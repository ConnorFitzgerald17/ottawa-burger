-- Reserve the clean restaurant slug for the newest review of each venue.
-- Older repeat visits remain archived with internal-only unique slugs.
with ranked_reviews as (
  select
    reviews.id,
    row_number() over (
      partition by reviews.venue_id
      order by reviews.visit_date desc, reviews.created_at desc
    ) as visit_rank
  from public.reviews
)
update public.reviews
set slug = '__slug_migration__-' || replace(public.reviews.id::text, '-', '')
from ranked_reviews
where public.reviews.id = ranked_reviews.id;

with ranked_reviews as (
  select
    reviews.id,
    venues.slug as restaurant_slug,
    row_number() over (
      partition by reviews.venue_id
      order by reviews.visit_date desc, reviews.created_at desc
    ) as visit_rank
  from public.reviews
  join public.venues on venues.id = reviews.venue_id
)
update public.reviews
set
  slug = case
    when ranked_reviews.visit_rank = 1 then ranked_reviews.restaurant_slug
    else ranked_reviews.restaurant_slug || '-archived-' || left(public.reviews.id::text, 8)
  end,
  status = case
    when ranked_reviews.visit_rank = 1 then public.reviews.status
    else 'archived'::public.review_status
  end
from ranked_reviews
where public.reviews.id = ranked_reviews.id;
