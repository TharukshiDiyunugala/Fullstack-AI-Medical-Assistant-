# 📊 Health Metrics Tracking - User Guide

## Overview

The Health Metrics Tracking system helps you monitor and visualize your health data over time with:
- ❤️ **Blood Pressure** tracking with trend charts
- 🍬 **Blood Sugar** monitoring with glucose levels
- ⚖️ **Weight** tracking with progress visualization
- 💊 **Medication** management with adherence tracking
- 📈 **Interactive charts** for data visualization
- ⏰ **Medication reminders** (coming soon)

## Features

### 📈 Overview Dashboard

**Quick Summary Cards:**
- Latest blood pressure reading
- Latest blood sugar level
- Current weight
- Active medications list

**Quick Actions:**
- Mark medications as taken
- View trends at a glance
- Add new metrics

### ❤️ Blood Pressure Tracking

**What You Can Track:**
- Systolic pressure (top number)
- Diastolic pressure (bottom number)
- Measurement date and time
- Optional notes

**Visualization:**
- Interactive line chart showing both systolic and diastolic trends
- Last 10 readings displayed
- Color-coded lines (Red for systolic, Blue for diastolic)

**Normal Ranges:**
- Normal: < 120/80 mmHg
- Elevated: 120-129/<80 mmHg
- High (Stage 1): 130-139/80-89 mmHg
- High (Stage 2): ≥140/≥90 mmHg

### 🍬 Blood Sugar Tracking

**What You Can Track:**
- Glucose level (mg/dL)
- Measurement date and time
- Optional notes (fasting, post-meal, etc.)

**Visualization:**
- Line chart showing glucose trends
- Last 10 readings displayed
- Green color-coded line

**Normal Ranges:**
- Fasting: 70-100 mg/dL
- Post-meal (2 hours): < 140 mg/dL
- Pre-diabetes: 100-125 mg/dL (fasting)
- Diabetes: ≥ 126 mg/dL (fasting)

### ⚖️ Weight Tracking

**What You Can Track:**
- Weight in kilograms
- Measurement date and time
- Optional notes

**Visualization:**
- Bar chart showing weight changes
- Last 10 measurements displayed
- Purple color-coded bars

**Tips:**
- Weigh yourself at the same time each day
- Use the same scale
- Track weekly for best results

### 💊 Medication Management

**Features:**
- Add multiple medications
- Set dosage and frequency
- Schedule medication times
- Add special instructions
- Track adherence (taken/missed/skipped)
- View medication history

**Medication Details:**
- Name
- Dosage (e.g., 100mg, 2 tablets)
- Frequency (Once daily, Twice daily, etc.)
- Scheduled times
- Start date
- End date (optional)
- Instructions
- Active/Inactive status

## How to Use

### Adding Health Metrics

1. **Navigate to Health Metrics:**
   - Dashboard → "View Metrics" button
   - Or visit: http://localhost:3000/health-metrics

2. **Click "➕ Add Metric"**

3. **Select Metric Type:**
   - Blood Pressure
   - Blood Sugar
   - Weight

4. **Enter Values:**
   - **Blood Pressure:** Systolic and Diastolic
   - **Blood Sugar:** Glucose level
   - **Weight:** Weight in kg

5. **Add Notes (Optional):**
   - Time of day
   - Before/after meal
   - Any relevant context

6. **Click "Add Metric"**

### Adding Medications

1. **Go to Medications Tab** or click "➕ Add" in Overview

2. **Click "💊 Add Medication"**

3. **Fill in Details:**
   - Medication name
   - Dosage
   - Frequency
   - Time(s) to take
   - Instructions (optional)

4. **Click "Add Medication"**

### Logging Medication Intake

**Quick Log (Overview):**
- Click "✓ Taken" next to medication

**Detailed Log (Medications Tab):**
- Click "✓ Mark as Taken"
- Or "⊘ Skip" if skipped

**Status Options:**
- ✓ **Taken** - Medication taken as scheduled
- ⊘ **Skipped** - Intentionally skipped
- ❌ **Missed** - Accidentally missed

### Viewing Trends

**Switch Between Tabs:**
- **Overview** - Summary of all metrics
- **Blood Pressure** - Detailed BP chart
- **Blood Sugar** - Detailed glucose chart
- **Weight** - Detailed weight chart
- **Medications** - Full medication list

**Chart Features:**
- Hover over data points for exact values
- View last 10 measurements
- Interactive tooltips
- Responsive design

## Data Insights

### Blood Pressure Trends

**What to Look For:**
- Consistent high readings → Consult doctor
- Sudden spikes → Note triggers (stress, diet)
- Gradual improvement → Lifestyle changes working

**Action Items:**
- Track at same time daily
- Note activities before measurement
- Share trends with healthcare provider

### Blood Sugar Patterns

**What to Monitor:**
- Fasting levels
- Post-meal spikes
- Patterns over time
- Effect of diet and exercise

**Red Flags:**
- Consistently high readings
- Extreme fluctuations
- Symptoms (thirst, fatigue, frequent urination)

### Weight Management

**Healthy Tracking:**
- Weekly measurements
- Track trends, not daily fluctuations
- Combine with diet and exercise notes
- Set realistic goals

### Medication Adherence

**Benefits of Tracking:**
- Identify missed doses
- Improve compliance
- Share with doctor
- Understand effectiveness

**Tips for Better Adherence:**
- Set alarms/reminders
- Use pill organizers
- Link to daily routines
- Track side effects

## Best Practices

### ✅ Do:

- **Consistency** - Measure at same time daily
- **Accuracy** - Use calibrated devices
- **Context** - Add notes about circumstances
- **Regular** - Track consistently for patterns
- **Share** - Discuss trends with healthcare provider

### ❌ Don't:

- **Over-measure** - Too frequent can cause anxiety
- **Self-diagnose** - Always consult professionals
- **Ignore patterns** - Act on concerning trends
- **Skip medications** - Without doctor approval
- **Compare** - Everyone's health journey is different

## Understanding the Charts

### Line Charts (BP & Blood Sugar)

**Features:**
- X-axis: Date
- Y-axis: Value (mmHg or mg/dL)
- Multiple lines for different metrics
- Hover for exact values

**Interpretation:**
- Upward trend → Values increasing
- Downward trend → Values decreasing
- Flat line → Stable readings
- Spikes → Investigate causes

### Bar Charts (Weight)

**Features:**
- X-axis: Date
- Y-axis: Weight (kg)
- Color-coded bars
- Hover for exact weight

**Interpretation:**
- Taller bars → Higher weight
- Shorter bars → Lower weight
- Pattern → Weight trend

## Medication Reminders (Coming Soon)

**Planned Features:**
- ⏰ Push notifications
- 📧 Email reminders
- 📱 SMS alerts
- 🔔 In-app notifications
- ⏱️ Customizable reminder times
- 🔁 Recurring reminders

## Data Management

### Privacy & Security

- 🔒 All data encrypted
- 👤 User-specific access only
- 🔐 Secure authentication required
- 💾 MongoDB secure storage
- 🚫 No data sharing

### Data Export (Coming Soon)

- 📄 Export to PDF
- 📊 Export to CSV
- 📈 Generate reports
- 📧 Email to doctor

## Tips for Success

### Blood Pressure

1. **Timing:**
   - Same time each day
   - Before medications
   - Avoid caffeine 30 min before

2. **Position:**
   - Sit quietly for 5 minutes
   - Feet flat on floor
   - Arm at heart level

3. **Frequency:**
   - Once or twice daily
   - More if doctor recommends

### Blood Sugar

1. **Testing Times:**
   - Fasting (morning)
   - Before meals
   - 2 hours after meals
   - Before bed

2. **Factors Affecting:**
   - Food intake
   - Exercise
   - Stress
   - Medications
   - Illness

3. **Record:**
   - Time of day
   - Relation to meals
   - Activities

### Weight

1. **Best Time:**
   - Morning after bathroom
   - Before eating/drinking
   - Same time weekly

2. **Consistency:**
   - Same scale
   - Same clothing
   - Same conditions

### Medications

1. **Organization:**
   - Use pill organizers
   - Keep in visible location
   - Set phone alarms

2. **Tracking:**
   - Log immediately after taking
   - Note any side effects
   - Track effectiveness

3. **Communication:**
   - Share log with doctor
   - Report missed doses
   - Discuss concerns

## Troubleshooting

### Charts Not Showing

**Solution:**
- Add at least 2 data points
- Refresh the page
- Check browser console for errors

### Can't Add Metrics

**Solution:**
- Ensure all required fields filled
- Check internet connection
- Verify MongoDB is connected

### Medication Not Saving

**Solution:**
- Fill all required fields
- Check date format
- Verify authentication

## Health Goals Integration (Coming Soon)

- 🎯 Set health goals
- 📊 Track progress
- 🏆 Achievements
- 📈 Goal visualization
- 🔔 Goal reminders

## Mobile App (Future)

- 📱 iOS and Android apps
- 🔔 Native push notifications
- 📸 Photo tracking
- 🗣️ Voice input
- ⌚ Smartwatch integration

---

## Quick Reference

### Keyboard Shortcuts

- `Ctrl/Cmd + N` - Add new metric (coming soon)
- `Ctrl/Cmd + M` - Add medication (coming soon)
- `Tab` - Navigate between tabs

### API Endpoints

- `GET /api/health-metrics` - Get all metrics
- `POST /api/health-metrics` - Add metric
- `GET /api/medications` - Get medications
- `POST /api/medications` - Add medication
- `POST /api/medications/log` - Log medication intake

---

**Remember: This tool helps you track your health data, but always consult healthcare professionals for medical advice and treatment decisions!**
