import mongoose, { Schema, Document, Model } from "mongoose"

export interface IMedicationLog extends Document {
  medicationId: string
  takenAt: Date
  status: "taken" | "missed" | "skipped"
  notes?: string
}

export interface IMedication extends Document {
  userId: string
  name: string
  dosage: string
  frequency: string // e.g., "Once daily", "Twice daily", "Every 8 hours"
  times: string[] // e.g., ["08:00", "20:00"]
  startDate: Date
  endDate?: Date
  isActive: boolean
  reminderEnabled: boolean
  instructions?: string
  sideEffects?: string[]
  logs: IMedicationLog[]
  createdAt: Date
  updatedAt: Date
}

const MedicationLogSchema = new Schema<IMedicationLog>({
  medicationId: { type: String, required: true },
  takenAt: { type: Date, required: true },
  status: { type: String, enum: ["taken", "missed", "skipped"], required: true },
  notes: String,
})

const MedicationSchema: Schema<IMedication> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    times: [String],
    startDate: { type: Date, required: true },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    reminderEnabled: { type: Boolean, default: true },
    instructions: String,
    sideEffects: [String],
    logs: [MedicationLogSchema],
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
MedicationSchema.index({ userId: 1, isActive: 1 })

const Medication: Model<IMedication> =
  mongoose.models.Medication || mongoose.model<IMedication>("Medication", MedicationSchema)

export default Medication
