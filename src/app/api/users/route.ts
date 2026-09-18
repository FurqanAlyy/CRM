import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

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

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser(request)

    if (
      !currentUser ||
      !mongoose.Types.ObjectId.isValid(currentUser.userId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized"
        },
        { status: 401 }
      )
    }

    await connectDB()

    if (currentUser.role === "admin") {
      const users = await User.find({})
        .select("_id name email role avatar")
        .sort({ name: 1 })

      return NextResponse.json({
        success: true,
        users
      })
    }

    const user = await User.findById(currentUser.userId)
      .select("_id name email role avatar")

    return NextResponse.json({
      success: true,
      users: user ? [user] : []
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users"
      },
      { status: 500 }
    )
  }
}