# 🔧 Fix Your Gemini API Key - Step by Step

## The Problem

You're getting this error:
```
[404 Not Found] models/gemini-pro is not found for API version v1beta
```

**This means your current API key CANNOT access Gemini models.**

---

## ✅ The Solution (5 Minutes)

### Step 1: Get a New API Key

1. Open this link: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"**
5. **Copy the key** (it starts with `AIza...`)

### Step 2: Update Your .env.local File

1. Open the file: `mediassistant/.env.local`
2. Find the line: `GEMINI_API_KEY=...`
3. Replace with your NEW key:
   ```env
   GEMINI_API_KEY=AIzaSy...your-actual-key-here
   ```
4. Save the file

### Step 3: Restart Your Dev Server

In your terminal:
1. Press `Ctrl+C` to stop the server
2. Run: `npm run dev`
3. Wait for it to start

### Step 4: Test It

**Option A: Test via Browser**
- Open: http://localhost:3000/api/test-gemini
- You should see: `"success": true` and a list of available models

**Option B: Test via Chat**
- Go to: http://localhost:3000/chat
- Send a message like "Hello"
- You should get a response!

---

## 🎯 What I Fixed in Your Code

I updated the code to:
1. ✅ Try multiple model names automatically (gemini-1.5-flash-latest, gemini-1.5-pro-latest, etc.)
2. ✅ Show detailed error messages with instructions
3. ✅ Added a test endpoint: `/api/test-gemini`
4. ✅ Better error handling and logging

**The code will now automatically find and use whichever model your API key has access to.**

---

## 🔍 Still Not Working?

### Check the Terminal Output

When you send a message, look at your terminal. You should see:
```
Trying model: gemini-1.5-flash-latest
✅ Successfully used model: gemini-1.5-flash-latest
```

If you see all models failing, your API key is still not working.

### Common Issues

1. **Old API Key Format**
   - API keys from Google Cloud Console often don't work
   - Use Google AI Studio instead: https://aistudio.google.com/app/apikey

2. **API Not Enabled**
   - If using Google Cloud Console key, enable: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

3. **Billing Required**
   - Some projects require billing even for free tier
   - Set up at: https://console.cloud.google.com/billing

4. **Wrong Key**
   - Make sure you copied the entire key
   - It should start with `AIza` and be about 39 characters long

---

## 📞 Need More Help?

1. **Test your API key:** Visit http://localhost:3000/api/test-gemini
2. **Check terminal logs:** Look for detailed error messages
3. **Verify API key:** Make sure it starts with `AIza` and has no spaces
4. **Create fresh key:** When in doubt, create a new key from AI Studio

---

## ✨ Success Checklist

- [ ] Created new API key from Google AI Studio
- [ ] Updated `.env.local` with new key
- [ ] Restarted dev server (`Ctrl+C` then `npm run dev`)
- [ ] Tested at http://localhost:3000/api/test-gemini
- [ ] Sent a test message in the chat

Once all checkboxes are done, your chat should work! 🎉
