# Maintenance Mode Guide

This guide explains how to use the maintenance mode feature for your Inpilot application.

## Overview

The maintenance mode feature allows you to display a beautiful "Under Construction" page to visitors while you're developing new features or performing maintenance. The page includes:

- 🎨 Beautiful animated design with gradient backgrounds
- 📧 Contact form for visitors to reach you
- 🔗 Social media links (GitHub, LinkedIn, Portfolio)
- ⚡ Smooth animations and transitions
- 🌓 Dark mode support

## How to Enable/Disable Maintenance Mode

### Method 1: Using the Configuration File (Recommended)

1. Open `lib/maintenance-config.ts`
2. Change `MAINTENANCE_MODE` to `true` to enable maintenance mode:
   ```typescript
   export const MAINTENANCE_MODE = true
   ```
3. Change it back to `false` to disable maintenance mode:
   ```typescript
   export const MAINTENANCE_MODE = false
   ```

### Method 2: Direct Page Access

You can also access the maintenance page directly at:
```
http://localhost:3000/maintenance
```

Or in production:
```
https://yourdomain.com/maintenance
```

## Configuration Options

### Whitelist Paths

You can whitelist specific paths that should bypass maintenance mode. Edit `MAINTENANCE_WHITELIST` in `lib/maintenance-config.ts`:

```typescript
export const MAINTENANCE_WHITELIST = [
  '/maintenance',
  '/api',
  '/_next',
  '/favicon.ico',
  '/admin', // Add custom paths here
]
```

### Admin Access

You can allow specific email addresses to bypass maintenance mode. Edit `ADMIN_EMAILS` in `lib/maintenance-config.ts`:

```typescript
export const ADMIN_EMAILS = [
  'lvigneshbunty789@gmail.com',
  'your-email@example.com', // Add more admin emails
]
```

When logged in with an admin email, you'll have full access to the site even when maintenance mode is enabled.

## How It Works

1. **Middleware Check**: The `middleware.ts` file checks if maintenance mode is enabled
2. **Path Validation**: It verifies if the current path is whitelisted
3. **Admin Check**: It checks if the logged-in user is an admin
4. **Redirect**: If none of the above conditions are met, users are redirected to `/maintenance`

## Customization

### Update Contact Information

Edit `components/UnderConstruction.tsx` to customize:

- **Social Links**: Update the GitHub, LinkedIn, and Portfolio URLs
- **Developer Name**: Change "Lagishetti Vignesh" to your name
- **Messages**: Customize the text and descriptions

### Styling

The component uses:
- Tailwind CSS for styling
- Framer Motion for animations
- Your existing UI components (Button, Card, etc.)

All styling is consistent with your existing design system.

## Testing

1. **Enable Maintenance Mode**:
   ```typescript
   // lib/maintenance-config.ts
   export const MAINTENANCE_MODE = true
   ```

2. **Test Regular User**: Open the site in an incognito window - you should see the maintenance page

3. **Test Admin Access**: Log in with an admin email - you should have full access

4. **Test Contact Form**: Submit the contact form to ensure it works properly

## Production Deployment

When deploying to production:

1. **Before Deployment**: Set `MAINTENANCE_MODE = true` if you want to show the maintenance page
2. **After Deployment**: Set `MAINTENANCE_MODE = false` to restore normal access
3. **Rebuild**: Make sure to rebuild and redeploy after changing the configuration

## Tips

- 💡 Use maintenance mode when deploying major updates
- 💡 Test the contact form to ensure you receive messages
- 💡 Update social links to your actual profiles
- 💡 Consider adding a "Expected completion time" message
- 💡 You can customize the animations and colors to match your brand

## Files Created

- `components/UnderConstruction.tsx` - Main maintenance page component
- `app/maintenance/page.tsx` - Maintenance page route
- `lib/maintenance-config.ts` - Configuration file
- `middleware.ts` - Updated with maintenance mode logic

## Support

If you encounter any issues or need help customizing the maintenance page, feel free to reach out!
