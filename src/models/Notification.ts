import mongoose, { Document, Schema } from "mongoose"

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  title: string
  message: string
  type: "task" | "deal" | "lead" | "system"
  read: boolean
  link?: string
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["task", "deal", "lead", "system"],
      default: "system"
    },
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

notificationSchema.index({
  user: 1,
  read: 1
})

notificationSchema.index({
  user: 1,
  createdAt: -1
})

export default mongoose.models.Notification ||
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  )