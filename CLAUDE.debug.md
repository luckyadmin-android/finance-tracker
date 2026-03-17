# Debugging Log

## 2026-03-17 — Systematic Debugging Audit

### Method
Used `superpowers:systematic-debugging` 4-phase process: Root Cause Investigation → Pattern Analysis → Hypothesis Testing → Implementation.

### Issues Found & Fixed

| # | Severity | Issue | Root Cause | Fix | Files |
|---|----------|-------|-----------|-----|-------|
| 1 | CRITICAL | Amounts not validated as multiples of 1,000₫ on server | Server actions only checked `> 0` and `<= MAX_AMOUNT` but never `% 1000` | Added `% 1000 !== 0` checks in all `validate*()` functions and `addGoalAmount()` | `actions/transactions.ts`, `actions/categories.ts`, `actions/goals.ts` |
| 2 | CRITICAL | Delete operations update UI without checking server response | `handleDelete()` never inspected return value — UI removed item even on server error | All 3 delete handlers now check `result.success` before state update, show `alert()` on failure | `GoalsClient.tsx`, `CategoriesClient.tsx`, `TransactionsClient.tsx` |
| 3 | CRITICAL | `addGoalAmount` silently fails | Only handled success path with no `else` branch | Added `else { alert(result.error) }` | `GoalsClient.tsx` |
| 4 | MEDIUM | Delete buttons clickable during pending delete | No `disabled` prop on Trash2 buttons in Goals/Categories | Added `deleting` state + `disabled` prop | `GoalsClient.tsx`, `GoalCard.tsx`, `CategoriesClient.tsx` |

### Investigated but NOT Bugs
| Issue | Finding |
|-------|---------|
| `bg-mesh-light` missing `dark:` variant | `.dark .bg-mesh-light` defined in `globals.css` — handled via CSS, not Tailwind prefix |
| Non-null assertions (`!`) on `category` in `page.tsx` | Guarded by `.filter(t => t.category)` upstream — safe at runtime |

### Verification
- `npm run build` passes cleanly with 0 type errors after all fixes.
