import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Deal from "@/models/Deal"
import Lead from "@/models/Lead"
import Task from "@/models/Task"
import Activity from "@/models/Activity"

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

    const owner = new mongoose.Types.ObjectId(user.userId)

    const [
      dealStats,
      leadStats,
      taskStats,
      activityStats
    ] = await Promise.all([
      Deal.aggregate([
        {
          $match: {
            owner
          }
        },
        {
          $group: {
            _id: "$stage",
            count: {
              $sum: 1
            },
            value: {
              $sum: "$amount"
            }
          }
        }
      ]),

      Lead.aggregate([
        {
          $match: {
            owner
          }
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            },
            value: {
              $sum: {
                $ifNull: ["$value", 0]
              }
            }
          }
        }
      ]),

      Task.aggregate([
        {
          $match: {
            owner
          }
        },
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1
            }
          }
        }
      ]),

      Activity.aggregate([
        {
          $match: {
            createdBy: owner
          }
        },
        {
          $group: {
            _id: "$type",
            count: {
              $sum: 1
            }
          }
        }
      ])
    ])

    const monthlyDeals = await Deal.aggregate([
      {
        $match: {
          owner
        }
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt"
            },
            month: {
              $month: "$createdAt"
            }
          },
          deals: {
            $sum: 1
          },
          value: {
            $sum: "$amount"
          }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ])

    return NextResponse.json({
      success: true,
      dealStats,
      leadStats,
      taskStats,
      activityStats,
      monthlyDeals
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports"
      },
      { status: 500 }
    )
  }
}