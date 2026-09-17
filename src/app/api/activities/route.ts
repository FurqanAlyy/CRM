import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Activity from "@/models/Activity"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Deal from "@/models/Deal"
import Lead from "@/models/Lead"

const activitySchema = z.object({
  type: z.enum([
    "call",
    "email",
    "meeting",
    "note",
    "follow_up"
  ]),
  title: z.string().min(1),
  description: z.string().optional(),
  contact: z.string().optional(),
  company: z.string().optional(),
  deal: z.string().optional(),
  lead: z.string().optional()
})

async function getUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) return null

  try {
    const payload = await verifyToken(token)

    return {
      userId: payload.userId as string,
      role: payload.role as string
    }
  } catch {
    return null
  }
}

async function validateContact(
  contactId: string | undefined,
  userId: string
) {
  if (!contactId) return true

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return false
  }

  const contact = await Contact.findOne({
    _id: contactId,
    owner: userId
  })

  return !!contact
}

async function validateCompany(
  companyId: string | undefined,
  userId: string
) {
  if (!companyId) return true

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return false
  }

  const company = await Company.findOne({
    _id: companyId,
    owner: userId
  })

  return !!company
}

async function validateDeal(
  dealId: string | undefined,
  userId: string
) {
  if (!dealId) return true

  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    return false
  }

  const deal = await Deal.findOne({
    _id: dealId,
    owner: userId
  })

  return !!deal
}

async function validateLead(
  leadId: string | undefined,
  userId: string
) {
  if (!leadId) return true

  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    return false
  }

  const lead = await Lead.findOne({
    _id: leadId,
    owner: userId
  })

  return !!lead
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      )
    }

    await connectDB()

    const activities = await Activity.find({
      createdBy: user.userId
    })
      .populate("createdBy", "name email role")
      .populate("contact", "firstName lastName email")
      .populate("company", "name")
      .populate("deal", "title amount stage")
      .populate("lead", "title status value")
      .sort({
        createdAt: -1
      })

    return NextResponse.json({
      success: true,
      activities
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch activities"
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    const result = activitySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid activity data"
        },
        { status: 400 }
      )
    }

    await connectDB()

    const contactValid = await validateContact(
      result.data.contact,
      user.userId
    )

    if (!contactValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact"
        },
        { status: 400 }
      )
    }

    const companyValid = await validateCompany(
      result.data.company,
      user.userId
    )

    if (!companyValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company"
        },
        { status: 400 }
      )
    }

    const dealValid = await validateDeal(
      result.data.deal,
      user.userId
    )

    if (!dealValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deal"
        },
        { status: 400 }
      )
    }

    const leadValid = await validateLead(
      result.data.lead,
      user.userId
    )

    if (!leadValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead"
        },
        { status: 400 }
      )
    }

    const activity = await Activity.create({
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      deal: result.data.deal || undefined,
      lead: result.data.lead || undefined,
      createdBy: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Activity created successfully",
        activity
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create activity"
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (
      !body.id ||
      !mongoose.Types.ObjectId.isValid(body.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid activity ID"
        },
        { status: 400 }
      )
    }

    const result = activitySchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid activity data"
        },
        { status: 400 }
      )
    }

    await connectDB()

    const contactValid = await validateContact(
      result.data.contact,
      user.userId
    )

    if (!contactValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact"
        },
        { status: 400 }
      )
    }

    const companyValid = await validateCompany(
      result.data.company,
      user.userId
    )

    if (!companyValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company"
        },
        { status: 400 }
      )
    }

    const dealValid = await validateDeal(
      result.data.deal,
      user.userId
    )

    if (!dealValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deal"
        },
        { status: 400 }
      )
    }

    const leadValid = await validateLead(
      result.data.lead,
      user.userId
    )

    if (!leadValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead"
        },
        { status: 400 }
      )
    }

    const updateData = {
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      deal: result.data.deal || undefined,
      lead: result.data.lead || undefined
    }

    const activity = await Activity.findOneAndUpdate(
      {
        _id: body.id,
        createdBy: user.userId
      },
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    )

    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          message: "Activity not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Activity updated successfully",
      activity
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update activity"
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid activity ID"
        },
        { status: 400 }
      )
    }

    await connectDB()

    const activity = await Activity.findOneAndDelete({
      _id: id,
      createdBy: user.userId
    })

    if (!activity) {
      return NextResponse.json(
        {
          success: false,
          message: "Activity not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete activity"
      },
      { status: 500 }
    )
  }
}