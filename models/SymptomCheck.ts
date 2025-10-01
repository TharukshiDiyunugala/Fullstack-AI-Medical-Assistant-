import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISymptom {
  name: string
  severity: "mild" | "moderate" | "severe"
  duration: string
}

export interface ISymptomCheck extends Document {
  userId: string
  symptoms: ISymptom[]
  age?: number
  gender?: string
  additionalInfo?: string
  analysis: {
    probableConditions: string[]
    urgencyLevel: "low" | "medium" | "high" | "emergency"
    recommendations: string[]
    selfCareAdvice: string[]
    whenToSeeDoctor: string
    aiResponse: string
  }
  createdAt: Date
  updatedAt: Date
}

const SymptomSchema = new Schema<ISymptom>({
  name: { type: String, required: true },
  severity: { type: String, enum: ["mild", "moderate", "severe"], required: true },
  duration: { type: String, required: true },
})

const SymptomCheckSchema: Schema<ISymptomCheck> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    symptoms: [SymptomSchema],
    age: { type: Number },
    gender: { type: String },
    additionalInfo: { type: String },
    analysis: {
      probableConditions: [String],
      urgencyLevel: { type: String, enum: ["low", "medium", "high", "emergency"] },
      recommendations: [String],
      selfCareAdvice: [String],
      whenToSeeDoctor: String,
      aiResponse: String,
    },
  },
  {
    timestamps: true,
  }
)

const SymptomCheck: Model<ISymptomCheck> =
  mongoose.models.SymptomCheck || mongoose.model<ISymptomCheck>("SymptomCheck", SymptomCheckSchema)

export default SymptomCheck
