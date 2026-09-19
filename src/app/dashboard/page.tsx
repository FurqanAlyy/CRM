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
  UserPlus,
  TrendingUp
} from "lucide-react"
import LeadChart from "@/components/dashboard/LeadChart"
import DealPipelineChart from "@/components/dashboard/DealPipelineChart"

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
        setError(data.message || "Failed to fetch dashboard data")
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
      return "border-red-400/20 bg-red-400/10 text-red-300"
    }

    if (priority === "medium") {
      return "border-amber-400/20 bg-amber-400/10 text-amber-300"
    }

    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
  }

  function getActivityIcon(type: string) {
    if (type === "call") {
      return <MessageCircle className="h-4 w-4" />
    }

    if (type === "email") {
      return <MessageCircle className="h-4 w-4" />
    }

    if (type === "meeting") {
      return <Users className="h-4 w-4" />
    }

    return <Clock3 className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#11131b]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#282a32] border-t-[#adc6ff]" />
          <p className="mt-4 text-sm text-[#8c909f]">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#11131b]">
        <div className="rounded-xl border border-[#282a32] bg-[#191b24] px-8 py-7 text-center">
          <p className="text-sm text-red-300">
            {error || "Failed to load dashboard"}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-4 rounded-lg border border-[#3b3e49] bg-[#1d1f28] px-4 py-2 text-sm text-[#d8dbe5] transition hover:bg-[#282a32] hover:text-white"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#11131b] text-[#f4f4f6]">
      <div className="space-y-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#adc6ff]/20 bg-[#adc6ff]/8 px-3 py-1 text-xs font-medium text-[#adc6ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#adc6ff]" />
              Live Pipeline
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-[#8c909f]">
              Overview of your CRM activity and sales pipeline
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-[#282a32] bg-[#191b24] px-3 py-2 text-xs text-[#8c909f]">
              {stats.activities} total activities
            </div>

            <div className="rounded-lg border border-[#282a32] bg-[#191b24] px-3 py-2 text-xs text-[#8c909f]">
              {stats.tasks} total tasks
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#3b3e49]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#adc6ff]/10 text-[#adc6ff]">
                <Users className="h-5 w-5" />
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#555966] transition group-hover:text-[#adc6ff]" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-[#777b89]">
              Total Contacts
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {stats.contacts}
            </p>

            <p className="mt-2 text-xs text-[#8c909f]">
              <span className="text-[#4edea3]">
                {stats.activeContacts}
              </span>{" "}
              active contacts
            </p>
          </div>

          <div className="group rounded-2xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#3b3e49]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4edea3]/10 text-[#4edea3]">
                <UserPlus className="h-5 w-5" />
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#555966] transition group-hover:text-[#4edea3]" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-[#777b89]">
              Active Leads
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {stats.leads}
            </p>

            <p className="mt-2 text-xs text-[#8c909f]">
              <span className="text-[#4edea3]">
                {stats.newLeads}
              </span>{" "}
              new leads
            </p>
          </div>

          <div className="group rounded-2xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#3b3e49]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#adc6ff]/10 text-[#adc6ff]">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#555966] transition group-hover:text-[#adc6ff]" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-[#777b89]">
              Open Deals
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {stats.openDeals}
            </p>

            <p className="mt-2 text-xs text-[#8c909f]">
              {formatCurrency(stats.weightedDealValue)} weighted value
            </p>
          </div>

          <div className="group rounded-2xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#3b3e49]">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffb95f]/10 text-[#ffb95f]">
                <DollarSign className="h-5 w-5" />
              </div>

              <TrendingUp className="h-4 w-4 text-[#555966] transition group-hover:text-[#ffb95f]" />
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-wider text-[#777b89]">
              Won Revenue
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {formatCurrency(stats.wonDealValue)}
            </p>

            <p className="mt-2 text-xs text-[#8c909f]">
              {stats.wonDealsCount} closed won deals
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-[#282a32] bg-[#191b24] xl:col-span-7">
            <div className="flex items-center justify-between border-b border-[#282a32] px-5 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white">
                    Sales Pipeline
                  </h2>

                  <span className="rounded-full bg-[#adc6ff]/10 px-2 py-0.5 text-[10px] font-medium text-[#adc6ff]">
                    LIVE
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#777b89]">
                  Deal value by pipeline stage
                </p>
              </div>

              <ArrowUpRight className="h-4 w-4 text-[#555966]" />
            </div>

            <div className="p-5">
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-[#282a32] bg-[#11131b] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#777b89]">
                    Total Value
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatCurrency(stats.dealValue)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#282a32] bg-[#11131b] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#777b89]">
                    Weighted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#adc6ff]">
                    {formatCurrency(stats.weightedDealValue)}
                  </p>
                </div>

                <div className="rounded-xl border border-[#282a32] bg-[#11131b] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#777b89]">
                    Won Value
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#4edea3]">
                    {formatCurrency(stats.wonDealValue)}
                  </p>
                </div>
              </div>

              <DealPipelineChart data={dealPipeline} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#282a32] bg-[#191b24] xl:col-span-5">
            <div className="border-b border-[#282a32] px-5 py-5">
              <h2 className="text-sm font-semibold text-white">
                Lead Distribution
              </h2>

              <p className="mt-1 text-xs text-[#777b89]">
                Current lead distribution
              </p>
            </div>

            <div className="p-5">
              <LeadChart data={leadStats} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-[#282a32] bg-[#191b24] xl:col-span-7">
            <div className="flex items-center justify-between border-b border-[#282a32] px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Recent Activity
                </h2>

                <p className="mt-1 text-xs text-[#777b89]">
                  Latest customer interactions
                </p>
              </div>

              <MessageCircle className="h-4 w-4 text-[#777b89]" />
            </div>

            <div className="divide-y divide-[#282a32]">
              {recentActivities.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#777b89]">
                    No activities yet
                  </p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#1d1f28]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#282a32] text-[#adc6ff]">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#e7e8ec]">
                        {activity.title}
                      </p>

                      <p className="mt-1 truncate text-xs capitalize text-[#777b89]">
                        {formatActivityType(activity.type)}

                        {activity.contact &&
                          ` · ${activity.contact.firstName} ${activity.contact.lastName}`}

                        {activity.company &&
                          ` · ${activity.company.name}`}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-[#777b89]">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#282a32] bg-[#191b24] xl:col-span-5">
            <div className="flex items-center justify-between border-b border-[#282a32] px-5 py-5">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Priority Action Items
                </h2>

                <p className="mt-1 text-xs text-[#777b89]">
                  Tasks that need attention
                </p>
              </div>

              <Clock3 className="h-4 w-4 text-[#777b89]" />
            </div>

            <div className="divide-y divide-[#282a32]">
              {upcomingTasks.length === 0 ? (
                <div className="flex h-48 items-center justify-center">
                  <p className="text-sm text-[#777b89]">
                    No upcoming tasks
                  </p>
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 px-5 py-4 transition hover:bg-[#1d1f28]"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#282a32]">
                      <CheckCircle2 className="h-4 w-4 text-[#8c909f]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#e7e8ec]">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-[#777b89]">
                        {task.contact
                          ? `${task.contact.firstName} ${task.contact.lastName}`
                          : task.company?.name ||
                            task.deal?.title ||
                            "No related record"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-[#8c909f]">
                        {formatDate(task.dueDate)}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#282a32] bg-[#191b24] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#adc6ff]/10">
                <Building2 className="h-5 w-5 text-[#adc6ff]" />
              </div>

              <div>
                <p className="text-xs text-[#777b89]">
                  Companies
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {stats.companies}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#282a32] bg-[#191b24] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffb95f]/10">
                <Clock3 className="h-5 w-5 text-[#ffb95f]" />
              </div>

              <div>
                <p className="text-xs text-[#777b89]">
                  Pending Tasks
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {stats.pendingTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#282a32] bg-[#191b24] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4edea3]/10">
                <CheckCircle2 className="h-5 w-5 text-[#4edea3]" />
              </div>

              <div>
                <p className="text-xs text-[#777b89]">
                  Completed Tasks
                </p>

                <p className="mt-1 text-xl font-semibold text-white">
                  {stats.completedTasks}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}