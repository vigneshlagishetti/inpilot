// Maintenance Mode Configuration
// Set MAINTENANCE_MODE to true to enable maintenance mode for all pages
// Set MAINTENANCE_MODE to false to disable maintenance mode

export const MAINTENANCE_MODE = false

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
