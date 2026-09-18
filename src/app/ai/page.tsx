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
  User,
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
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
            <Sparkles className="h-5 w-5 text-zinc-300" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-white">
              AI Assistant
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Use your CRM data to get AI-powered sales assistance
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-zinc-500" />

              <h2 className="font-medium text-white">
                AI Actions
              </h2>
            </div>

            <div className="space-y-2">
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
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-zinc-600 bg-zinc-800"
                        : "border-zinc-800 hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />

                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {action.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-zinc-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-medium text-white">
              Select Record
            </h2>

            <p className="mt-1 text-xs text-zinc-600">
              Choose the CRM record the AI should analyze.
            </p>

            {activeType === "deal_insight" ? (
              <div className="mt-4">
                <label className="mb-2 block text-xs text-zinc-500">
                  Deal
                </label>

                <select
                  value={selectedDeal}
                  onChange={(event) =>
                    setSelectedDeal(event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-zinc-700"
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
              <div className="mt-4">
                <label className="mb-2 block text-xs text-zinc-500">
                  Contact
                </label>

                <select
                  value={selectedContact}
                  onChange={(event) =>
                    setSelectedContact(
                      event.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none focus:border-zinc-700"
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
              <p className="mt-3 text-xs text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={generateAI}
              disabled={loading}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-200 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />

              {loading
                ? "Generating..."
                : "Generate with AI"}
            </button>
          </div>
        </div>

        <div className="xl:col-span-2">
          <div className="min-h-[620px] rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div>
                <h2 className="font-medium text-white">
                  AI Response
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Generated from your CRM data
                </p>
              </div>

              {response && (
                <button
                  onClick={copyResponse}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
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

            <div className="p-6">
              {!response && !loading ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
                    <Sparkles className="h-6 w-6 text-zinc-500" />
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-zinc-300">
                    AI assistance is ready
                  </h3>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-600">
                    Select an action and a CRM record, then generate an AI-powered response.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700">
                    <Sparkles className="h-4 w-4 animate-pulse text-zinc-400" />
                  </div>

                  <p className="mt-4 text-sm text-zinc-500">
                    Analyzing CRM data...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {response}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}