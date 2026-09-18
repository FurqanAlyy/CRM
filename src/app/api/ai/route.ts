import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import { generateAIResponse } from "@/lib/gemini"
import Contact from "@/models/Contact"
import Company from "@/models/Company"
import Deal from "@/models/Deal"
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

const prompts = {
  summary: (data: string) => `
You are an AI assistant inside a CRM system.

Create a concise customer summary based only on the CRM data below.

Focus on:
- Who the customer is
- Their company
- Current relationship
- Relevant deals
- Recent interactions
- Important follow-up points

Do not invent information.

CRM DATA:
${data}
`,

  follow_up: (data: string) => `
You are an AI sales assistant inside a CRM.

Suggest practical follow-up actions based only on the CRM data below.

Provide:
1. Recommended next action
2. Suggested timing
3. Reason
4. A short message the sales representative could send

Do not invent facts.

CRM DATA:
${data}
`,

  email: (data: string) => `
You are an AI assistant helping a sales representative write a professional follow-up email.

Write a concise, natural business email based only on the CRM information below.

Include:
- Subject
- Greeting
- Main message
- Clear next step
- Professional closing

Do not invent facts, names, promises, prices, or commitments.

CRM DATA:
${data}
`,

  deal_insight: (data: string) => `
You are an AI sales assistant analyzing a CRM deal.

Analyze the deal using only the CRM data below.

Provide:
- Current deal situation
- Positive signals
- Potential risks
- Recommended next actions
- Questions the sales representative should consider

Do not invent information.

CRM DATA:
${data}
`
}

export async function POST(request: NextRequest) {
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

    const type = body.type
    const id = body.id

    if (
      !["summary", "follow_up", "email", "deal_insight"].includes(
        type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid AI action"
        },
        { status: 400 }
      )
    }

    if (
      !id ||
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid record ID"
        },
        { status: 400 }
      )
    }

    await connectDB()

    let crmData = ""

    if (type === "deal_insight") {
      const deal = await Deal.findOne({
        _id: id,
        owner: user.userId
      })
        .populate("contact", "firstName lastName email phone jobTitle")
        .populate("company", "name industry website")
        .populate("lead", "title status source value")

      if (!deal) {
        return NextResponse.json(
          {
            success: false,
            message: "Deal not found"
          },
          { status: 404 }
        )
      }

      const activities = await Activity.find({
        createdBy: user.userId,
        deal: deal._id
      })
        .select("type title description createdAt")
        .sort({ createdAt: -1 })
        .limit(10)

      crmData = JSON.stringify(
        {
          deal: {
            title: deal.title,
            amount: deal.amount,
            stage: deal.stage,
            probability: deal.probability,
            expectedCloseDate:
              deal.expectedCloseDate,
            notes: deal.notes
          },
          contact: deal.contact,
          company: deal.company,
          lead: deal.lead,
          recentActivities: activities
        },
        null,
        2
      )
    } else {
      const contact = await Contact.findOne({
        _id: id,
        owner: user.userId
      }).populate(
        "company",
        "name industry website size"
      )

      if (!contact) {
        return NextResponse.json(
          {
            success: false,
            message: "Contact not found"
          },
          { status: 404 }
        )
      }

      const [deals, activities] = await Promise.all([
        Deal.find({
          owner: user.userId,
          contact: contact._id
        })
          .select(
            "title amount stage probability expectedCloseDate notes"
          )
          .sort({ createdAt: -1 })
          .limit(10),

        Activity.find({
          createdBy: user.userId,
          contact: contact._id
        })
          .select(
            "type title description createdAt"
          )
          .sort({ createdAt: -1 })
          .limit(10)
      ])

      crmData = JSON.stringify(
        {
          contact: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            jobTitle: contact.jobTitle,
            status: contact.status,
            notes: contact.notes
          },
          company: contact.company,
          deals,
          recentActivities: activities
        },
        null,
        2
      )
    }

    const prompt = prompts[
      type as keyof typeof prompts
    ](crmData)

    const response = await generateAIResponse(prompt)

    return NextResponse.json({
      success: true,
      type,
      response
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate AI response"
      },
      { status: 500 }
    )
  }
}