# Backend — Server Actions, Auth & Validation

## Auth
- `(dashboard)/layout.tsx` is the auth gate — calls `supabase.auth.getUser()` and redirects to `/login` if unauthenticated.
- Middleware in `src/lib/supabase/middleware.ts` refreshes sessions on every request.

## Server Actions (`src/app/actions/`)
All mutations go through server actions. Each action:
1. Validates input (see rules below)
2. Verifies `auth.getUser()` — rejects if not logged in
3. Uses `.eq("user_id", user.id)` on all updates/deletes
4. Returns `{ success: true, data }` or `{ success: false, error }`

### Validation Rules
| Action | Rules |
|--------|-------|
| `transactions.ts` | type ∈ {income, expense}, amount > 0, amount ≤ 999,999,999,999, **amount % 1000 === 0**, description 1–100 chars, valid date, valid recurrence if recurring |
| `categories.ts` | name 1–40 chars, valid color from `CATEGORY_COLORS`, budget_limit ≥ 0 and ≤ MAX_AMOUNT, **budget_limit % 1000 === 0** if set |
| `goals.ts` | name 1–60 chars, target > 0 and ≤ MAX_AMOUNT, **target % 1000 === 0**, current ≤ target, **current % 1000 === 0** if > 0, valid color, valid deadline format |
| `addGoalAmount` | amount > 0, **amount % 1000 === 0**, caps at target_amount |

### Error Handling Pattern
- Client-side validation is a UX guard only — server always re-validates.
- All delete handlers in client components check `result.success` before updating state.
- Failed operations show `alert()` with the server error message.
- Delete buttons are disabled while request is in-flight (prevents double-clicks).
