# Quick Start Commands

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local and add your keys
# You can use any text editor, for example:
notepad .env.local
# or
code .env.local
```

### 3. Get Your API Keys

#### Clerk (Authentication)
```bash
# 1. Visit https://clerk.com and sign up
# 2. Create new application
# 3. Copy keys to .env.local
```

#### Supabase (Database)
```bash
# 1. Visit https://supabase.com and sign up
# 2. Create new project
# 3. Copy URL and anon key to .env.local
# 4. Run the SQL schema:
#    - Go to SQL Editor in Supabase
#    - Copy contents from supabase/schema.sql
#    - Run the query
```

#### OpenAI (AI)
```bash
# 1. Visit https://platform.openai.com
# 2. Create API key
# 3. Add to .env.local
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Open in Browser
```
http://localhost:3000
```

## Alternative: Step-by-Step Interactive Setup

### For Windows (PowerShell)
```powershell
# Navigate to project
cd ai-chat-app

# Install dependencies
npm install

# Create environment file
Copy-Item .env.local.example .env.local

# Open in editor
notepad .env.local

# After adding keys, run dev server
npm run dev

# Open browser
start http://localhost:3000
```

### For macOS/Linux
```bash
# Navigate to project
cd ai-chat-app

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Open in editor
nano .env.local
# or
vim .env.local
# or
code .env.local

# After adding keys, run dev server
npm run dev

# Open browser
open http://localhost:3000
```

## Verify Installation

Run these checks after setup:

```bash
# Check if all dependencies installed
npm list --depth=0

# Check if environment file exists
ls -la .env.local

# Lint the code
npm run lint

# Build (optional - tests if everything compiles)
npm run build
```

## Common Commands

### Development
```bash
# Start dev server
npm run dev

# Start dev server on different port
PORT=3001 npm run dev
```

### Building
```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Cleaning
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Troubleshooting

### If `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install

# Or use different package manager
yarn install
# or
pnpm install
```

### If port 3000 is already in use
```bash
# Use different port
PORT=3001 npm run dev
```

### If build fails
```bash
# Check TypeScript errors
npx tsc --noEmit

# Check Next.js configuration
npm run lint
```

## Environment Variables Needed

Make sure your `.env.local` has these:

```env
# Clerk (Get from https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (Get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# OpenAI (Get from https://platform.openai.com)
OPENAI_API_KEY=sk-...

# These are fixed (don't change)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## First Time Users

1. **Install Node.js** (if not installed)
   - Download from: https://nodejs.org
   - Recommended: LTS version
   - Verify: `node --version` should show v18+

2. **Install a Code Editor** (recommended)
   - VS Code: https://code.visualstudio.com
   - Or use any editor you prefer

3. **Get API Keys** (before running)
   - Clerk account
   - Supabase account  
   - OpenAI account with credits

4. **Follow Quick Start** (above)

5. **Read Documentation**
   - README.md - Overview
   - SETUP.md - Detailed setup
   - PROJECT_SUMMARY.md - Technical details

## Need Help?

- Check [SETUP.md](SETUP.md) for detailed instructions
- See [README.md](README.md) for feature overview
- Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for technical details
- Check browser console for errors
- Verify all environment variables are set correctly

## Success Indicators

After running `npm run dev`, you should see:
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

Visit http://localhost:3000 and you should see the sign-in page.

Happy coding! 🚀
