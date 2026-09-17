import mongoose, { Document, Schema } from "mongoose"

export interface ICompany extends Document {
  name: string
  website?: string
  industry?: string
  size?: string
  phone?: string
  email?: string
  address?: string
  owner: mongoose.Types.ObjectId
  notes?: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    notes: {
      type: String
    },
    logo: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

companySchema.index({ owner: 1 })
companySchema.index({ name: 1 })

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", companySchema)