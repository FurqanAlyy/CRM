import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Contact from "@/models/Contact"

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  avatar: z.string().optional(),
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

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const contacts = await Contact.find({
      owner: user.userId
    })
      .populate("company", "name")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      contacts
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contacts"
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const result = contactSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid contact data"
        },
        { status: 400 }
      )
    }

    await connectDB()

    const contact = await Contact.create({
      ...result.data,
      company: result.data.company || undefined,
      owner: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Contact created successfully",
        contact
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create contact"
      },
      { status: 500 }
    )
  }
}