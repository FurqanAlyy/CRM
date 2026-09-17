import mongoose, { Document, Schema } from "mongoose"

export interface IDeal extends Document {
  title: string
  contact?: mongoose.Types.ObjectId
  company?: mongoose.Types.ObjectId
  lead?: mongoose.Types.ObjectId
  amount: number
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost"
  probability?: number
  expectedCloseDate?: Date
  owner: mongoose.Types.ObjectId
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const dealSchema = new Schema<IDeal>(
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
    lead: {
      type: Schema.Types.ObjectId,
      ref: "Lead"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    stage: {
      type: String,
      enum: [
        "prospecting",
        "qualification",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost"
      ],
      default: "prospecting"
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

dealSchema.index({ owner: 1 })
dealSchema.index({ stage: 1 })
dealSchema.index({ contact: 1 })
dealSchema.index({ company: 1 })
dealSchema.index({ lead: 1 })

export default mongoose.models.Deal ||
  mongoose.model<IDeal>("Deal", dealSchema)