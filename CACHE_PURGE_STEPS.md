# 🚨 EMERGENCY: Fix Maintenance Mode Cache Issue

## ✅ Step-by-Step Fix (Do in Order)

### 1️⃣ Verify Database (30 seconds)
```sql
-- In Supabase SQL Editor
SELECT value FROM maintenance_settings WHERE key = 'maintenance_mode';
```

**If it shows `true`:**
```sql
UPDATE maintenance_settings 
SET value = false, 
updated_at = NOW() 
WHERE key = 'maintenance_mode';
```

**Expected result:** Should show `false`

---

### 2️⃣ Purge Vercel CDN Cache (YOU ARE HERE! ✨)

**In the Vercel Cache Purge UI you're looking at:**

1. **Select:** ⚪ **"Invalidate content"** (the SAFE option)
   - ❌ Do NOT select "Delete content" 
   
2. **Purge Method:**
   - **Leave the cache tag field EMPTY** (or delete `product1,product2,product3`)
   - This will purge ALL cache
   
3. **Click:** "Purge Cache" button

4. **Wait:** 30-60 seconds for cache to invalidate globally

---

### 3️⃣ Force New Deployment (2 minutes)

**After purging cache, trigger a fresh build:**

```bash
# Run this in your terminal
git commit --allow-empty -m "fix: force rebuild after maintenance mode"
git push
```

**Or in Vercel Dashboard:**
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment
- Select: ✅ "Use existing Build Cache" (it's fine, we purged CDN cache)

---

### 4️⃣ Verify Fix (1 minute)

**Test API endpoint:**
```bash
# Replace with your domain
curl https://your-domain.vercel.app/api/maintenance/status
```

**Expected response:**
```json
{
  "enabled": false,
  "message": "Site is operational",
  "timestamp": 1738329600000
}
```

**Test in browser:**
1. Open incognito/private window
2. Go to: `https://your-domain.vercel.app`
3. Should see normal site, NOT maintenance page ✅

---

### 5️⃣ Help Users Clear Their Cache

**Send this message to users:**

> Hi! Maintenance is complete! If you're still seeing the maintenance page:
> 
> **Quick Fix:**
> 1. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
> 2. Or click the "Force Refresh" button on the maintenance page
> 
> The site is back - this is just your browser cache! 🚀

---

## 🔍 Troubleshooting

### Cache purge didn't work?

**Try Data Cache too:**
1. In Vercel Dashboard → Your Project
2. Go to **Storage** → **Data Cache** 
3. Click **"Purge Cache"**

### Still showing maintenance after ALL steps?

**Check these:**

1. **Cloudflare?** If you're using Cloudflare in front of Vercel:
   - Cloudflare Dashboard → Caching → Purge Everything
   
2. **Browser extensions?** Ad blockers or privacy extensions can cache
   - Disable temporarily and test

3. **DNS Cache?** 
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   ```

4. **Service Worker?**
   - Chrome DevTools → Application → Service Workers
   - Click "Unregister"
   - Hard refresh

---

## ✨ Future Prevention

### Add Proper Cache Control Headers

Your maintenance status API already has good headers (I added them!):
```typescript
headers: {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
}
```

### Use Cache Tags (Optional Enhancement)

Add to your pages:
```typescript
// app/dashboard/page.tsx
export const revalidate = 0; // Never cache
export const fetchCache = 'force-no-store';
```

---

## 📊 Monitor Status

**Check these URLs:**
- API Status: `https://your-domain.vercel.app/api/maintenance/status`
- Should return: `{"enabled":false,...}`

**Vercel Logs:**
- Dashboard → Deployments → Latest → Logs
- Look for `[Middleware]` messages

---

## 🆘 Still Stuck?

Run diagnostic:
```bash
node scripts/fix-maintenance-cache.js https://your-domain.vercel.app
```

Or check:
- [MAINTENANCE_TROUBLESHOOT.md](MAINTENANCE_TROUBLESHOOT.md)
- [DEPLOYMENT_MAINTENANCE_CHECKLIST.md](DEPLOYMENT_MAINTENANCE_CHECKLIST.md)

---

**Current Status:** You're at Step 2 - Click "Purge Cache" now! 🚀
