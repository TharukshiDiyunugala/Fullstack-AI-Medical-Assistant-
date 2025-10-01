"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin?callbackUrl=/chat")
    }
  }, [status])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Display the specific error message from the API
        const errorMsg = data.details 
          ? `${data.error}\n\nDetails: ${data.details}`
          : data.error || "Failed to get response"
        throw new Error(errorMsg)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Chat error:", error)
      
      // Provide more helpful error messages
      let errorContent = "Sorry, I encountered an error. Please try again."
      
      if (error.message) {
        if (error.message.includes("API key") || error.message.includes("API_KEY") || error.message.includes("invalid_api_key")) {
          errorContent = "⚠️ API Configuration Error: The Gemini API key is not configured or invalid.\n\nPlease check your .env.local file and ensure GEMINI_API_KEY is set correctly.\n\nGet your API key from: https://makersuite.google.com/app/apikey"
        } else if (error.message.includes("quota") || error.message.includes("rate limit") || error.message.includes("RESOURCE_EXHAUSTED")) {
          errorContent = "⚠️ API Quota Exceeded: The API rate limit has been reached. Please try again later or check your API quota."
        } else if (error.message.includes("PERMISSION_DENIED") || error.message.includes("access denied") || error.message.includes("403")) {
          errorContent = "⚠️ API Access Denied: Your API key doesn't have permission or billing is not enabled.\n\nPlease check:\n1. API key is valid\n2. Billing is enabled in Google Cloud Console\n3. Gemini API is enabled for your project"
        } else if (error.message.includes("SAFETY") || error.message.includes("blocked")) {
          errorContent = "⚠️ Content Blocked: Your message was blocked by safety filters. Please rephrase your question."
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("ENOTFOUND")) {
          errorContent = "⚠️ Network Error: Unable to connect to the Gemini API.\n\nPlease check:\n1. Your internet connection\n2. Firewall/proxy settings\n3. The Gemini API service status"
        } else if (error.message.includes("Unauthorized")) {
          errorContent = "⚠️ Authentication Error: Please sign in again."
        } else {
          // Include the actual error message for debugging
          errorContent = `⚠️ Error: ${error.message}`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              💬 AI Health Assistant
            </h1>
          </div>
          <button
            onClick={clearChat}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 bg-white rounded-t-2xl shadow-lg overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to AI Health Assistant
              </h2>
              <p className="text-gray-600 max-w-md">
                Ask me anything about health, symptoms, medications, or general wellness.
                I'm here to provide guidance and information.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                <button
                  onClick={() => setInput("What are the symptoms of flu?")}
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 transition-colors"
                >
                  💊 What are the symptoms of flu?
                </button>
                <button
                  onClick={() => setInput("How can I improve my sleep quality?")}
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 transition-colors"
                >
                  😴 How can I improve my sleep quality?
                </button>
                <button
                  onClick={() => setInput("What foods are good for heart health?")}
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 transition-colors"
                >
                  ❤️ What foods are good for heart health?
                </button>
                <button
                  onClick={() => setInput("How much water should I drink daily?")}
                  className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 transition-colors"
                >
                  💧 How much water should I drink daily?
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {message.role === "user" ? "👤" : "🤖"}
                      </span>
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-lg p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`px-4 py-3 rounded-lg transition-colors ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              title="Voice input"
            >
              {isListening ? "🎙️" : "🎤"}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health question here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            💡 This AI assistant provides general health information. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
