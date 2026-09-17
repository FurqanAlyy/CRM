"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
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
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }

    if (type === "email") {
      return "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }

    if (type === "meeting") {
      return "bg-green-500/10 text-green-400 border-green-500/20"
    }

    if (type === "follow_up") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }

    return "bg-zinc-800 text-zinc-400 border-zinc-700"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Activities
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Track calls, emails, meetings and follow-ups
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search activities..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
          >
            <option value="all">All types</option>
            <option value="call">Calls</option>
            <option value="email">Emails</option>
            <option value="meeting">Meetings</option>
            <option value="note">Notes</option>
            <option value="follow_up">Follow-ups</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-zinc-500">
              Loading activities...
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-red-400">
                {error}
              </p>

              <button
                onClick={fetchActivities}
                className="mt-3 text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <MessageCircle className="h-10 w-10 text-zinc-700" />

            <h3 className="mt-4 text-sm font-medium text-zinc-300">
              No activities found
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              Record an activity or adjust your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="px-5 py-4 font-medium">
                    Activity
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Related To
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Created By
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Date
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map(
                  (activity) => (
                    <tr
                      key={activity._id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${getActivityClass(
                              activity.type
                            )}`}
                          >
                            {getActivityIcon(
                              activity.type
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">
                                {activity.title}
                              </p>

                              <span className="text-xs capitalize text-zinc-600">
                                {activity.type.replace(
                                  "_",
                                  " "
                                )}
                              </span>
                            </div>

                            {activity.description && (
                              <p className="mt-1 max-w-[350px] truncate text-xs text-zinc-500">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {activity.contact && (
                            <p className="text-sm text-zinc-300">
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
                            <p className="text-xs text-zinc-500">
                              {
                                activity.company
                                  .name
                              }
                            </p>
                          )}

                          {activity.deal && (
                            <p className="text-xs text-zinc-600">
                              {activity.deal.title}
                            </p>
                          )}

                          {activity.lead && (
                            <p className="text-xs text-zinc-600">
                              {activity.lead.title}
                            </p>
                          )}

                          {!activity.contact &&
                            !activity.company &&
                            !activity.deal &&
                            !activity.lead && (
                              <span className="text-xs text-zinc-600">
                                None
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-300">
                          {activity.createdBy?.name ||
                            "Unknown"}
                        </p>

                        {activity.createdBy?.role && (
                          <p className="mt-1 text-xs capitalize text-zinc-600">
                            {activity.createdBy.role}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-400">
                          {formatDate(
                            activity.createdAt
                          )}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {formatTime(
                            activity.createdAt
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setEditingActivity(
                                activity
                              )
                            }
                            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
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
                            className="rounded-lg p-2 text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                            title="Delete activity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <button
                            className="rounded-lg p-2 text-zinc-600"
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