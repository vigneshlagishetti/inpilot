# Maintenance Toggle Debug - What I've Done

## Summary
I've added comprehensive logging throughout the entire maintenance mode system to help us diagnose why users are still seeing the maintenance page after you toggle it OFF.

## Changes Made

### 1. Enhanced Middleware Logging (`middleware.ts`)
Added detailed logging to track:
- ✅ When a request comes in and which path
- ✅ Whether bypass cookie exists and its value
- ✅ Whether bypass is valid (not expired)
- ✅ Database maintenance mode status
- ✅ Whether the path should be blocked
- ✅ Final decision (redirect or allow)

**Key log messages to look for:**
```
[Middleware] === MAINTENANCE CHECK START ===
[Middleware] ✅ BYPASS ACTIVE - Allowing request
[Middleware] 📊 Database says maintenance mode: true/false
[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE
[Middleware] ✅ Maintenance mode OFF - Normal operation
```

### 2. Enhanced Database Update Logging (`lib/maintenance-config.ts`)
Added logging in the `setMaintenanceMode` function:
- ✅ When maintenance mode is being updated
- ✅ What value it's being set to
- ✅ Success/failure of the update
- ✅ Verification that reads back the value after update

**Key log messages:**
```
[setMaintenanceMode] 🔄 Updating maintenance mode to: false
[setMaintenanceMode] ✅ Successfully updated to: false
[setMaintenanceMode] 🔍 Verification - Database now shows: false
```

### 3. Enhanced Redirect Logging (`components/UnderConstruction.tsx`)
Added logging when redirecting from maintenance page:
- ✅ The exact URL being redirected to
- ✅ The bypass token expiry time

**Key log messages:**
```
[MaintenanceRecovery] 🔄 Redirecting to: /dashboard?_recovery=true&_bypass=...
[MaintenanceRecovery] 📅 Bypass valid until: [timestamp]
```

### 4. Removed Redundant Logic
- Removed the duplicate check that was forcing `maintenanceMode = false` after database query
- Cleaned up the logic flow so bypass cookie check happens once, early

## How to Debug the Issue

### Step 1: Deploy These Changes
```bash
git add .
git commit -m "Add comprehensive maintenance mode logging"
git push
```

Wait for Vercel deployment to complete.

### Step 2: Reproduce the Issue

1. Go to your admin panel: `https://your-domain.com/admin`
2. Toggle maintenance mode ON
3. Wait a few seconds for it to propagate
4. Open a new incognito window
5. Go to `https://your-domain.com/dashboard`
6. You should see the maintenance page
7. Now back in admin panel, toggle maintenance mode OFF
8. Watch what happens in the incognito window

### Step 3: Check Vercel Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Functions** → **Logs** (or **Realtime Logs**)
4. Filter for `[Middleware]` or `[setMaintenanceMode]`

### What You Should See in Logs (Happy Path)

**When you toggle OFF in admin:**
```
[setMaintenanceMode] 🔄 Updating maintenance mode to: false
[setMaintenanceMode] ✅ Successfully updated to: false
[setMaintenanceMode] 🔍 Verification - Database now shows: false
```

**When user is redirected from maintenance page:**
```
[MaintenanceRecovery] Maintenance mode ended! Redirecting to dashboard
[MaintenanceRecovery] 🔄 Redirecting to: /dashboard?_recovery=true&_bypass=[timestamp]
[MaintenanceRecovery] 📅 Bypass valid until: [ISO date]
```

**When middleware processes the redirect:**
```
[Middleware] === MAINTENANCE CHECK START ===
[Middleware] Path: /dashboard
[Middleware] Bypass cookie exists: false  (first request, query param present)
[Middleware] No bypass cookie - Proceeding to database check
[Middleware] 🔍 Checking database for maintenance status...
[Middleware] Recovery bypass active - setting cookie and allowing access
[Middleware] ✅ BYPASS ACTIVE - Allowing request
```

**On subsequent requests (with cookie):**
```
[Middleware] === MAINTENANCE CHECK START ===
[Middleware] Path: /api/something
[Middleware] Bypass cookie exists: true
[Middleware] Bypass cookie value: [timestamp]
[Middleware] Current timestamp: [current]
[Middleware] Time remaining (ms): 25000
[Middleware] ✅ BYPASS ACTIVE - Allowing request
```

## Possible Issues We're Looking For

### Issue 1: Database Not Updating
**Symptoms:**
```
[setMaintenanceMode] 🔄 Updating maintenance mode to: false
[setMaintenanceMode] ❌ Error updating maintenance mode: ...
```

**Fix:** Check Supabase RLS policies, check if admin has permissions.

### Issue 2: Database Updates But Shows Wrong Value
**Symptoms:**
```
[setMaintenanceMode] ✅ Successfully updated to: false
[setMaintenanceMode] 🔍 Verification - Database now shows: true
```

**Fix:** There might be multiple rows or a caching issue. Run:
```sql
DELETE FROM maintenance_settings WHERE key = 'maintenance_mode';
INSERT INTO maintenance_settings (key, value) VALUES ('maintenance_mode', false);
```

### Issue 3: Cookie Not Set on Redirect
**Symptoms:**
```
[MaintenanceRecovery] 🔄 Redirecting to: /dashboard?_recovery=true&_bypass=[timestamp]
[Middleware] === MAINTENANCE CHECK START ===
[Middleware] Path: /dashboard
[Middleware] Bypass cookie exists: false
[Middleware] No bypass cookie - Proceeding to database check
[Middleware] 🔍 Checking database for maintenance status...
[Middleware] 📊 Database says maintenance mode: true
[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE
```

**This means:** The query param is present but not being detected. Check the middleware logic for handling `?_recovery=true`.

### Issue 4: Cookie Expires Too Fast
**Symptoms:**
```
[Middleware] Bypass cookie exists: true
[Middleware] ⚠️ Bypass cookie expired - Clearing and checking database
```

**Fix:** Increase bypass duration from 30 seconds to 60 seconds.

### Issue 5: Database Still Shows True
**Symptoms:**
```
[setMaintenanceMode] ✅ Successfully updated to: false
[setMaintenanceMode] 🔍 Verification - Database now shows: false
... (later)
[Middleware] 📊 Database says maintenance mode: true
```

**This means:** Middleware is using a different Supabase client or there's connection pooling caching. 

**Fix:** Force the middleware to use the same authenticated client or add cache-busting to the query.

## Next Steps After Reviewing Logs

Once you deploy and test, share the relevant log output from Vercel. Look for the specific sequence of events:

1. Admin toggle OFF
2. UnderConstruction redirect
3. Middleware processing

The logs will tell us exactly where the flow is breaking. Then we can apply a targeted fix!

## Quick Verification Queries

**Check database directly in Supabase:**
```sql
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
```

**Check update history:**
```sql
SELECT * FROM maintenance_settings ORDER BY updated_at DESC LIMIT 5;
```

**Force reset if needed:**
```sql
UPDATE maintenance_settings 
SET value = false, updated_at = NOW() 
WHERE key = 'maintenance_mode';
```

---

## The Complete Flow (For Reference)

1. **Admin toggles OFF** → POST `/api/admin/maintenance` → `setMaintenanceMode(false)` → Database updates
2. **Real-time subscription fires** → UnderConstruction component detects change
3. **Component redirects** → `/dashboard?_recovery=true&_bypass=[30s from now]`
4. **Middleware sees query param** → Sets `maintenance_bypass` cookie for 30 seconds → Allows request
5. **Dashboard loads** → All subsequent requests have the cookie → Bypass active
6. **After 30 seconds** → Cookie expires → Middleware checks database → Shows false → Normal operation

The problem is happening somewhere in steps 1-5. The logs will tell us exactly where!
