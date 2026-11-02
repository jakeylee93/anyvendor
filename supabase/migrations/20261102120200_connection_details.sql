-- Non-secret connection details members may see: when the token expires (LinkedIn
-- tokens last 60 days with no refresh, so we prompt a reconnect), and settings such
-- as the Search Console properties available and the one chosen.
alter table public.provider_connections add column token_expires_at timestamptz;
alter table public.provider_connections add column settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object');

create function public.choose_seo_site(p_connection uuid, p_site text) returns void
language plpgsql security definer set search_path = public, pg_temp as $$
declare c public.provider_connections%rowtype;
begin
  select * into c from public.provider_connections where id = p_connection for update;
  if c.id is null or not public.is_member(c.business_id) then raise exception 'not_member' using errcode = '42501'; end if;
  if c.provider <> 'google_search_console' then raise exception 'wrong_provider'; end if;
  if not (coalesce(c.settings -> 'sites', '[]'::jsonb) ? p_site) then raise exception 'site_not_available'; end if;
  update public.provider_connections set settings = settings || jsonb_build_object('site', p_site), display_name = p_site, updated_at = now() where id = p_connection;
end $$;

revoke execute on function public.choose_seo_site(uuid, text) from public, anon;
grant execute on function public.choose_seo_site(uuid, text) to authenticated, service_role;
