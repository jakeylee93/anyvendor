-- Tenancy hardening for real businesses: access granted by exact email without sending mail,
-- staff switching that is explicit and audited, staff writes audited, internal test plans kept
-- apart from paid subscriptions, listing links only by staff, bespoke sites with a per-site
-- manifest, and a versioned public read contract.

-- ---------------------------------------------------------------- audit
create table public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor uuid,
  business_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);
create index audit_log_business_idx on public.audit_log (business_id, at desc);

create function public.audit(p_business uuid, p_action text, p_detail jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = public, pg_temp as $$
  insert into public.audit_log (actor, business_id, action, detail) values (auth.uid(), p_business, p_action, coalesce(p_detail, '{}'::jsonb))
$$;

/** Members manage their business. Staff may too, and every such write is recorded. */
create function public.can_manage(p_business uuid, p_action text default 'manage') returns boolean
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if public.is_member(p_business) then return true; end if;
  if public.is_staff() then
    perform public.audit(p_business, 'staff.' || p_action);
    return true;
  end if;
  return false;
end $$;

-- ---------------------------------------------------------------- access by exact email: table, apply function and trigger live in 20261103090000_owner_claims.sql

/** Audited version of the owner-claims grant (audit_log exists from here on). Same rules: verified email only. */
create or replace function public.apply_pending_access(p_user uuid) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare u record; r record; n int := 0;
begin
  select id, lower(btrim(email)) as email, email_confirmed_at into u from auth.users where id = p_user;
  if u.id is null or u.email is null or u.email_confirmed_at is null then return 0; end if;
  for r in select * from public.pending_access where email = u.email and claimed_at is null order by created_at loop
    if r.make_staff then insert into public.staff_members (user_id, note) values (u.id, coalesce(r.note, 'AnyVendor team')) on conflict do nothing; end if;
    if r.business_id is not null then insert into public.memberships (business_id, user_id, role) values (r.business_id, u.id, r.role) on conflict do nothing; end if;
    update public.pending_access set claimed_at = now(), claimed_user = u.id where id = r.id;
    insert into public.audit_log (actor, business_id, action, detail) values (u.id, r.business_id, 'access.granted', jsonb_build_object('pending', r.id, 'staff', r.make_staff, 'role', r.role));
    n := n + 1;
  end loop;
  return n;
end $$;

/** True for AnyVendor staff, the service role, or a direct database session. Never for anon or an ordinary signed-in user. */
create function public.is_privileged() returns boolean
language plpgsql stable security definer set search_path = public, pg_temp as $$
declare r text := coalesce(current_setting('role', true), 'none');
begin
  if r in ('anon', 'authenticated') then return public.is_staff(); end if;
  return r = 'service_role' or r = 'none' or r = '' or r = 'postgres' or public.is_staff();
end $$;

/** Staff record who may join which business. If that person already has an account the access applies at once. Nothing is emailed. */
create function public.add_pending_access(p_email text, p_business uuid, p_role public.member_role default 'owner', p_make_staff boolean default false, p_note text default null) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; u record;
begin
  if not public.is_staff() then raise exception 'staff_only' using errcode = '42501'; end if;
  insert into public.pending_access (email, business_id, role, make_staff, note, created_by)
  values (lower(trim(p_email)), p_business, p_role, p_make_staff, p_note, auth.uid()) returning id into v_id;
  perform public.audit(p_business, 'access.pending', jsonb_build_object('email', lower(trim(p_email)), 'role', p_role, 'staff', p_make_staff));
  for u in select id from auth.users where lower(trim(email)) = lower(trim(p_email)) and email_confirmed_at is not null loop perform public.apply_pending_access(u.id); end loop;
  return v_id;
end $$;

create function public.revoke_pending_access(p_id uuid) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_staff() then raise exception 'staff_only' using errcode = '42501'; end if;
  delete from public.pending_access where id = p_id and claimed_at is null;
end $$;

-- ---------------------------------------------------------------- listings: a claim is a note, a link is staff work
alter table public.businesses add column listing_claim_note text;
alter table public.businesses alter column created_by drop not null;
create unique index businesses_directory_slug_unique on public.businesses (directory_slug) where directory_slug is not null;

create or replace function public.create_business(p_name text, p_slug text, p_directory_slug text default null) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_count int;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select count(*) into v_count from public.memberships where user_id = auth.uid() and role = 'owner';
  if v_count >= 5 then raise exception 'too_many_businesses'; end if;
  -- A listing named at sign-up is only a claim for staff to verify; it never links the listing.
  insert into public.businesses (name, slug, listing_claim_note, created_by)
  values (trim(p_name), lower(p_slug), nullif(trim(p_directory_slug), ''), auth.uid()) returning id into v_id;
  insert into public.memberships (business_id, user_id, role) values (v_id, auth.uid(), 'owner');
  insert into public.websites (business_id) values (v_id);
  insert into public.audit_log (actor, business_id, action, detail) values (auth.uid(), v_id, 'business.created', jsonb_build_object('claim', nullif(trim(p_directory_slug), '')));
  return v_id;
end $$;

create function public.link_listing(p_business uuid, p_directory_slug text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_staff() then raise exception 'staff_only' using errcode = '42501'; end if;
  update public.businesses set directory_slug = nullif(trim(p_directory_slug), ''), listing_claim_note = null where id = p_business;
  if not found then raise exception 'not_found'; end if;
  perform public.audit(p_business, 'listing.linked', jsonb_build_object('directory_slug', p_directory_slug));
end $$;

/** Idempotent by slug; staff or service role. Returns the business id. */
create function public.provision_business(p_name text, p_slug text, p_directory_slug text default null, p_kind text default 'hosted', p_timezone text default 'Europe/London') returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_actor uuid := auth.uid();
begin
  if not public.is_privileged() then raise exception 'staff_only' using errcode = '42501'; end if;
  select id into v_id from public.businesses where slug = lower(p_slug);
  if v_id is null then
    insert into public.businesses (name, slug, directory_slug, timezone, created_by)
    values (trim(p_name), lower(p_slug), nullif(trim(p_directory_slug), ''), p_timezone, v_actor)
    returning id into v_id;
  else
    update public.businesses set name = trim(p_name), directory_slug = coalesce(nullif(trim(p_directory_slug), ''), directory_slug) where id = v_id;
  end if;
  insert into public.websites (business_id, kind) values (v_id, p_kind) on conflict (business_id) do update set kind = excluded.kind;
  insert into public.audit_log (actor, business_id, action, detail) values (v_actor, v_id, 'business.provisioned', jsonb_build_object('slug', lower(p_slug), 'kind', p_kind));
  return v_id;
end $$;

-- ---------------------------------------------------------------- staff switching, explicit and logged
create function public.staff_switch(p_business uuid) returns table (id uuid, name text, slug text)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_staff() then raise exception 'staff_only' using errcode = '42501'; end if;
  perform public.audit(p_business, 'staff.switch');
  return query select b.id, b.name, b.slug from public.businesses b where b.id = p_business;
end $$;

-- ---------------------------------------------------------------- internal test plans, never confused with paid status
create table public.internal_entitlements (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  plan public.plan_code not null,
  label text not null check (char_length(label) between 3 and 120),
  granted_by uuid,
  granted_at timestamptz not null default now(),
  expires_at timestamptz
);

create or replace function public.active_plan(p_business uuid) returns public.plan_code
language sql stable security definer set search_path = public, pg_temp as $$
  select plan from (
    select plan from public.subscriptions where business_id = p_business and plan is not null and status in ('active', 'trialing', 'past_due')
    union all
    select plan from public.internal_entitlements where business_id = p_business and (expires_at is null or expires_at > now())
  ) p order by public.plan_rank(plan) desc limit 1
$$;

create function public.grant_internal_plan(p_business uuid, p_plan public.plan_code, p_label text, p_expires timestamptz default null) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_privileged() then raise exception 'staff_only' using errcode = '42501'; end if;
  if p_plan is null then delete from public.internal_entitlements where business_id = p_business;
  else
    insert into public.internal_entitlements (business_id, plan, label, granted_by, expires_at) values (p_business, p_plan, trim(p_label), auth.uid(), p_expires)
    on conflict (business_id) do update set plan = excluded.plan, label = excluded.label, granted_by = excluded.granted_by, granted_at = now(), expires_at = excluded.expires_at;
  end if;
  perform public.audit(p_business, 'entitlement.internal', jsonb_build_object('plan', p_plan, 'label', p_label, 'expires', p_expires));
end $$;

-- ---------------------------------------------------------------- staff may manage content, audited
create or replace function public.save_website_draft(p_business uuid, p_content jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_version int;
begin
  if not public.can_manage(p_business, 'website.save') then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_content) <> 'object' or pg_column_size(p_content) > 400000 then raise exception 'invalid_content'; end if;
  update public.websites set draft = p_content, draft_version = draft_version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and draft_version = p_expected_version returning draft_version into v_version;
  if v_version is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by) values (p_business, v_version, 'save', p_content, auth.uid());
  return v_version;
end $$;

create or replace function public.publish_website(p_business uuid, p_expected_version int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare w public.websites%rowtype; v_rev uuid;
begin
  if not public.can_manage(p_business, 'website.publish') then raise exception 'not_member' using errcode = '42501'; end if;
  if not public.has_module(p_business, 'website') then raise exception 'plan_required' using errcode = '42501'; end if;
  select * into w from public.websites where business_id = p_business for update;
  if w.business_id is null or w.draft_version <> p_expected_version then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by) values (p_business, w.draft_version, 'publish', w.draft, auth.uid()) returning id into v_rev;
  update public.websites set published_revision_id = v_rev, published_at = now(), updated_at = now(), updated_by = auth.uid() where business_id = p_business;
  return v_rev;
end $$;

create or replace function public.restore_website_revision(p_business uuid, p_revision uuid, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_content jsonb; v_version int;
begin
  if not public.can_manage(p_business, 'website.restore') then raise exception 'not_member' using errcode = '42501'; end if;
  select content into v_content from public.website_revisions where id = p_revision and business_id = p_business;
  if v_content is null then raise exception 'revision_not_found'; end if;
  update public.websites set draft = v_content, draft_version = draft_version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and draft_version = p_expected_version returning draft_version into v_version;
  if v_version is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  insert into public.website_revisions (business_id, version, action, content, created_by) values (p_business, v_version, 'restore', v_content, auth.uid());
  return v_version;
end $$;

create or replace function public.save_vendor_profile(p_business uuid, p_profile jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v int;
begin
  if not public.can_manage(p_business, 'profile.save') then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_profile) <> 'object' or pg_column_size(p_profile) > 100000 then raise exception 'invalid_content'; end if;
  insert into public.vendor_profiles (business_id) values (p_business) on conflict (business_id) do nothing;
  update public.vendor_profiles set draft = p_profile, version = version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and version = p_expected_version returning version into v;
  if v is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  return v;
end $$;

create or replace function public.save_brand_kit(p_business uuid, p_kit jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v int;
begin
  if not public.can_manage(p_business, 'brand.save') then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_kit) <> 'object' or pg_column_size(p_kit) > 50000 then raise exception 'invalid_content'; end if;
  insert into public.brand_kits (business_id) values (p_business) on conflict (business_id) do nothing;
  update public.brand_kits set data = p_kit, version = version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and version = p_expected_version returning version into v;
  if v is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  return v;
end $$;

create or replace function public.add_brand_file(p_business uuid, p_kind text, p_label text, p_path text, p_content_type text, p_size int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.can_manage(p_business, 'brand.file.add') then raise exception 'not_member' using errcode = '42501'; end if;
  if p_path not like p_business::text || '/brand/%' then raise exception 'invalid_path'; end if;
  if p_content_type not in ('image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf') then raise exception 'unsupported_type'; end if;
  insert into public.brand_files (business_id, kind, label, storage_path, content_type, size_bytes, created_by)
  values (p_business, p_kind, left(trim(p_label), 120), p_path, p_content_type, p_size, auth.uid()) returning id into v_id;
  return v_id;
end $$;

create or replace function public.remove_brand_file(p_file uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare f public.brand_files%rowtype;
begin
  select * into f from public.brand_files where id = p_file;
  if f.id is null or not public.can_manage(f.business_id, 'brand.file.remove') then raise exception 'not_member' using errcode = '42501'; end if;
  delete from public.brand_files where id = p_file;
  return f.storage_path;
end $$;

-- ---------------------------------------------------------------- bespoke sites and the public content contract (v1)
alter table public.websites drop constraint websites_kind_check;
alter table public.websites add constraint websites_kind_check check (kind in ('hosted', 'external', 'bespoke'));
alter table public.websites add column manifest jsonb not null default '{}'::jsonb check (jsonb_typeof(manifest) = 'object');
alter table public.websites add column manifest_version int not null default 0;
alter table public.websites add column preview_token uuid not null default gen_random_uuid();
alter table public.websites add column revalidate_url text check (revalidate_url is null or revalidate_url ~ '^https://');

create function public.set_site_manifest(p_business uuid, p_manifest jsonb) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v int;
begin
  if not public.is_privileged() then raise exception 'staff_only' using errcode = '42501'; end if;
  if jsonb_typeof(p_manifest) <> 'object' or jsonb_typeof(p_manifest -> 'sections') <> 'array' or pg_column_size(p_manifest) > 200000 then raise exception 'invalid_manifest'; end if;
  update public.websites set manifest = p_manifest, manifest_version = manifest_version + 1, updated_at = now() where business_id = p_business returning manifest_version into v;
  if v is null then raise exception 'not_found'; end if;
  perform public.audit(p_business, 'site.manifest', jsonb_build_object('version', v));
  return v;
end $$;

create function public.set_site_kind(p_business uuid, p_kind text, p_external_url text default null, p_revalidate_url text default null) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_privileged() then raise exception 'staff_only' using errcode = '42501'; end if;
  update public.websites set kind = p_kind, external_url = nullif(trim(p_external_url), ''), revalidate_url = nullif(trim(p_revalidate_url), ''), updated_at = now() where business_id = p_business;
  if not found then raise exception 'not_found'; end if;
  perform public.audit(p_business, 'site.kind', jsonb_build_object('kind', p_kind, 'external_url', p_external_url, 'revalidate_url', p_revalidate_url));
end $$;

create function public.rotate_preview_token(p_business uuid) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare t uuid;
begin
  if not public.can_manage(p_business, 'site.preview_token') then raise exception 'not_member' using errcode = '42501'; end if;
  update public.websites set preview_token = gen_random_uuid() where business_id = p_business returning preview_token into t;
  return t;
end $$;

/** Published content for a site (anon). Nothing is returned when the business has no website plan. */
create function public.public_site_v1(p_slug text) returns table (
  business_id uuid, name text, slug text, kind text, content jsonb, manifest jsonb, manifest_version int, revision_id uuid, revision_version int, published_at timestamptz
) language sql stable security definer set search_path = public, pg_temp as $$
  select b.id, b.name, b.slug, w.kind, r.content, w.manifest, w.manifest_version, r.id, r.version, w.published_at
  from public.businesses b
  join public.websites w on w.business_id = b.id
  join public.website_revisions r on r.id = w.published_revision_id
  where b.slug = p_slug and public.has_module(b.id, 'website')
$$;

/** Draft content for a preview, gated by the site's preview token. */
create function public.site_draft_v1(p_slug text, p_token uuid) returns table (
  business_id uuid, name text, slug text, kind text, content jsonb, manifest jsonb, manifest_version int, draft_version int, updated_at timestamptz
) language sql stable security definer set search_path = public, pg_temp as $$
  select b.id, b.name, b.slug, w.kind, w.draft, w.manifest, w.manifest_version, w.draft_version, w.updated_at
  from public.businesses b join public.websites w on w.business_id = b.id
  where b.slug = p_slug and w.preview_token = p_token
$$;

-- ---------------------------------------------------------------- RLS and grants
alter table public.audit_log enable row level security;
alter table public.internal_entitlements enable row level security;
create policy audit_staff_read on public.audit_log for select to authenticated using (public.is_staff());
create policy pending_staff_read on public.pending_access for select to authenticated using (public.is_staff());
create policy claim_requests_staff_update on public.claim_requests for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy entitlements_read on public.internal_entitlements for select to authenticated using (public.is_member(business_id) or public.is_staff());

revoke all on public.audit_log, public.internal_entitlements from anon, authenticated;
grant select on public.audit_log, public.pending_access, public.internal_entitlements to authenticated;
grant all on public.audit_log, public.internal_entitlements to service_role;
grant usage, select on sequence public.audit_log_id_seq to authenticated, service_role;

revoke execute on function public.audit(uuid, text, jsonb), public.can_manage(uuid, text), public.is_privileged() from public, anon, authenticated;
revoke execute on function public.add_pending_access(text, uuid, public.member_role, boolean, text), public.revoke_pending_access(uuid), public.link_listing(uuid, text),
  public.provision_business(text, text, text, text, text), public.staff_switch(uuid), public.grant_internal_plan(uuid, public.plan_code, text, timestamptz),
  public.set_site_manifest(uuid, jsonb), public.set_site_kind(uuid, text, text, text), public.rotate_preview_token(uuid), public.public_site_v1(text), public.site_draft_v1(text, uuid) from public, anon;
grant execute on function public.add_pending_access(text, uuid, public.member_role, boolean, text), public.revoke_pending_access(uuid), public.link_listing(uuid, text),
  public.provision_business(text, text, text, text, text), public.staff_switch(uuid), public.grant_internal_plan(uuid, public.plan_code, text, timestamptz),
  public.set_site_manifest(uuid, jsonb), public.set_site_kind(uuid, text, text, text), public.rotate_preview_token(uuid) to authenticated, service_role;
grant execute on function public.public_site_v1(text), public.site_draft_v1(text, uuid) to anon, authenticated, service_role;
grant execute on function public.audit(uuid, text, jsonb), public.can_manage(uuid, text), public.is_privileged() to service_role;
