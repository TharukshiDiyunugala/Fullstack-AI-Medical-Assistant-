import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Chat from "@/models/Chat"

// GET all chats for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const chats = await Chat.find({ userId: session.user.email })
      .sort({ updatedAt: -1 })
      .select("_id title createdAt updatedAt messages")
      .lean()

    return NextResponse.json({ chats })
  } catch (error: any) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    )
  }
}

// POST create a new chat or update existing
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { chatId, messages, title } = await request.json()

    console.log("Attempting to save chat for user:", session.user.email)
    console.log("Chat ID:", chatId, "Messages:", messages?.length, "Title:", title)

    try {
      await connectDB()
      console.log("MongoDB connected successfully")
    } catch (dbError: any) {
      console.error("MongoDB connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please check MONGODB_URI in .env.local", details: dbError.message },
        { status: 500 }
      )
    }

    if (chatId) {
      // Update existing chat
      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, userId: session.user.email },
        { 
          messages,
          title: title || "Chat",
          updatedAt: new Date()
        },
        { new: true }
      )

      if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
      }

      return NextResponse.json({ chat })
    } else {
      // Create new chat
      const chat = await Chat.create({
        userId: session.user.email,
        title: title || "New Chat",
        messages: messages || [],
      })

      return NextResponse.json({ chat })
    }
  } catch (error: any) {
    console.error("Error saving chat:", error)
    return NextResponse.json(
      { error: "Failed to save chat" },
      { status: 500 }
    )
  }
}

// DELETE all chats for the current user
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const result = await Chat.deleteMany({ userId: session.user.email })

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount 
    })
  } catch (error: any) {
    console.error("Error deleting chats:", error)
    return NextResponse.json(
      { error: "Failed to delete chats" },
      { status: 500 }
    )
  }
}
