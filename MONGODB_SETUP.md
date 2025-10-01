# MongoDB Setup Guide

## The Problem

Chat history is not being saved because MongoDB is not configured or connected.

## Quick Test

Visit this URL to check MongoDB status:
**http://localhost:3000/api/test-db**

This will tell you exactly what's wrong.

---

## Option 1: MongoDB Atlas (Free Cloud Database - Recommended)

### Step 1: Create Free MongoDB Atlas Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up for a free account
3. Create a **FREE M0 Cluster** (512 MB storage, completely free)

### Step 2: Get Connection String

1. In MongoDB Atlas dashboard, click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 3: Configure Network Access

1. In Atlas, go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (or add your IP)
4. Click **"Confirm"**

### Step 4: Create Database User

1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Create username and password
4. Give **"Read and write to any database"** permission
5. Click **"Add User"**

### Step 5: Update .env.local

Replace the placeholders in your connection string:

```env

```

Replace:
- `username` with your database username
- `password` with your database password
- `medical-assistant` is your database name (can be anything)

### Step 6: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 7: Test

Visit: http://localhost:3000/api/test-db

You should see: `"success": true`

---

## Option 2: Local MongoDB (For Development)

### Step 1: Install MongoDB

**Windows:**
1. Download from: https://www.mongodb.com/try/download/community
2. Run installer (choose "Complete" installation)
3. Install as a Windows Service

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh
# or
mongo
```

If you see a MongoDB shell, it's running!

### Step 3: Update .env.local

```env
MONGODB_URI=mongodb://localhost:27017/medical-assistant
```

### Step 4: Restart Server

```bash
npm run dev
```

### Step 5: Test

Visit: http://localhost:3000/api/test-db

---

## Troubleshooting

### Error: "MONGODB_URI is not set"

**Solution:**
1. Open `.env.local` file
2. Add this line:
   ```env
   MONGODB_URI=your-connection-string-here
   ```
3. Restart server

### Error: "MongoDB is not connected"

**For Atlas:**
- Check if IP is whitelisted in Network Access
- Verify username/password are correct
- Ensure connection string has no spaces

**For Local:**
- Check if MongoDB service is running
- Try: `mongosh` to verify MongoDB is accessible

### Error: "Authentication failed"

**Solution:**
- Double-check username and password in connection string
- Make sure password doesn't have special characters (or URL encode them)
- Verify database user has correct permissions

### Error: "Network timeout"

**Solution:**
- Check your internet connection (for Atlas)
- Verify firewall isn't blocking MongoDB
- For Atlas, ensure IP is whitelisted

---

## Verify Chat History Works

1. **Test MongoDB:** http://localhost:3000/api/test-db
2. **Go to chat:** http://localhost:3000/chat
3. **Send a message**
4. **Check browser console** - should see "Chat saved successfully"
5. **Click "📜 History"** - your chat should appear!

---

## Quick Setup (MongoDB Atlas - 5 Minutes)

```bash
# 1. Create account at https://www.mongodb.com/cloud/atlas/register
# 2. Create FREE cluster
# 3. Add IP: 0.0.0.0/0 (allow all)
# 4. Create database user
# 5. Get connection string
# 6. Add to .env.local:

MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medical-assistant?retryWrites=true&w=majority

# 7. Restart server
npm run dev

# 8. Test
# Visit: http://localhost:3000/api/test-db
```

---

## Need Help?

1. **Test endpoint:** http://localhost:3000/api/test-db
2. **Check browser console** (F12) for errors
3. **Check terminal** for MongoDB connection errors
4. **Verify .env.local** has MONGODB_URI set correctly
