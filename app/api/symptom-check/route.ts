import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import SymptomCheck from "@/models/SymptomCheck"

// GET all symptom checks for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const checks = await SymptomCheck.find({ userId: session.user.email })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    return NextResponse.json({ checks })
  } catch (error: any) {
    console.error("Error fetching symptom checks:", error)
    return NextResponse.json(
      { error: "Failed to fetch symptom checks" },
      { status: 500 }
    )
  }
}

// POST analyze symptoms
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { symptoms, age, gender, additionalInfo } = await request.json()

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: "At least one symptom is required" },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      )
    }

    // Import Gemini AI SDK
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)

    // Build symptom description
    const symptomList = symptoms
      .map((s: any) => `- ${s.name} (${s.severity} severity, duration: ${s.duration})`)
      .join("\n")

    const demographicInfo = []
    if (age) demographicInfo.push(`Age: ${age}`)
    if (gender) demographicInfo.push(`Gender: ${gender}`)
    const demographics = demographicInfo.length > 0 ? demographicInfo.join(", ") : "Not provided"

    // Create medical analysis prompt
    const prompt = `You are an experienced medical AI assistant. Analyze the following symptoms and provide a structured medical assessment.

**Patient Information:**
${demographics}

**Symptoms:**
${symptomList}

**Additional Information:**
${additionalInfo || "None provided"}

**Please provide a detailed analysis in the following JSON format:**
{
  "probableConditions": ["condition1", "condition2", "condition3"],
  "urgencyLevel": "low|medium|high|emergency",
  "recommendations": ["recommendation1", "recommendation2"],
  "selfCareAdvice": ["advice1", "advice2", "advice3"],
  "whenToSeeDoctor": "Detailed explanation of when to seek medical attention",
  "detailedAnalysis": "A comprehensive explanation of the symptoms and possible conditions"
}

**Guidelines:**
- List 3-5 probable conditions based on symptoms
- Urgency levels:
  * low: Minor issues, self-care appropriate
  * medium: Should see doctor within a few days
  * high: Should see doctor within 24 hours
  * emergency: Seek immediate medical attention
- Provide practical, actionable recommendations
- Include self-care tips that are safe and evidence-based
- Be clear about red flags that require immediate medical attention
- Always emphasize that this is not a diagnosis and professional medical advice should be sought

Respond ONLY with valid JSON, no additional text.`

    // Try multiple models
    const modelNames = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
    ]

    let analysis: any = null
    let lastError: any = null

    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const response = result.response
        const text = response.text()

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
          analysis.aiResponse = text
          console.log(`✅ Successfully used model: ${modelName}`)
          break
        }
      } catch (error: any) {
        console.log(`❌ Model ${modelName} failed:`, error.message)
        lastError = error
      }
    }

    if (!analysis) {
      throw new Error("Failed to analyze symptoms with AI")
    }

    // Save to database
    await connectDB()

    const symptomCheck = await SymptomCheck.create({
      userId: session.user.email,
      symptoms,
      age,
      gender,
      additionalInfo,
      analysis,
    })

    return NextResponse.json({
      success: true,
      checkId: symptomCheck._id,
      analysis,
    })
  } catch (error: any) {
    console.error("Symptom check error:", error)
    return NextResponse.json(
      { error: "Failed to analyze symptoms", details: error.message },
      { status: 500 }
    )
  }
}
