
"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users
} from "lucide-react"
import AddActivityModal from "@/components/activities/AddActivityModal"
import EditActivityModal from "@/components/activities/EditActivityModal"

interface Activity {
  _id: string
  type: "call" | "email" | "meeting" | "note" | "follow_up"
  title: string
  description?: string
  contact?: {
    _id: string
    firstName: string
    lastName: string
  }
  company?: {
    _id: string
    name: string
  }
  deal?: {
    _id: string
    title: string
  }
  lead?: {
    _id: string
    title: string
  }
  createdBy?: {
    _id: string
    name: string
    email: string
    role: string
  }
  createdAt: string
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingActivity, setEditingActivity] =
    useState<Activity | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/activities")
      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch activities"
        )
        return
      }

      setActivities(data.activities)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this activity?"
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/activities?id=${id}`,
        {
          method: "DELETE"
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.message || "Failed to delete activity"
        )
        return
      }

      setActivities((current) =>
        current.filter(
          (activity) => activity._id !== id
        )
      )
    } catch {
      alert("Something went wrong")
    }
  }

  function getActivityIcon(
    type: Activity["type"]
  ) {
    if (type === "call") {
      return <Phone className="h-4 w-4" />
    }

    if (type === "email") {
      return <Mail className="h-4 w-4" />
    }

    if (type === "meeting") {
      return <Users className="h-4 w-4" />
    }

    if (type === "follow_up") {
      return <CalendarDays className="h-4 w-4" />
    }

    return <MessageCircle className="h-4 w-4" />
  }

  function getActivityClass(
    type: Activity["type"]
  ) {
    if (type === "call") {
      return "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]"
    }

    if (type === "email") {
      return "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]"
    }

    if (type === "meeting") {
      return "border-[#4edea3]/20 bg-[#4edea3]/10 text-[#4edea3]"
    }

    if (type === "follow_up") {
      return "border-[#ffb95f]/20 bg-[#ffb95f]/10 text-[#ffb95f]"
    }

    return "border-[#424754] bg-[#282a32] text-[#c2c6d6]"
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    )
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    )
  }

  const filteredActivities = activities.filter(
    (activity) => {
      const searchText = search.toLowerCase()

      const matchesSearch =
        activity.title
          .toLowerCase()
          .includes(searchText) ||
        activity.description
          ?.toLowerCase()
          .includes(searchText) ||
        activity.contact?.firstName
          .toLowerCase()
          .includes(searchText) ||
        activity.contact?.lastName
          .toLowerCase()
          .includes(searchText) ||
        activity.company?.name
          .toLowerCase()
          .includes(searchText) ||
        activity.deal?.title
          .toLowerCase()
          .includes(searchText) ||
        activity.lead?.title
          .toLowerCase()
          .includes(searchText)

      const matchesType =
        typeFilter === "all" ||
        activity.type === typeFilter

      return matchesSearch && matchesType
    }
  )

  const calls = activities.filter(
    (activity) => activity.type === "call"
  ).length

  const emails = activities.filter(
    (activity) => activity.type === "email"
  ).length

  const meetings = activities.filter(
    (activity) => activity.type === "meeting"
  ).length

  const followUps = activities.filter(
    (activity) => activity.type === "follow_up"
  ).length

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed] sm:text-3xl">
              Activities
            </h1>

            <span className="rounded-md border border-[#424754] bg-[#1d1f28] px-2 py-1 text-xs font-medium text-[#c2c6d6]">
              {activities.length} records
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c909f]">
            Track calls, emails, meetings, notes, and
            follow-ups across your CRM.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#c4d6ff] lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </button>
      </div>

      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Total Activities
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {activities.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <MessageCircle className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              All recorded activities
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Calls
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {calls}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Phone className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Logged phone conversations
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Meetings
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {meetings}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <Users className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Recorded meetings
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Follow-ups
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {followUps}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb95f]/10">
                <CalendarDays className="h-5 w-5 text-[#ffb95f]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Follow-up activities
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
        <div className="border-b border-[#282a32] p-4 lg:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#e2e1ed]">
                  Activity Directory
                </h2>

                <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-xs text-[#c2c6d6]">
                  {filteredActivities.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#8c909f]">
                Search and manage your CRM activities
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative flex-1 sm:min-w-[260px] lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c909f]" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search activities..."
                  className="w-full rounded-lg border border-[#424754] bg-[#11131b] py-2.5 pl-9 pr-4 text-sm text-[#e2e1ed] outline-none transition placeholder:text-[#8c909f] focus:border-[#adc6ff]"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[#424754] bg-[#11131b] px-3 py-2.5 text-sm text-[#c2c6d6] outline-none transition focus:border-[#adc6ff] sm:w-auto"
              >
                <option value="all">All types</option>
                <option value="call">Calls</option>
                <option value="email">Emails</option>
                <option value="meeting">Meetings</option>
                <option value="note">Notes</option>
                <option value="follow_up">
                  Follow-ups
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#8c909f]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#424754] border-t-[#adc6ff]" />
              Loading activities...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/10">
              <MessageCircle className="h-6 w-6 text-[#ffb4ab]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              Unable to load activities
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {error}
            </p>

            <button
              onClick={fetchActivities}
              className="mt-4 rounded-lg border border-[#424754] bg-[#282a32] px-4 py-2 text-sm font-medium text-[#e2e1ed] transition hover:bg-[#33343d]"
            >
              Try Again
            </button>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#282a32] bg-[#11131b]">
              <MessageCircle className="h-6 w-6 text-[#8c909f]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              No activities found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {search || typeFilter !== "all"
                ? "Try changing your search or filter."
                : "Record your first activity to get started."}
            </p>

            {!search && typeFilter === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#adc6ff] transition hover:text-[#c4d6ff]"
              >
                <Plus className="h-4 w-4" />
                Add Activity
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#282a32] bg-[#11131b]/40 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Activity
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Related To
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Created By
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Date
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map(
                  (activity) => (
                    <tr
                      key={activity._id}
                      className="border-b border-[#282a32]/70 last:border-0 transition hover:bg-[#282a32]/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${getActivityClass(
                              activity.type
                            )}`}
                          >
                            {getActivityIcon(
                              activity.type
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium text-[#e2e1ed]">
                                {activity.title}
                              </p>

                              <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-[10px] font-medium capitalize text-[#c2c6d6]">
                                {activity.type.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>

                            {activity.description && (
                              <p className="mt-1 max-w-[350px] truncate text-xs text-[#8c909f]">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {activity.contact && (
                            <p className="text-sm text-[#c2c6d6]">
                              {
                                activity.contact
                                  .firstName
                              }{" "}
                              {
                                activity.contact
                                  .lastName
                              }
                            </p>
                          )}

                          {activity.company && (
                            <p className="text-xs text-[#8c909f]">
                              {
                                activity.company
                                  .name
                              }
                            </p>
                          )}

                          {activity.deal && (
                            <p className="text-xs text-[#8c909f]">
                              {activity.deal.title}
                            </p>
                          )}

                          {activity.lead && (
                            <p className="text-xs text-[#8c909f]">
                              {activity.lead.title}
                            </p>
                          )}

                          {!activity.contact &&
                            !activity.company &&
                            !activity.deal &&
                            !activity.lead && (
                              <span className="text-xs text-[#8c909f]">
                                None
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-[#c2c6d6]">
                          {activity.createdBy?.name ||
                            "Unknown"}
                        </p>

                        {activity.createdBy?.role && (
                          <p className="mt-0.5 text-xs capitalize text-[#8c909f]">
                            {activity.createdBy.role}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-[#8c909f]" />

                          <div>
                            <p className="text-sm text-[#c2c6d6]">
                              {formatDate(
                                activity.createdAt
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-[#8c909f]">
                              {formatTime(
                                activity.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setEditingActivity(
                                activity
                              )
                            }
                            className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            title="Edit activity"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                activity._id
                              )
                            }
                            className="rounded-lg p-2 text-[#8c909f] transition hover:bg-red-950/30 hover:text-[#ffb4ab]"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            title="More"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          !error &&
          filteredActivities.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#8c909f]">
                Showing{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {filteredActivities.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {activities.length}
                </span>{" "}
                activities
              </p>

              <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                <TrendingUp className="h-3.5 w-3.5" />
                Activity tracking
              </div>
            </div>
          )}
      </div>

      {showAddModal && (
        <AddActivityModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchActivities}
        />
      )}

      {editingActivity && (
        <EditActivityModal
          activity={editingActivity}
          onClose={() =>
            setEditingActivity(null)
          }
          onUpdated={fetchActivities}
        />
      )}
    </div>
  )
}
