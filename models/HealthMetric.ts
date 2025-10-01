import mongoose, { Schema, Document, Model } from "mongoose"

export interface IHealthMetric extends Document {
  userId: string
  type: "blood_pressure" | "blood_sugar" | "weight" | "heart_rate" | "temperature"
  value: {
    systolic?: number // For blood pressure
    diastolic?: number // For blood pressure
    glucose?: number // For blood sugar
    weight?: number // For weight
    heartRate?: number // For heart rate
    temperature?: number // For temperature
  }
  unit: string
  notes?: string
  measuredAt: Date
  createdAt: Date
  updatedAt: Date
}

const HealthMetricSchema: Schema<IHealthMetric> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["blood_pressure", "blood_sugar", "weight", "heart_rate", "temperature"],
      required: true,
    },
    value: {
      systolic: Number,
      diastolic: Number,
      glucose: Number,
      weight: Number,
      heartRate: Number,
      temperature: Number,
    },
    unit: { type: String, required: true },
    notes: String,
    measuredAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
HealthMetricSchema.index({ userId: 1, type: 1, measuredAt: -1 })

const HealthMetric: Model<IHealthMetric> =
  mongoose.models.HealthMetric || mongoose.model<IHealthMetric>("HealthMetric", HealthMetricSchema)

export default HealthMetric
