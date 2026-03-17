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
| amount | bigint | |
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
| budget_limit | bigint | nullable — monthly budget |
| created_at | timestamptz | |

### `goals`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | DEFAULT auth.uid() |
| name | text | max 60 chars |
| target_amount | bigint | |
| current_amount | bigint | |
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
- Money inputs use dot separators (e.g. `1.000.000`) — the `fmtInput()` helper formats digits as-you-type.
- **All amount inputs enforce multiples of 1,000₫** — validation blocks submit and shows an error if not divisible by 1000.
- A live hint displays below amount fields once the value reaches ≥ 1,000 (e.g. `= 1.500.000₫`). If ≥ 1,000,000 a triệu label is shown; if ≥ 1,000,000,000 the label switches to tỉ.
- `amountHint(formatted: string)` is a shared helper duplicated in each component file (GoalForm, GoalCard, CategoriesClient). Keep it consistent if updating.
- `MAX_AMOUNT = 999_999_999_999` (12 digits, 999 tỉ) is the input cap — well within `bigint` DB column range and `Number.MAX_SAFE_INTEGER`. Defined in each file that runs validation (GoalCard, GoalsClient, CategoriesClient, TransactionModal). `fmtInput()` also slices raw digits to 12 to prevent typing beyond this limit.

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
- Input validation happens in server actions before any DB call. Client-side validation (e.g. divisibility) is also added as a UX guard but is not a substitute for server-side checks.
- Components are split by concern — avoid files over ~150 lines.
- No `date-fns` — use native `Date` APIs.
- All amount inputs must enforce multiples of 1,000₫ with a visible error and a live VND hint.
- `CurrencyProvider` only exposes `fmt(amount: number): string` — there is no currency switcher or `setCurrency`.
- Git remote: `https://github.com/luckyadmin-android/finance-tracker.git`, branch `master`.

## Debugging Log (2026-03-17) — Systematic Debugging Audit

### Method
Used `superpowers:systematic-debugging` 4-phase process: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation.

### Issues Found & Fixed

| # | Severity | Issue | Root Cause | Fix | Files Changed |
|---|----------|-------|-----------|-----|---------------|
| 1 | CRITICAL | Amounts not validated as multiples of 1,000₫ on server | Server actions only checked `> 0` and `<= MAX_AMOUNT` but never `% 1000` — client-side validation alone is bypassable | Added `% 1000 !== 0` checks in all `validate*()` functions and `addGoalAmount()` | `actions/transactions.ts`, `actions/categories.ts`, `actions/goals.ts` |
| 2 | CRITICAL | Delete operations update UI without checking server response | `handleDelete()` called server action with `await` but never inspected the return value — UI removed the item even if server returned an error | All 3 delete handlers now check `result.success` before updating state, show `alert()` on failure | `GoalsClient.tsx`, `CategoriesClient.tsx`, `TransactionsClient.tsx` |
| 3 | CRITICAL | `addGoalAmount` silently fails | `handleAddAmount()` only handled the success path (`if (result.success)`) with no `else` branch — user gets zero feedback on server error | Added `else { alert(result.error) }` branch | `GoalsClient.tsx` |
| 4 | MEDIUM | Delete buttons clickable during pending delete (double-click risk) | No `disabled` prop on Trash2 buttons in GoalsClient and CategoriesClient (TransactionsClient already had `deleting` state) | Added `deleting` state + `disabled` prop with `opacity-40 pointer-events-none` styles | `GoalsClient.tsx`, `GoalCard.tsx`, `CategoriesClient.tsx` |

### Issues Investigated but NOT Bugs
| Issue | Finding |
|-------|---------|
| `bg-mesh-light` missing `dark:` variant | `.dark .bg-mesh-light` is defined in `globals.css` — dark mode handled via CSS, not Tailwind `dark:` prefix. Not a bug. |
| Non-null assertions (`!`) on `category` in dashboard `page.tsx` | Guarded by `.filter(t => t.category)` upstream — safe at runtime despite TypeScript hint. Acceptable trade-off. |

### Verification
- `npm run build` passes cleanly with 0 type errors after all fixes.
