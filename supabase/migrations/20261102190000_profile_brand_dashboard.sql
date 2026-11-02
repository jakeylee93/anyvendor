-- My profile, Brand kit, customisable Home dashboard and AnyVendor insights.
-- Same rules as the core: members read their own rows; writes go through checked functions.

alter function public.request_before_update() set search_path = public, pg_temp;
alter function public.request_transition_allowed(text, public.request_status, public.request_status) set search_path = public, pg_temp;
alter function public.plan_rank(public.plan_code) set search_path = public, pg_temp;

-- Directory profile the business edits (reviewed by AnyVendor before it replaces the public listing).
create table public.vendor_profiles (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object'),
  version int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create function public.save_vendor_profile(p_business uuid, p_profile jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v int;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_profile) <> 'object' or pg_column_size(p_profile) > 100000 then raise exception 'invalid_content'; end if;
  insert into public.vendor_profiles (business_id) values (p_business) on conflict (business_id) do nothing;
  update public.vendor_profiles set draft = p_profile, version = version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and version = p_expected_version returning version into v;
  if v is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  return v;
end $$;

-- Brand kit: colours, fonts, company details; files live in the private brand-assets bucket.
create table public.brand_kits (
  business_id uuid primary key references public.businesses (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  version int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create function public.save_brand_kit(p_business uuid, p_kit jsonb, p_expected_version int) returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare v int;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_kit) <> 'object' or pg_column_size(p_kit) > 50000 then raise exception 'invalid_content'; end if;
  insert into public.brand_kits (business_id) values (p_business) on conflict (business_id) do nothing;
  update public.brand_kits set data = p_kit, version = version + 1, updated_at = now(), updated_by = auth.uid()
  where business_id = p_business and version = p_expected_version returning version into v;
  if v is null then raise exception 'version_conflict' using errcode = '40001'; end if;
  return v;
end $$;

create table public.brand_files (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  kind text not null check (kind in ('logo', 'document', 'image', 'other')),
  label text not null check (char_length(label) between 1 and 120),
  storage_path text not null unique,
  content_type text not null,
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 20971520),
  created_by uuid not null,
  created_at timestamptz not null default now()
);
create index brand_files_business_idx on public.brand_files (business_id, kind, created_at desc);

create function public.add_brand_file(p_business uuid, p_kind text, p_label text, p_path text, p_content_type text, p_size int) returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if p_path not like p_business::text || '/brand/%' then raise exception 'invalid_path'; end if;
  if p_content_type not in ('image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf') then raise exception 'unsupported_type'; end if;
  insert into public.brand_files (business_id, kind, label, storage_path, content_type, size_bytes, created_by)
  values (p_business, p_kind, left(trim(p_label), 120), p_path, p_content_type, p_size, auth.uid()) returning id into v_id;
  return v_id;
end $$;

create function public.remove_brand_file(p_file uuid) returns text
language plpgsql security definer set search_path = public, pg_temp as $$
declare f public.brand_files%rowtype;
begin
  select * into f from public.brand_files where id = p_file;
  if f.id is null or not public.is_member(f.business_id) then raise exception 'not_member' using errcode = '42501'; end if;
  delete from public.brand_files where id = p_file;
  return f.storage_path;
end $$;

-- Each person arranges their own Home widgets per business.
create table public.dashboard_layouts (
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  layout jsonb not null check (jsonb_typeof(layout) = 'array' and jsonb_array_length(layout) <= 30),
  updated_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create function public.save_dashboard_layout(p_business uuid, p_layout jsonb) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_member(p_business) then raise exception 'not_member' using errcode = '42501'; end if;
  if jsonb_typeof(p_layout) <> 'array' or jsonb_array_length(p_layout) > 30 then raise exception 'invalid_content'; end if;
  insert into public.dashboard_layouts (business_id, user_id, layout) values (p_business, auth.uid(), p_layout)
  on conflict (business_id, user_id) do update set layout = excluded.layout, updated_at = now();
end $$;

-- Articles and industry tips written by the AnyVendor team (managed by staff).
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 160),
  summary text not null default '' check (char_length(summary) <= 400),
  body text not null default '' check (char_length(body) <= 40000),
  category text not null default 'Tips',
  author text not null default 'AnyVendor team',
  image_url text check (image_url is null or image_url ~ '^https://'),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index insights_published_idx on public.insights (published_at desc);

alter table public.vendor_profiles enable row level security;
alter table public.brand_kits enable row level security;
alter table public.brand_files enable row level security;
alter table public.dashboard_layouts enable row level security;
alter table public.insights enable row level security;

create policy vendor_profiles_read on public.vendor_profiles for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy brand_kits_read on public.brand_kits for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy brand_files_read on public.brand_files for select to authenticated using (public.is_member(business_id) or public.is_staff());
create policy dashboard_layouts_read on public.dashboard_layouts for select to authenticated using (user_id = auth.uid() and public.is_member(business_id));
create policy insights_read on public.insights for select to authenticated using (published_at is not null and published_at <= now());

revoke all on public.vendor_profiles, public.brand_kits, public.brand_files, public.dashboard_layouts, public.insights from anon, authenticated;
grant select on public.vendor_profiles, public.brand_kits, public.brand_files, public.dashboard_layouts, public.insights to authenticated;
grant all on public.vendor_profiles, public.brand_kits, public.brand_files, public.dashboard_layouts, public.insights to service_role;

revoke execute on function public.save_vendor_profile(uuid, jsonb, int), public.save_brand_kit(uuid, jsonb, int),
  public.add_brand_file(uuid, text, text, text, text, int), public.remove_brand_file(uuid), public.save_dashboard_layout(uuid, jsonb) from public, anon;
grant execute on function public.save_vendor_profile(uuid, jsonb, int), public.save_brand_kit(uuid, jsonb, int),
  public.add_brand_file(uuid, text, text, text, text, int), public.remove_brand_file(uuid), public.save_dashboard_layout(uuid, jsonb) to authenticated, service_role;
