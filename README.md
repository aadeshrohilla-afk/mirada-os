# Mirada OS

Next.js + Supabase rebuild of Mirada Promise Portal + Design Room.

## Deploy

1. Create a Supabase project at https://supabase.com
2. SQL editor → paste `supabase/migrations/0001_init.sql` → run
3. Get Project URL + anon key + service_role key (Settings → API)
4. Push this repo to GitHub
5. Netlify → Add new site → Import from GitHub → pick this repo
6. Build settings auto-detected. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (optional for now)
7. Deploy. Netlify auto-installs Node deps and builds.
8. After deploy, visit the live URL → sign up with your email → in Supabase SQL editor run:
   `update public.profiles set role = 'admin', full_name = 'Your Name' where email = 'your@email.com';`
9. Refresh — you'll land in the admin dashboard.

## Roles

admin · merchandiser · designer · rd_executive · embroidery_executive · management

Each role gets its own dashboard at `/dashboard/<role>`. Pages are stubs in v1.

## v2 roadmap

- Queries CRUD with role-scoped views
- Samples + plan sheets + reviews
- Cost sheet 6-part calc
- PCM
- Email notifications (Resend)
- Data import from existing Google Sheets
