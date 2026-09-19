"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  DollarSign,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  TrendingUp,
  UserRound
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
  new: "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]",
  contacted: "border-[#ffb95f]/20 bg-[#ffb95f]/10 text-[#ffb95f]",
  qualified: "border-[#4edea3]/20 bg-[#4edea3]/10 text-[#4edea3]",
  unqualified: "border-[#ffb4ab]/20 bg-[#ffb4ab]/10 text-[#ffb4ab]",
  converted: "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]"
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

  const totalValue = leads.reduce(
    (total, lead) => total + (lead.value || 0),
    0
  )

  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "qualified"
  ).length

  const averageProbability =
    leads.length > 0
      ? Math.round(
          leads.reduce(
            (total, lead) =>
              total + (lead.probability || 0),
            0
          ) / leads.length
        )
      : 0

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed] sm:text-3xl">
              Leads
            </h1>

            <span className="rounded-md border border-[#424754] bg-[#1d1f28] px-2 py-1 text-xs font-medium text-[#c2c6d6]">
              {leads.length} records
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c909f]">
            Manage and track potential customers throughout your sales process.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#c4d6ff] lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {!loading && leads.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Total Leads
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {leads.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Target className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Potential customers
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Pipeline Value
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  ${totalValue.toLocaleString()}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <DollarSign className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Combined lead value
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Qualified
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {qualifiedLeads}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <TrendingUp className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Qualified opportunities
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
              Across all leads
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
        <div className="flex flex-col gap-4 border-b border-[#282a32] p-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#e2e1ed]">
                Lead Directory
              </h2>

              <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-xs text-[#c2c6d6]">
                {filteredLeads.length}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#8c909f]">
              Search and manage your sales opportunities
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c909f]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full rounded-lg border border-[#424754] bg-[#11131b] py-2.5 pl-9 pr-4 text-sm text-[#e2e1ed] outline-none transition placeholder:text-[#8c909f] focus:border-[#adc6ff]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#8c909f]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#424754] border-t-[#adc6ff]" />
              Loading leads...
            </div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#282a32] bg-[#11131b]">
              <Target className="h-6 w-6 text-[#8c909f]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              No leads found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {search
                ? "Try changing your search."
                : "Add your first lead to get started."}
            </p>

            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#adc6ff] transition hover:text-[#c4d6ff]"
              >
                <Plus className="h-4 w-4" />
                Add Lead
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#282a32] bg-[#11131b]/40 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Lead
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Contact
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Company
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Status
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Value
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
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-[#282a32]/70 last:border-0 transition hover:bg-[#282a32]/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#424754] bg-[#282a32] text-sm font-semibold text-[#adc6ff]">
                          {lead.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#e2e1ed]">
                            {lead.title}
                          </p>

                          {lead.source && (
                            <p className="mt-0.5 max-w-[160px] truncate text-xs text-[#8c909f]">
                              {lead.source}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {lead.contact ? (
                        <div className="flex items-start gap-2.5">
                          <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#8c909f]" />

                          <div className="min-w-0">
                            <p className="truncate text-sm text-[#c2c6d6]">
                              {lead.contact.firstName}{" "}
                              {lead.contact.lastName}
                            </p>

                            {lead.contact.email && (
                              <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#8c909f]">
                                {lead.contact.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {lead.company?.name ? (
                        <span className="text-sm text-[#c2c6d6]">
                          {lead.company.name}
                        </span>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${statusStyles[lead.status]}`}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-[#8c909f]" />

                        <span className="text-sm font-medium text-[#c2c6d6]">
                          {formatValue(lead.value)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {lead.probability !== undefined ? (
                        <div className="flex min-w-[100px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#282a32]">
                            <div
                              className="h-full rounded-full bg-[#adc6ff]"
                              style={{
                                width: `${Math.min(
                                  Math.max(
                                    lead.probability,
                                    0
                                  ),
                                  100
                                )}%`
                              }}
                            />
                          </div>

                          <span className="w-9 text-right text-xs text-[#c2c6d6]">
                            {lead.probability}%
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
                            lead.expectedCloseDate
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="relative px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === lead._id
                                ? null
                                : lead._id
                            )
                          }
                          className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenu === lead._id && (
                          <div className="absolute right-5 top-12 z-20 w-32 overflow-hidden rounded-lg border border-[#424754] bg-[#191b24] shadow-2xl">
                            <button
                              onClick={() => {
                                setEditingLead(lead)
                                setOpenMenu(null)
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-[#c2c6d6] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDelete(lead)
                              }
                              className="block w-full px-4 py-2.5 text-left text-sm text-[#ffb4ab] transition hover:bg-red-950/30"
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

        {!loading && filteredLeads.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#8c909f]">
              Showing{" "}
              <span className="font-medium text-[#c2c6d6]">
                {filteredLeads.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#c2c6d6]">
                {leads.length}
              </span>{" "}
              leads
            </p>

            <div className="flex items-center gap-2 text-xs text-[#8c909f]">
              <Target className="h-3.5 w-3.5" />
              Lead pipeline
            </div>
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