// Maintenance Mode Configuration
// Set NEXT_PUBLIC_MAINTENANCE_MODE environment variable to 'true' to enable maintenance mode
// Set it to 'false' or leave it unset to disable maintenance mode
// This allows you to toggle maintenance mode without code changes

export const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

// Optional: Whitelist specific paths that should bypass maintenance mode
// For example, you might want to allow access to the maintenance page itself
export const MAINTENANCE_WHITELIST = [
    '/maintenance',
    '/api',
    '/_next',
    '/favicon.ico',
]

// Optional: Whitelist specific email addresses that can bypass maintenance mode
// Useful for allowing yourself or team members to access the site during development
export const ADMIN_EMAILS = [
    'lvigneshbunty789@gmail.com',
    // Add more admin emails here
]
