
"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  DollarSign,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Trophy
} from "lucide-react"
import AddDealModal from "@/components/deals/AddDealModal"
import EditDealModal from "@/components/deals/EditDealModal"
import DealPipeline from "@/components/deals/DealPipeline"

interface Deal {
  _id: string
  title: string
  contact?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  company?: {
    _id: string
    name: string
  }
  lead?: {
    _id: string
    title: string
    status: string
  }
  amount: number
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost"
  probability?: number
  expectedCloseDate?: string
  notes?: string
}

const stageLabels = {
  prospecting: "Prospecting",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost"
}

const stageStyles = {
  prospecting:
    "border-[#424754] bg-[#282a32] text-[#c2c6d6]",
  qualification:
    "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]",
  proposal:
    "border-[#ffb95f]/20 bg-[#ffb95f]/10 text-[#ffb95f]",
  negotiation:
    "border-[#ffb95f]/20 bg-[#ffb95f]/10 text-[#ffb95f]",
  closed_won:
    "border-[#4edea3]/20 bg-[#4edea3]/10 text-[#4edea3]",
  closed_lost:
    "border-[#ffb4ab]/20 bg-[#ffb4ab]/10 text-[#ffb4ab]"
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [view, setView] = useState<"table" | "pipeline">(
    "table"
  )

  const [showAddModal, setShowAddModal] =
    useState(false)

  const [editingDeal, setEditingDeal] =
    useState<Deal | null>(null)

  const [openMenu, setOpenMenu] =
    useState<string | null>(null)

  useEffect(() => {
    fetchDeals()
  }, [])

  async function fetchDeals() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/deals")
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to fetch deals")
        return
      }

      setDeals(data.deals)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deal?"
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `/api/deals?id=${id}`,
        {
          method: "DELETE"
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Failed to delete deal")
        return
      }

      setDeals((currentDeals) =>
        currentDeals.filter(
          (deal) => deal._id !== id
        )
      )

      setOpenMenu(null)
    } catch {
      alert("Something went wrong")
    }
  }

  async function handleStageChange(
    dealId: string,
    stage: Deal["stage"]
  ) {
    try {
      const response = await fetch("/api/deals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: dealId,
          stage
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Failed to update deal")
        return
      }

      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal._id === dealId
            ? {
                ...deal,
                stage
              }
            : deal
        )
      )
    } catch {
      alert("Something went wrong")
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const searchValue = search.toLowerCase()

    const contactName = deal.contact
      ? `${deal.contact.firstName} ${deal.contact.lastName}`
      : ""

    const companyName = deal.company?.name || ""
    const leadTitle = deal.lead?.title || ""

    return (
      deal.title
        .toLowerCase()
        .includes(searchValue) ||
      contactName
        .toLowerCase()
        .includes(searchValue) ||
      companyName
        .toLowerCase()
        .includes(searchValue) ||
      leadTitle
        .toLowerCase()
        .includes(searchValue) ||
      stageLabels[deal.stage]
        .toLowerCase()
        .includes(searchValue)
    )
  })

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(amount)
  }

  function formatDate(date?: string) {
    if (!date) {
      return "—"
    }

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    )
  }

  const totalValue = deals.reduce(
    (total, deal) => total + deal.amount,
    0
  )

  const openDeals = deals.filter(
    (deal) =>
      deal.stage !== "closed_won" &&
      deal.stage !== "closed_lost"
  ).length

  const wonDeals = deals.filter(
    (deal) => deal.stage === "closed_won"
  )

  const wonValue = wonDeals.reduce(
    (total, deal) => total + deal.amount,
    0
  )

  const averageProbability =
    deals.length > 0
      ? Math.round(
          deals.reduce(
            (total, deal) =>
              total + (deal.probability || 0),
            0
          ) / deals.length
        )
      : 0

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed] sm:text-3xl">
              Deals
            </h1>

            <span className="rounded-md border border-[#424754] bg-[#1d1f28] px-2 py-1 text-xs font-medium text-[#c2c6d6]">
              {deals.length} records
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c909f]">
            Manage your sales opportunities and track your
            pipeline from prospecting to close.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#c4d6ff] lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </button>
      </div>

      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Pipeline Value
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {formatAmount(totalValue)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <DollarSign className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Total deal value
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Open Deals
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {openDeals}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Target className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Active opportunities
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Won Value
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {formatAmount(wonValue)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <Trophy className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Closed won deals
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Avg. Probability
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {averageProbability}%
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb95f]/10">
                <TrendingUp className="h-5 w-5 text-[#ffb95f]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Across all deals
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
        <div className="flex flex-col gap-4 border-b border-[#282a32] p-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#e2e1ed]">
                Deal Directory
              </h2>

              <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-xs text-[#c2c6d6]">
                {filteredDeals.length}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#8c909f]">
              Search and manage your sales opportunities
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:min-w-[260px] lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c909f]" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search deals..."
                className="w-full rounded-lg border border-[#424754] bg-[#11131b] py-2.5 pl-9 pr-4 text-sm text-[#e2e1ed] outline-none transition placeholder:text-[#8c909f] focus:border-[#adc6ff]"
              />
            </div>

            <div className="flex rounded-lg border border-[#282a32] bg-[#11131b] p-1">
              <button
                onClick={() => setView("table")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  view === "table"
                    ? "bg-[#282a32] text-[#e2e1ed]"
                    : "text-[#8c909f] hover:text-[#c2c6d6]"
                }`}
              >
                Table
              </button>

              <button
                onClick={() => setView("pipeline")}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition sm:flex-none ${
                  view === "pipeline"
                    ? "bg-[#282a32] text-[#e2e1ed]"
                    : "text-[#8c909f] hover:text-[#c2c6d6]"
                }`}
              >
                Pipeline
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#8c909f]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#424754] border-t-[#adc6ff]" />
              Loading deals...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/10">
              <Target className="h-6 w-6 text-[#ffb4ab]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              Unable to load deals
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {error}
            </p>

            <button
              onClick={fetchDeals}
              className="mt-4 rounded-lg border border-[#424754] bg-[#282a32] px-4 py-2 text-sm font-medium text-[#e2e1ed] transition hover:bg-[#33343d]"
            >
              Try Again
            </button>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#282a32] bg-[#11131b]">
              <Target className="h-6 w-6 text-[#8c909f]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              {search
                ? "No deals found"
                : "No deals yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {search
                ? "Try changing your search."
                : "Create your first deal to start managing your sales pipeline."}
            </p>

            {!search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#adc6ff] transition hover:text-[#c4d6ff]"
              >
                <Plus className="h-4 w-4" />
                Add Deal
              </button>
            )}
          </div>
        ) : view === "pipeline" ? (
          <div className="p-3 sm:p-5">
            <DealPipeline
              deals={filteredDeals}
              onStageChange={handleStageChange}
              onEdit={setEditingDeal}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#282a32] bg-[#11131b]/40 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Deal
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Contact
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Company
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Amount
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Stage
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Probability
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Close Date
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="border-b border-[#282a32]/70 last:border-0 transition hover:bg-[#282a32]/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#424754] bg-[#282a32] text-sm font-semibold text-[#adc6ff]">
                          {deal.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#e2e1ed]">
                            {deal.title}
                          </p>

                          {deal.lead && (
                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#8c909f]">
                              Lead: {deal.lead.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {deal.contact ? (
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#c2c6d6]">
                            {deal.contact.firstName}{" "}
                            {deal.contact.lastName}
                          </p>

                          {deal.contact.email && (
                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#8c909f]">
                              {deal.contact.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-[#c2c6d6]">
                        {deal.company?.name || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-[#8c909f]" />

                        <span className="text-sm font-medium text-[#c2c6d6]">
                          {formatAmount(deal.amount)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${stageStyles[deal.stage]}`}
                      >
                        {stageLabels[deal.stage]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {deal.probability !== undefined ? (
                        <div className="flex min-w-[110px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#282a32]">
                            <div
                              className="h-full rounded-full bg-[#adc6ff]"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    deal.probability,
                                    0
                                  ),
                                  100
                                )}%`
                              }}
                            />
                          </div>

                          <span className="w-9 text-right text-xs text-[#c2c6d6]">
                            {deal.probability}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-[#8c909f]" />

                        <span className="text-sm text-[#c2c6d6]">
                          {formatDate(
                            deal.expectedCloseDate
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="relative px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === deal._id
                                ? null
                                : deal._id
                            )
                          }
                          className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenu === deal._id && (
                          <div className="absolute right-5 top-12 z-20 w-36 overflow-hidden rounded-lg border border-[#424754] bg-[#191b24] p-1 shadow-2xl">
                            <button
                              onClick={() => {
                                setEditingDeal(deal)
                                setOpenMenu(null)
                              }}
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#c2c6d6] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(deal._id)
                              }
                              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#ffb4ab] transition hover:bg-red-950/30"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          !error &&
          filteredDeals.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#8c909f]">
                Showing{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {filteredDeals.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {deals.length}
                </span>{" "}
                deals
              </p>

              <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                <Target className="h-3.5 w-3.5" />
                Sales pipeline
              </div>
            </div>
          )}
      </div>

      {showAddModal && (
        <AddDealModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchDeals}
        />
      )}

      {editingDeal && (
        <EditDealModal
          deal={editingDeal}
          onClose={() => setEditingDeal(null)}
          onUpdated={fetchDeals}
        />
      )}
    </div>
  )
}