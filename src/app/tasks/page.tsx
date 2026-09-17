"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2
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
      task.assignedTo?.name.toLowerCase().includes(searchText) ||
      task.contact?.firstName.toLowerCase().includes(searchText) ||
      task.contact?.lastName.toLowerCase().includes(searchText) ||
      task.company?.name.toLowerCase().includes(searchText) ||
      task.deal?.title.toLowerCase().includes(searchText)

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
      return "bg-red-500/10 text-red-400 border-red-500/20"
    }

    if (priority === "medium") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    }

    return "bg-green-500/10 text-green-400 border-green-500/20"
  }

  function getStatusClass(status: Task["status"]) {
    if (status === "completed") {
      return "bg-green-500/10 text-green-400 border-green-500/20"
    }

    if (status === "in_progress") {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20"
    }

    return "bg-zinc-800 text-zinc-400 border-zinc-700"
  }

  function formatDate(date?: string) {
    if (!date) return "No due date"

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your team's tasks and follow-ups
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Clock3 className="h-4 w-4 animate-spin" />
              Loading tasks...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[300px] items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-red-400">
                {error}
              </p>

              <button
                onClick={fetchTasks}
                className="mt-3 text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
              >
                Try again
              </button>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-zinc-700" />

            <h3 className="mt-4 text-sm font-medium text-zinc-300">
              No tasks found
            </h3>

            <p className="mt-1 text-sm text-zinc-600">
              Create a task or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                  <th className="px-5 py-4 font-medium">
                    Task
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Assigned To
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Related To
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Due Date
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Priority
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-white">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 max-w-[250px] truncate text-xs text-zinc-500">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-zinc-300">
                          {task.assignedTo?.name || "Current user"}
                        </p>

                        {task.assignedTo?.email && (
                          <p className="mt-1 text-xs text-zinc-600">
                            {task.assignedTo.email}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {task.contact && (
                          <p className="text-sm text-zinc-300">
                            {task.contact.firstName}{" "}
                            {task.contact.lastName}
                          </p>
                        )}

                        {task.company && (
                          <p className="text-xs text-zinc-500">
                            {task.company.name}
                          </p>
                        )}

                        {task.deal && (
                          <p className="text-xs text-zinc-600">
                            {task.deal.title}
                          </p>
                        )}

                        {!task.contact &&
                          !task.company &&
                          !task.deal && (
                            <span className="text-xs text-zinc-600">
                              None
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-zinc-400">
                      {formatDate(task.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${getPriorityClass(
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
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium outline-none ${getStatusClass(
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
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setEditingTask(task)
                          }
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                          title="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(task._id)
                          }
                          className="rounded-lg p-2 text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                          title="Delete task"
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
                ))}
              </tbody>
            </table>
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