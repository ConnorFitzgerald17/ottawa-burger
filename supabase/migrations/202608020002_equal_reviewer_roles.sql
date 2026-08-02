update public.reviewers
set bio = case slug
  when 'connor' then 'Main reviewer. Tracks the sear, seasoning, structure, and whether the fries stay crisp.'
  when 'alex' then 'Main reviewer. Tracks balance, execution, atmosphere, and how the whole visit comes together.'
  else bio
end
where slug in ('connor', 'alex');
