"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FaRobot, FaUser, FaMicrophone, FaPaperPlane, FaHistory, FaPlus, FaTrash, FaHome } from "react-icons/fa"
import { div } from "framer-motion/client"

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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const isInitialMount = useRef(true)

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

  // Auto-save chat when messages change (after AI responds)
  useEffect(() => {
    // Skip on initial mount or when loading a chat
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (messages.length > 0 && status === "authenticated") {
      // Only save if the last message is from assistant (meaning AI just responded)
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        console.log("🔄 Auto-saving chat after AI response...")
        // Use a timer to prevent infinite loops
        const timer = setTimeout(() => {
          saveChat()
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [messages.length, status]) // Only depend on length, not the entire messages array

  // Load chat history on mount
  useEffect(() => {
    if (status === "authenticated") {
      loadChatHistory()
    }
  }, [status])

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

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/chats")
      if (response.ok) {
        const data = await response.json()
        setChatHistory(data.chats || [])
      } else {
        const data = await response.json()
        console.error("Failed to load chat history:", data)
        if (data.error?.includes("Database")) {
          console.warn("⚠️ MongoDB is not configured. Chat history will not be saved.")
          console.log("📖 See MONGODB_SETUP.md for setup instructions")
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
  }

  const saveChat = async () => {
    if (messages.length === 0) return

    try {
      // Generate title from first user message
      const firstUserMsg = messages.find(m => m.role === "user")
      const title = firstUserMsg?.content.slice(0, 50) + (firstUserMsg?.content.length! > 50 ? "..." : "") || "New Chat"

      console.log("Saving chat with", messages.length, "messages")
      
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: currentChatId,
          messages,
          title,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("Failed to save chat:", data)
        return
      }

      console.log("✅ Chat saved successfully:", data.chat._id)
      
      // Update current chat ID if it's a new chat
      if (!currentChatId && data.chat._id) {
        setCurrentChatId(data.chat._id)
      }

      // Reload history in background without blocking
      setTimeout(() => loadChatHistory(), 1000)
    } catch (error) {
      console.error("Error saving chat:", error)
    }
  }

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      if (response.ok) {
        const data = await response.json()
        isInitialMount.current = true // Prevent auto-save when loading
        setMessages(data.chat.messages)
        setCurrentChatId(chatId)
        setShowHistory(false)
      }
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }

  const deleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (currentChatId === chatId) {
          setMessages([])
          setCurrentChatId(null)
        }
        loadChatHistory()
      }
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  const clearAllChats = async () => {
    if (!confirm("Are you sure you want to delete ALL chat history? This cannot be undone.")) return

    try {
      const response = await fetch("/api/chats", {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages([])
        setCurrentChatId(null)
        setChatHistory([])
      }
    } catch (error) {
      console.error("Error clearing chats:", error)
    }
  }

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
    setCurrentChatId(null)
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setShowHistory(false)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#79b473] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#79b473]/5 via-white to-[#41658a]/5">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-[#79b473]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-[#79b473]/10"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-4 py-2 bg-white text-[#41658a] rounded-xl hover:shadow-lg transition-all duration-300 font-medium border-2 border-[#41658a]/20"
              >
                <FaHome className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-xl flex items-center justify-center shadow-lg">
                  <FaRobot className="text-white text-xl" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">
                  AI Health Assistant
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#41658a] to-[#414073] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                <FaHistory />
                <span className="hidden md:inline">History ({chatHistory.length})</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startNewChat}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-[#79b473] to-[#70a37f] text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                <FaPlus />
                <span className="hidden md:inline">New Chat</span>
              </motion.button>
            <button
              onClick={clearChat}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              🗑️ Clear
            </button>
              {chatHistory.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllChats}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:shadow-lg transition-all duration-300 font-medium"
                >
                  <FaTrash />
                  <span className="hidden md:inline">Clear All</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-6 h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4 z-10">
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full md:w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 overflow-y-auto max-h-[calc(100vh-120px)] border border-[#79b473]/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaHistory className="text-[#41658a]" />
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent">Chat History</h2>
              </div>
            {chatHistory.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No chat history yet</p>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentChatId === chat._id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div onClick={() => loadChat(chat._id)}>
                      <h3 className="font-medium text-sm text-gray-800 truncate">
                        {chat.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(chat.updatedAt).toLocaleDateString()} • {chat.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChat(chat._id)
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-t-3xl shadow-xl overflow-y-auto p-6 space-y-4 border border-[#79b473]/20">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-br from-[#79b473] to-[#70a37f] rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
              >
                <FaRobot className="text-white text-5xl" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#41658a] to-[#414073] bg-clip-text text-transparent mb-3">
                Welcome to AI Health Assistant
              </h2>
              <p className="text-gray-600 max-w-md mb-8">
                Ask me anything about health, symptoms, medications, or general wellness.
                I'm here to provide guidance and information.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("What are the symptoms of flu?")}
                  className="p-4 bg-gradient-to-br from-[#79b473]/10 to-[#70a37f]/10 hover:from-[#79b473]/20 hover:to-[#70a37f]/20 rounded-xl text-left text-sm text-gray-700 transition-all border border-[#79b473]/20"
                >
                  💊 What are the symptoms of flu?
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("How can I improve my sleep quality?")}
                  className="p-4 bg-gradient-to-br from-[#41658a]/10 to-[#414073]/10 hover:from-[#41658a]/20 hover:to-[#414073]/20 rounded-xl text-left text-sm text-gray-700 transition-all border border-[#41658a]/20"
                >
                  😴 How can I improve my sleep quality?
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("What foods are good for heart health?")}
                  className="p-4 bg-gradient-to-br from-[#414073]/10 to-[#4c3957]/10 hover:from-[#414073]/20 hover:to-[#4c3957]/20 rounded-xl text-left text-sm text-gray-700 transition-all border border-[#414073]/20"
                >
                  ❤️ What foods are good for heart health?
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput("How much water should I drink daily?")}
                  className="p-4 bg-gradient-to-br from-[#70a37f]/10 to-[#79b473]/10 hover:from-[#70a37f]/20 hover:to-[#79b473]/20 rounded-xl text-left text-sm text-gray-700 transition-all border border-[#70a37f]/20"
                >
                  💧 How much water should I drink daily?
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-[#79b473] to-[#70a37f] text-white rounded-tr-sm"
                        : "bg-white border-2 border-[#41658a]/20 text-gray-800 rounded-tl-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-white/20"
                          : "bg-gradient-to-br from-[#41658a] to-[#414073]"
                      }`}>
                        {message.role === "user" ? (
                          <FaUser className="text-white text-sm" />
                        ) : (
                          <FaRobot className="text-white text-sm" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-white/70"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border-2 border-[#41658a]/20 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#41658a] to-[#414073] flex items-center justify-center">
                        <FaRobot className="text-white text-sm" />
                      </div>
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-[#79b473] rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-[#70a37f] rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-[#41658a] rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-b-2xl shadow-lg p-3 md:p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`px-3 md:px-4 py-3 rounded-lg transition-colors ${
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
              placeholder="Type your question..."
              className="flex-1 px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 md:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm md:text-base"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center hidden md:block">
            💡 This AI assistant provides general health information. Always consult a healthcare professional for medical advice.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
