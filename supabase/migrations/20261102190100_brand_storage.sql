-- Private brand-assets bucket (Supabase storage only; not part of the PGlite run).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('brand-assets', 'brand-assets', false, 20971520, array['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;

create policy "members read their brand files" on storage.objects for select to authenticated
  using (bucket_id = 'brand-assets' and (public.is_member(((storage.foldername(name))[1])::uuid) or public.is_staff()));
create policy "members upload brand files" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-assets' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members delete brand files" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-assets' and public.is_member(((storage.foldername(name))[1])::uuid));
