
"use client"

import { useEffect, useState } from "react"
import {
  Brain,
  BriefcaseBusiness,
  Check,
  Copy,
  Mail,
  RefreshCw,
  Sparkles,
  Users
} from "lucide-react"

interface Contact {
  _id: string
  firstName: string
  lastName: string
  email?: string
  jobTitle?: string
}

interface Deal {
  _id: string
  title: string
  amount: number
  stage: string
  probability?: number
}

type AIType =
  | "summary"
  | "follow_up"
  | "email"
  | "deal_insight"

export default function AIAssistantPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])

  const [selectedContact, setSelectedContact] =
    useState("")

  const [selectedDeal, setSelectedDeal] =
    useState("")

  const [activeType, setActiveType] =
    useState<AIType>("summary")

  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRecords()
  }, [])

  async function fetchRecords() {
    try {
      const [contactsResponse, dealsResponse] =
        await Promise.all([
          fetch("/api/contacts"),
          fetch("/api/deals")
        ])

      const contactsData =
        await contactsResponse.json()

      const dealsData = await dealsResponse.json()

      if (contactsResponse.ok) {
        setContacts(contactsData.contacts || [])
      }

      if (dealsResponse.ok) {
        setDeals(dealsData.deals || [])
      }
    } catch {
      setError("Failed to load CRM records")
    }
  }

  async function generateAI() {
    setError("")
    setResponse("")
    setCopied(false)

    const needsDeal = activeType === "deal_insight"

    const id = needsDeal
      ? selectedDeal
      : selectedContact

    if (!id) {
      setError(
        needsDeal
          ? "Please select a deal first"
          : "Please select a contact first"
      )
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: activeType,
          id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Failed to generate AI response"
        )
        return
      }

      setResponse(data.response || "")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function copyResponse() {
    if (!response) return

    await navigator.clipboard.writeText(response)

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const actions = [
    {
      type: "summary" as AIType,
      title: "Customer Summary",
      description:
        "Get a concise overview of a customer and their CRM history.",
      icon: Users
    },
    {
      type: "follow_up" as AIType,
      title: "Follow-up Suggestion",
      description:
        "Generate a practical next action and follow-up message.",
      icon: RefreshCw
    },
    {
      type: "email" as AIType,
      title: "Email Generator",
      description:
        "Create a professional follow-up email using CRM data.",
      icon: Mail
    },
    {
      type: "deal_insight" as AIType,
      title: "Deal Insights",
      description:
        "Analyze a deal's situation, risks, and next actions.",
      icon: BriefcaseBusiness
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#adc6ff]/10">
              <Sparkles className="h-5 w-5 text-[#adc6ff]" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed]">
              AI Assistant
            </h1>

            <span className="rounded-full border border-[#4edea3]/20 bg-[#4edea3]/10 px-2.5 py-1 text-xs font-medium text-[#4edea3]">
              AI Powered
            </span>
          </div>

          <p className="mt-2 text-sm text-[#8c909f]">
            Use your CRM data to get AI-powered sales assistance
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8c909f]">
          <div className="h-2 w-2 rounded-full bg-[#4edea3]" />
          Gemini AI
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
            <div className="border-b border-[#282a32] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                  <Brain className="h-4 w-4 text-[#adc6ff]" />
                </div>

                <div>
                  <h2 className="font-medium text-[#e2e1ed]">
                    AI Actions
                  </h2>

                  <p className="mt-1 text-xs text-[#8c909f]">
                    Choose what you want AI to do
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4">
              {actions.map((action) => {
                const Icon = action.icon
                const active =
                  activeType === action.type

                return (
                  <button
                    key={action.type}
                    onClick={() => {
                      setActiveType(action.type)
                      setResponse("")
                      setError("")
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-[#adc6ff]/30 bg-[#adc6ff]/10"
                        : "border-[#282a32] bg-[#11131b] hover:border-[#424754] hover:bg-[#1d1f28]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-[#adc6ff]/15"
                            : "bg-[#282a32]"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            active
                              ? "text-[#adc6ff]"
                              : "text-[#8c909f]"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#e2e1ed]">
                            {action.title}
                          </p>

                          {active && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#adc6ff]" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#8c909f]">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
            <div className="border-b border-[#282a32] px-5 py-4">
              <h2 className="font-medium text-[#e2e1ed]">
                Select Record
              </h2>

              <p className="mt-1 text-xs text-[#8c909f]">
                Choose the CRM record the AI should analyze.
              </p>
            </div>

            <div className="p-5">
              {activeType === "deal_insight" ? (
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#c2c6d6]">
                    Deal
                  </label>

                  <select
                    value={selectedDeal}
                    onChange={(event) =>
                      setSelectedDeal(event.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-[#424754] bg-[#11131b] px-3 text-sm text-[#e2e1ed] outline-none transition focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]/20"
                  >
                    <option value="">
                      Select a deal
                    </option>

                    {deals.map((deal) => (
                      <option
                        key={deal._id}
                        value={deal._id}
                      >
                        {deal.title} — $
                        {deal.amount.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#c2c6d6]">
                    Contact
                  </label>

                  <select
                    value={selectedContact}
                    onChange={(event) =>
                      setSelectedContact(
                        event.target.value
                      )
                    }
                    className="h-11 w-full rounded-lg border border-[#424754] bg-[#11131b] px-3 text-sm text-[#e2e1ed] outline-none transition focus:border-[#adc6ff] focus:ring-1 focus:ring-[#adc6ff]/20"
                  >
                    <option value="">
                      Select a contact
                    </option>

                    {contacts.map((contact) => (
                      <option
                        key={contact._id}
                        value={contact._id}
                      >
                        {contact.firstName}{" "}
                        {contact.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-lg border border-[#ffb4ab]/20 bg-[#ffb4ab]/10 px-3 py-2">
                  <p className="text-xs text-[#ffb4ab]">
                    {error}
                  </p>
                </div>
              )}

              <button
                onClick={generateAI}
                disabled={loading}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4d8eff] px-4 text-sm font-medium text-white transition hover:bg-[#5c98ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles
                  className={`h-4 w-4 ${
                    loading ? "animate-pulse" : ""
                  }`}
                />

                {loading
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
            <div className="flex flex-col gap-3 border-b border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                  <Sparkles className="h-4 w-4 text-[#adc6ff]" />
                </div>

                <div>
                  <h2 className="font-medium text-[#e2e1ed]">
                    AI Response
                  </h2>

                  <p className="mt-1 text-xs text-[#8c909f]">
                    Generated from your CRM data
                  </p>
                </div>
              </div>

              {response && (
                <button
                  onClick={copyResponse}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#424754] bg-[#282a32] px-3 py-2 text-xs text-[#c2c6d6] transition hover:bg-[#33343d] hover:text-[#e2e1ed] sm:w-auto"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#4edea3]" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-5 sm:p-6">
              {!response && !loading ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#424754] bg-[#282a32]">
                    <Sparkles className="h-7 w-7 text-[#adc6ff]" />
                  </div>

                  <h3 className="mt-5 text-sm font-medium text-[#e2e1ed]">
                    AI assistance is ready
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-[#8c909f]">
                    Select an action and a CRM record, then generate an AI-powered response.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full border border-[#282a32] bg-[#11131b] px-3 py-1.5 text-[11px] text-[#8c909f]">
                      Customer summaries
                    </span>

                    <span className="rounded-full border border-[#282a32] bg-[#11131b] px-3 py-1.5 text-[11px] text-[#8c909f]">
                      Follow-ups
                    </span>

                    <span className="rounded-full border border-[#282a32] bg-[#11131b] px-3 py-1.5 text-[11px] text-[#8c909f]">
                      Deal insights
                    </span>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#424754] bg-[#282a32]">
                    <Sparkles className="h-5 w-5 animate-pulse text-[#adc6ff]" />
                  </div>

                  <p className="mt-4 text-sm text-[#c2c6d6]">
                    Analyzing CRM data...
                  </p>

                  <p className="mt-1 text-xs text-[#8c909f]">
                    Generating your AI response
                  </p>
                </div>
              ) : (
                <div className="min-h-[500px] rounded-xl border border-[#282a32] bg-[#11131b] p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-2 border-b border-[#282a32] pb-4">
                    <div className="h-2 w-2 rounded-full bg-[#4edea3]" />

                    <span className="text-xs font-medium text-[#8c909f]">
                      Generated response
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap text-sm leading-7 text-[#c2c6d6]">
                    {response}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}