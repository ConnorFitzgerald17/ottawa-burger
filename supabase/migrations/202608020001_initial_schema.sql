create extension if not exists pgcrypto;

create type public.review_status as enum ('draft', 'published', 'archived');
create type public.baseline_type as enum ('original', 'closest', 'exception');
create type public.rating_category as enum ('burger', 'fries', 'beer', 'beer_selection', 'service', 'atmosphere');

create table public.reviewers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  bio text not null default '',
  avatar_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reviewer_id uuid references public.reviewers(id) on delete set null,
  role text not null default 'editor' check (role = 'editor'),
  created_at timestamptz not null default now()
);

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text not null,
  neighbourhood text not null,
  website_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete restrict,
  slug text not null unique,
  status public.review_status not null default 'draft',
  visit_date date not null,
  summary text not null,
  story text not null,
  verdict text not null,
  burger_order text not null,
  fries_order text,
  beer_order text,
  burger_price_cents integer check (burger_price_cents is null or burger_price_cents >= 0),
  baseline_type public.baseline_type not null default 'original',
  baseline_note text not null,
  overall_score numeric(3,1) not null default 0 check (overall_score between 0 and 10),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reviewer_id uuid not null references public.reviewers(id) on delete cascade,
  category public.rating_category not null,
  score numeric(3,1) not null check (score between 0 and 10),
  unique (review_id, reviewer_id, category)
);

create table public.reviewer_takes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reviewer_id uuid not null references public.reviewers(id) on delete cascade,
  body text not null,
  unique (review_id, reviewer_id)
);

create table public.review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  storage_path text not null unique,
  alt text not null check (char_length(alt) >= 3),
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index review_images_one_cover on public.review_images(review_id) where is_cover;
create index reviews_status_published_at_idx on public.reviews(status, published_at desc);
create index venues_neighbourhood_idx on public.venues(neighbourhood);
create index ratings_review_id_idx on public.ratings(review_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviewers_updated_at before update on public.reviewers for each row execute function public.set_updated_at();
create trigger venues_updated_at before update on public.venues for each row execute function public.set_updated_at();
create trigger reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();

create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

alter table public.reviewers enable row level security;
alter table public.admin_users enable row level security;
alter table public.venues enable row level security;
alter table public.reviews enable row level security;
alter table public.ratings enable row level security;
alter table public.reviewer_takes enable row level security;
alter table public.review_images enable row level security;

create policy "reviewers are public" on public.reviewers for select using (true);
create policy "editors manage reviewers" on public.reviewers for all using (public.is_editor()) with check (public.is_editor());
create policy "admins can read self" on public.admin_users for select using (user_id = auth.uid());

create policy "published venues are public" on public.venues for select using (
  public.is_editor() or exists(select 1 from public.reviews where reviews.venue_id = venues.id and reviews.status = 'published')
);
create policy "editors manage venues" on public.venues for all using (public.is_editor()) with check (public.is_editor());

create policy "published reviews are public" on public.reviews for select using (status = 'published' or public.is_editor());
create policy "editors create reviews" on public.reviews for insert with check (public.is_editor());
create policy "editors update reviews" on public.reviews for update using (public.is_editor()) with check (public.is_editor());
create policy "editors delete reviews" on public.reviews for delete using (public.is_editor());

create policy "published ratings are public" on public.ratings for select using (
  public.is_editor() or exists(select 1 from public.reviews where reviews.id = ratings.review_id and reviews.status = 'published')
);
create policy "editors manage ratings" on public.ratings for all using (public.is_editor()) with check (public.is_editor());

create policy "published takes are public" on public.reviewer_takes for select using (
  public.is_editor() or exists(select 1 from public.reviews where reviews.id = reviewer_takes.review_id and reviews.status = 'published')
);
create policy "editors manage takes" on public.reviewer_takes for all using (public.is_editor()) with check (public.is_editor());

create policy "published image records are public" on public.review_images for select using (
  public.is_editor() or exists(select 1 from public.reviews where reviews.id = review_images.review_id and reviews.status = 'published')
);
create policy "editors manage image records" on public.review_images for all using (public.is_editor()) with check (public.is_editor());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media', 'review-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "review photos are public" on storage.objects for select using (bucket_id = 'review-media');
create policy "editors upload review photos" on storage.objects for insert with check (bucket_id = 'review-media' and public.is_editor());
create policy "editors update review photos" on storage.objects for update using (bucket_id = 'review-media' and public.is_editor());
create policy "editors delete review photos" on storage.objects for delete using (bucket_id = 'review-media' and public.is_editor());

insert into public.reviewers (id, slug, display_name, bio, sort_order) values
  ('00000000-0000-0000-0000-000000000001', 'connor', 'Connor', 'Main reviewer. Tracks the sear, seasoning, structure, and whether the fries stay crisp.', 1),
  ('00000000-0000-0000-0000-000000000002', 'alex', 'Alex', 'Main reviewer. Tracks balance, execution, atmosphere, and how the whole visit comes together.', 2)
on conflict (id) do nothing;
