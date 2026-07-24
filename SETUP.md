# AI Interview Assistant - Setup Guide

## Quick Start

Follow these steps to get your AI Interview Assistant up and running:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Clerk Authentication

1. Visit [clerk.com](https://clerk.com)
2. Sign up/Sign in to your account
3. Click "Add Application"
4. Name your application (e.g., "AI Interview Assistant")
5. Select "Email" and "Google" (or other providers)
6. Copy your publishable key and secret key
7. Add to `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Step 3: Configure Supabase Database

1. Visit [supabase.com](https://supabase.com)
2. Sign up/Sign in to your account
3. Click "New Project"
4. Fill in project details:
   - Name: AI Interview Assistant
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
5. Wait for project setup (2-3 minutes)
6. Go to Settings → API
7. Copy your URL and anon/public key
8. Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Step 4: Set Up Database Schema

1. In Supabase, go to SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the query editor
5. Click "Run" to execute

### Step 5: Configure OpenAI

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up/Sign in to your account
3. Go to API Keys section
4. Click "Create new secret key"
5. Name it "AI Interview Assistant"
6. Copy the key (you won't see it again!)
7. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

### Step 6: Create .env.local File

Create a file named `.env.local` in the root directory with all keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_key_here
```

### Step 7: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Application

### Browser Compatibility
- **Best**: Chrome or Edge (full Web Speech API support)
- **Good**: Safari
- **Limited**: Firefox

### Test Flow
1. Sign up for a new account
2. Sign in with your credentials
3. Click the microphone button
4. Allow microphone permissions when prompted
5. Ask a question: "What is React?"
6. Wait 2 seconds after speaking (auto-stops)
7. View the generated answer

## Common Issues

### Issue: "Browser not supported" error
**Solution**: Use Chrome or Edge browser. Safari also works but Chrome is recommended.

### Issue: Microphone not working
**Solutions**:
- Check browser permissions (click lock icon in address bar)
- Ensure microphone is not used by another application
- Try reloading the page
- Use HTTPS (required for Web Speech API)

### Issue: "Unauthorized" error
**Solutions**:
- Verify Clerk keys are correct
- Check if you're signed in
- Clear cookies and try again

### Issue: "Failed to generate answer"
**Solutions**:
- Verify OpenAI API key is correct
- Check if you have credits in your OpenAI account
- Look at browser console for detailed errors

### Issue: Database errors
**Solutions**:
- Verify Supabase URL and key are correct
- Ensure schema.sql was executed successfully
- Check Supabase dashboard for connection issues

## Environment Variables Checklist

Make sure you have ALL of these in your `.env.local`:

- [ ] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- [ ] CLERK_SECRET_KEY
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] OPENAI_API_KEY

## Costs

### Clerk (Authentication)
- Free tier: 10,000 monthly active users
- More than enough for personal use

### Supabase (Database)
- Free tier: 500MB database, 1GB file storage
- 50,000 monthly active users
- Perfect for testing and small projects

### OpenAI (AI)
- Pay-per-use pricing
- GPT-4 Turbo: ~$0.01 per request
- GPT-3.5 Turbo: ~$0.002 per request
- Start with $5-10 credit for testing

## Next Steps

After setup:
1. Test the voice recording feature
2. Ask various types of questions
3. Check the answer history
4. Customize the UI if desired
5. Deploy to Vercel for production use

## Need Help?

- Check the main README.md for more details
- Review the browser console for errors
- Ensure all environment variables are set correctly
- Verify all third-party services are properly configured
