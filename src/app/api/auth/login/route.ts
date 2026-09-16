import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"
import { createToken } from "@/lib/auth"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input" },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      )
    }

    const token = await createToken(
      user._id.toString(),
      user.role
    )

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    })

    return response
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    )
  }
}