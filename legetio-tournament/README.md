# Legetio Youth Tournament

React + Vite + Tailwind CSS tournament manager (ward qualifiers -> constituency main tournament).
Offline-first: data is stored in the browser (localStorage) until you add a database (Phase 2).
Note: views use `htm` tagged templates (JSX-like, no build plugin needed) in `src/main.js`.

## Run it on your computer (5 minutes)
1. Install Node.js LTS from https://nodejs.org
2. Open a terminal in this folder:
   ```
   npm install
   npm run dev        # opens http://localhost:5173
   npm run build      # production files go to /dist
   ```

## Making it real: roadmap

### Phase 1 - Go online (free, today)
Deploy `/dist` as a static site. Easiest: push this folder to GitHub, then on https://vercel.com
(or Netlify / Cloudflare Pages) "Import Project" -> framework "Vite" -> Deploy. You get a public link;
buy a domain later (e.g. legetioyouth.co.ke) and attach it in the host's dashboard.
Limit: data lives on one phone/laptop only. Fine for a pilot with ONE person entering scores.

### Phase 2 - Shared database (recommended: Supabase)
Why Supabase: managed PostgreSQL, built-in admin login, row-level security, realtime updates, generous free tier
(check current limits at supabase.com/pricing), no server to maintain.
1. Create a project at https://supabase.com.
2. SQL Editor -> paste `supabase/schema.sql` -> Run. (Tables, rules: public can read, only admins write.)
3. Authentication -> Users -> add the organisers' emails. Only these can edit.
4. Copy `.env.example` to `.env`, fill the Project URL and anon key (Project Settings -> API).
5. `npm install @supabase/supabase-js`, create `src/supabase.js`:
   ```js
   import { createClient } from '@supabase/supabase-js';
   export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```
6. Replace the localStorage `load()` / save effect in `main.js` with `supabase.from('teams').select(...)` reads
   and inserts/updates from the admin forms; add a login form before the Admin tab
   (`supabase.auth.signInWithPassword`). Use `supabase.channel(...)` for live scores so every phone updates instantly.
   Standings, top scorers and qualifiers are already computed in the app from matches/events, so no extra tables needed.
Add your `.env` values in Vercel's Environment Variables too.

### Phase 3 - Works with poor network (PWA)
`npm i -D vite-plugin-pwa`, add it to `vite.config.js`. Fans can "Add to Home Screen"; pages load offline from cache.

### Phase 4 - Run the tournament
- Register teams with a player list and ID/birth-certificate check (schema has `dob` and `id_verified`) to enforce age limits.
- Appoint 1-2 score keepers per ground with admin logins; share the link on WhatsApp.
- Back up weekly: Supabase dashboard -> Database -> Backups, or export CSV per table.

### Alternatives
Firebase (Firestore + Auth) works equally well; PocketBase / a VPS if you want to self-host; Google Sheets is a
stop-gap, not recommended for live scores.

## Project layout
```
index.html              entry
src/main.js             app (data, calculations, all views, admin)
src/index.css           Tailwind + theme (dark green/gold, auto light mode)
supabase/schema.sql     production database schema
.env.example            Supabase keys template
```
