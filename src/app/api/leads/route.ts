import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Lead from "@/models/Lead"
import Contact from "@/models/Contact"
import Company from "@/models/Company"

const leadSchema = z.object({
  title: z.string().min(1),
  contact: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "unqualified",
      "converted"
    ])
    .default("new"),
  value: z.number().min(0).optional(),
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

    const leads = await Lead.find({
      owner: user.userId
    })
      .populate("contact", "firstName lastName email")
      .populate("company", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      leads
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch leads"
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

    const result = leadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead data"
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

    const lead = await Lead.create({
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      expectedCloseDate: result.data.expectedCloseDate
        ? new Date(result.data.expectedCloseDate)
        : undefined,
      owner: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        lead
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
        message: "Failed to create lead"
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
          message: "Invalid lead ID"
        },
        {
          status: 400
        }
      )
    }

    const result = leadSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead data"
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

    const updateData = {
      ...result.data,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      expectedCloseDate: result.data.expectedCloseDate
        ? new Date(result.data.expectedCloseDate)
        : undefined
    }

    const lead = await Lead.findOneAndUpdate(
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

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update lead"
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
          message: "Invalid lead ID"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const lead = await Lead.findOneAndDelete({
      _id: id,
      owner: user.userId
    })

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete lead"
      },
      {
        status: 500
      }
    )
  }
}