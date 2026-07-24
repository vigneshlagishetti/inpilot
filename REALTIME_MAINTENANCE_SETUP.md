# Real-Time Maintenance Mode Setup

## 🎯 What's New?

I've upgraded your maintenance mode system to work **in real-time** - no more server restarts needed!

### Before (Old System):
- ❌ Had to edit `.env.local` file manually
- ❌ Required server restart to take effect
- ❌ Changes took time to apply

### After (New System):
- ✅ Toggle from admin dashboard
- ✅ **Instant updates** - no restart needed!
- ✅ Stored in database for persistence
- ✅ Works across all server instances

---

## 🚀 Setup Instructions

### Step 1: Run the New Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Run the Migration**
   - Go to SQL Editor → New query
   - Open `supabase/maintenance_settings_migration.sql`
   - Copy and paste the entire file
   - Click "Run"

3. **Verify**
   - Go to Table Editor
   - You should see a new `maintenance_settings` table
   - It should have one row: `key='maintenance_mode', value=false`

### Step 2: Restart Your Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

That's it! You're done! 🎉

---

## 🎮 How to Use

### Toggle Maintenance Mode

1. **Go to Admin Dashboard**
   - Navigate to http://localhost:3000/admin/settings
   - Or http://localhost:3000/admin (has the toggle too)

2. **Click the Switch**
   - Toggle ON → Site goes into maintenance mode **instantly**
   - Toggle OFF → Site becomes accessible **instantly**
   - **No reload or restart needed!**

3. **Test It**
   - Open your site in an incognito window
   - Toggle maintenance mode
   - Refresh the incognito window
   - You'll see the maintenance page appear/disappear instantly!

---

## 🔧 How It Works

### Database-Driven Configuration
- Maintenance mode status is stored in `maintenance_settings` table
- Middleware checks the database on every request
- Changes take effect immediately across all users

### Real-Time Flow
1. Admin toggles switch in dashboard
2. API updates database record
3. Middleware checks database on next request
4. Users see maintenance page (or not) instantly

### Fallback System
- If database is unavailable, falls back to environment variable
- Ensures your site stays accessible even if database has issues

---

## 🎯 Benefits

1. **Instant Updates** - No server restart required
2. **User-Friendly** - Toggle from beautiful admin UI
3. **Persistent** - Survives server restarts
4. **Scalable** - Works across multiple server instances
5. **Safe** - Admins can still access the site during maintenance

---

## 🧪 Testing

### Test Real-Time Updates

1. **Open two browser windows**
   - Window 1: Admin dashboard (signed in)
   - Window 2: Home page (incognito/not signed in)

2. **Toggle maintenance mode in Window 1**
   - Click the switch to enable

3. **Refresh Window 2**
   - You should see the maintenance page immediately!

4. **Toggle off in Window 1**
   - Click the switch to disable

5. **Refresh Window 2**
   - Normal site should appear immediately!

---

## 📝 Important Notes

### Admin Access During Maintenance
- Admins can **always** access the site, even during maintenance
- This lets you test and make changes while site is down for others

### Database vs Environment Variable
- Database setting takes priority
- Environment variable is used as fallback only
- You can remove `NEXT_PUBLIC_MAINTENANCE_MODE` from `.env.local` if you want

### Performance
- Middleware checks database on every request
- This is fast (< 10ms typically)
- Supabase caches responses for better performance

---

## 🎉 You're All Set!

Your maintenance mode now works in real-time! Just toggle the switch and changes apply instantly - no more manual file editing or server restarts!

Enjoy the convenience! 🚀
