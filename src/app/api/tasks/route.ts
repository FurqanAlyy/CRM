import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Task from "@/models/Task"
import User from "@/models/User"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Deal from "@/models/Deal"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  contact: z.string().optional(),
  company: z.string().optional(),
  deal: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z
    .enum(["low", "medium", "high"])
    .default("medium"),
  status: z
    .enum([
      "pending",
      "in_progress",
      "completed"
    ])
    .default("pending")
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

async function validateUser(
  userId: string | undefined,
  currentUserId: string
) {
  const targetUserId = userId || currentUserId

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    return false
  }

  const user = await User.findById(targetUserId)

  return !!user
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

async function validateDeal(
  dealId: string | undefined,
  userId: string
) {
  if (!dealId) {
    return true
  }

  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    return false
  }

  const deal = await Deal.findOne({
    _id: dealId,
    owner: userId
  })

  return !!deal
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

    const tasks = await Task.find({
      owner: user.userId
    })
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "contact",
        "firstName lastName email"
      )
      .populate("company", "name")
      .populate("deal", "title amount stage")
      .sort({
        dueDate: 1,
        createdAt: -1
      })

    return NextResponse.json({
      success: true,
      tasks
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasks"
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

    const result = taskSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task data"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const assignedTo = result.data.assignedTo || user.userId

    const assignedUserValid = await validateUser(
      assignedTo,
      user.userId
    )

    if (!assignedUserValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assigned user"
        },
        {
          status: 400
        }
      )
    }

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
        {
          status: 400
        }
      )
    }

    const task = await Task.create({
      ...result.data,
      assignedTo,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      deal: result.data.deal || undefined,
      dueDate: result.data.dueDate
        ? new Date(result.data.dueDate)
        : undefined,
      owner: user.userId
    })

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task
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
        message: "Failed to create task"
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
          message: "Invalid task ID"
        },
        {
          status: 400
        }
      )
    }

    const result = taskSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid task data"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const assignedUserValid = await validateUser(
      result.data.assignedTo,
      user.userId
    )

    if (!assignedUserValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid assigned user"
        },
        {
          status: 400
        }
      )
    }

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
        {
          status: 400
        }
      )
    }

    const updateData = {
      ...result.data,
      assignedTo:
        result.data.assignedTo || undefined,
      contact: result.data.contact || undefined,
      company: result.data.company || undefined,
      deal: result.data.deal || undefined,
      dueDate: result.data.dueDate
        ? new Date(result.data.dueDate)
        : undefined
    }

    const task = await Task.findOneAndUpdate(
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

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update task"
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
          message: "Invalid task ID"
        },
        {
          status: 400
        }
      )
    }

    await connectDB()

    const task = await Task.findOneAndDelete({
      _id: id,
      owner: user.userId
    })

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found"
        },
        {
          status: 404
        }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully"
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete task"
      },
      {
        status: 500
      }
    )
  }
}