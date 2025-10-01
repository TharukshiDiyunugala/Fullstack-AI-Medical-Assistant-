# AI Chat Feature Setup Guide

## 🎯 Overview

The AI-powered chat feature integrates Google's Gemini AI to provide intelligent health-related guidance through:
- 💬 **Text-based chat** - Type your health questions
- 🎙️ **Voice input** - Speak your questions using Web Speech API
- 🤖 **Smart responses** - Context-aware AI responses with conversation history

---

## 📦 Installation

### 1. Install Gemini AI SDK

```powershell
npm install @google/generative-ai
```

### 2. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key

### 3. Configure Environment Variables

Add the Gemini API key to your `.env.local` file:

```env
# Gemini AI API Key
GEMINI_API_KEY=your-actual-api-key-here
```

**⚠️ Important:** Never commit your `.env.local` file to Git. It's already in `.gitignore`.

---

## 🚀 Usage

### Starting a Chat

1. Sign in to your account
2. Go to the Dashboard
3. Click **"Start Chat"** on the AI Chat card
4. Start asking health-related questions!

### Text Input

- Type your question in the input field
- Press **Enter** or click **"Send"**
- Wait for the AI response

### Voice Input

1. Click the **🎤 microphone icon**
2. Allow microphone permissions (first time only)
3. Speak your question clearly
4. The text will appear in the input field
5. Click **"Send"** to submit

**Note:** Voice input requires Chrome, Edge, or Safari browser.

---

## 🎨 Features

### ✅ Implemented Features

- **Real-time chat interface** with message history
- **Context-aware responses** - AI remembers last 10 messages
- **Voice recognition** - Speak your questions
- **Suggested prompts** - Quick start questions
- **Auto-scroll** - Messages automatically scroll to bottom
- **Loading indicators** - Visual feedback during AI processing
- **Error handling** - Graceful error messages
- **Authentication** - Protected route, requires sign-in
- **Responsive design** - Works on mobile and desktop

### 🎯 Sample Questions

Try asking:
- "What are the symptoms of flu?"
- "How can I improve my sleep quality?"
- "What foods are good for heart health?"
- "How much water should I drink daily?"
- "What are the benefits of regular exercise?"

---

## 🔧 Technical Details

### File Structure

```
mediassistant/
├── app/
│   ├── chat/
│   │   └── page.tsx              # Chat UI component
│   └── api/
│       └── chat/
│           └── route.ts          # Gemini AI API endpoint
├── .env.local                    # Environment variables (create this)
└── .env.example                  # Template for environment variables
```

### API Endpoint

**POST** `/api/chat`

**Request Body:**
```json
{
  "message": "What are the symptoms of flu?",
  "history": [
    {
      "role": "user",
      "content": "Previous question",
      "timestamp": "2025-09-30T..."
    }
  ]
}
```

**Response:**
```json
{
  "response": "AI-generated response text",
  "timestamp": "2025-09-30T..."
}
```

### Technologies Used

- **Google Gemini AI** (`gemini-pro` model) - AI responses
- **Web Speech API** - Voice recognition
- **Next.js 15** - Framework
- **NextAuth** - Authentication
- **React Hooks** - State management
- **Tailwind CSS** - Styling

---

## 🐛 Troubleshooting

### Error: "Gemini API key is not configured"

**Solution:**
1. Make sure you've added `GEMINI_API_KEY` to `.env.local`
2. Restart the development server: `npm run dev`
3. Verify the API key is correct

### Voice Input Not Working

**Possible causes:**
- Browser doesn't support Web Speech API (use Chrome/Edge)
- Microphone permissions not granted
- No microphone connected

**Solution:**
1. Check browser compatibility
2. Allow microphone access when prompted
3. Check browser settings → Privacy → Microphone

### API Rate Limits

Gemini AI has rate limits on the free tier:
- **60 requests per minute**
- **1,500 requests per day**

If you hit limits, wait a few minutes or upgrade to a paid plan.

### Chat Not Loading

**Solution:**
1. Check if you're signed in
2. Verify MongoDB connection is working
3. Check browser console for errors
4. Ensure all dependencies are installed: `npm install`

---

## 🔐 Security Best Practices

1. **Never expose your API key** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** for production
4. **Validate user input** before sending to AI
5. **Monitor API usage** to avoid unexpected costs

---

## 💡 Medical Disclaimer

The AI assistant provides **general health information only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical concerns.

---

## 📈 Future Enhancements

Potential improvements:
- [ ] Save chat history to database
- [ ] Export chat conversations
- [ ] Multi-language support
- [ ] Image analysis (symptoms from photos)
- [ ] Voice output (text-to-speech responses)
- [ ] Symptom severity assessment
- [ ] Integration with health metrics tracking

---

## 🤝 Support

If you encounter issues:
1. Check this guide first
2. Verify all environment variables are set
3. Ensure dependencies are installed
4. Check browser console for errors
5. Restart the development server

For Gemini AI specific issues, visit: https://ai.google.dev/docs
