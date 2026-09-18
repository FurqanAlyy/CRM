import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Notification from "@/models/Notification"
import Task from "@/models/Task"

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

async function createTaskNotifications(
  userId: string
) {
  const now = new Date()

  const upcomingDate = new Date(now)
  upcomingDate.setDate(
    upcomingDate.getDate() + 1
  )

  const tasks = await Task.find({
    owner: userId,
    status: {
      $in: ["pending", "in_progress"]
    },
    dueDate: {
      $ne: null,
      $lte: upcomingDate
    }
  })
    .select("_id title dueDate status")
    .limit(20)

  for (const task of tasks) {
    if (!task.dueDate) continue

    const dueDate = new Date(task.dueDate)

    const isOverdue = dueDate < now

    const type = isOverdue
      ? "overdue"
      : "upcoming"

    const title = isOverdue
      ? "Overdue Task"
      : "Upcoming Task"

    const message = isOverdue
      ? `"${task.title}" is overdue.`
      : `"${task.title}" is due soon.`

    const link = "/tasks"

    const existing =
      await Notification.findOne({
        user: userId,
        type: "task",
        link,
        message
      })

    if (!existing) {
      await Notification.create({
        user: userId,
        title,
        message,
        type: "task",
        read: false,
        link
      })
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (
      !user ||
      !mongoose.Types.ObjectId.isValid(user.userId)
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

    await createTaskNotifications(user.userId)

    const notifications =
      await Notification.find({
        user: user.userId
      })
        .sort({ createdAt: -1 })
        .limit(20)

    const unreadCount =
      await Notification.countDocuments({
        user: user.userId,
        read: false
      })

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notifications"
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (
      !user ||
      !mongoose.Types.ObjectId.isValid(user.userId)
    ) {
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
      body.id &&
      !mongoose.Types.ObjectId.isValid(body.id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid notification ID"
        },
        { status: 400 }
      )
    }

    await connectDB()

    if (body.markAllRead) {
      await Notification.updateMany(
        {
          user: user.userId,
          read: false
        },
        {
          $set: {
            read: true
          }
        }
      )

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read"
      })
    }

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification ID is required"
        },
        { status: 400 }
      )
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: body.id,
          user: user.userId
        },
        {
          $set: {
            read: true
          }
        },
        {
          new: true
        }
      )

    if (!notification) {
      return NextResponse.json(
        {
          success: false,
          message: "Notification not found"
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
      notification
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update notification"
      },
      { status: 500 }
    )
  }
}