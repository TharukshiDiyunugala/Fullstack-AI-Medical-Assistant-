import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Medication from "@/models/Medication"

// GET all medications for the current user
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    await connectDB()

    const query: any = { userId: session.user.email }
    if (activeOnly) {
      query.isActive = true
    }

    const medications = await Medication.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ medications })
  } catch (error: any) {
    console.error("Error fetching medications:", error)
    return NextResponse.json(
      { error: "Failed to fetch medications" },
      { status: 500 }
    )
  }
}

// POST create a new medication
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, dosage, frequency, times, startDate, endDate, instructions, sideEffects, reminderEnabled } = body

    if (!name || !dosage || !frequency || !times || !startDate) {
      return NextResponse.json(
        { error: "Name, dosage, frequency, times, and start date are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const medication = await Medication.create({
      userId: session.user.email,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
      instructions,
      sideEffects,
      reminderEnabled: reminderEnabled !== false,
      isActive: true,
      logs: [],
    })

    return NextResponse.json({ success: true, medication })
  } catch (error: any) {
    console.error("Error creating medication:", error)
    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    )
  }
}

// PATCH update a medication
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await connectDB()

    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      updates,
      { new: true }
    )

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, medication })
  } catch (error: any) {
    console.error("Error updating medication:", error)
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    )
  }
}

// DELETE a medication
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

    const medication = await Medication.findOneAndDelete({
      _id: id,
      userId: session.user.email,
    })

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting medication:", error)
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    )
  }
}
