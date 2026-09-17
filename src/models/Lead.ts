import mongoose, { Document, Schema } from "mongoose"

export interface ILead extends Document {
  title: string
  contact?: mongoose.Types.ObjectId
  company?: mongoose.Types.ObjectId
  source?: string
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted"
  value?: number
  probability?: number
  expectedCloseDate?: Date
  owner: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const leadSchema = new Schema<ILead>(
  {
    title: {
      type: String,
      required: true,
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
    source: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "unqualified",
        "converted"
      ],
      default: "new"
    },
    value: {
      type: Number,
      min: 0
    },
    probability: {
      type: Number,
      min: 0,
      max: 100
    },
    expectedCloseDate: {
      type: Date
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

leadSchema.index({ owner: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ contact: 1 })
leadSchema.index({ company: 1 })

export default mongoose.models.Lead ||
  mongoose.model<ILead>("Lead", leadSchema)