import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Lead from "@/models/Lead"
import Deal from "@/models/Deal"

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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()

    if (!query) {
      return NextResponse.json({
        success: true,
        results: []
      })
    }

    await connectDB()

    const regex = new RegExp(query, "i")

    const [contacts, companies, leads, deals] =
      await Promise.all([
        Contact.find({
          owner: user.userId,
          $or: [
            { firstName: regex },
            { lastName: regex },
            { email: regex },
            { phone: regex }
          ]
        })
          .select("_id firstName lastName email")
          .limit(5),

        Company.find({
          owner: user.userId,
          $or: [
            { name: regex },
            { email: regex },
            { industry: regex }
          ]
        })
          .select("_id name email industry")
          .limit(5),

        Lead.find({
          owner: user.userId,
          $or: [
            { title: regex },
            { source: regex },
            { status: regex }
          ]
        })
          .select("_id title status value")
          .limit(5),

        Deal.find({
          owner: user.userId,
          $or: [
            { title: regex },
            { stage: regex }
          ]
        })
          .select("_id title stage amount")
          .limit(5)
      ])

    const results = [
      ...contacts.map((contact) => ({
        id: contact._id,
        type: "contact",
        title: `${contact.firstName} ${contact.lastName}`,
        subtitle: contact.email || "Contact",
        url: `/contacts`
      })),

      ...companies.map((company) => ({
        id: company._id,
        type: "company",
        title: company.name,
        subtitle:
          company.industry ||
          company.email ||
          "Company",
        url: `/companies`
      })),

      ...leads.map((lead) => ({
        id: lead._id,
        type: "lead",
        title: lead.title,
        subtitle: `${lead.status} · $${lead.value || 0}`,
        url: `/leads`
      })),

      ...deals.map((deal) => ({
        id: deal._id,
        type: "deal",
        title: deal.title,
        subtitle: `${deal.stage} · $${deal.amount}`,
        url: `/deals`
      }))
    ]

    return NextResponse.json({
      success: true,
      results
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search CRM"
      },
      { status: 500 }
    )
  }
}