"use client"

import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  DollarSign,
  MessageCircle,
  Users,
  UserPlus
} from "lucide-react"
import LeadChart from "@/components/dashboard/LeadChart"

interface DashboardStats {
  contacts: number
  companies: number
  leads: number
  deals: number
  tasks: number
  activities: number
  activeContacts: number
  newLeads: number
  openDeals: number
  pendingTasks: number
  completedTasks: number
  dealValue: number
  weightedDealValue: number
  wonDealValue: number
  wonDealsCount: number
}

interface LeadStat {
  _id: string
  count: number
}

interface DealPipeline {
  _id: string
  count: number
  value: number
}

interface Activity {
  _id: string
  type: string
  title: string
  createdAt: string
  contact?: {
    firstName: string
    lastName: string
  }
  company?: {
    name: string
  }
  deal?: {
    title: string
  }
  lead?: {
    title: string
  }
}

interface Task {
  _id: string
  title: string
  dueDate?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress"
  contact?: {
    firstName: string
    lastName: string
  }
  company?: {
    name: string
  }
  deal?: {
    title: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [leadStats, setLeadStats] = useState<LeadStat[]>([])
  const [dealPipeline, setDealPipeline] = useState<DealPipeline[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/dashboard")
      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message || "Failed to fetch dashboard data"
        )
        return
      }

      setStats(data.stats)
      setLeadStats(data.leadStats)
      setDealPipeline(data.dealPipeline)
      setRecentActivities(data.recentActivities)
      setUpcomingTasks(data.upcomingTasks)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value)
  }

  function formatDate(date?: string) {
    if (!date) return "No due date"

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    })
  }

  function formatActivityType(type: string) {
    return type.replace("_", " ")
  }

  function getPriorityClass(priority: Task["priority"]) {
    if (priority === "high") {
      return "text-red-400"
    }

    if (priority === "medium") {
      return "text-yellow-400"
    }

    return "text-green-400"
  }

  function getPipelineStageName(stage: string) {
    return stage
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">
            {error || "Failed to load dashboard"}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-3 text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Overview of your CRM activity and sales pipeline
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-zinc-800 p-2.5">
              <Users className="h-5 w-5 text-zinc-300" />
            </div>

            <span className="text-xs text-zinc-600">
              Contacts
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {stats.contacts}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {stats.activeContacts} active contacts
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-zinc-800 p-2.5">
              <UserPlus className="h-5 w-5 text-zinc-300" />
            </div>

            <span className="text-xs text-zinc-600">
              Leads
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {stats.leads}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {stats.newLeads} new leads
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-zinc-800 p-2.5">
              <BriefcaseBusiness className="h-5 w-5 text-zinc-300" />
            </div>

            <span className="text-xs text-zinc-600">
              Open Deals
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {stats.openDeals}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {formatCurrency(stats.dealValue)} pipeline value
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-zinc-800 p-2.5">
              <DollarSign className="h-5 w-5 text-zinc-300" />
            </div>

            <span className="text-xs text-zinc-600">
              Won Revenue
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {formatCurrency(stats.wonDealValue)}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {stats.wonDealsCount} closed won deals
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 xl:col-span-2">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="font-medium text-white">
                Sales Pipeline
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Deals grouped by stage
              </p>
            </div>

            <ArrowUpRight className="h-4 w-4 text-zinc-600" />
          </div>

          <div className="p-5">
            {dealPipeline.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No deals available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dealPipeline.map((stage) => (
                  <div key={stage._id}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-zinc-400">
                        {getPipelineStageName(stage._id)}
                      </span>

                      <span className="text-zinc-500">
                        {stage.count}{" "}
                        {stage.count === 1
                          ? "deal"
                          : "deals"}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-400"
                        style={{
                          width: `${Math.min(
                            stage.value /
                              Math.max(
                                stats.dealValue,
                                1
                              ) *
                              100,
                            100
                          )}%`
                        }}
                      />
                    </div>

                    <p className="mt-1 text-xs text-zinc-600">
                      {formatCurrency(stage.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
  <div className="border-b border-zinc-800 px-5 py-4">
    <h2 className="font-medium text-white">
      Lead Overview
    </h2>

    <p className="mt-1 text-xs text-zinc-600">
      Current lead distribution
    </p>
  </div>

  <div className="p-5">
    <LeadChart data={leadStats} />
  </div>
</div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="font-medium text-white">
                Recent Activities
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Latest customer interactions
              </p>
            </div>

            <MessageCircle className="h-4 w-4 text-zinc-600" />
          </div>

          <div className="divide-y divide-zinc-800">
            {recentActivities.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No activities yet
                </p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity._id}
                  className="px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs capitalize text-zinc-600">
                        {formatActivityType(
                          activity.type
                        )}

                        {activity.contact &&
                          ` · ${activity.contact.firstName} ${activity.contact.lastName}`}

                        {activity.company &&
                          ` · ${activity.company.name}`}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-zinc-600">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <div>
              <h2 className="font-medium text-white">
                Upcoming Tasks
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Tasks that need attention
              </p>
            </div>

            <Clock3 className="h-4 w-4 text-zinc-600" />
          </div>

          <div className="divide-y divide-zinc-800">
            {upcomingTasks.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No upcoming tasks
                </p>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task._id}
                  className="px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-600" />

                      <div>
                        <p className="text-sm font-medium text-zinc-300">
                          {task.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-600">
                          {task.contact
                            ? `${task.contact.firstName} ${task.contact.lastName}`
                            : task.company?.name ||
                              task.deal?.title ||
                              "No related record"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-zinc-500">
                        {formatDate(task.dueDate)}
                      </p>

                      <p
                        className={`mt-1 text-xs capitalize ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-zinc-500" />

            <div>
              <p className="text-xs text-zinc-600">
                Companies
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {stats.companies}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-zinc-500" />

            <div>
              <p className="text-xs text-zinc-600">
                Pending Tasks
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {stats.pendingTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-zinc-500" />

            <div>
              <p className="text-xs text-zinc-600">
                Completed Tasks
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {stats.completedTasks}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}