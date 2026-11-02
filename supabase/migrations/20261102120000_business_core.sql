-- AnyVendor business backend: tenancy, plans, billing ledger, website revisions,
-- update requests, provider connections, social scheduling, SEO snapshots.
-- Rules: every business-scoped row is readable only by that business's members
-- (or explicit staff); every write goes through a SECURITY DEFINER function that
-- re-checks membership, staff status and plan entitlement. Service-role-only
-- functions are used by the Stripe webhook and the scheduler cron.

-- Functions are not executable by PUBLIC unless granted below.
alter default privileges in schema public revoke execute on functions from public;

create type public.member_role as enum ('owner', 'editor');
create type public.plan_code as enum ('website', 'seo', 'social');
create type public.request_status as enum ('received', 'in_progress', 'needs_information', 'ready_to_review', 'completed');
create type public.request_kind as enum ('update', 'feature');
create type public.request_scope as enum ('standard', 'larger_feature', 'external_dependency');
create type public.provider_kind as enum ('instagram', 'linkedin', 'google_search_console');
create type public.connection_status as enum ('connected', 'needs_reconnect', 'revoked');
create type public.post_status as enum ('draft', 'scheduled', 'publishing', 'published', 'partially_published', 'failed', 'cancelled');
create type public.target_status as enum ('draft', 'scheduled', 'claimed', 'published', 'failed', 'cancelled');

-- ---------------------------------------------------------------- tenancy
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  directory_slug text,
  timezone text not null default 'Europe/London',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.memberships (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

-- Staff are added explicitly by an operator with SQL / service role. Never at signup.
create table public.staff_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  note text,
  added_at timestamptz not null default now()
);

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.staff_members where user_id = auth.uid())
$$;

create function public.is_member(p_business uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.memberships where business_id = p_business and user_id = auth.uid())
$$;

create function public.is_owner(p_business uuid) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.memberships where business_id = p_business and user_id = auth.uid() and role = 'owner')
$$;

-- ---------------------------------------------------------------- billing
create table public.billing_customers (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  stripe_customer_id text not null unique,
  livemode boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  plan public.plan_code,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  livemode boolean not null default false,
  last_event_created timestamptz not null,
  updated_at timestamptz not null default now()
);
create index subscriptions_business_idx on public.subscriptions (business_id);

create table public.stripe_events (
  id text primary key,
  type text not null,
  livemode boolean not null,
  stripe_created timestamptz not null,
  status text not null default 'processing' check (status in ('processing', 'processed', 'ignored', 'failed')),
  attempts int not null default 1,
  last_error text,
  claimed_at timestamptz not null default now(),
  processed_at timestamptz
);

create function public.plan_rank(p public.plan_code) returns int
language sql immutable as $$
  select case p when 'website' then 1 when 'seo' then 2 when 'social' then 3 else 0 end
$$;

-- Stripe statuses that keep paid access: active, trialing, past_due (Stripe is retrying).
-- unpaid, canceled, incomplete, incomplete_expired, paused => no paid modules (history stays readable).
create function public.active_plan(p_business uuid) returns public.plan_code
language sql stable security definer set search_path = public, pg_temp as $$
  select plan from public.subscriptions
  where business_id = p_business and plan is not null and status in ('active', 'trialing', 'past_due')
  order by public.plan_rank(plan) desc, updated_at desc
  limit 1
$$;

create function public.has_module(p_business uuid, p_module text) returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select case p_module
    when 'listing' then public.plan_rank(public.active_plan(p_business)) >= 1
    when 'website' then public.plan_rank(public.active_plan(p_business)) >= 1
    when 'requests' then public.plan_rank(public.active_plan(p_business)) >= 1
    when 'seo' then public.plan_rank(public.active_plan(p_business)) >= 2
    when 'social' then public.plan_rank(public.active_plan(p_business)) >= 3
    else false end
$$;

-- Webhook ledger: 'claimed' (process it), 'duplicate' (already done), 'in_flight' (another delivery is processing).
create function public.claim_stripe_event(p_id text, p_type text, p_livemode boolean, p_created timestamptz) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare v public.stripe_events%rowtype;
begin
  insert into public.stripe_events (id, type, livemode, stripe_created) values (p_id, p_type, p_livemode, p_created)
  on conflict (id) do nothing;
  if found then return 'claimed'; end if;
  select * into v from public.stripe_events where id = p_id for update;
  if v.status in ('processed', 'ignored') then return 'duplicate'; end if;
  if v.status = 'processing' and v.claimed_at > now() - interval '5 minutes' then return 'in_flight'; end if;
  update public.stripe_events set status = 'processing', attempts = attempts + 1, claimed_at = now(), last_error = null where id = p_id;
  return 'claimed';
end $$;

create function public.finish_stripe_event(p_id text, p_status text, p_error text default null) returns void
language sql security definer set search_path = public, pg_temp as $$
  update public.stripe_events
  set status = p_status, last_error = p_error, processed_at = case when p_status in ('processed', 'ignored') then now() else processed_at end
  where id = p_id
$$;

-- Applies a subscription snapshot only if it is not older than what we already hold.
create function public.upsert_subscription(
  p_business uuid, p_subscription text, p_customer text, p_plan public.plan_code, p_price text, p_status text,
  p_period_end timestamptz, p_cancel_at_period_end boolean, p_canceled_at timestamptz, p_livemode boolean, p_event_created timestamptz
) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.subscriptions as s (business_id, stripe_subscription_id, stripe_customer_id, plan, stripe_price_id, status,
    current_period_end, cancel_at_period_end, canceled_at, livemode, last_event_created, updated_at)
  values (p_business, p_subscription, p_customer, p_plan, p_price, p_status, p_period_end, p_cancel_at_period_end, p_canceled_at,
    p_livemode, p_event_created, now())
  on conflict (stripe_subscription_id) do update set
    plan = excluded.plan, stripe_price_id = excluded.stripe_price_id, status = excluded.status,
    current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end,
    canceled_at = excluded.canceled_at, last_event_created = excluded.last_event_created, updated_at = now()
  where s.last_event_created <= excluded.last_event_created and s.business_id = excluded.business_id;
  if found then return 'applied'; end if;
  return 'stale';
end $$;

-- ---------------------------------------------------------------- website
create table public.websites (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  kind text not null default 'hosted' check (kind in ('hosted', 'external')),
  external_url text check (external_url is null or external_url ~ '^https://'),
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object'),
  draft_version int not null default 0,
  published_revision_id uuid,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table public.website_revisions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  version int not null,
  action text not null check (action in ('save', 'publish', 'restore')),
  content jsonb not null,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index website_revisions_business_idx on public.website_revisions (business_id, created_at desc);

create function public.save_website_draft(p_business uuid, p_content jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_version int;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_content) <> 'object' or pg_column_size(p_content) > 200000 then raise exception 'invalid_content'; end if;
  update public.websites set draft = p_content, draft_version = draft_version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and draft_version = p_expected_version
  returning draft_version into v_version;
  if v_version is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by) values (p_business, v_version, 'save', p_content, auth.uid());
  return v_version;
end $$;

create function public.publish_website(p_business uuid, p_expected_version int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare w public.websites%rowtype; v_rev uuid;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if not public.has_module(p_business, 'website') then raise exception 'plan_required' using errcode = '42501'; end if;
  select * into w from public.websites where business_id = p_business for update;
  if w.business_id is null or w.draft_version <> p_expected_version then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by)
  values (p_business, w.draft_version, 'publish', w.draft, auth.uid()) returning id into v_rev;
  update public.websites set published_revision_id = v_rev, published_at = now(), updated_at = now(), updated_by = auth.uid() where business_id = p_business;
  return v_rev;
end $$;

create function public.restore_website_revision(p_business uuid, p_revision uuid, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_content jsonb; v_version int;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  select content into v_content from public.website_revisions where id = p_revision and business_id = p_business;
  if v_content is null then raise exception 'revision_not_found'; end if;
  update public.websites set draft = v_content, draft_version = draft_version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and draft_version = p_expected_version returning draft_version into v_version;
  if v_version is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by) values (p_business, v_version, 'restore', v_content, auth.uid());
  return v_version;
end $$;

-- Public hosted site: only published content, only while the business holds a website plan.
create function public.public_site(p_slug text) returns table (business_id uuid, name text, content jsonb, published_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select b.id, b.name, r.content, w.published_at
  from public.businesses b
  join public.websites w on w.business_id = b.id
  join public.website_revisions r on r.id = w.published_revision_id
  where b.slug = p_slug and public.has_module(b.id, 'website')
$$;

-- ---------------------------------------------------------------- business creation
create function public.create_business(p_name text, p_slug text, p_directory_slug text default null) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_count int;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select count(*) into v_count from public.memberships where user_id = auth.uid() and role = 'owner';
  if v_count >= 5 then raise exception 'too_many_businesses'; end if;
  insert into public.businesses (name, slug, directory_slug, created_by) values (trim(p_name), lower(p_slug), p_directory_slug, auth.uid())
  returning id into v_id;
  insert into public.memberships (business_id, user_id, role) values (v_id, auth.uid(), 'owner');
  insert into public.websites (business_id) values (v_id);
  return v_id;
end $$;

-- ---------------------------------------------------------------- update requests
create table public.update_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  ref int not null,
  title text not null check (char_length(title) between 3 and 140),
  body text not null check (char_length(body) between 1 and 8000),
  kind public.request_kind not null default 'update',
  status public.request_status not null default 'received',
  scope public.request_scope not null default 'standard',
  scope_note text,
  submitted_by uuid not null references auth.users (id),
  submitted_at timestamptz not null default now(),
  due_at timestamptz not null,
  preview_url text check (preview_url is null or preview_url ~ '^https://'),
  completion_note text,
  completed_at timestamptz,
  completed_by uuid,
  updated_at timestamptz not null default now(),
  unique (business_id, ref)
);
create index update_requests_due_idx on public.update_requests (status, due_at);
create index update_requests_business_idx on public.update_requests (business_id, submitted_at desc);

create table public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.update_requests (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  author_id uuid,
  author_kind text not null check (author_kind in ('customer', 'staff', 'system')),
  internal boolean not null default false,
  body text check (body is null or char_length(body) <= 8000),
  status_from public.request_status,
  status_to public.request_status,
  created_at timestamptz not null default now()
);
create index request_events_request_idx on public.request_events (request_id, created_at);

create table public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.update_requests (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  storage_path text not null unique,
  filename text not null,
  content_type text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 10485760),
  uploaded_by uuid not null,
  created_at timestamptz not null default now()
);

-- The 24-hour clock starts when the request is submitted and is never moved.
create function public.request_before_insert() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.business_id::text));
  new.submitted_at := now();
  new.due_at := new.submitted_at + interval '24 hours';
  new.status := 'received';
  new.scope := 'standard';
  new.ref := coalesce((select max(ref) from public.update_requests where business_id = new.business_id), 0) + 1;
  return new;
end $$;
create trigger update_requests_before_insert before insert on public.update_requests
for each row execute function public.request_before_insert();

create function public.request_before_update() returns trigger
language plpgsql as $$
begin
  if new.submitted_at <> old.submitted_at or new.due_at <> old.due_at or new.business_id <> old.business_id
     or new.submitted_by <> old.submitted_by or new.ref <> old.ref then
    raise exception 'immutable_request_fields';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger update_requests_before_update before update on public.update_requests
for each row execute function public.request_before_update();

create function public.create_update_request(p_business uuid, p_title text, p_body text, p_kind public.request_kind default 'update') returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if not public.has_module(p_business, 'requests') then raise exception 'plan_required' using errcode = '42501'; end if;
  insert into public.update_requests (business_id, title, body, kind, submitted_by, ref, due_at)
  values (p_business, trim(p_title), trim(p_body), p_kind, auth.uid(), 0, now())
  returning id into v_id;
  insert into public.request_events (request_id, business_id, author_id, author_kind, body, status_to)
  values (v_id, p_business, auth.uid(), 'customer', trim(p_body), 'received');
  return v_id;
end $$;

-- Allowed moves. Staff run the work; the customer can answer, approve, ask for changes or reopen.
create function public.request_transition_allowed(p_actor text, p_from public.request_status, p_to public.request_status) returns boolean
language sql immutable as $$
  select case
    when p_actor = 'staff' then (p_from, p_to) in (
      ('received', 'in_progress'), ('received', 'needs_information'), ('received', 'ready_to_review'), ('received', 'completed'),
      ('in_progress', 'needs_information'), ('in_progress', 'ready_to_review'), ('in_progress', 'completed'),
      ('needs_information', 'in_progress'), ('needs_information', 'completed'),
      ('ready_to_review', 'in_progress'), ('ready_to_review', 'completed'),
      ('completed', 'in_progress'))
    when p_actor = 'customer' then (p_from, p_to) in (
      ('needs_information', 'in_progress'), ('ready_to_review', 'completed'), ('ready_to_review', 'in_progress'), ('completed', 'in_progress'))
    else false end
$$;

create function public.transition_update_request(
  p_request uuid, p_to public.request_status, p_note text default null, p_preview_url text default null, p_completion_note text default null
) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.update_requests%rowtype; v_actor text; v_preview text; v_evidence text;
begin
  select * into r from public.update_requests where id = p_request for update;
  if r.id is null then raise exception 'not_found'; end if;
  if public.is_staff() then v_actor := 'staff';
  elsif public.is_member(r.business_id) then v_actor := 'customer';
  else raise exception 'not_member' using errcode = '42501'; end if;
  if not public.request_transition_allowed(v_actor, r.status, p_to) then raise exception 'transition_not_allowed'; end if;
  v_preview := coalesce(nullif(trim(p_preview_url), ''), r.preview_url);
  if p_to = 'ready_to_review' and v_preview is null then raise exception 'preview_required'; end if;
  if v_actor = 'customer' and p_to = 'in_progress' and coalesce(trim(p_note), '') = '' then raise exception 'note_required'; end if;
  if p_to = 'needs_information' and coalesce(trim(p_note), '') = '' then raise exception 'note_required'; end if;
  if p_to = 'completed' then
    if v_actor = 'staff' then
      v_evidence := nullif(trim(p_completion_note), '');
      if v_evidence is null then raise exception 'completion_evidence_required'; end if;
    else
      if v_preview is null then raise exception 'completion_evidence_required'; end if;
      v_evidence := 'Approved by customer after reviewing ' || v_preview;
    end if;
  end if;
  update public.update_requests set
    status = p_to,
    preview_url = v_preview,
    completion_note = case when p_to = 'completed' then v_evidence when p_to = 'in_progress' and r.status = 'completed' then null else completion_note end,
    completed_at = case when p_to = 'completed' then now() when p_to <> 'completed' then null end,
    completed_by = case when p_to = 'completed' then auth.uid() else null end
  where id = p_request;
  insert into public.request_events (request_id, business_id, author_id, author_kind, body, status_from, status_to)
  values (p_request, r.business_id, auth.uid(), v_actor, coalesce(nullif(trim(p_note), ''), case when p_to = 'completed' then v_evidence end), r.status, p_to);
end $$;

create function public.add_request_message(p_request uuid, p_body text, p_internal boolean default false) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.update_requests%rowtype; v_actor text; v_id uuid;
begin
  select * into r from public.update_requests where id = p_request for update;
  if r.id is null then raise exception 'not_found'; end if;
  if public.is_staff() then v_actor := 'staff';
  elsif public.is_member(r.business_id) then v_actor := 'customer';
  else raise exception 'not_member' using errcode = '42501'; end if;
  if p_internal and v_actor <> 'staff' then raise exception 'internal_notes_are_staff_only'; end if;
  if coalesce(trim(p_body), '') = '' then raise exception 'empty_message'; end if;
  insert into public.request_events (request_id, business_id, author_id, author_kind, internal, body)
  values (p_request, r.business_id, auth.uid(), v_actor, p_internal, trim(p_body)) returning id into v_id;
  -- A customer answering a question puts the request back in progress.
  if v_actor = 'customer' and r.status = 'needs_information' then
    update public.update_requests set status = 'in_progress' where id = p_request;
    insert into public.request_events (request_id, business_id, author_kind, status_from, status_to)
    values (p_request, r.business_id, 'system', 'needs_information', 'in_progress');
  end if;
  return v_id;
end $$;

-- Staff mark work that is bigger than an update, or that waits on someone else. Visible to the customer.
create function public.flag_request_scope(p_request uuid, p_scope public.request_scope, p_note text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.update_requests%rowtype;
begin
  if not public.is_staff() then raise exception 'staff_only' using errcode = '42501'; end if;
  select * into r from public.update_requests where id = p_request for update;
  if r.id is null then raise exception 'not_found'; end if;
  if p_scope <> 'standard' and coalesce(trim(p_note), '') = '' then raise exception 'note_required'; end if;
  update public.update_requests set scope = p_scope, scope_note = nullif(trim(p_note), '') where id = p_request;
  insert into public.request_events (request_id, business_id, author_id, author_kind, body)
  values (p_request, r.business_id, auth.uid(), 'staff',
    case p_scope when 'larger_feature' then 'Scoped as a larger feature: ' when 'external_dependency' then 'Waiting on an external dependency: ' else 'Scope back to a standard update. ' end
    || coalesce(trim(p_note), ''));
end $$;

create function public.add_request_attachment(p_request uuid, p_path text, p_filename text, p_content_type text, p_size int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.update_requests%rowtype; v_id uuid;
begin
  select * into r from public.update_requests where id = p_request;
  if r.id is null then raise exception 'not_found'; end if;
  if not (public.is_member(r.business_id) or public.is_staff()) then raise exception 'not_member' using errcode = '42501'; end if;
  if p_path not like r.business_id::text || '/' || r.id::text || '/%' then raise exception 'invalid_path'; end if;
  if p_content_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf') then raise exception 'unsupported_type'; end if;
  insert into public.request_attachments (request_id, business_id, storage_path, filename, content_type, size_bytes, uploaded_by)
  values (p_request, r.business_id, p_path, left(p_filename, 200), p_content_type, p_size, auth.uid()) returning id into v_id;
  return v_id;
end $$;

-- ---------------------------------------------------------------- provider connections
create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  provider public.provider_kind not null,
  external_account_id text not null,
  display_name text,
  account_type text,
  scopes text[] not null default '{}',
  status public.connection_status not null default 'connected',
  last_error text,
  connected_by uuid,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, provider, external_account_id)
);

-- Encrypted tokens; no policies, so only the service role can read or write them.
create table public.provider_tokens (
  connection_id uuid primary key references public.provider_connections (id) on delete cascade,
  access_ciphertext text not null,
  refresh_ciphertext text,
  access_expires_at timestamptz,
  refresh_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create function public.disconnect_provider(p_connection uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare c public.provider_connections%rowtype;
begin
  select * into c from public.provider_connections where id = p_connection for update;
  if c.id is null or not public.is_member(c.business_id) then raise exception 'not_member' using errcode = '42501'; end if;
  update public.provider_connections set status = 'revoked', updated_at = now() where id = p_connection;
  delete from public.provider_tokens where connection_id = p_connection;
  update public.social_post_targets set status = 'cancelled', last_error = 'Account disconnected'
  where connection_id = p_connection and status in ('draft', 'scheduled');
end $$;

-- ---------------------------------------------------------------- social scheduling
create table public.social_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_by uuid not null,
  body text not null default '' check (char_length(body) <= 3000),
  media jsonb not null default '[]'::jsonb check (jsonb_typeof(media) = 'array' and jsonb_array_length(media) <= 10),
  status public.post_status not null default 'draft',
  scheduled_for timestamptz,
  timezone text not null default 'Europe/London',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index social_posts_business_idx on public.social_posts (business_id, scheduled_for);

create table public.social_post_targets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  connection_id uuid not null references public.provider_connections (id) on delete cascade,
  provider public.provider_kind not null,
  status public.target_status not null default 'draft',
  idempotency_key uuid not null default gen_random_uuid() unique,
  attempts int not null default 0,
  max_attempts int not null default 3,
  next_attempt_at timestamptz,
  claimed_at timestamptz,
  provider_container_id text,
  external_id text,
  external_url text,
  last_error text,
  published_at timestamptz,
  unique (post_id, connection_id)
);
create index social_targets_due_idx on public.social_post_targets (status, next_attempt_at);

create function public.save_social_post(
  p_business uuid, p_post uuid, p_body text, p_media jsonb, p_connections uuid[], p_scheduled_for timestamptz, p_timezone text, p_schedule boolean
) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_post uuid; v_status public.post_status; v_conn uuid; v_provider public.provider_kind; v_conn_status public.connection_status;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if not public.has_module(p_business, 'social') then raise exception 'plan_required' using errcode = '42501'; end if;
  if p_schedule and (p_scheduled_for is null or p_scheduled_for < now() + interval '2 minutes') then raise exception 'schedule_in_future'; end if;
  if p_schedule and coalesce(array_length(p_connections, 1), 0) = 0 then raise exception 'choose_an_account'; end if;
  if p_post is null then
    insert into public.social_posts (business_id, created_by, body, media, status, scheduled_for, timezone)
    values (p_business, auth.uid(), coalesce(p_body, ''), coalesce(p_media, '[]'::jsonb), 'draft', p_scheduled_for, coalesce(p_timezone, 'Europe/London'))
    returning id into v_post;
  else
    select status into v_status from public.social_posts where id = p_post and business_id = p_business for update;
    if v_status is null then raise exception 'not_found'; end if;
    if v_status not in ('draft', 'scheduled') then raise exception 'post_locked'; end if;
    if exists (select 1 from public.social_post_targets where post_id = p_post and status in ('claimed', 'published')) then raise exception 'post_locked'; end if;
    update public.social_posts set body = coalesce(p_body, ''), media = coalesce(p_media, '[]'::jsonb), scheduled_for = p_scheduled_for,
      timezone = coalesce(p_timezone, timezone), updated_at = now() where id = p_post;
    delete from public.social_post_targets where post_id = p_post;
    v_post := p_post;
  end if;
  foreach v_conn in array coalesce(p_connections, '{}') loop
    select provider, status into v_provider, v_conn_status from public.provider_connections where id = v_conn and business_id = p_business;
    if v_provider is null then raise exception 'connection_not_found'; end if;
    if p_schedule and v_conn_status <> 'connected' then raise exception 'connection_needs_reconnect'; end if;
    insert into public.social_post_targets (post_id, business_id, connection_id, provider, status, next_attempt_at)
    values (v_post, p_business, v_conn, v_provider, case when p_schedule then 'scheduled' else 'draft' end::public.target_status,
      case when p_schedule then p_scheduled_for end);
  end loop;
  update public.social_posts set status = case when p_schedule then 'scheduled' else 'draft' end::public.post_status where id = v_post;
  return v_post;
end $$;

create function public.cancel_social_post(p_post uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare p public.social_posts%rowtype;
begin
  select * into p from public.social_posts where id = p_post for update;
  if p.id is null or not public.is_member(p.business_id) then raise exception 'not_member' using errcode = '42501'; end if;
  if p.status not in ('draft', 'scheduled') then raise exception 'post_locked'; end if;
  if exists (select 1 from public.social_post_targets where post_id = p_post and status in ('claimed', 'published')) then raise exception 'post_locked'; end if;
  update public.social_post_targets set status = 'cancelled' where post_id = p_post;
  update public.social_posts set status = 'cancelled', updated_at = now() where id = p_post;
end $$;

create function public.rollup_social_post(p_post uuid) returns void
language sql security definer set search_path = public, pg_temp as $$
  update public.social_posts p set updated_at = now(), status = (
    select case
      when count(*) filter (where t.status in ('scheduled', 'claimed')) > 0 then
        case when count(*) filter (where t.status = 'published') > 0 or count(*) filter (where t.status = 'claimed') > 0 then 'publishing' else 'scheduled' end
      when count(*) = count(*) filter (where t.status = 'published') then 'published'
      when count(*) filter (where t.status = 'published') > 0 then 'partially_published'
      when count(*) filter (where t.status = 'failed') > 0 then 'failed'
      else p.status::text end::public.post_status
    from public.social_post_targets t where t.post_id = p_post and t.status <> 'cancelled')
  where p.id = p_post and exists (select 1 from public.social_post_targets t where t.post_id = p_post and t.status <> 'cancelled')
$$;

-- Scheduler (service role). Claims due targets once; re-checks plan and connection at claim time.
-- A target left 'claimed' for 10 minutes is NOT retried automatically: its outcome is unknown and a
-- retry could double-post, so it fails with a message telling the owner to check the account.
create function public.claim_due_social_targets(p_limit int default 10) returns setof public.social_post_targets
language plpgsql security definer set search_path = public, pg_temp as $$
declare t record;
begin
  for t in
    update public.social_post_targets set status = 'failed', last_error = 'Publishing outcome unknown after a timeout. Check the account before posting again.'
    where status = 'claimed' and claimed_at < now() - interval '10 minutes' returning post_id
  loop perform public.rollup_social_post(t.post_id); end loop;

  for t in
    update public.social_post_targets st set status = 'failed',
      last_error = case when not public.has_module(st.business_id, 'social') then 'Social scheduling is not on the current plan.'
                        else 'The account needs reconnecting.' end
    from public.provider_connections c
    where st.connection_id = c.id and st.status = 'scheduled' and st.next_attempt_at <= now()
      and (not public.has_module(st.business_id, 'social') or c.status <> 'connected')
    returning st.post_id
  loop perform public.rollup_social_post(t.post_id); end loop;

  return query
  update public.social_post_targets st set status = 'claimed', claimed_at = now(), attempts = st.attempts + 1
  where st.id in (
    select id from public.social_post_targets
    where status = 'scheduled' and next_attempt_at <= now()
    order by next_attempt_at
    for update skip locked
    limit p_limit)
  returning st.*;
end $$;

create function public.record_social_target_result(
  p_target uuid, p_outcome text, p_external_id text default null, p_external_url text default null, p_error text default null, p_container text default null
) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare t public.social_post_targets%rowtype;
begin
  select * into t from public.social_post_targets where id = p_target for update;
  if t.id is null then raise exception 'not_found'; end if;
  if t.status <> 'claimed' then return 'stale'; end if;
  if p_outcome = 'published' then
    update public.social_post_targets set status = 'published', external_id = p_external_id, external_url = p_external_url,
      published_at = now(), last_error = null, provider_container_id = coalesce(p_container, provider_container_id) where id = p_target;
  elsif p_outcome = 'retryable_error' and t.attempts < t.max_attempts then
    update public.social_post_targets set status = 'scheduled', last_error = p_error, provider_container_id = coalesce(p_container, provider_container_id),
      next_attempt_at = now() + make_interval(mins => (2 ^ t.attempts)::int) where id = p_target;
  elsif p_outcome = 'auth_error' then
    update public.social_post_targets set status = 'failed', last_error = coalesce(p_error, 'The account needs reconnecting.') where id = p_target;
    update public.provider_connections set status = 'needs_reconnect', last_error = p_error, updated_at = now() where id = t.connection_id;
  else
    update public.social_post_targets set status = 'failed', last_error = coalesce(p_error, 'Publishing failed.'),
      provider_container_id = coalesce(p_container, provider_container_id) where id = p_target;
  end if;
  perform public.rollup_social_post(t.post_id);
  return 'recorded';
end $$;

-- ---------------------------------------------------------------- SEO
create table public.seo_snapshots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  connection_id uuid references public.provider_connections (id) on delete set null,
  site_url text not null,
  period_start date not null,
  period_end date not null,
  clicks int not null,
  impressions int not null,
  ctr numeric not null,
  position numeric,
  top_queries jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);
create index seo_snapshots_business_idx on public.seo_snapshots (business_id, fetched_at desc);

-- ---------------------------------------------------------------- row level security
alter table public.businesses enable row level security;
alter table public.memberships enable row level security;
alter table public.staff_members enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.websites enable row level security;
alter table public.website_revisions enable row level security;
alter table public.update_requests enable row level security;
alter table public.request_events enable row level security;
alter table public.request_attachments enable row level security;
alter table public.provider_connections enable row level security;
alter table public.provider_tokens enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_post_targets enable row level security;
alter table public.seo_snapshots enable row level security;

create policy businesses_read on public.businesses for select to authenticated using (public.is_member(id) or public.is_staff());
create policy memberships_read on public.memberships for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy staff_read_self on public.staff_members for select to authenticated using (user_id = auth.uid());
create policy subscriptions_read on public.subscriptions for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy websites_read on public.websites for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy website_revisions_read on public.website_revisions for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy requests_read on public.update_requests for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy request_events_read on public.request_events for select to authenticated
  using ((public.is_member(business_id) and not internal) or public.is_staff());
create policy request_attachments_read on public.request_attachments for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy connections_read on public.provider_connections for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy social_posts_read on public.social_posts for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy social_targets_read on public.social_post_targets for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy seo_read on public.seo_snapshots for select to authenticated using (public.is_member(business_id) or public.is_staff());

-- ---------------------------------------------------------------- grants
revoke all on all tables in schema public from anon, authenticated;
grant select on public.businesses, public.memberships, public.staff_members, public.subscriptions, public.websites,
  public.website_revisions, public.update_requests, public.request_events, public.request_attachments,
  public.provider_connections, public.social_posts, public.social_post_targets, public.seo_snapshots to authenticated;
grant all on all tables in schema public to service_role;

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.is_staff(), public.is_member(uuid), public.is_owner(uuid), public.active_plan(uuid),
  public.has_module(uuid, text), public.plan_rank(public.plan_code), public.request_transition_allowed(text, public.request_status, public.request_status),
  public.create_business(text, text, text), public.save_website_draft(uuid, jsonb, int), public.publish_website(uuid, int),
  public.restore_website_revision(uuid, uuid, int), public.create_update_request(uuid, text, text, public.request_kind),
  public.transition_update_request(uuid, public.request_status, text, text, text), public.add_request_message(uuid, text, boolean),
  public.flag_request_scope(uuid, public.request_scope, text), public.add_request_attachment(uuid, text, text, text, int),
  public.disconnect_provider(uuid), public.save_social_post(uuid, uuid, text, jsonb, uuid[], timestamptz, text, boolean),
  public.cancel_social_post(uuid) to authenticated;
grant execute on function public.public_site(text) to anon, authenticated;
grant execute on all functions in schema public to service_role;
