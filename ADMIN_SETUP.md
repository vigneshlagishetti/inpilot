# Admin System Setup Guide

## Overview
This guide will help you set up the admin access system for your InPilot application.

## Prerequisites
- Supabase account and project set up
- Clerk authentication configured
- Application running locally

## Step 1: Install Required Dependencies

First, install the necessary packages for the UI components:

```bash
npm install @radix-ui/react-switch class-variance-authority
```

## Step 2: Run Database Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Admin Migration**
   - Copy the contents of `supabase/admin_migration.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created**
   - Go to "Table Editor"
   - You should see a new `admin_users` table

## Step 3: Get Your Clerk User ID

You need your Clerk user ID to seed yourself as the first admin:

### Method 1: From Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Select your application
3. Click "Users" in the sidebar
4. Find your user account
5. Copy the User ID (starts with `user_`)

### Method 2: From Your App (Easier)
1. Sign in to your application
2. Open browser console (F12)
3. Run this code:
   ```javascript
   fetch('/api/admin/check').then(r => r.json()).then(console.log)
   ```
4. Look for the error message - it will show you're not authenticated
5. The userId will be in the request headers

### Method 3: Add a Temporary Debug Route
Create `app/api/debug/user/route.ts`:
```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  return NextResponse.json({ userId });
}
```
Visit `/api/debug/user` while signed in, then delete this file.

## Step 4: Update Admin Migration with Your User ID

1. Open `supabase/admin_migration.sql`
2. Find this line:
   ```sql
   'REPLACE_WITH_YOUR_CLERK_USER_ID',
   ```
3. Replace with your actual Clerk user ID:
   ```sql
   'user_2abc123xyz',
   ```
4. Re-run the migration in Supabase SQL Editor

Alternatively, you can manually insert your admin user:

```sql
INSERT INTO admin_users (user_id, email, role, permissions, granted_by)
VALUES (
  'YOUR_CLERK_USER_ID',
  'lvigneshbunty789@gmail.com',
  'super_admin',
  '{"manage_users": true, "manage_content": true, "toggle_maintenance": true, "grant_admin": true, "revoke_admin": true}'::jsonb,
  'system'
)
ON CONFLICT (user_id) DO NOTHING;
```

## Step 5: Restart Your Development Server

The middleware changes require a server restart:

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
```

## Step 6: Test Admin Access

1. **Sign in to your application**
   - Go to http://localhost:3000
   - Sign in with your admin email

2. **Access Admin Dashboard**
   - Navigate to http://localhost:3000/admin
   - You should see the admin dashboard

3. **Test Admin Features**
   - Try toggling maintenance mode
   - View the users list
   - Grant admin access to a test user (if you have one)

## Troubleshooting

### "Access Denied" when accessing /admin

**Possible causes:**
1. Your user ID is not in the `admin_users` table
2. Your email is not in the `ADMIN_EMAILS` array in `lib/maintenance-config.ts`

**Solution:**
- Verify your user ID is correct in the database
- Check Supabase logs for any RLS policy errors
- Temporarily add your email to `ADMIN_EMAILS` as a fallback

### Database Connection Errors

**Check:**
1. Supabase environment variables are correct in `.env.local`
2. Supabase project is not paused
3. RLS policies are enabled on `admin_users` table

### UI Components Not Found

**Install missing dependencies:**
```bash
npm install @radix-ui/react-switch class-variance-authority
```

### Maintenance Mode Toggle Not Working

**Note:** After toggling maintenance mode, you need to restart the dev server for changes to take effect. This is because environment variables are loaded at build time.

For production, consider using a database flag instead of environment variables for real-time updates.

## Security Best Practices

1. **Never commit your Clerk user ID** to version control
2. **Use environment variables** for sensitive configuration
3. **Regularly audit admin users** through the admin dashboard
4. **Enable 2FA** for all admin accounts in Clerk
5. **Monitor admin actions** (consider adding audit logging)

## Next Steps

### Optional Enhancements

1. **Add Audit Logging**
   - Track all admin actions
   - Log who granted/revoked admin access
   - Monitor maintenance mode toggles

2. **Enhanced Permissions**
   - Create custom permission sets
   - Role-based access control (RBAC)
   - Fine-grained permissions per feature

3. **Real-time Maintenance Mode**
   - Use Supabase Realtime for instant updates
   - No server restart required
   - Better user experience

4. **Admin Analytics Dashboard**
   - User growth charts
   - Question statistics
   - System health monitoring

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the server logs for backend errors
3. Verify Supabase RLS policies are correct
4. Ensure all dependencies are installed

## File Structure

```
inpilot/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with navigation
│   │   ├── page.tsx            # Admin dashboard overview
│   │   ├── users/
│   │   │   └── page.tsx        # User management page
│   │   └── settings/
│   │       └── page.tsx        # Admin settings page
│   └── api/
│       └── admin/
│           ├── check/
│           │   └── route.ts    # Check admin status
│           ├── users/
│           │   └── route.ts    # User management API
│           └── maintenance/
│               └── route.ts    # Maintenance mode API
├── components/
│   ├── AdminGuard.tsx          # Client-side admin protection
│   ├── admin/
│   │   ├── MaintenanceModeToggle.tsx
│   │   └── UserManagementTable.tsx
│   └── ui/
│       ├── switch.tsx
│       ├── table.tsx
│       └── badge.tsx
├── lib/
│   ├── admin.ts                # Admin utility functions
│   └── maintenance-config.ts   # Maintenance configuration
├── supabase/
│   └── admin_migration.sql     # Database migration
└── middleware.ts               # Updated with admin route protection
```
