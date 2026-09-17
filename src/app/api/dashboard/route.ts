import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Lead from "@/models/Lead"
import Deal from "@/models/Deal"
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

    if (!user || !mongoose.Types.ObjectId.isValid(user.userId)) {
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
      contacts,
      companies,
      leads,
      deals,
      tasks,
      activities
    ] = await Promise.all([
      Contact.countDocuments({ owner }),
      Company.countDocuments({ owner }),
      Lead.countDocuments({ owner }),
      Deal.countDocuments({ owner }),
      Task.countDocuments({ owner }),
      Activity.countDocuments({ createdBy: owner })
    ])

    const [
      activeContacts,
      newLeads,
      openDeals,
      pendingTasks,
      completedTasks
    ] = await Promise.all([
      Contact.countDocuments({
        owner,
        status: "active"
      }),

      Lead.countDocuments({
        owner,
        status: "new"
      }),

      Deal.countDocuments({
        owner,
        stage: {
          $nin: ["closed_won", "closed_lost"]
        }
      }),

      Task.countDocuments({
        owner,
        status: {
          $in: ["pending", "in_progress"]
        }
      }),

      Task.countDocuments({
        owner,
        status: "completed"
      })
    ])

    const dealStats = await Deal.aggregate([
      {
        $match: {
          owner,
          stage: {
            $nin: ["closed_lost"]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: "$amount"
          },
          weightedValue: {
            $sum: {
              $multiply: [
                "$amount",
                {
                  $divide: [
                    {
                      $ifNull: ["$probability", 0]
                    },
                    100
                  ]
                }
              ]
            }
          }
        }
      }
    ])

    const wonDeals = await Deal.aggregate([
      {
        $match: {
          owner,
          stage: "closed_won"
        }
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: "$amount"
          },
          count: {
            $sum: 1
          }
        }
      }
    ])

    const leadStats = await Lead.aggregate([
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
    ])

    const dealPipeline = await Deal.aggregate([
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
    ])

    const recentActivities = await Activity.find({
      createdBy: owner
    })
      .populate("contact", "firstName lastName")
      .populate("company", "name")
      .populate("deal", "title")
      .populate("lead", "title")
      .sort({ createdAt: -1 })
      .limit(8)

    const upcomingTasks = await Task.find({
      owner,
      status: {
        $in: ["pending", "in_progress"]
      }
    })
      .populate("contact", "firstName lastName")
      .populate("company", "name")
      .populate("deal", "title")
      .sort({
        dueDate: 1,
        createdAt: -1
      })
      .limit(8)

    return NextResponse.json({
      success: true,
      stats: {
        contacts,
        companies,
        leads,
        deals,
        tasks,
        activities,
        activeContacts,
        newLeads,
        openDeals,
        pendingTasks,
        completedTasks,
        dealValue: dealStats[0]?.totalValue || 0,
        weightedDealValue:
          dealStats[0]?.weightedValue || 0,
        wonDealValue: wonDeals[0]?.value || 0,
        wonDealsCount: wonDeals[0]?.count || 0
      },
      leadStats,
      dealPipeline,
      recentActivities,
      upcomingTasks
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data"
      },
      { status: 500 }
    )
  }
}