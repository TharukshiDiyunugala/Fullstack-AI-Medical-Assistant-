# Troubleshooting Guide

## Error: "404 Not Found - models/gemini-pro is not found"

**This is the most common error!** It means your API key cannot access any Gemini models.

### Quick Fix (Recommended)

**Your current API key is NOT working.** You need to create a new one:

1. **Go to Google AI Studio:**
   - Visit: **https://aistudio.google.com/app/apikey**
   - Sign in with your Google account

2. **Create a NEW API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project"
   - Copy the generated key (starts with `AIza...`)

3. **Replace in `.env.local`:**
   ```env
   GEMINI_API_KEY=AIzaSy...your-new-key
   ```

4. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

5. **Test your API key:**
   - Visit: http://localhost:3000/api/test-gemini
   - This will show you which models are available

---

## Error: "Failed to generate response. Please try again."

This error occurs when the chat API cannot generate a response from the Gemini AI. Here are the steps to fix it:

### Step 1: Check Your .env.local File

1. Make sure you have a `.env.local` file in the root directory (`mediassistant/.env.local`)
2. If it doesn't exist, create it by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

### Step 2: Configure the Gemini API Key

1. **Get a Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Add the API key to .env.local:**
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   ```
   Replace `your-actual-api-key-here` with your actual API key.

### Step 3: Configure Other Required Environment Variables

Your `.env.local` should have these variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Restart the Development Server

After updating `.env.local`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then start it again:
npm run dev
```

### Step 5: Check the Console for Detailed Errors

With the improved error handling, you should now see more detailed error messages:
- In the browser console (F12 → Console tab)
- In the terminal where the dev server is running
- In the chat interface itself

### Common Error Messages and Solutions

#### "API key is not configured"
- **Cause:** `GEMINI_API_KEY` is missing or empty in `.env.local`
- **Solution:** Add a valid Gemini API key to `.env.local`

#### "Invalid API key"
- **Cause:** The API key is incorrect or has been revoked
- **Solution:** Generate a new API key from Google AI Studio

#### "API quota exceeded"
- **Cause:** You've hit the rate limit for the Gemini API
- **Solution:** Wait a few minutes and try again, or upgrade your API plan

#### "Network error"
- **Cause:** Cannot connect to the Gemini API
- **Solution:** Check your internet connection and firewall settings

#### "Unauthorized"
- **Cause:** Your session has expired
- **Solution:** Sign out and sign in again

### Still Having Issues?

1. **Check the browser console** (F12) for detailed error messages
2. **Check the terminal** where `npm run dev` is running for server-side errors
3. **Verify your API key** is valid at https://makersuite.google.com/app/apikey
4. **Check API quotas** to ensure you haven't exceeded the free tier limits
5. **Try a simple test message** like "Hello" to isolate the issue

### Testing Your Configuration

After setting up, try sending a simple message like:
- "Hello"
- "What is health?"

If these work, your configuration is correct!
