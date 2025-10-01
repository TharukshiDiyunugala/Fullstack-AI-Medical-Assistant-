import { NextResponse } from "next/server"
import connectDB from "@/lib/mongoose"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: false,
        error: "MONGODB_URI is not set in .env.local",
        instructions: [
          "1. Add MONGODB_URI to your .env.local file",
          "2. For local MongoDB: MONGODB_URI=mongodb://localhost:27017/medical-assistant",
          "3. For MongoDB Atlas: Get connection string from https://cloud.mongodb.com",
          "4. Restart dev server: npm run dev"
        ]
      }, { status: 500 })
    }

    // Try to connect
    await connectDB()

    // Check connection status
    const state = mongoose.connection.readyState
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    }

    if (state !== 1) {
      return NextResponse.json({
        success: false,
        connectionState: states[state as keyof typeof states],
        error: "MongoDB is not connected",
        mongodbUri: process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//<credentials>@')
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "MongoDB is connected successfully!",
      connectionState: states[state as keyof typeof states],
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      instructions: [
        "Check if MongoDB is running (if using local MongoDB)",
        "Verify MONGODB_URI is correct in .env.local",
        "For MongoDB Atlas, check if your IP is whitelisted",
        "Ensure network access is configured properly"
      ]
    }, { status: 500 })
  }
}
