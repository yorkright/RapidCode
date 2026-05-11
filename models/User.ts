import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date;
  preferences?: {
    emailNotifications?: boolean;
    darkMode?: boolean;
  };
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,  // ✅ Keep this
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,  // ✅ Keep this
    },
    firstName: String,
    lastName: String,
    profileImageUrl: String,
    username: String,
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ❌ REMOVE this - index: true already in schema is enough
// UserSchema.index({ clerkId: 1 });
// UserSchema.index({ email: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;