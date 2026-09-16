import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Contact from "@/models/Contact"
import mongoose from "mongoose"

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

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const idSchema = z.object({
      id: z.string()
    })

    const parsedId = idSchema.safeParse(body)

    if (!parsedId.success || !mongoose.Types.ObjectId.isValid(parsedId.data.id)) {
      return NextResponse.json(
        { success: false, message: "Invalid contact ID" },
        { status: 400 }
      )
    }

    const result = contactSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid contact data" },
        { status: 400 }
      )
    }

    await connectDB()

    const contact = await Contact.findOneAndUpdate(
      {
        _id: parsedId.data.id,
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

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
      contact
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update contact"
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid contact ID" },
        { status: 400 }
      )
    }

    await connectDB()

    const contact = await Contact.findOneAndDelete({
      _id: id,
      owner: user.userId
    })

    if (!contact) {
      return NextResponse.json(
        { success: false, message: "Contact not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete contact"
      },
      { status: 500 }
    )
  }
}