# Deployment Guide

Deploy your AI Interview Assistant to production with Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- All environment variables configured
- Working application locally

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI Interview Assistant"

# Create a repository on GitHub
# Then push to GitHub
git remote add origin https://github.com/yourusername/ai-interview-assistant.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
5. Add environment variables (see below)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts to configure project

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel

Add all these environment variables in Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
```

**Important**: Use production keys for Clerk (pk_live_ and sk_live_), not test keys!

### 4. Update Clerk Settings

1. Go to Clerk Dashboard
2. Navigate to your application
3. Go to "Domains"
4. Add your Vercel domain (e.g., `your-app.vercel.app`)
5. Update redirect URLs:
   - Sign-in URL: `https://your-app.vercel.app/sign-in`
   - Sign-up URL: `https://your-app.vercel.app/sign-up`
   - After sign-in: `https://your-app.vercel.app/dashboard`

### 5. Configure Supabase for Production

1. Go to Supabase Dashboard
2. Navigate to Settings → API
3. Add your Vercel domain to allowed domains
4. Update CORS settings if needed

### 6. Test Your Deployment

1. Visit your Vercel URL
2. Test sign-up/sign-in
3. Test voice recording (must use HTTPS)
4. Test answer generation
5. Check browser console for errors

## Domain Configuration (Optional)

### Add Custom Domain

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as shown
5. Update Clerk settings with new domain

## Environment-Specific Configurations

### Production Optimizations

Update [next.config.js](next.config.js) for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com'],
  },
  // Enable production optimizations
  reactStrictMode: true,
  swcMinify: true,
  // Add compression
  compress: true,
}

module.exports = nextConfig
```

### Error Monitoring (Optional)

Consider adding Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## Post-Deployment Checklist

- [ ] Application loads correctly
- [ ] Sign-up/Sign-in works
- [ ] Microphone permissions work (HTTPS only)
- [ ] Voice recording functions
- [ ] AI answers generate correctly
- [ ] UI displays properly on mobile
- [ ] All environment variables are set
- [ ] Clerk redirect URLs are updated
- [ ] Database connections work
- [ ] No console errors

## Monitoring & Maintenance

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page load times
   - API response times
   - Error rates
   - User activity

### Cost Monitoring

Monitor usage for:
- **Vercel**: Free tier has limits on builds/bandwidth
- **OpenAI**: Check API usage and costs
- **Supabase**: Monitor database size and requests
- **Clerk**: Track monthly active users

### Regular Updates

```bash
# Update dependencies
npm update

# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Update dependencies"
git push

# Vercel auto-deploys on push to main
```

## Scaling Considerations

### For High Traffic

1. **OpenAI Rate Limits**
   - Implement request queuing
   - Add rate limiting middleware
   - Consider caching common questions

2. **Database Optimization**
   - Add database indexes
   - Implement connection pooling
   - Consider read replicas

3. **CDN & Caching**
   - Vercel Edge Network handles this
   - Configure proper cache headers

### Alternative Speech Services

For production scale, consider:

**Deepgram**
- More reliable than Web Speech API
- Better accuracy
- Supports more languages

**AssemblyAI**
- Real-time transcription
- Better for long sessions
- Built-in speaker diarization

**Google Speech-to-Text**
- Enterprise-grade reliability
- Multi-language support
- Good pricing

## Troubleshooting Production Issues

### Microphone Not Working
- Ensure HTTPS is enabled (Vercel does this automatically)
- Check browser console for permission errors
- Test in Chrome/Edge first

### API Errors
- Check environment variables are set correctly
- Verify API keys are production keys, not test keys
- Check Vercel function logs

### Database Connection Issues
- Verify Supabase URL and keys
- Check if IP restrictions are configured
- Review connection pool settings

### Build Failures
- Check build logs in Vercel
- Ensure all dependencies are in package.json
- Verify TypeScript types are correct

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard
2. Navigate to "Deployments"
3. Find last working deployment
4. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/overview)
- [Supabase Production Setup](https://supabase.com/docs/guides/platform)

## Security Best Practices

1. Never commit `.env.local` to git
2. Use production API keys in production
3. Enable rate limiting for API routes
4. Implement proper CORS policies
5. Keep dependencies updated
6. Monitor for security vulnerabilities
7. Use environment variables for all secrets

Your AI Interview Assistant is now ready for production! 🚀
