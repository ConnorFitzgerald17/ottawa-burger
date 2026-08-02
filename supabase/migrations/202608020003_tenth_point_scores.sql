alter table public.ratings
  drop constraint if exists ratings_score_check;

alter table public.ratings
  add constraint ratings_score_check
  check (score between 0 and 10);
