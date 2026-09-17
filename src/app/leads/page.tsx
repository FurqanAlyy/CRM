"use client"

import { useEffect, useState } from "react"
import {
  MoreHorizontal,
  Plus,
  Search,
  Target
} from "lucide-react"
import AddLeadModal from "@/components/leads/AddLeadModal"
import EditLeadModal from "@/components/leads/EditLeadModal"

interface Lead {
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
  source?: string
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "unqualified"
    | "converted"
  value?: number
  probability?: number
  expectedCloseDate?: string
  notes?: string
}

const statusStyles = {
  new: "bg-blue-500/10 text-blue-400",
  contacted: "bg-yellow-500/10 text-yellow-400",
  qualified: "bg-green-500/10 text-green-400",
  unqualified: "bg-red-500/10 text-red-400",
  converted: "bg-purple-500/10 text-purple-400"
}

const statusLabels = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  unqualified: "Unqualified",
  converted: "Converted"
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const response = await fetch("/api/leads")
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(lead: Lead) {
    const confirmed = window.confirm(
      `Delete ${lead.title}?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/leads?id=${lead._id}`,
        {
          method: "DELETE"
        }
      )

      const data = await response.json()

      if (!response.ok) {
        window.alert(
          data.message || "Failed to delete lead"
        )
        return
      }

      setOpenMenu(null)
      fetchLeads()
    } catch {
      window.alert("Something went wrong")
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const value = search.toLowerCase()

    return (
      lead.title.toLowerCase().includes(value) ||
      lead.contact?.firstName
        .toLowerCase()
        .includes(value) ||
      lead.contact?.lastName
        .toLowerCase()
        .includes(value) ||
      lead.company?.name
        .toLowerCase()
        .includes(value) ||
      lead.source?.toLowerCase().includes(value) ||
      lead.status.toLowerCase().includes(value)
    )
  })

  function formatDate(date?: string) {
    if (!date) return "—"

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    )
  }

  function formatValue(value?: number) {
    if (value === undefined) return "—"

    return `$${value.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Leads
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage and track potential customers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          <p className="text-sm text-zinc-500">
            {filteredLeads.length} leads
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <Target className="h-6 w-6 text-zinc-500" />
            </div>

            <h3 className="text-sm font-medium text-white">
              No leads found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {search
                ? "Try changing your search."
                : "Add your first lead to get started."}
            </p>

            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-sm font-medium text-white hover:underline"
              >
                Add Lead
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Lead
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Company
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Value
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Probability
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Close Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
                          {lead.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {lead.title}
                          </p>

                          {lead.source && (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {lead.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {lead.contact ? (
                        <div>
                          <p className="text-sm text-zinc-300">
                            {lead.contact.firstName}{" "}
                            {lead.contact.lastName}
                          </p>

                          {lead.contact.email && (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              {lead.contact.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-600">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {lead.company?.name || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[lead.status]}`}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-300">
                      {formatValue(lead.value)}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {lead.probability !== undefined
                        ? `${lead.probability}%`
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(
                        lead.expectedCloseDate
                      )}
                    </td>

                    <td className="relative px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === lead._id
                                ? null
                                : lead._id
                            )
                          }
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenu === lead._id && (
                          <div className="absolute right-6 top-12 z-20 w-32 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
                            <button
                              onClick={() => {
                                setEditingLead(lead)
                                setOpenMenu(null)
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(lead)
                              }
                              className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-950/30"
                            >
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
      </div>

      {showModal && (
        <AddLeadModal
          onClose={() => setShowModal(false)}
          onCreated={fetchLeads}
        />
      )}

      {editingLead && (
        <EditLeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onUpdated={fetchLeads}
        />
      )}
    </div>
  )
}