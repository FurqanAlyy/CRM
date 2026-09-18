"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  MessageCircle,
  TrendingUp,
  UserPlus
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface Stat {
  _id: string
  count: number
  value?: number
}

interface MonthlyDeal {
  _id: {
    year: number
    month: number
  }
  deals: number
  value: number
}

export default function ReportsPage() {
  const [dealStats, setDealStats] = useState<Stat[]>([])
  const [leadStats, setLeadStats] = useState<Stat[]>([])
  const [taskStats, setTaskStats] = useState<Stat[]>([])
  const [activityStats, setActivityStats] = useState<Stat[]>([])
  const [monthlyDeals, setMonthlyDeals] = useState<
    MonthlyDeal[]
  >([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/reports")
      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to fetch reports")
        return
      }

      setDealStats(data.dealStats || [])
      setLeadStats(data.leadStats || [])
      setTaskStats(data.taskStats || [])
      setActivityStats(data.activityStats || [])
      setMonthlyDeals(data.monthlyDeals || [])
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function formatLabel(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      )
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value)
  }

  const totalDealValue = dealStats.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  )

  const totalDeals = dealStats.reduce(
    (sum, item) => sum + item.count,
    0
  )

  const totalLeads = leadStats.reduce(
    (sum, item) => sum + item.count,
    0
  )

  const completedTasks =
    taskStats.find(
      (item) => item._id === "completed"
    )?.count || 0

  const totalActivities = activityStats.reduce(
    (sum, item) => sum + item.count,
    0
  )

  const monthlyChartData = monthlyDeals.map((item) => ({
    month: new Date(
      item._id.year,
      item._id.month - 1
    ).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    }),
    deals: item.deals,
    value: item.value
  }))

  const dealChartData = dealStats.map((item) => ({
    stage: formatLabel(item._id),
    deals: item.count,
    value: item.value || 0
  }))

  const leadChartData = leadStats.map((item) => ({
    status: formatLabel(item._id),
    leads: item.count
  }))

  const activityChartData = activityStats.map((item) => ({
    type: formatLabel(item._id),
    activities: item.count
  }))

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-sm text-zinc-500">
          Loading reports...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            onClick={fetchReports}
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
          Reports
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Analyze sales performance, leads, tasks, and customer activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <BarChart3 className="h-5 w-5 text-zinc-500" />

            <span className="text-xs text-zinc-600">
              Total Deals
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {totalDeals}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            {formatCurrency(totalDealValue)} total value
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-zinc-500" />

            <span className="text-xs text-zinc-600">
              Leads
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {totalLeads}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Across all lead stages
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 text-zinc-500" />

            <span className="text-xs text-zinc-600">
              Completed Tasks
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {completedTasks}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Tasks marked completed
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <MessageCircle className="h-5 w-5 text-zinc-500" />

            <span className="text-xs text-zinc-600">
              Activities
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-white">
            {totalActivities}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Customer interactions
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="font-medium text-white">
            Monthly Deal Performance
          </h2>

          <p className="mt-1 text-xs text-zinc-600">
            Deal volume and value over time
          </p>
        </div>

        <div className="h-80 p-5">
          {monthlyChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-zinc-600">
                No monthly deal data available
              </p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthlyChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#71717a",
                    fontSize: 11
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#71717a",
                    fontSize: 11
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px"
                  }}
                  formatter={(value, name) => [
                    name === "value"
                      ? formatCurrency(Number(value))
                      : value,
                    name === "value"
                      ? "Value"
                      : "Deals"
                  ]}
                />

                <Bar
                  dataKey="deals"
                  fill="#71717a"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />

              <div>
                <h2 className="font-medium text-white">
                  Deal Pipeline
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Deals and value by stage
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 p-5">
            {dealChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No deal data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={dealChartData}
                  layout="vertical"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#27272a"
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fill: "#71717a",
                      fontSize: 11
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={100}
                    tick={{
                      fill: "#71717a",
                      fontSize: 11
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "1px solid #27272a",
                      borderRadius: "8px"
                    }}
                  />

                  <Bar
                    dataKey="deals"
                    fill="#a1a1aa"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-4 w-4 text-zinc-500" />

              <div>
                <h2 className="font-medium text-white">
                  Lead Distribution
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Leads by current status
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {leadChartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No lead data available
                </p>
              </div>
            ) : (
              leadChartData.map((item) => {
                const percentage =
                  totalLeads > 0
                    ? (item.leads / totalLeads) * 100
                    : 0

                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm capitalize text-zinc-400">
                        {item.status}
                      </span>

                      <span className="text-sm font-medium text-zinc-300">
                        {item.leads}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-500"
                        style={{
                          width: `${percentage}%`
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-zinc-500" />

              <div>
                <h2 className="font-medium text-white">
                  Task Status
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Current task completion status
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {taskStats.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No task data available
                </p>
              </div>
            ) : (
              taskStats.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="text-sm capitalize text-zinc-400">
                    {formatLabel(item._id)}
                  </span>

                  <span className="text-sm font-medium text-zinc-300">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-zinc-500" />

              <div>
                <h2 className="font-medium text-white">
                  Activity Breakdown
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Customer interactions by type
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-zinc-800">
            {activityChartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-zinc-600">
                  No activity data available
                </p>
              </div>
            ) : (
              activityChartData.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <span className="text-sm text-zinc-400">
                    {item.type}
                  </span>

                  <span className="text-sm font-medium text-zinc-300">
                    {item.activities}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}