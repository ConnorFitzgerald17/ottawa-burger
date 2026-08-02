# Ottawa Burger Spot

An independent Ottawa burger-review site led equally by main reviewers Connor and Alex. It includes a public review library, burger-first scorecards, neighbourhood discovery, and a private two-person editor.

## Local development

Requirements: Node.js 20.9 or newer and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your Supabase project values.
3. Apply `supabase/migrations/202608020001_initial_schema.sql` through the Supabase SQL editor or CLI.
4. Start the app with `npm run dev` and open `http://localhost:3000`.

Without Supabase variables, the public site intentionally renders its polished “first verdict coming soon” state. The editor explains that configuration is still required.

## Supabase setup

The first migration creates the review schema, row-level security policies, public photo bucket, and seeded Connor/Alex reviewer profiles.

1. Create two email/password users in **Authentication → Users**. Public signup should remain disabled.
2. Copy each new auth user UUID.
3. Approve the two accounts as editors with the following SQL, substituting the real UUIDs:

```sql
insert into public.admin_users (user_id, reviewer_id)
values
  ('CONNOR_AUTH_USER_UUID', '00000000-0000-0000-0000-000000000001'),
  ('ALEX_AUTH_USER_UUID', '00000000-0000-0000-0000-000000000002');
```

Both main reviewers have equal access and can manage every review. Drafts and archived reviews are protected by row-level security; anonymous visitors can query only published reports. Review photos are public once their unguessable URL is known, while uploads and record changes require an approved editor.

## Environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical site URL, such as `https://ottawaburgerspot.com`.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe project publishable key.

## Review workflow

1. Sign in at `/admin/login` and create a report.
2. Save once as a draft to receive a review ID and unlock photo uploads.
3. Add images and alt text, choose a cover, and arrange their order.
4. Complete both scorecards and final takes, preview the report, then publish.

Every category accepts scores from 0.0–10.0 in one-decimal increments. The server calculates each reviewer score as 40% burger plus 60% shared equally across that reviewer’s other applicable categories. It averages the two results and rounds to one decimal. Beer fields can be left blank when they do not apply.

## Verification and deployment

Run `npm run check` for type checking, linting, unit tests, and a production build. Deploy the repository to Vercel, copy the environment variables into the project, and point `ottawaburgerspot.com` at the deployment. Update Supabase Auth’s site URL to the final HTTPS domain.
