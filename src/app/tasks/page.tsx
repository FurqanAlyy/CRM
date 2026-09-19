
"use client"

import { useEffect, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp
} from "lucide-react"
import AddTaskModal from "@/components/tasks/AddTaskModal"
import EditTaskModal from "@/components/tasks/EditTaskModal"

interface Task {
  _id: string
  title: string
  description?: string
  assignedTo?: {
    _id: string
    name: string
    email: string
    role: string
  }
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
  dueDate?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  createdAt: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/tasks")
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to fetch tasks")
        return
      }

      setTasks(data.tasks)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    )

    if (!confirmed) return

    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Failed to delete task")
        return
      }

      setTasks((current) =>
        current.filter((task) => task._id !== id)
      )
    } catch {
      alert("Something went wrong")
    }
  }

  async function handleStatusChange(
    id: string,
    status: Task["status"]
  ) {
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          status
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Failed to update task")
        return
      }

      setTasks((current) =>
        current.map((task) =>
          task._id === id
            ? {
                ...task,
                status
              }
            : task
        )
      )
    } catch {
      alert("Something went wrong")
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      task.description?.toLowerCase().includes(searchText) ||
      task.assignedTo?.name
        .toLowerCase()
        .includes(searchText) ||
      task.contact?.firstName
        .toLowerCase()
        .includes(searchText) ||
      task.contact?.lastName
        .toLowerCase()
        .includes(searchText) ||
      task.company?.name
        .toLowerCase()
        .includes(searchText) ||
      task.deal?.title
        .toLowerCase()
        .includes(searchText)

    const matchesStatus =
      statusFilter === "all" ||
      task.status === statusFilter

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === priorityFilter

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    )
  })

  function getPriorityClass(priority: Task["priority"]) {
    if (priority === "high") {
      return "border-[#ffb4ab]/20 bg-[#ffb4ab]/10 text-[#ffb4ab]"
    }

    if (priority === "medium") {
      return "border-[#ffb95f]/20 bg-[#ffb95f]/10 text-[#ffb95f]"
    }

    return "border-[#4edea3]/20 bg-[#4edea3]/10 text-[#4edea3]"
  }

  function getStatusClass(status: Task["status"]) {
    if (status === "completed") {
      return "border-[#4edea3]/20 bg-[#4edea3]/10 text-[#4edea3]"
    }

    if (status === "in_progress") {
      return "border-[#adc6ff]/20 bg-[#adc6ff]/10 text-[#adc6ff]"
    }

    return "border-[#424754] bg-[#282a32] text-[#c2c6d6]"
  }

  function formatDate(date?: string) {
    if (!date) return "No due date"

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length

  const pendingTasks = tasks.filter(
    (task) => task.status === "pending"
  ).length

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high"
  ).length

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed] sm:text-3xl">
              Tasks
            </h1>

            <span className="rounded-md border border-[#424754] bg-[#1d1f28] px-2 py-1 text-xs font-medium text-[#c2c6d6]">
              {tasks.length} records
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c909f]">
            Manage your team's tasks, follow-ups, and daily
            activities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#c4d6ff] lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Total Tasks
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {tasks.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Target className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              All assigned tasks
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {completedTasks}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <CheckCircle2 className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Finished tasks
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  In Progress
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {inProgressTasks}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <TrendingUp className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Currently active
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  High Priority
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {highPriorityTasks}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb4ab]/10">
                <Clock3 className="h-5 w-5 text-[#ffb4ab]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Tasks requiring attention
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
                  Task Directory
                </h2>

                <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-xs text-[#c2c6d6]">
                  {filteredTasks.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#8c909f]">
                Search, filter, and manage your tasks
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
                  placeholder="Search tasks..."
                  className="w-full rounded-lg border border-[#424754] bg-[#11131b] py-2.5 pl-9 pr-4 text-sm text-[#e2e1ed] outline-none transition placeholder:text-[#8c909f] focus:border-[#adc6ff]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[#424754] bg-[#11131b] px-3 py-2.5 text-sm text-[#c2c6d6] outline-none transition focus:border-[#adc6ff] sm:w-auto"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">
                  In Progress
                </option>
                <option value="completed">
                  Completed
                </option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value)
                }
                className="w-full rounded-lg border border-[#424754] bg-[#11131b] px-3 py-2.5 text-sm text-[#c2c6d6] outline-none transition focus:border-[#adc6ff] sm:w-auto"
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#8c909f]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#424754] border-t-[#adc6ff]" />
              Loading tasks...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#ffb4ab]/20 bg-[#ffb4ab]/10">
              <Clock3 className="h-6 w-6 text-[#ffb4ab]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              Unable to load tasks
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {error}
            </p>

            <button
              onClick={fetchTasks}
              className="mt-4 rounded-lg border border-[#424754] bg-[#282a32] px-4 py-2 text-sm font-medium text-[#e2e1ed] transition hover:bg-[#33343d]"
            >
              Try Again
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#282a32] bg-[#11131b]">
              <CheckCircle2 className="h-6 w-6 text-[#8c909f]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              No tasks found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {search ||
              statusFilter !== "all" ||
              priorityFilter !== "all"
                ? "Try changing your search or filters."
                : "Create your first task to get started."}
            </p>

            {!search &&
              statusFilter === "all" &&
              priorityFilter === "all" && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-[#adc6ff] transition hover:text-[#c4d6ff]"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-[#282a32] bg-[#11131b]/40 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Task
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Assigned To
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Related To
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Due Date
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Priority
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Status
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-[#282a32]/70 last:border-0 transition hover:bg-[#282a32]/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#424754] bg-[#282a32] text-sm font-semibold text-[#adc6ff]">
                          {task.title
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#e2e1ed]">
                            {task.title}
                          </p>

                          {task.description && (
                            <p className="mt-0.5 max-w-[230px] truncate text-xs text-[#8c909f]">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[#c2c6d6]">
                          {task.assignedTo?.name ||
                            "Current user"}
                        </p>

                        {task.assignedTo?.email && (
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-[#8c909f]">
                            {task.assignedTo.email}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {task.contact && (
                          <p className="text-sm text-[#c2c6d6]">
                            {task.contact.firstName}{" "}
                            {task.contact.lastName}
                          </p>
                        )}

                        {task.company && (
                          <p className="text-xs text-[#8c909f]">
                            {task.company.name}
                          </p>
                        )}

                        {task.deal && (
                          <p className="text-xs text-[#8c909f]">
                            {task.deal.title}
                          </p>
                        )}

                        {!task.contact &&
                          !task.company &&
                          !task.deal && (
                            <span className="text-xs text-[#8c909f]">
                              None
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-[#8c909f]" />

                        <span className="text-sm text-[#c2c6d6]">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task._id,
                            e.target.value as Task["status"]
                          )
                        }
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium outline-none transition ${getStatusClass(
                          task.status
                        )}`}
                      >
                        <option value="pending">
                          Pending
                        </option>

                        <option value="in_progress">
                          In Progress
                        </option>

                        <option value="completed">
                          Completed
                        </option>
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setEditingTask(task)
                          }
                          className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                          title="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(task._id)
                          }
                          className="rounded-lg p-2 text-[#8c909f] transition hover:bg-red-950/30 hover:text-[#ffb4ab]"
                          title="Delete task"
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading &&
          !error &&
          filteredTasks.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#8c909f]">
                Showing{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {filteredTasks.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#c2c6d6]">
                  {tasks.length}
                </span>{" "}
                tasks
              </p>

              <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                <Target className="h-3.5 w-3.5" />
                Task management
              </div>
            </div>
          )}
      </div>

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchTasks}
        />
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdated={fetchTasks}
        />
      )}
    </div>
  )
}
