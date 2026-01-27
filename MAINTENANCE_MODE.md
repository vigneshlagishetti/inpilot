# Maintenance Mode Guide

## How to Toggle Maintenance Mode

You no longer need to change code or commit files to toggle maintenance mode! Use environment variables instead.

### **Enable Maintenance Mode**

Add this to your `.env.local` file:
```
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

Then restart your development server:
```bash
npm run dev
```

### **Disable Maintenance Mode**

Either remove the line from `.env.local` or set it to false:
```
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

Then restart your development server.

---

## For Production (Vercel/Other Hosting)

### **On Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add: `NEXT_PUBLIC_MAINTENANCE_MODE` = `true`
4. Redeploy (or it will auto-redeploy)

To disable: Change the value to `false` or delete the variable

### **On Other Platforms:**
Set the environment variable `NEXT_PUBLIC_MAINTENANCE_MODE=true` in your hosting platform's settings.

---

## Admin Access During Maintenance

Admins listed in `lib/maintenance-config.ts` can still access the site even during maintenance mode:
- lvigneshbunty789@gmail.com

To add more admins, edit the `ADMIN_EMAILS` array in `lib/maintenance-config.ts`.

---

## Benefits of This Approach

✅ **No code changes needed** - Toggle via environment variable  
✅ **No commits required** - Keep your git history clean  
✅ **Different per environment** - Dev can be live while production is in maintenance  
✅ **Quick toggle** - Enable/disable in seconds on hosting platforms  
✅ **Safe** - Default is OFF (false) if variable is not set
