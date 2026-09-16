import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    await connectDB()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    )
  }
}