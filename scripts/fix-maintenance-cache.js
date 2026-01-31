#!/usr/bin/env node

/**
 * Emergency Maintenance Mode Cache Fix Script
 * 
 * This script helps diagnose and fix maintenance mode caching issues
 * Run: node scripts/fix-maintenance-cache.js
 */

const https = require('https');
const http = require('http');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    };

    protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            success: true,
            status: res.statusCode,
            data: json,
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            success: false,
            status: res.statusCode,
            error: 'Invalid JSON response',
            data: data,
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
      });
    });
  });
}

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║     MAINTENANCE MODE CACHE FIX DIAGNOSTIC TOOL          ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

  // Get the domain from command line args or use localhost
  const domain = process.argv[2] || 'http://localhost:3000';
  const statusUrl = `${domain}/api/maintenance/status?t=${Date.now()}`;

  log(`📍 Checking: ${statusUrl}\n`, 'blue');

  // Step 1: Check API endpoint
  log('Step 1: Checking API Endpoint...', 'yellow');
  const result = await checkUrl(statusUrl);

  if (!result.success) {
    log(`✗ Error: ${result.error}`, 'red');
    log('\n⚠️  Possible issues:', 'yellow');
    log('  1. Server is not running');
    log('  2. Wrong domain/URL');
    log('  3. Network connectivity issue\n');
    process.exit(1);
  }

  log(`✓ Status Code: ${result.status}`, 'green');
  
  // Step 2: Check maintenance mode value
  log('\nStep 2: Checking Maintenance Mode Value...', 'yellow');
  if (result.data && typeof result.data.enabled !== 'undefined') {
    if (result.data.enabled === false) {
      log('✓ Maintenance Mode: DISABLED (OFF)', 'green');
      log('  Message: ' + result.data.message, 'green');
    } else {
      log('✗ Maintenance Mode: ENABLED (ON)', 'red');
      log('  Message: ' + result.data.message, 'red');
      log('\n⚠️  ISSUE FOUND: Maintenance mode is still ON in the database!', 'yellow');
      log('\n📝 To fix, run this SQL in Supabase:', 'cyan');
      log(`
      UPDATE maintenance_settings 
      SET value = false, updated_at = NOW() 
      WHERE key = 'maintenance_mode';
      `, 'magenta');
    }
  } else {
    log('✗ Invalid response format', 'red');
    log('  Response:', JSON.stringify(result.data, null, 2), 'yellow');
  }

  // Step 3: Check cache headers
  log('\nStep 3: Checking Cache Headers...', 'yellow');
  const cacheControl = result.headers['cache-control'];
  const pragma = result.headers['pragma'];
  const expires = result.headers['expires'];

  if (cacheControl && cacheControl.includes('no-store')) {
    log('✓ Cache-Control: ' + cacheControl, 'green');
  } else {
    log('✗ Cache-Control: ' + (cacheControl || 'NOT SET'), 'red');
    log('  ⚠️  WARNING: Response may be cached!', 'yellow');
  }

  if (pragma === 'no-cache') {
    log('✓ Pragma: no-cache', 'green');
  } else {
    log('⚠️  Pragma: ' + (pragma || 'NOT SET'), 'yellow');
  }

  if (expires === '0') {
    log('✓ Expires: 0', 'green');
  } else {
    log('⚠️  Expires: ' + (expires || 'NOT SET'), 'yellow');
  }

  // Step 4: Recommendations
  log('\n╔══════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    RECOMMENDATIONS                       ║', 'cyan');
  log('╚══════════════════════════════════════════════════════════╝\n', 'cyan');

  if (result.data && result.data.enabled === false) {
    log('✓ API is returning maintenance mode as DISABLED', 'green');
    log('\nIf users still see maintenance page, likely causes:', 'yellow');
    log('  1. 🌐 CDN Cache (Vercel/Cloudflare)', 'yellow');
    log('  2. 💻 Browser Cache', 'yellow');
    log('  3. 📱 Service Worker Cache', 'yellow');
    log('\nFixes:', 'cyan');
    log('  • Purge CDN cache in Vercel/Cloudflare dashboard', 'white');
    log('  • Ask users to hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)', 'white');
    log('  • Redeploy application: npm run build && git push', 'white');
    log('  • Test in incognito/private mode to verify\n', 'white');
  } else if (result.data && result.data.enabled === true) {
    log('✗ Maintenance mode is still ENABLED in database!', 'red');
    log('\nFix:', 'cyan');
    log('  1. Go to Supabase SQL Editor', 'white');
    log('  2. Run: UPDATE maintenance_settings SET value = false WHERE key = \'maintenance_mode\';', 'white');
    log('  3. Or use admin panel to toggle it off\n', 'white');
  }

  log('📄 For detailed troubleshooting, see: MAINTENANCE_TROUBLESHOOT.md\n', 'cyan');
}

main().catch((err) => {
  log(`\n✗ Unexpected error: ${err.message}`, 'red');
  process.exit(1);
});
