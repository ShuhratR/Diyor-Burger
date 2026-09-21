insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('restaurant-media', 'restaurant-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create policy "public restaurant media read" on storage.objects for select using (bucket_id = 'restaurant-media');
create policy "active admins upload restaurant media" on storage.objects for insert to authenticated with check (bucket_id = 'restaurant-media' and public.is_admin());
create policy "active admins update restaurant media" on storage.objects for update to authenticated using (bucket_id = 'restaurant-media' and public.is_admin()) with check (bucket_id = 'restaurant-media' and public.is_admin());
create policy "active admins delete restaurant media" on storage.objects for delete to authenticated using (bucket_id = 'restaurant-media' and public.is_admin());
