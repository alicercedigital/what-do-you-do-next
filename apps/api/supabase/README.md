# Supabase Database Setup

This folder contains the Supabase configuration and migrations for the WDYDN database.

## Migrations

- `20240101000000_initial_schema.sql` - Base schema (profiles, universes, game_saves, etc.)
- `20250111000000_admin_tables.sql` - Admin panel tables (is_admin, system_config, audit_logs, etc.)

## Setup with Supabase CLI

### 1. Login to Supabase

```bash
cd apps/api
npx supabase login
```

### 2. Link to your project

Get your project ref from your Supabase Dashboard URL (the part before `.supabase.co`):

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Push migrations to remote database

```bash
npx supabase db push
```

### 4. (Optional) Pull current remote schema

If you need to sync with changes made in the dashboard:

```bash
npx supabase db pull
```

## Quick Commands

```bash
# View migration status
npx supabase migration list

# Create a new migration
npx supabase migration new my_migration_name

# Reset local database (if using local Supabase)
npx supabase db reset
```

## Manual Setup

If you prefer to run SQL manually in Supabase Dashboard:

1. Go to your Supabase Dashboard > SQL Editor
2. Run the contents of each migration file in order:
   - First: `20240101000000_initial_schema.sql`
   - Then: `20250111000000_admin_tables.sql`

## Setting up an Admin User

After running migrations, make yourself an admin:

```sql
UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';
```

Or by username:

```sql
UPDATE profiles SET is_admin = true WHERE username = 'your_username';
```
