import mongoose, { Document, Schema } from "mongoose"

export interface ITask extends Document {
  title: string
  description?: string
  assignedTo: mongoose.Types.ObjectId
  contact?: mongoose.Types.ObjectId
  company?: mongoose.Types.ObjectId
  deal?: mongoose.Types.ObjectId
  dueDate?: Date
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  owner: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
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
    dueDate: {
      type: Date
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    status: {
      type: String,
      enum: [
        "pending",
        "in_progress",
        "completed"
      ],
      default: "pending"
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
)

taskSchema.index({ owner: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ priority: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ contact: 1 })
taskSchema.index({ company: 1 })
taskSchema.index({ deal: 1 })

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", taskSchema)