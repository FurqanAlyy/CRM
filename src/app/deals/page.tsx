"use client"

import { useEffect, useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2
} from "lucide-react"
import AddDealModal from "@/components/deals/AddDealModal"
import EditDealModal from "@/components/deals/EditDealModal"

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
    "bg-zinc-800 text-zinc-300",
  qualification:
    "bg-blue-950/50 text-blue-400",
  proposal:
    "bg-yellow-950/50 text-yellow-400",
  negotiation:
    "bg-orange-950/50 text-orange-400",
  closed_won:
    "bg-green-950/50 text-green-400",
  closed_lost:
    "bg-red-950/50 text-red-400"
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
        currentDeals.filter((deal) => deal._id !== id)
      )

      setOpenMenu(null)
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

    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Deals
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your sales opportunities and pipeline
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Deal
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-zinc-500">
            Loading deals...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            {error}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-zinc-500">
              {search
                ? "No deals found"
                : "No deals yet"}
            </p>

            {!search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-sm text-white hover:underline"
              >
                Create your first deal
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-6 py-4 font-medium">
                    Deal
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Contact
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Company
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Stage
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Probability
                  </th>

                  <th className="px-6 py-4 font-medium">
                    Close Date
                  </th>

                  <th className="px-6 py-4 font-medium">
                    <span className="sr-only">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDeals.map((deal) => (
                  <tr
                    key={deal._id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {deal.title}
                        </p>

                        {deal.lead && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Lead: {deal.lead.title}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {deal.contact ? (
                        <div>
                          <p className="text-sm text-zinc-300">
                            {deal.contact.firstName}{" "}
                            {deal.contact.lastName}
                          </p>

                          {deal.contact.email && (
                            <p className="mt-1 text-xs text-zinc-500">
                              {deal.contact.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-600">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {deal.company?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {formatAmount(deal.amount)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stageStyles[deal.stage]}`}
                      >
                        {stageLabels[deal.stage]}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {deal.probability !== undefined
                        ? `${deal.probability}%`
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(
                        deal.expectedCloseDate
                      )}
                    </td>

                    <td className="relative px-6 py-4">
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === deal._id
                              ? null
                              : deal._id
                          )
                        }
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openMenu === deal._id && (
                        <div className="absolute right-6 top-12 z-20 w-36 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
                          <button
                            onClick={() => {
                              setEditingDeal(deal)
                              setOpenMenu(null)
                            }}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(deal._id)
                            }
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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