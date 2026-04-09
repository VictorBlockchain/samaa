# Production Issues Fix Guide

## Issues Identified

1. ✅ **Email works in dev but not production** - Missing environment variables in Vercel
2. ✅ **403 Forbidden on cart_items** - RLS policy permissions issue
3. ✅ **Function not found (upsert_user_minimal)** - Function needs SECURITY DEFINER
4. ✅ **Permission denied on users table** - Missing RLS policy for authenticated users

---

## Fix 1: Add Environment Variables to Vercel

**Problem:** Email works locally but not in production because Vercel doesn't have the Mailgun environment variables.

**Solution:** Add these environment variables in your Vercel dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `samaa`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=mg.samaa.app
MAILGUN_FROM_EMAIL=postmaster@mg.samaa.app
NEXT_PUBLIC_APP_URL=https://samaa.app
```

**Note:** Get your MAILGUN_API_KEY from your Mailgun dashboard or `.env.local` file.

5. **Important:** Set them for all environments (Production, Preview, Development)
6. Redeploy your application after adding the variables

---

## Fix 2: Run Database Migration

**Problem:** RLS policies are blocking access to users table and cart_items.

**Solution:** Run the migration file in Supabase SQL Editor:

1. Go to: https://app.supabase.com
2. Select your project: `qwnukvbeoglvynyrhuey`
3. Go to **SQL Editor**
4. Copy the contents of: `schema/migrations/2026-04-09_fix_production_rls.sql`
5. Paste and **Run** the SQL

**What this fixes:**
- ✅ Adds SELECT policy for users table (authenticated users can view their profile)
- ✅ Fixes cart_items RLS policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ Grants proper permissions to authenticated users
- ✅ Makes `upsert_user_minimal` function SECURITY DEFINER (bypasses RLS)
- ✅ Grants EXECUTE permission on upsert_user_minimal function

---

## Fix 3: Verify Database Schema

After running the migration, verify everything is working:

### Test 1: Check if function exists
```sql
SELECT proname, pronargs, prosecdef 
FROM pg_proc 
WHERE proname = 'upsert_user_minimal';
```

**Expected result:**
- proname: `upsert_user_minimal`
- pronargs: `8`
- prosecdef: `t` (true = SECURITY DEFINER)

### Test 2: Check RLS policies on users table
```sql
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

**Expected:** Should show "Users can view own profile" policy

### Test 3: Check RLS policies on cart_items
```sql
SELECT policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'cart_items';
```

**Expected:** Should show 4 policies (SELECT, INSERT, UPDATE, DELETE)

---

## Fix 4: Test Email in Production

After adding environment variables and redeploying:

1. Go to: `https://samaa.app/api/email`
2. This will test the Mailgun connection
3. You should see: `{"success": true, "message": "Connected to Mailgun successfully..."}`

If it fails, check Vercel logs:
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** → Click latest deployment
4. Check **Logs** for any errors

---

## Verification Checklist

After applying all fixes:

- [ ] Environment variables added to Vercel
- [ ] Migration SQL run in Supabase
- [ ] Application redeployed in Vercel
- [ ] Test signup on https://samaa.app/auth/signup
- [ ] Check terminal logs for email sending
- [ ] Verify email received in inbox
- [ ] Check browser console for any 403 errors
- [ ] Verify profile creation works without errors

---

## Common Issues

### Issue: Still getting 403 on cart_items
**Solution:** Make sure you're logged in. The policies require `authenticated` role.

### Issue: Email still not sending in production
**Solution:** 
1. Check Vercel environment variables are set correctly
2. Check Vercel deployment logs
3. Test the endpoint: `https://samaa.app/api/email` (GET request)

### Issue: Function not found error
**Solution:** 
1. Make sure you ran the migration SQL
2. Verify function exists: `SELECT * FROM pg_proc WHERE proname = 'upsert_user_minimal';`
3. If missing, run the full `schema/schema.sql` file

### Issue: Permission denied on users table
**Solution:**
1. Run the migration SQL
2. Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'users';`
3. Check user is authenticated (not anon)

---

## Files Changed

- `schema/migrations/2026-04-09_fix_production_rls.sql` - New migration to fix RLS
- `.env.local` - Updated Mailgun domain (already committed)
- `app/api/auth/signup/route.ts` - Added logging (already committed)
- `lib/mailgun.ts` - Added logging (already committed)

---

## Next Steps

1. **Immediate:** Run the migration SQL in Supabase
2. **Immediate:** Add environment variables to Vercel
3. **Immediate:** Redeploy to Vercel
4. **Test:** Sign up with a new email on production
5. **Monitor:** Check Vercel logs for any errors
