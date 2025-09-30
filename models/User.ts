import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  name?: string
  email: string
  password?: string
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    emailVerified: { type: Date },
    image: { type: String },
  },
  {
    timestamps: true,
  }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
