alter table public.venues
add column if not exists is_closed boolean not null default false;
