# Supabase Setup (Shared Dashboard Data)

Use this to make all app instances (different ports/servers) show the same bounty dashboard data.

## 1. Create table and policies

1. Open Supabase SQL Editor.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) to create `bounties`, `disputes`, and `submissions` tables.

## 2. Add env variables

In `projects/frontend/.env.local`, add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## 3. Restart dev server

```powershell
cd projects/frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

## Notes

- When Supabase env vars are present, bounties are read/written from Supabase.
- DAO disputes and voting are also read/written from Supabase.
- Bounty submissions are also shared via Supabase, so creators can review worker submissions across devices.
- If env vars are missing or Supabase fails, the app falls back to browser `localStorage`.
- Dashboard cards now use only stored bounty data (no injected mock rows).
