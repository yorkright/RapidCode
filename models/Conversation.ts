import mongoose, { Document, Model, Schema } from "mongoose";
import { IMessage } from "./Message";

/**
 * Conversation Interface
 */
export interface IConversation extends Document {
  title: string;
  messages: IMessage[];
  userId: string; // ✅ NEW (conversation belongs to a specific logged-in user)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversation Schema
 */
const ConversationSchema = new Schema<IConversation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // 🔥 NEW: store Clerk userId
    userId: {
      type: String,
      required: true,
      index: true, // speeds up lookup by user
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false, // No "__v"
  }
);

// Index for faster sorting & querying
if (!ConversationSchema.indexes().length) {
  ConversationSchema.index({ updatedAt: -1 });
  ConversationSchema.index({ userId: 1 });
}

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
