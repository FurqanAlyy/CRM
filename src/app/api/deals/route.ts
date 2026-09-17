import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Deal from "@/models/Deal"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Lead from "@/models/Lead"

const dealSchema = z.object({
  title: z.string().min(1),
  contact: z.string().optional(),
  company: z.string().optional(),
  lead: z.string().optional(),
  amount: z.number().min(0),
  stage: z
    .enum([
      "prospecting",
      "qualification",
      "proposal",
      "negotiation",
      "closed_won",
      "closed_lost"
    ])
    .default("prospecting"),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional()
})

async function getUser(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value

  if (!token) {
    return null
  }

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
  if (!contactId) {
    return true
  }

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
  if (!companyId) {
    return true
  }

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return false
  }

  const company = await Company.findOne({
    _id: companyId,
    owner: userId
  })

  return !!company
}

async function validateLead(
  leadId: string | undefined,
  userId: string
) {
  if (!leadId) {
    return true
  }

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
        {
          status: 401
        }
      )
    }

    await connectDB()

    const deals = await Deal.find({
      owner: user.userId
    })
      .populate(
        "contact",
        "firstName lastName email"
      )
      .populate("company", "name")
      .populate("lead", "title status")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      deals
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch deals"
      },
      {
        status: 500
      }
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
        {
          status: 401
        }
      )
    }

    const body = await request.json()

    const result = dealSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deal data"
        },
        {
          status: 400
        }
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
        {
          status: 400
        }
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
        {
          status: 400
        }
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
        {
          status: 400
        }
      )
    }

    const deal = await Deal.create({
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      lead: result.data.lead || undefined,
      expectedCloseDate: result.data.expectedCloseDate
        ? new Date(result.data.expectedCloseDate)
        : undefined,
      owner: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Deal created successfully",
        deal
      },
      {
        status: 201
      }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create deal"
      },
      {
        status: 500
      }
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
        {
          status: 401
        }
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
          message: "Invalid deal ID"
        },
        {
          status: 400
        }
      )
    }

    const result = dealSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid deal data"
        },
        {
          status: 400
        }
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
        {
          status: 400
        }
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
        {
          status: 400
        }
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
        {
          status: 400
        }
      )
    }

    const updateData = {
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      lead: result.data.lead || undefined,
      expectedCloseDate: result.data.expectedCloseDate
        ? new Date(result.data.expectedCloseDate)
        : undefined
    }

    const deal = await Deal.findOneAndUpdate(
      {
        _id: body.id,
        owner: user.userId
      },
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    )

    if (!deal) {
      return NextResponse.json(
        {
          success: false,
          message: "Deal not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Deal updated successfully",
      deal
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update deal"
      },
      {
        status: 500
      }
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
        {
          status: 401
        }
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
          message: "Invalid deal ID"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const deal = await Deal.findOneAndDelete({
      _id: id,
      owner: user.userId
    })

    if (!deal) {
      return NextResponse.json(
        {
          success: false,
          message: "Deal not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Deal deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete deal"
      },
      {
        status: 500
      }
    )
  }
}