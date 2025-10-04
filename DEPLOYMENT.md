# Deployment Guide for Vercel

## Fix for "Redirecting to localhost:3000" Issue

If your app redirects to `localhost:3000` after sign-in on Vercel, follow these steps:

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard:
1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

#### Required Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Your actual Vercel deployment URL |
| `NEXTAUTH_SECRET` | (generate a secret) | Random secret key for JWT encryption |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `GEMINI_API_KEY` | Your Gemini API key | For AI features |

#### Optional (for Google OAuth):

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |

### 2. Generate NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online tool: https://generate-secret.vercel.app/32

### 3. Update Google OAuth Settings (if using Google Sign-In)

If you're using Google OAuth, update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
   - Keep the localhost one for development: `http://localhost:3000/api/auth/callback/google`

### 4. Redeploy

After adding the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for the deployment to complete

### 5. Test

Visit your Vercel URL and try signing in. It should now redirect correctly!

## Troubleshooting

### Still redirecting to localhost?
- Double-check that `NEXTAUTH_URL` is set correctly in Vercel (no trailing slash)
- Make sure you redeployed after adding environment variables
- Clear your browser cache and cookies
- Check Vercel logs for any errors

### Authentication errors?
- Verify `NEXTAUTH_SECRET` is set
- Ensure `MONGODB_URI` is correct and accessible from Vercel
- Check that your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel's IP ranges

### Google OAuth not working?
- Verify redirect URIs in Google Cloud Console match your Vercel URL
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly

## Environment Variables Checklist

- [ ] `NEXTAUTH_URL` - Set to your Vercel URL
- [ ] `NEXTAUTH_SECRET` - Generated and set
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `GEMINI_API_KEY` - Gemini API key
- [ ] `GOOGLE_CLIENT_ID` - (Optional) Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth
- [ ] Redeployed after adding variables
- [ ] Tested sign-in on production

## Notes

- The `trustHost: true` option has been added to the NextAuth configuration to support Vercel's dynamic URLs
- Never commit `.env.local` to Git - it's already in `.gitignore`
- Use `.env.example` as a template for your local development
