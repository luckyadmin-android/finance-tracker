# Finance Tracker — Claude Context

## Project Overview
A Vietnamese-language personal finance tracker built with Next.js 15 App Router and Supabase. Deployed on Vercel. All UI text is in Vietnamese.

## Tech Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5 (strict)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling**: Tailwind CSS 3 with `darkMode: "class"` strategy
- **Charts**: Recharts
- **Icons**: Lucide React
- **Auth**: Supabase SSR (`@supabase/ssr`) with cookie-based sessions
- **Deployment**: Vercel

## Project Structure
```
src/
  app/
    (auth)/login/          # Login page
    (auth)/signup/         # Signup page
    (dashboard)/           # Protected dashboard routes
      layout.tsx           # Auth guard, renders Sidebar
      page.tsx             # Dashboard overview (server component)
      loading.tsx          # Skeleton UI
      transactions/        # Transactions list
      categories/          # Category management
      goals/               # Savings goals
    actions/               # Server actions (transactions.ts, categories.ts, goals.ts)
    layout.tsx             # Root layout — ThemeProvider, CurrencyProvider, anti-flash script
  components/              # See CLAUDE.frontend.md
  lib/supabase/            # Client, server, middleware helpers
  lib/utils.ts             # Shared utilities
  types/index.ts           # TypeScript interfaces
```

## Conventions
- Vietnamese UI text throughout.
- Prefer server actions over client-side Supabase calls for writes.
- Components split by concern — avoid files over ~150 lines.
- No `date-fns` — use native `Date` APIs.
- All amounts are VND integers, multiples of 1,000₫.
- Git remote: `https://github.com/luckyadmin-android/finance-tracker.git`, branch `master`.

## Environment Variables
Set in `.env.local` (not committed) and in Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Related Docs
- [CLAUDE.frontend.md](CLAUDE.frontend.md) — Components, styling, dark mode, currency formatting
- [CLAUDE.backend.md](CLAUDE.backend.md) — Server actions, auth, validation rules
- [CLAUDE.database.md](CLAUDE.database.md) — Schema, RLS policies, triggers
- [CLAUDE.debug.md](CLAUDE.debug.md) — Debugging audit log
