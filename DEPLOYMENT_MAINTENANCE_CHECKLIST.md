# 🚀 DEPLOYMENT CHECKLIST - Maintenance Mode Issues

## After Turning Off Maintenance Mode

### ✅ Immediate Actions (Do These Every Time!)

1. **Verify Database Status**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT value FROM maintenance_settings WHERE key = 'maintenance_mode';
   -- Should return: false
   ```

2. **Clear CDN Cache (CRITICAL!)**
   
   **For Vercel:**
   - Dashboard → Project → Settings → Caching → "Purge Cache"
   - OR: Create new deployment (force rebuild)
   
   **For Cloudflare:**
   - Dashboard → Domain → Caching → "Purge Everything"

3. **Force New Deployment**
   ```bash
   # Force rebuild with empty commit
   git commit --allow-empty -m "chore: force rebuild after maintenance"
   git push
   
   # Or rebuild locally and push
   npm run build
   git push
   ```

4. **Test in Multiple Ways**
   ```bash
   # Test API endpoint
   curl -H "Cache-Control: no-cache" https://your-domain.com/api/maintenance/status
   
   # Expected: {"enabled":false,"message":"Site is operational","timestamp":...}
   ```

---

## 🔍 If Users Still See Maintenance Page

### Quick Diagnosis
1. Open Chrome DevTools → Network tab
2. Visit your site
3. Look for `/api/maintenance/status` request
4. Check:
   - Response: `enabled: false`?
   - Headers: `from cache` or `from disk cache`?

### Solutions by Cause

#### Problem 1: CDN/Edge Cache
**Symptoms:** API returns correct value but pages show maintenance
**Fix:**
1. Purge ALL cache in Vercel/Cloudflare
2. Wait 2-3 minutes for propagation
3. Force new deployment

#### Problem 2: Browser Cache
**Symptoms:** Works in incognito, fails in normal mode
**Fix:**
1. Instruct users to hard refresh:
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
2. Or use "Force Refresh" button on maintenance page

#### Problem 3: Service Worker Cache
**Symptoms:** Hard refresh doesn't work
**Fix:**
1. Browser DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh

#### Problem 4: Database Still Shows True
**Symptoms:** API returns `enabled: true`
**Fix:**
```sql
-- Force update
UPDATE maintenance_settings 
SET value = false, updated_at = NOW() 
WHERE key = 'maintenance_mode';
```

---

## 🛠️ Diagnostic Tools

### 1. Use the Diagnostic Script
```bash
node scripts/fix-maintenance-cache.js https://your-domain.com
```

### 2. Use the SQL Diagnostic
```sql
-- Run: supabase/emergency_maintenance_fix.sql
```

### 3. Check Server Logs
- Vercel: Dashboard → Deployments → Select Deployment → Logs
- Look for: `[Middleware]` and `[MaintenanceChecker]` logs

---

## 📱 User Instructions Template

Copy-paste this to help users:

```
Hi! If you're still seeing the maintenance page:

1. Hard Refresh your browser:
   • Windows: Press Ctrl + Shift + R
   • Mac: Press Cmd + Shift + R

2. Clear your browser cache:
   • Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   • Firefox: History → Clear Recent History → Cache

3. Try incognito/private mode

4. Still stuck? Use the "Force Refresh" button on the maintenance page

The site is back up - this is just a caching issue! 🙂
```

---

## 🔄 Prevention for Next Time

### Before Enabling Maintenance
```bash
# Document when you turn it on
echo "Maintenance enabled at $(date)" >> maintenance.log
```

### After Disabling Maintenance
```bash
# Follow this checklist:
[ ] Update database (via admin panel)
[ ] Verify API endpoint returns enabled:false
[ ] Purge CDN cache (Vercel/Cloudflare)
[ ] Force new deployment
[ ] Test in incognito mode
[ ] Test API: curl https://your-domain.com/api/maintenance/status
[ ] Update maintenance.log
```

### Monitoring Script (Optional)
```bash
# Add to cron or GitHub Actions
*/5 * * * * curl -s https://your-domain.com/api/maintenance/status | grep '"enabled":true' && echo "⚠️ Maintenance mode is ON"
```

---

## 📞 Emergency Contacts

If nothing works:
1. Check: [MAINTENANCE_TROUBLESHOOT.md](MAINTENANCE_TROUBLESHOOT.md)
2. Run: `node scripts/fix-maintenance-cache.js`
3. SQL: `supabase/emergency_maintenance_fix.sql`
4. Email: lvigneshbunty789@gmail.com

---

## ✨ Quick Commands Reference

```bash
# Check env variable
echo $NEXT_PUBLIC_MAINTENANCE_MODE

# Test API locally
curl http://localhost:3000/api/maintenance/status

# Test API production
curl https://your-domain.com/api/maintenance/status

# Force rebuild
npm run build && git add -A && git commit -m "rebuild" && git push

# Run diagnostic
node scripts/fix-maintenance-cache.js https://your-domain.com
```

---

**Remember:** 99% of "still showing maintenance" issues after disabling are **CACHE PROBLEMS**, not code problems!

The fix is usually: **Purge CDN → Force Deploy → Hard Refresh** 🔄
