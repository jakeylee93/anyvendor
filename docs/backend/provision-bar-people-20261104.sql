-- The Bar People workspace + trusted owner email (4 Nov 2026). Narrow, idempotent. Run as a direct
-- database session AFTER 20261103090000_owner_claims. Creates no auth users and sends no email.
-- The verified owner is the existing auth user f91e23fc-3aa3-4fcb-a3cc-e2b1f59d14f1 (jake@thebarpeople.co.uk).
do $body$
declare v_id uuid; v_jake uuid := 'f91e23fc-3aa3-4fcb-a3cc-e2b1f59d14f1';
begin
  if not exists (select 1 from auth.users where id = v_jake and lower(btrim(email)) = 'jake@thebarpeople.co.uk' and email_confirmed_at is not null) then
    raise exception 'verified Jake user not found; stop';
  end if;
  select id into v_id from public.businesses where slug = 'the-bar-people';
  if v_id is null then
    insert into public.businesses (name, slug, directory_slug, timezone, created_by) values ('The Bar People', 'the-bar-people', 'the-bar-people', 'Europe/London', v_jake) returning id into v_id;
  end if;
  insert into public.websites (business_id, kind, external_url) values (v_id, 'external', 'https://thebarpeople.co.uk/') on conflict (business_id) do nothing;
  insert into public.pending_access (email, business_id, role, note)
    select 'jake@thebarpeople.co.uk', v_id, 'owner', 'Trusted owner email for The Bar People listing (4 Nov 2026)'
    where not exists (select 1 from public.pending_access where email = 'jake@thebarpeople.co.uk' and business_id = v_id)
      and not exists (select 1 from public.memberships where user_id = v_jake and business_id = v_id);
  perform public.apply_pending_access(v_jake);
end $body$;

select b.slug, b.name, b.directory_slug, w.kind, w.external_url,
  (select json_agg(json_build_object('user', m.user_id, 'role', m.role)) from public.memberships m where m.business_id = b.id) as members,
  (select count(*) from public.pending_access p where p.business_id = b.id and p.claimed_at is null) as unclaimed
from public.businesses b join public.websites w on w.business_id = b.id where b.slug = 'the-bar-people';
