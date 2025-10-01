# 🩺 Symptom Checker - User Guide

## Overview

The Symptom Checker is an AI-powered tool that analyzes your symptoms and provides:
- 🏥 Probable medical conditions
- ⚠️ Urgency level assessment
- 💡 Actionable recommendations
- 🏠 Self-care advice
- 🚨 When to see a doctor

## How to Use

### Step 1: Access the Symptom Checker

1. Go to your **Dashboard**
2. Click on **"Check Symptoms"** card
3. Or visit: http://localhost:3000/symptom-checker

### Step 2: Add Your Symptoms

For each symptom:
1. **Enter symptom name** (e.g., "Headache", "Fever", "Cough")
2. **Select severity:**
   - **Mild** - Barely noticeable, doesn't affect daily activities
   - **Moderate** - Noticeable, somewhat affects daily activities
   - **Severe** - Significantly affects daily activities
3. **Enter duration** (e.g., "2 days", "1 week", "3 hours")
4. Click **"➕ Add Symptom"**

**Tip:** You can add multiple symptoms for better analysis!

### Step 3: Optional Information (Recommended)

Providing additional information improves accuracy:
- **Age** - Helps identify age-specific conditions
- **Gender** - Some conditions are gender-specific
- **Additional Info** - Medications, allergies, recent travel, etc.

### Step 4: Analyze

Click **"🔍 Analyze Symptoms"** button

The AI will analyze your symptoms and provide:

## Understanding the Results

### 🚦 Urgency Levels

| Level | Icon | Meaning | Action |
|-------|------|---------|--------|
| **Low** | ✅ | Minor issue | Self-care appropriate |
| **Medium** | ⚠️ | Moderate concern | See doctor within a few days |
| **High** | 🚨 | Serious concern | See doctor within 24 hours |
| **Emergency** | 🆘 | Critical | Seek immediate medical attention |

### 📊 Analysis Components

1. **Probable Conditions**
   - List of possible medical conditions based on your symptoms
   - Ranked by likelihood
   - Not a definitive diagnosis

2. **Recommendations**
   - Specific actions you should take
   - May include tests, consultations, or lifestyle changes

3. **Self-Care Tips**
   - Safe, evidence-based home remedies
   - Things you can do to manage symptoms
   - Over-the-counter medication suggestions

4. **When to See a Doctor**
   - Clear guidance on when professional help is needed
   - Red flags to watch for
   - Emergency signs

## Features

### ✅ History Tracking

- All symptom checks are saved to your account
- Click **"📋 History"** to view past checks
- See urgency levels and dates
- Track symptom patterns over time

### 🔄 Reset Form

- Click **"🔄 Reset"** to clear all inputs
- Start a new symptom check
- Previous checks remain in history

### 📱 Responsive Design

- Works on desktop, tablet, and mobile
- Easy-to-use interface
- Clear visual indicators

## Important Disclaimers

### ⚠️ Medical Disclaimer

**This tool is NOT a substitute for professional medical advice.**

- Results are for **informational purposes only**
- Always consult a **qualified healthcare professional** for:
  - Proper diagnosis
  - Treatment plans
  - Medical advice
- In case of **emergency**, call emergency services immediately

### 🔒 Privacy

- Your symptom checks are stored securely
- Only you can access your history
- Data is encrypted and protected

## Example Use Cases

### Example 1: Common Cold

**Symptoms:**
- Runny nose (Mild, 2 days)
- Sore throat (Moderate, 3 days)
- Mild cough (Mild, 2 days)

**Expected Result:**
- Urgency: Low ✅
- Probable: Common cold, Upper respiratory infection
- Recommendations: Rest, fluids, OTC medications
- Self-care: Warm liquids, humidifier, throat lozenges

### Example 2: Potential Concern

**Symptoms:**
- Chest pain (Severe, 1 hour)
- Shortness of breath (Severe, 1 hour)
- Dizziness (Moderate, 30 minutes)

**Expected Result:**
- Urgency: Emergency 🆘
- Recommendation: **Seek immediate medical attention**
- Call emergency services

### Example 3: Moderate Issue

**Symptoms:**
- Persistent headache (Moderate, 5 days)
- Blurred vision (Mild, 3 days)
- Fatigue (Moderate, 1 week)

**Expected Result:**
- Urgency: Medium ⚠️
- Recommendation: Schedule doctor appointment within 2-3 days
- Possible conditions: Migraine, vision problems, stress

## Tips for Best Results

### ✅ Do:

- Be specific about symptoms
- Include all relevant symptoms
- Provide accurate duration
- Mention any recent changes
- Include relevant medical history

### ❌ Don't:

- Self-diagnose based solely on results
- Ignore emergency symptoms
- Delay seeking help for serious issues
- Use as a replacement for doctor visits
- Share your account with others

## When to Seek Immediate Help

**Call emergency services (911) if you experience:**

- 🚨 Chest pain or pressure
- 🚨 Difficulty breathing
- 🚨 Severe bleeding
- 🚨 Loss of consciousness
- 🚨 Severe allergic reaction
- 🚨 Stroke symptoms (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call)
- 🚨 Severe head injury
- 🚨 Suicidal thoughts

## Technical Details

### How It Works

1. **Input Collection** - Gathers symptoms and patient info
2. **AI Analysis** - Uses Google Gemini AI to analyze patterns
3. **Medical Knowledge** - Cross-references with medical databases
4. **Risk Assessment** - Evaluates urgency and severity
5. **Recommendations** - Generates personalized advice
6. **Storage** - Saves to MongoDB for history tracking

### Data Stored

- Symptoms (name, severity, duration)
- Patient demographics (optional)
- AI analysis results
- Timestamp
- User ID (for privacy)

### Privacy & Security

- End-to-end encryption
- HIPAA-compliant storage
- No data sharing with third parties
- Secure authentication required

## Troubleshooting

### Issue: Analysis Takes Too Long

**Solution:**
- Check your internet connection
- Refresh the page and try again
- Reduce number of symptoms if too many

### Issue: Inaccurate Results

**Possible Causes:**
- Vague symptom descriptions
- Missing important symptoms
- Incomplete information

**Solution:**
- Be more specific
- Add all relevant symptoms
- Include optional information

### Issue: Can't See History

**Solution:**
- Ensure you're logged in
- Check MongoDB connection
- Refresh the page

## Support

For technical issues or questions:
- Check the browser console (F12) for errors
- Verify MongoDB is connected
- Ensure Gemini API key is configured

## Future Enhancements

Coming soon:
- 📸 Image upload for visual symptoms
- 🗣️ Voice input for symptoms
- 📈 Symptom tracking over time
- 🔔 Reminders for follow-ups
- 📄 Export reports as PDF
- 🌐 Multi-language support

---

**Remember: This is a tool to help you make informed decisions, but it's not a replacement for professional medical care. When in doubt, always consult a healthcare provider!**
