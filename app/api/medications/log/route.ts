import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import connectDB from "@/lib/mongoose"
import Medication from "@/models/Medication"

// POST log medication intake
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { medicationId, status, notes, takenAt } = await request.json()

    if (!medicationId || !status) {
      return NextResponse.json(
        { error: "Medication ID and status are required" },
        { status: 400 }
      )
    }

    await connectDB()

    const medication = await Medication.findOne({
      _id: medicationId,
      userId: session.user.email,
    })

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    // Add log entry
    medication.logs.push({
      medicationId,
      takenAt: takenAt || new Date(),
      status,
      notes,
    } as any)

    await medication.save()

    return NextResponse.json({ success: true, medication })
  } catch (error: any) {
    console.error("Error logging medication:", error)
    return NextResponse.json(
      { error: "Failed to log medication" },
      { status: 500 }
    )
  }
}
