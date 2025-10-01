import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY not configured"
      })
    }

    // Try to fetch available models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: data,
        instructions: {
          "403_Forbidden": "API not enabled or billing not set up",
          "400_Bad_Request": "Invalid API key format",
          "Solution": "Create a new API key at https://aistudio.google.com/app/apikey"
        }
      }, { status: response.status })
    }

    const availableModels = data.models?.map((m: any) => ({
      name: m.name.replace('models/', ''),
      displayName: m.displayName,
      methods: m.supportedGenerationMethods
    })) || []

    const generateModels = availableModels.filter((m: any) => 
      m.methods?.includes('generateContent')
    )

    return NextResponse.json({
      success: true,
      apiKeyPrefix: apiKey.substring(0, 10) + "...",
      totalModels: availableModels.length,
      availableModels,
      recommendedModel: generateModels[0]?.name || null,
      message: generateModels.length > 0 
        ? `✅ API key is working! Use model: ${generateModels[0]?.name}`
        : "⚠️ No models available for generateContent"
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
