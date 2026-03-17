# Database — Supabase Schema, RLS & Triggers

All tables have `user_id uuid references auth.users` with RLS enabled.

## Tables

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

## RLS Policies
All tables have SELECT/INSERT/UPDATE/DELETE policies: `auth.uid() = user_id`.

## Trigger: Default Categories on Signup
A Postgres trigger `on_auth_user_created` fires on `auth.users` INSERT and seeds default expense + income categories for the new user. Uses `SECURITY DEFINER SET search_path = public`.
