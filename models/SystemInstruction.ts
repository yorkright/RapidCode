import mongoose, { Schema, model, models } from "mongoose";

export interface ISystemInstruction {
  title: string;
  content: string; // full system instruction text (could be JSON or plain)
  domain?: string; // e.g., "finance"
  author?: string;
  tags?: string[];
  active?: boolean; // whether this version is active/published
  version: number;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

interface SystemInstructionModel
  extends mongoose.Model<ISystemInstruction> {
  getActiveByDomain(domain: string): Promise<ISystemInstruction | null>;
}

const SystemInstructionSchema = new Schema<ISystemInstruction>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    domain: { type: String, default: "general" },
    author: { type: String },
    tags: { type: [String], default: [] },
    active: { type: Boolean, default: false },
    version: { type: Number, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// ✅ Static method to fetch latest active system instruction by domain
SystemInstructionSchema.statics.getActiveByDomain = async function (
  domain: string
) {
  return this.findOne({ domain, active: true }).sort({ version: -1 }).lean();
};

// ✅ Prevent model overwrite during hot-reload
const SystemInstruction =
  (models.SystemInstruction as SystemInstructionModel) ||
  model<ISystemInstruction, SystemInstructionModel>(
    "SystemInstruction",
    SystemInstructionSchema
  );

export default SystemInstruction;
