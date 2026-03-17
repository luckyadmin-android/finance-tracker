# Frontend — Components, Styling & Patterns

## Component Map
| Component | Role |
|-----------|------|
| `Sidebar.tsx` | Nav + dark mode toggle + sign out |
| `ThemeProvider.tsx` | Dark mode context (localStorage + OS preference) |
| `CurrencyProvider.tsx` | `fmt()` helper for VND formatting |
| `TransactionsClient.tsx` | Transactions page orchestrator |
| `TransactionFilters.tsx` | Filter bar (search, type, category, month, year) |
| `TransactionList.tsx` | Transaction rows |
| `TransactionModal.tsx` | Add/edit transaction modal |
| `CategoriesClient.tsx` | Category CRUD |
| `GoalsClient.tsx` | Goals page orchestrator |
| `GoalForm.tsx` | Add/edit goal form |
| `GoalCard.tsx` | Individual goal card with progress bar |
| `BudgetOverview.tsx` | Budget progress bars on dashboard |
| `DashboardCharts.tsx` | Bar chart (monthly) + pie chart (by category) |
| `RecentTransactions.tsx` | Recent transactions list on dashboard |
| `SummaryCards.tsx` | Income/expense/balance summary cards |

## Server vs Client
- Dashboard pages (`page.tsx`) are **server components** — fetch data directly.
- Interactive components (`*Client.tsx`, modals, forms) are **client components** (`"use client"`).
- All mutations go through **server actions** — never call Supabase directly from client components for writes.

## Currency (VND Only)
- Only VND supported. All amounts are integers (no decimals).
- `useCurrency()` hook → `fmt(amount)` which calls `formatCurrency(n, "VND")`.
- Money inputs use dot separators (e.g. `1.000.000`) — `fmtInput()` formats digits as-you-type.
- **All amount inputs enforce multiples of 1,000₫** — validation blocks submit with visible error.
- Live hint below amount fields: `= 1.500.000₫` with triệu/tỉ label at thresholds.
- `amountHint()` is duplicated in GoalForm, GoalCard, CategoriesClient — keep consistent.
- `MAX_AMOUNT = 999_999_999_999` (12 digits, 999 tỉ). `fmtInput()` slices raw digits to 12.
- `CurrencyProvider` only exposes `fmt(amount: number): string` — no currency switcher.

## Dark Mode
- Controlled by `ThemeProvider` context — toggles `dark` class on `<html>`.
- Persisted to `localStorage`. Respects OS preference on first visit.
- Anti-flash inline `<script>` in root `layout.tsx` applies the class before paint.
- `bg-mesh-light` has a `.dark` variant defined in `globals.css` (not via Tailwind `dark:` prefix).
- Always add `dark:` variants when writing new UI.

## Recurring Transactions
- When `is_recurring=true`, `next_occurrence` holds the date of the next auto-created copy.
- On mount of `TransactionsClient`, any transaction with `next_occurrence <= today` is auto-materialized and `next_occurrence` is cleared on the original.
- `calcNextOccurrence()` and `calcNextFutureOccurrence()` are in `lib/utils.ts`.

## Loading Skeletons
Each dashboard route has a `loading.tsx` with `animate-pulse` skeleton matching the page layout and theme.
