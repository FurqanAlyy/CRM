import mongoose, { Document, Schema } from "mongoose"

export interface IContact extends Document {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  company?: mongoose.Types.ObjectId
  owner: mongoose.Types.ObjectId
  status: "active" | "inactive"
  avatar?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const contactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    jobTitle: {
      type: String,
      trim: true
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company"
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    avatar: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

contactSchema.index({ owner: 1 })
contactSchema.index({ email: 1 })
contactSchema.index({ firstName: 1, lastName: 1 })

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", contactSchema)