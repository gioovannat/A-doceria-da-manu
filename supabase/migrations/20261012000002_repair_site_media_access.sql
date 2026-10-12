-- Storage access must use the private authorization helper introduced by the
-- security hardening migration. Public reads remain limited to the public bucket.
drop policy if exists "staff uploads site media" on storage.objects;
create policy "staff uploads site media" on storage.objects for insert to authenticated
with check (bucket_id = 'site-media' and (select private.is_staff()));

drop policy if exists "staff updates site media" on storage.objects;
create policy "staff updates site media" on storage.objects for update to authenticated
using (bucket_id = 'site-media' and (select private.is_staff()))
with check (bucket_id = 'site-media' and (select private.is_staff()));

drop policy if exists "staff deletes site media" on storage.objects;
create policy "staff deletes site media" on storage.objects for delete to authenticated
using (bucket_id = 'site-media' and (select private.is_staff()));
