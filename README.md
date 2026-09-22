# DIYOR BURGER

Mobile-first web application for DIYOR BURGER: menu, cart, delivery/pickup checkout and manually sent WhatsApp orders. The owner manages business data through a protected Supabase-backed admin area.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase, Zod, Vitest, Vercel.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase URL and either the current publishable key or the legacy anon key.
3. Verify the linked Supabase project, review `npx supabase migration list`, then apply the versioned migrations in `supabase/migrations`.
4. Create the first Supabase Auth user, then manually insert its UUID into `admin_profiles`.
5. Run `npm run dev`.

## Commands

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

## Data and order safety

Money is stored in diram. Delivery zones, prices and WhatsApp number are database-controlled. The later checkout server action will recalculate all prices and delivery from database records before generating a `wa.me` URL; it will never trust client totals.

Images uploaded from the admin area use the `restaurant-media` Storage bucket. The browser uses only the public Supabase key; Storage writes are restricted by bucket RLS to active admins.

## Deployment

Set the same public Supabase environment variables in Vercel. Apply reviewed migrations before a Preview deployment. Do not expose service-role keys to the browser. See `OWNER_GUIDE.md` for owner operations.
