import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file." },
        { status: 500 }
      )
    }

    // Import Gemini AI SDK dynamically
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Build conversation history for context
    const conversationHistory = history
      ?.slice(-10) // Keep last 10 messages for context
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n") || ""

    // Create a health-focused prompt
    const systemPrompt = `You are a helpful medical AI assistant. Provide accurate, compassionate health information and guidance. 
Always remind users to consult healthcare professionals for serious concerns or diagnosis.
Be empathetic, clear, and provide actionable advice when appropriate.
If asked about emergency situations, advise to seek immediate medical attention.

Previous conversation:
${conversationHistory}

User's current question: ${message}

Provide a helpful, informative response:`

    // Try multiple model names as fallback (using latest available models)
    const modelNames = [
      "gemini-2.5-flash",           // Latest stable flash model
      "gemini-2.0-flash",           // Gemini 2.0 flash
      "gemini-flash-latest",        // Generic latest flash
      "gemini-2.5-pro",             // Latest pro model
      "gemini-pro-latest",          // Generic latest pro
      "gemini-2.0-flash-exp"        // Experimental fallback
    ]
    
    let result, response, text
    let lastError: any = null
    
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent(systemPrompt)
        response = result.response
        text = response.text()
        console.log(`✅ Successfully used model: ${modelName}`)
        break // Success! Exit the loop
      } catch (apiError: any) {
        console.log(`❌ Model ${modelName} failed:`, apiError.message)
        lastError = apiError
        // Continue to next model
      }
    }
    
    // If all models failed, throw the last error
    if (!text) {
      console.error("All models failed. Last error:", lastError)
      throw new Error(
        `Unable to access Gemini API. Please check:\n` +
        `1. Your API key is from Google AI Studio (https://aistudio.google.com/app/apikey)\n` +
        `2. The Generative Language API is enabled\n` +
        `3. Billing is set up (if required)\n\n` +
        `Error: ${lastError?.message || lastError}`
      )
    }

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    
    // Handle specific error cases
    if (error.message?.includes("API key") || error.message?.includes("API_KEY") || error.message?.includes("invalid_api_key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Gemini API configuration." },
        { status: 500 }
      )
    }

    if (error.message?.includes("quota") || error.message?.includes("rate limit") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error.message?.includes("PERMISSION_DENIED") || error.message?.includes("403")) {
      return NextResponse.json(
        { error: "API access denied. Please check your API key permissions and billing status." },
        { status: 403 }
      )
    }

    if (error.message?.includes("SAFETY") || error.message?.includes("blocked")) {
      return NextResponse.json(
        { error: "Content was blocked by safety filters. Please rephrase your question." },
        { status: 400 }
      )
    }

    if (error.message?.includes("network") || error.message?.includes("fetch") || error.message?.includes("ENOTFOUND") || error.message?.includes("ECONNREFUSED")) {
      return NextResponse.json(
        { error: "Network error. Please check your internet connection." },
        { status: 503 }
      )
    }

    // Return more detailed error in development
    const isDevelopment = process.env.NODE_ENV === "development"
    return NextResponse.json(
      { 
        error: "Failed to generate response. Please try again.",
        details: isDevelopment ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
