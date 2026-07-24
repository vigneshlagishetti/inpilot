# Maintenance Mode Troubleshooting Guide

## Problem: Users Still See Maintenance Page After Disabling It

### Quick Diagnosis Checklist

1. **✓ Database Check** - Verify maintenance mode is OFF in database
2. **✓ Environment Variable** - Ensure `NEXT_PUBLIC_MAINTENANCE_MODE=false`
3. **⚠️ Cache Issues** - Most common cause after deployment
4. **⚠️ Client-Side Cache** - Browser and service worker cache
5. **⚠️ CDN Cache** - Vercel/Cloudflare cache

---

## Solution Steps (In Order)

### Step 1: Verify Database Status
```sql
-- Run in Supabase SQL Editor
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
```

Expected result: `value` should be `false`

If it shows `true`, update it:
```sql
UPDATE maintenance_settings 
SET value = false, updated_at = NOW() 
WHERE key = 'maintenance_mode';
```

---

### Step 2: Clear All Caches (Critical!)

#### A. Rebuild & Redeploy
```bash
# 1. Clean build cache
npm run build

# 2. If using Vercel, force a new deployment
# Go to Vercel Dashboard → Your Project → Deployments → Redeploy

# 3. Or push a dummy commit to force redeploy
git commit --allow-empty -m "Force rebuild - maintenance mode fix"
git push
```

#### B. Clear CDN Cache (Vercel)
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Caching**
4. Click **"Purge Cache"** or **"Clear Cache"**

#### C. Clear CDN Cache (Cloudflare)
1. Go to Cloudflare Dashboard
2. Select your domain
3. Go to **Caching** → **Configuration**
4. Click **"Purge Everything"**

---

### Step 3: Add Cache-Busting Headers

Update your API endpoint to prevent caching:

```typescript
// In app/api/maintenance/status/route.ts
export async function GET() {
    const enabled = await getMaintenanceMode();
    
    return NextResponse.json(
        { enabled, message: enabled ? 'Maintenance mode is active' : 'Site is operational' },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store',
            }
        }
    );
}
```

---

### Step 4: User-Side Fixes

Instruct users to:

#### Option A: Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### Option B: Clear Browser Cache
**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Click "Clear Now"

#### Option C: Incognito/Private Mode
- Test in incognito mode to verify it's a cache issue

---

### Step 5: Emergency Database Override

If all else fails, force disable via SQL:

```sql
-- Forcefully disable maintenance mode
DELETE FROM maintenance_settings WHERE key = 'maintenance_mode';
INSERT INTO maintenance_settings (key, value, updated_by, updated_at)
VALUES ('maintenance_mode', false, 'emergency_fix', NOW());

-- Verify
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
```

---

## Prevention (Future Updates)

### 1. Add Version Query Parameter
Modify the maintenance check to include a version parameter:

```typescript
const response = await fetch(`/api/maintenance/status?v=${Date.now()}`);
```

### 2. Add Service Worker Cache Clear
If you have a service worker, add code to clear cache on version change.

### 3. Use Revalidation
Add ISR (Incremental Static Regeneration) with short revalidation:

```typescript
export const revalidate = 5; // Revalidate every 5 seconds
```

---

## Monitoring & Verification

### Check Real-Time Status
Visit these URLs (replace with your domain):
- `https://your-domain.com/api/maintenance/status`
- Should return: `{"enabled": false, "message": "Site is operational"}`

### Check Middleware Logs
Look for these logs in Vercel/server:
```
[Middleware] Checking admin bypass for user: ...
[MaintenanceChecker] Admin status: ...
```

### Test with Different Users
1. **Logged out user** - Should access site normally
2. **Regular user** - Should access site normally  
3. **Admin user** - Should always access site

---

## Common Mistakes

❌ **Only updating database** - Forgot to redeploy/clear cache
❌ **Only redeploying** - Database still has `true`
❌ **Forgetting CDN cache** - Vercel/Cloudflare serving old version
❌ **Browser cache** - Users need to hard refresh
❌ **Service Worker** - Old service worker still active

---

## Emergency Contact Form

If users can't access, they can still use the contact form on the maintenance page!

---

## Support

If issues persist after following all steps:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Network tab for cached responses
4. Contact: lvigneshbunty789@gmail.com
