# Maintenance Mode Debug Flow

## How to Debug the Issue

### Step 1: Enable Verbose Logging
The middleware now has comprehensive logging. When you deploy, you'll see these logs in Vercel.

### Step 2: Test the Bypass Flow

1. **Toggle OFF from Admin Panel**
   - Go to `/admin` 
   - Toggle maintenance OFF
   - Watch what happens

2. **Check Vercel Logs**
   - Open Vercel dashboard
   - Go to your project → Functions → Logs
   - Filter for `[Middleware]` messages
   - Look for these key log lines:

```
[Middleware] === MAINTENANCE CHECK START ===
[Middleware] Path: /dashboard
[Middleware] Bypass cookie exists: true/false
[Middleware] Bypass cookie value: [timestamp]
[Middleware] Current timestamp: [current time]
[Middleware] 🔍 Checking database for maintenance status...
[Middleware] 📊 Database says maintenance mode: true/false
[Middleware] 🚧 Maintenance mode is ON/OFF
```

### Step 3: What to Look For

#### Scenario 1: Cookie Not Being Set
If you see:
```
[Middleware] No bypass cookie - Proceeding to database check
[Middleware] 📊 Database says maintenance mode: true
[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE
```

**Problem**: The bypass cookie isn't being set when redirecting from maintenance page.

**Solution**: Check if the UnderConstruction component is properly redirecting with the `?_recovery=true&_bypass=[timestamp]` parameters.

#### Scenario 2: Cookie Expires Too Fast
If you see:
```
[Middleware] Bypass cookie exists: true
[Middleware] ⚠️ Bypass cookie expired - Clearing and checking database
[Middleware] 📊 Database says maintenance mode: true
```

**Problem**: The 30-second bypass window isn't long enough.

**Solution**: Increase the bypass duration to 60 seconds.

#### Scenario 3: Database Still Shows Maintenance ON
If you see:
```
[Middleware] ✅ BYPASS ACTIVE - Allowing request
```
But then later:
```
[Middleware] No bypass cookie - Proceeding to database check
[Middleware] 📊 Database says maintenance mode: true
```

**Problem**: Database hasn't updated yet OR bypass cookie not persisting across requests.

**Solution**: Need to verify:
1. Database is actually updated when admin toggles OFF
2. Cookie is being sent in subsequent requests
3. Cookie domain/path settings are correct

#### Scenario 4: Redirect Loop
If you see many rapid logs with:
```
[Middleware] Path: /dashboard
[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE
[Middleware] Path: /maintenance
[Middleware] Path: /dashboard
[Middleware] 🔴 REDIRECTING TO MAINTENANCE PAGE
```

**Problem**: MaintenanceChecker component triggering redirects even when on /maintenance page.

**Solution**: Already fixed with path checking, but verify MaintenanceChecker isn't running on /maintenance page.

### Step 4: Check Database Directly

Run this in Supabase SQL Editor:
```sql
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
```

Expected result when OFF:
```
key                 | value
--------------------+-------
maintenance_mode    | false
```

If it shows `true` even after toggling OFF, the admin toggle API isn't working.

### Step 5: Check Cookie in Browser

1. Toggle maintenance OFF
2. Open browser DevTools (F12)
3. Go to Application → Cookies
4. Look for `maintenance_bypass` cookie
5. Check:
   - Does it exist?
   - What's the expiry time?
   - Is it being sent in requests? (Network tab → Headers)

### Step 6: Test Recovery URL Directly

Try accessing this URL directly after toggling OFF:
```
https://your-domain.com/dashboard?_recovery=true&_bypass=[timestamp]
```

Replace `[timestamp]` with: Current time in milliseconds + 30000

Example:
```
https://your-domain.com/dashboard?_recovery=true&_bypass=1704067200000
```

If this works but the normal flow doesn't, the problem is in the UnderConstruction component's redirect.

### What Should Happen (Happy Path)

1. Admin toggles maintenance OFF in `/admin`
2. Database updates to `maintenance_mode: false`
3. UnderConstruction component detects change via real-time subscription
4. Shows toast: "🎉 We're back!"
5. Redirects to: `/dashboard?_recovery=true&_bypass=[30 seconds from now]`
6. Middleware sees recovery token, sets `maintenance_bypass` cookie for 30 seconds
7. Returns NextResponse.next() (no redirect)
8. User lands on dashboard
9. For next 30 seconds, ALL requests have the cookie so no maintenance check happens
10. After 30 seconds, cookie expires but database now shows maintenance OFF
11. Normal operation resumes

### Most Likely Issues

Based on symptoms "when toggle off same under construction page loading":

1. **Database not updating fast enough**
   - Real-time should be instant (<1 second)
   - If taking longer, check Supabase realtime logs
   
2. **Bypass cookie not working**
   - Check cookie domain/path
   - Verify cookie is httpOnly but NOT secure in development
   - Check sameSite setting

3. **Multiple requests happening faster than cookie propagation**
   - Browser might make multiple requests before cookie is set
   - Solution: Set cookie on server-side redirect instead of relying on query param

## Quick Fix to Try

If the bypass mechanism still isn't working, try this alternative approach:

Instead of using a cookie, store the bypass in the database itself with a timestamp:

```sql
ALTER TABLE maintenance_settings ADD COLUMN bypass_until BIGINT DEFAULT 0;
```

Then when toggling OFF:
1. Set maintenance_mode = false
2. Set bypass_until = (current time + 30 seconds)

In middleware:
1. Check bypass_until first
2. If current time < bypass_until, allow access
3. Otherwise check maintenance_mode

This way the bypass is synchronized with the database and no cookie coordination needed.
