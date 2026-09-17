import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Company from "@/models/Company"

const companySchema = z.object({
  name: z.string().min(1),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
  logo: z.string().optional()
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

    const companies = await Company.find({
      owner: user.userId
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      companies
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch companies"
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

    const result = companySchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company data"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const company = await Company.create({
      ...result.data,
      owner: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Company created successfully",
        company
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
        message: "Failed to create company"
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
          message: "Invalid company ID"
        },
        {
          status: 400
        }
      )
    }

    const result = companySchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company data"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const company = await Company.findOneAndUpdate(
      {
        _id: body.id,
        owner: user.userId
      },
      {
        $set: result.data
      },
      {
        new: true,
        runValidators: true
      }
    )

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      company
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update company"
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company ID"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const company = await Company.findOneAndDelete({
      _id: id,
      owner: user.userId
    })

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete company"
      },
      {
        status: 500
      }
    )
  }
}