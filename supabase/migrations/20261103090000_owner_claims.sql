-- Trusted owner emails for preloaded listings (narrow change, 4 Nov 2026).
-- A business is preloaded with the exact email of its trusted owner. When an auth user with that
-- exact, normalised, VERIFIED email exists (now or later), they are made a member automatically.
-- A typed email never grants anything: only auth.users rows with email_confirmed_at count.
-- Anyone else who signs in gets a safe path: request access to a listing for staff review.

create table public.pending_access (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email = btrim(email) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  business_id uuid references public.businesses (id) on delete cascade,
  role public.member_role not null default 'owner',
  make_staff boolean not null default false,
  note text,
  created_by uuid,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  claimed_user uuid,
  check (business_id is not null or make_staff)
);
create unique index pending_access_unique on public.pending_access (email, coalesce(business_id, '00000000-0000-0000-0000-000000000000'::uuid)) where claimed_at is null;
alter table public.pending_access enable row level security;
revoke all on public.pending_access from anon, authenticated;
grant all on public.pending_access to service_role;

/** Grants every unclaimed trusted-email record to one auth user, only if that user's email is verified. Idempotent. */
create function public.apply_pending_access(p_user uuid) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare u record; r record; n int := 0;
begin
  select id, lower(btrim(email)) as email, email_confirmed_at into u from auth.users where id = p_user;
  if u.id is null or u.email is null or u.email_confirmed_at is null then return 0; end if;
  for r in select * from public.pending_access where email = u.email and claimed_at is null order by created_at loop
    if r.make_staff then insert into public.staff_members (user_id, note) values (u.id, coalesce(r.note, 'AnyVendor team')) on conflict do nothing; end if;
    if r.business_id is not null then insert into public.memberships (business_id, user_id, role) values (r.business_id, u.id, r.role) on conflict do nothing; end if;
    update public.pending_access set claimed_at = now(), claimed_user = u.id where id = r.id;
    n := n + 1;
  end loop;
  return n;
end $$;

create function public.handle_auth_user_verified() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.email_confirmed_at is not null then perform public.apply_pending_access(new.id); end if;
  return new;
end $$;
create trigger av_grant_pending_access after insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user_verified();

revoke execute on function public.apply_pending_access(uuid), public.handle_auth_user_verified() from public, anon, authenticated;
grant execute on function public.apply_pending_access(uuid) to service_role;

-- Safe path when a signed-in user has no membership: ask for access to a listing; staff review it.
create table public.claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  directory_slug text,
  business_name text not null check (char_length(business_name) between 2 and 120),
  note text check (note is null or char_length(note) <= 500),
  status text not null default 'open' check (status in ('open', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);
create index claim_requests_user_idx on public.claim_requests (user_id, created_at desc);
alter table public.claim_requests enable row level security;
create policy claim_requests_own_read on public.claim_requests for select to authenticated using (user_id = auth.uid() or public.is_staff());
revoke all on public.claim_requests from anon, authenticated;
grant select on public.claim_requests to authenticated;
grant all on public.claim_requests to service_role;

/** A signed-in user asks for access to a listing. Records the request; grants nothing. One open request per user. */
create function public.request_listing_access(p_business_name text, p_directory_slug text default null, p_note text default null) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid; v_email text;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '42501'; end if;
  select lower(btrim(email)) into v_email from auth.users where id = auth.uid();
  if exists (select 1 from public.claim_requests where user_id = auth.uid() and status = 'open') then raise exception 'request_open'; end if;
  insert into public.claim_requests (user_id, email, directory_slug, business_name, note)
  values (auth.uid(), v_email, nullif(btrim(p_directory_slug), ''), btrim(p_business_name), nullif(btrim(p_note), '')) returning id into v_id;
  return v_id;
end $$;
revoke execute on function public.request_listing_access(text, text, text) from public, anon;
grant execute on function public.request_listing_access(text, text, text) to authenticated, service_role;
