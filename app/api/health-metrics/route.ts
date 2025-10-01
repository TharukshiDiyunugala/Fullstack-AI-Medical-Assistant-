import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import HealthMetric from "@/models/HealthMetric"

// GET all health metrics for the current user
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "30")

    await connectDB()

    const query: any = { userId: session.user.email }
    if (type) {
      query.type = type
    }

    const metrics = await HealthMetric.find(query)
      .sort({ measuredAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ metrics })
  } catch (error: any) {
    console.error("Error fetching health metrics:", error)
    return NextResponse.json(
      { error: "Failed to fetch health metrics" },
      { status: 500 }
    )
  }
}

// POST create a new health metric
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, value, unit, notes, measuredAt } = await request.json()

    if (!type || !value || !unit) {
      return NextResponse.json(
        { error: "Type, value, and unit are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const metric = await HealthMetric.create({
      userId: session.user.email,
      type,
      value,
      unit,
      notes,
      measuredAt: measuredAt || new Date(),
    })

    return NextResponse.json({ success: true, metric })
  } catch (error: any) {
    console.error("Error creating health metric:", error)
    return NextResponse.json(
      { error: "Failed to create health metric" },
      { status: 500 }
    )
  }
}

// DELETE a health metric
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await connectDB()

    const metric = await HealthMetric.findOneAndDelete({
      _id: id,
      userId: session.user.email,
    })

    if (!metric) {
      return NextResponse.json({ error: "Metric not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting health metric:", error)
    return NextResponse.json(
      { error: "Failed to delete health metric" },
      { status: 500 }
    )
  }
}
