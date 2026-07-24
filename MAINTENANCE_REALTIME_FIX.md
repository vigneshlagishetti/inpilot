# Maintenance Mode Real-Time Fix - Setup Instructions

## Problem Fixed
- **Before**: Users had to reload page 4-5 times to see maintenance mode changes
- **After**: Instant updates via Supabase Realtime - no reload needed!

## What Was Changed

### 1. **Real-Time Subscriptions Added**
   - `MaintenanceChecker.tsx`: Monitors for maintenance mode ON (redirects users from dashboard)
   - `UnderConstruction.tsx`: Monitors for maintenance mode OFF (redirects users to dashboard)
   - `MaintenanceModeToggle.tsx`: Admin toggle with real-time updates

### 2. **Cache-Busting Implemented**
   - Added no-cache headers to all maintenance API endpoints
   - Added timestamp query parameters to prevent browser caching
   - Forces fresh data on every request

### 3. **Polling Fallback**
   - Real-time subscription checks every change instantly
   - Polling backup checks every 5-10 seconds (in case realtime fails)

## Setup Required

### Step 1: Enable Realtime in Supabase

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable realtime replication
ALTER publication supabase_realtime ADD TABLE maintenance_settings;

-- Grant permissions
GRANT SELECT ON maintenance_settings TO anon;
GRANT SELECT ON maintenance_settings TO authenticated;
```

Or run the complete migration file:
```bash
# In Supabase SQL Editor, run:
supabase/enable_realtime_maintenance.sql
```

### Step 2: Verify Realtime is Enabled in Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Ensure `maintenance_settings` table has **Source** enabled
4. Toggle it ON if it's OFF

### Step 3: Test the Setup

#### Test Maintenance Mode ON:
1. Open two browser windows:
   - Window A: Admin panel (`/admin/settings`)
   - Window B: Dashboard (`/dashboard`)
2. In Window A: Toggle maintenance mode **ON**
3. In Window B: Should redirect to `/maintenance` **instantly** (1-2 seconds max)

#### Test Maintenance Mode OFF:
1. Keep both windows open
2. In Window A: Toggle maintenance mode **OFF**
3. In Window B (on maintenance page): Should redirect to `/dashboard` **instantly**

## How It Works

### When Maintenance Mode is Turned ON:
1. Admin clicks toggle → API updates database
2. **Real-time trigger**: Supabase broadcasts change to all connected clients
3. `MaintenanceChecker` component (on dashboard) receives update
4. Users are **instantly redirected** to `/maintenance`
5. **Fallback**: Polling checks every 10 seconds in case realtime fails

### When Maintenance Mode is Turned OFF:
1. Admin clicks toggle → API updates database
2. **Real-time trigger**: Supabase broadcasts change to all connected clients
3. `UnderConstruction` component (on maintenance page) receives update
4. Users are **instantly redirected** to `/dashboard`
5. **Fallback**: Polling checks every 5 seconds in case realtime fails

## Architecture

```
┌─────────────────┐
│  Admin Toggle   │
│  (Admin Panel)  │
└────────┬────────┘
         │ Updates database
         ▼
┌─────────────────────────────────┐
│  Supabase Database              │
│  maintenance_settings table     │
│  (key='maintenance_mode')       │
└────────┬────────────────────────┘
         │ Realtime broadcast
         ▼
┌────────────────────────────────────────┐
│  Supabase Realtime Channel             │
│  'postgres_changes' on                 │
│  maintenance_settings                  │
└──────┬────────────────────┬────────────┘
       │                    │
       ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│ MaintenanceChecker│  │ UnderConstruction │
│ (Dashboard)       │  │ (Maintenance Pg)  │
│ Redirects to /maint│  │ Redirects to /dash│
└──────────────────┘  └──────────────────┘
```

## Files Changed

### New Files:
- `components/MaintenanceChecker.tsx` - Real-time monitor for dashboard
- `supabase/enable_realtime_maintenance.sql` - Enable realtime setup

### Modified Files:
- `components/admin/MaintenanceModeToggle.tsx` - Added realtime subscription
- `components/UnderConstruction.tsx` - Added realtime monitoring
- `app/dashboard/page.tsx` - Added MaintenanceChecker component
- `app/api/admin/maintenance/route.ts` - Added no-cache headers
- `app/api/maintenance/status/route.ts` - Added no-cache headers

## Troubleshooting

### Issue: Still requiring multiple reloads
**Solution**: Check if realtime is enabled in Supabase Dashboard

### Issue: Console shows "Subscription status: CHANNEL_ERROR"
**Solution**: 
1. Verify realtime is enabled in Supabase
2. Check if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
3. Ensure table permissions are granted (see Step 1)

### Issue: Polling works but realtime doesn't
**Solution**: 
- Check browser console for errors
- Verify websocket connections aren't blocked by firewall/proxy
- Realtime uses websockets - ensure they're allowed

## Performance Impact

- **Realtime Connection**: ~1KB overhead per client
- **Polling Fallback**: 1 API call every 5-10 seconds (negligible)
- **Total Latency**: < 2 seconds for maintenance mode changes (vs. manual reload × 4-5 before)

## Monitoring

Check logs in browser console:
- `[MaintenanceChecker]` - Dashboard monitoring
- `[MaintenanceRecovery]` - Maintenance page monitoring
- `Subscription status:` - Realtime connection status

## Security

- Realtime only broadcasts changes (no sensitive data)
- Users can only READ maintenance status (not write)
- Admin permissions still required to toggle maintenance mode
- Middleware still enforces maintenance mode server-side

## Future Enhancements

Consider adding:
- Toast notification when maintenance mode is activated
- Countdown timer before redirect
- Admin broadcast message to all users
- Maintenance schedule display

---

**Result**: No more page reloads needed! Maintenance mode changes are now **instant and automatic**.
