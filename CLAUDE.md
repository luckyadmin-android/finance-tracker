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
    (dashboard)/           # Protected dashboard routes (auth guard in layout.tsx)
      layout.tsx           # Checks auth, renders Sidebar
      page.tsx             # Dashboard overview (server component)
      loading.tsx          # Skeleton UI
      transactions/        # Transactions list
      categories/          # Category management
      goals/               # Savings goals
    actions/               # Server actions with input validation
      transactions.ts
      categories.ts
      goals.ts
    layout.tsx             # Root layout — ThemeProvider, CurrencyProvider, anti-flash script
  components/
    Sidebar.tsx            # Nav + dark mode toggle + sign out
    ThemeProvider.tsx      # Dark mode context (localStorage + OS preference)
    CurrencyProvider.tsx   # fmt() helper for VND formatting
    TransactionsClient.tsx # Transactions page orchestrator
    TransactionFilters.tsx # Filter bar (search, type, category, month, year)
    TransactionList.tsx    # Transaction rows
    TransactionModal.tsx   # Add/edit transaction modal
    CategoriesClient.tsx   # Category CRUD
    GoalsClient.tsx        # Goals page orchestrator
    GoalForm.tsx           # Add/edit goal form
    GoalCard.tsx           # Individual goal card with progress bar
    BudgetOverview.tsx     # Budget progress bars on dashboard
    DashboardCharts.tsx    # Bar chart (monthly) + pie chart (by category)
    RecentTransactions.tsx # Recent transactions list on dashboard
    SummaryCards.tsx       # Income/expense/balance summary cards
  lib/
    supabase/
      client.ts            # Browser Supabase client
      server.ts            # Server Supabase client (uses cookies())
      middleware.ts        # Session refresh middleware
    utils.ts               # formatCurrency, formatDate, calcNextOccurrence, CATEGORY_COLORS, etc.
  types/
    index.ts               # Transaction, Category, Goal, TransactionType, RecurrenceType, etc.
```

## Database Schema (Supabase)
All tables have `user_id uuid references auth.users` with RLS enabled.

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | DEFAULT auth.uid() |
| type | text | 'income' or 'expense' |
| amount | numeric | |
| description | text | max 100 chars |
| category_id | uuid | nullable FK → categories |
| date | date | |
| is_recurring | boolean | |
| recurrence | text | 'daily','weekly','monthly','yearly' or null |
| next_occurrence | date | nullable — date of next auto-create |
| created_at | timestamptz | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | DEFAULT auth.uid() |
| name | text | max 40 chars |
| type | text | 'income' or 'expense' |
| color | string | hex color from CATEGORY_COLORS |
| budget_limit | numeric | nullable — monthly budget |
| created_at | timestamptz | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | DEFAULT auth.uid() |
| name | text | max 60 chars |
| target_amount | numeric | |
| current_amount | numeric | |
| color | string | hex color |
| deadline | date | nullable |
| created_at | timestamptz | |

### RLS Policies
All tables have SELECT/INSERT/UPDATE/DELETE policies: `auth.uid() = user_id`.

### Trigger: Default Categories on Signup
A Postgres trigger `on_auth_user_created` fires on `auth.users` INSERT and seeds default expense + income categories for the new user. Uses `SECURITY DEFINER SET search_path = public`.

## Key Patterns

### Auth
- `(dashboard)/layout.tsx` is the auth gate — calls `supabase.auth.getUser()` and redirects to `/login` if unauthenticated.
- Middleware in `src/lib/supabase/middleware.ts` refreshes sessions on every request.

### Server vs Client
- Dashboard pages (`page.tsx`) are **server components** — fetch data directly.
- Interactive components (`*Client.tsx`, modals, forms) are **client components** (`"use client"`).
- All mutations go through **server actions** in `src/app/actions/` — never call Supabase directly from client components for writes.

### Currency
- Only VND is supported. All amounts are integers (no decimals).
- Use `useCurrency()` hook to get `fmt(amount)` which calls `formatCurrency(n, "VND")` from utils.
- Money inputs use dot separators (e.g. `1.000.000`) — the `fmtInput()` helper in modals handles this.

### Dark Mode
- Controlled by `ThemeProvider` context — toggles `dark` class on `<html>`.
- Persisted to `localStorage`. Respects OS preference on first visit.
- Anti-flash inline `<script>` in root `layout.tsx` applies the class before paint.
- Always add `dark:` variants when writing new UI.

### Recurring Transactions
- When `is_recurring=true`, `next_occurrence` holds the date of the next auto-created copy.
- On mount of `TransactionsClient`, any transaction with `next_occurrence <= today` is automatically materialized as a new transaction and `next_occurrence` is cleared on the original.
- `calcNextOccurrence(date, recurrence)` and `calcNextFutureOccurrence(date, recurrence)` are in `lib/utils.ts`.

### Loading Skeletons
Each dashboard route has a `loading.tsx` with an animated `animate-pulse` skeleton that matches the page layout.

## Environment Variables
Set in `.env.local` (not committed) and in Vercel project settings:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Conventions
- Vietnamese UI text throughout — keep all user-facing strings in Vietnamese.
- Prefer server actions over client-side Supabase calls for any data mutation.
- Server actions always verify `auth.getUser()` and use `.eq("user_id", user.id)` on updates/deletes.
- Input validation happens in server actions before any DB call.
- Components are split by concern — avoid files over ~150 lines.
- No `date-fns` — use native `Date` APIs.
- Git remote: `https://github.com/luckyadmin-android/finance-tracker.git`, branch `master`.
