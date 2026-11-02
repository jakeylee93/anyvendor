-- Storage buckets and policies (Supabase storage schema; not part of the PGlite test run).
-- Paths always start with the business id, so membership decides access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('request-attachments', 'request-attachments', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('social-media', 'social-media', false, 104857600, array['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime']),
  ('website-media', 'website-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "members read their business files" on storage.objects for select to authenticated
  using (bucket_id in ('request-attachments', 'social-media', 'website-media')
    and (public.is_member(((storage.foldername(name))[1])::uuid) or public.is_staff()));

create policy "members upload to their business folder" on storage.objects for insert to authenticated
  with check (bucket_id in ('request-attachments', 'social-media', 'website-media')
    and (public.is_member(((storage.foldername(name))[1])::uuid) or (bucket_id = 'request-attachments' and public.is_staff())));

create policy "members delete their own business files" on storage.objects for delete to authenticated
  using (bucket_id in ('social-media', 'website-media') and public.is_member(((storage.foldername(name))[1])::uuid));
