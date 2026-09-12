-- Run this whole file in Supabase: Dashboard -> SQL Editor -> New query -> Run.

-- 1. The table that stores each sighting.
create table if not exists stickers (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  caption text,
  image_url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

alter table stickers enable row level security;

-- Anyone visiting the map can see all pins.
create policy "Public can view stickers"
  on stickers for select
  using (true);

-- Anyone visiting the map can add a pin (no login required, matches the prototype).
create policy "Public can add stickers"
  on stickers for insert
  with check (true);

-- Public deletion is OFF by default — this is a live public website, not the
-- prototype, so removing a pin requires no auth otherwise. Uncomment the two
-- policies below (this one and the matching storage one further down) only if
-- you're comfortable with any visitor being able to remove any pin, or once
-- you've added real authentication and want to scope this to admins instead.
-- create policy "Public can delete stickers"
--   on stickers for delete
--   using (true);


-- 2. Storage policies for the sticker photo bucket.
-- First create the bucket itself from the dashboard:
--   Storage -> New bucket -> name it exactly "sticker-photos" -> toggle Public bucket ON.
-- Then run the policies below.

create policy "Public can view sticker photos"
  on storage.objects for select
  using (bucket_id = 'sticker-photos');

create policy "Public can upload sticker photos"
  on storage.objects for insert
  with check (bucket_id = 'sticker-photos');

-- Pairs with the commented-out table delete policy above — leave both off,
-- or turn both on together.
-- create policy "Public can delete sticker photos"
--   on storage.objects for delete
--   using (bucket_id = 'sticker-photos');
