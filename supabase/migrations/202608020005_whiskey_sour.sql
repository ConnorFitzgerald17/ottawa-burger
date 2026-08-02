alter table public.reviews
  add column whiskey_sour_score numeric(3,1),
  add column whiskey_sour_notes text;

alter table public.reviews
  add constraint reviews_whiskey_sour_score_check
  check (whiskey_sour_score is null or whiskey_sour_score between 0 and 10),
  add constraint reviews_whiskey_sour_pair_check
  check (
    (whiskey_sour_score is null and whiskey_sour_notes is null)
    or (
      whiskey_sour_score is not null
      and whiskey_sour_notes is not null
      and char_length(whiskey_sour_notes) between 10 and 1000
    )
  );
