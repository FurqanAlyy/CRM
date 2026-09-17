import mongoose, { Document, Schema } from "mongoose"

export interface IActivity extends Document {
  type: "call" | "email" | "meeting" | "note" | "follow_up"
  title: string
  description?: string
  contact?: mongoose.Types.ObjectId
  company?: mongoose.Types.ObjectId
  deal?: mongoose.Types.ObjectId
  lead?: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    type: {
      type: String,
      enum: ["call", "email", "meeting", "note", "follow_up"],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact"
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company"
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: "Deal"
    },
    lead: {
      type: Schema.Types.ObjectId,
      ref: "Lead"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
)

activitySchema.index({ createdBy: 1 })
activitySchema.index({ type: 1 })
activitySchema.index({ contact: 1 })
activitySchema.index({ company: 1 })
activitySchema.index({ deal: 1 })
activitySchema.index({ lead: 1 })
activitySchema.index({ createdAt: -1 })

export default mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", activitySchema)