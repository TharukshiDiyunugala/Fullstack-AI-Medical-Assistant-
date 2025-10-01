import mongoose, { Schema, Document, Model } from "mongoose"

export interface IMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface IChat extends Document {
  userId: string
  title: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const ChatSchema: Schema<IChat> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
)

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)

export default Chat
