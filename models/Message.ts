import mongoose, { Document, Model, Schema } from "mongoose";

/**
 * Message Interface
 */
export interface IMessage extends Document {
  conversationId: string; // Link to conversation
  role: "user" | "assistant";
  content: string; // renamed from "text"
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Message Schema
 */
const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    /**
     * 📌 Renamed "text" → "content"
     * Allows long AI/user messages with Markdown formatting.
     */
    content: {
      type: String,
      required: true,
      trim: false, // keep Markdown, formatting, spacing
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Compound index for fast message loading
 */
MessageSchema.index({ conversationId: 1, createdAt: 1 });

/**
 * Prevent model overwrite in Next.js
 */
const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;