
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
  const [monthlyDeals, setMonthlyDeals] = useState<MonthlyDeal[]>([])

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
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
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
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#33343d] border-t-[#adc6ff]" />

          <p className="text-sm text-[#8c909f]">
            Loading reports...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-xl border border-[#ffb4ab]/20 bg-[#191b24] px-8 py-7 text-center">
          <p className="text-sm text-[#ffb4ab]">
            {error}
          </p>

          <button
            onClick={fetchReports}
            className="mt-4 rounded-lg border border-[#424754] bg-[#282a32] px-4 py-2 text-sm text-[#e2e1ed] transition hover:bg-[#33343d]"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed]">
              Reports
            </h1>

            <span className="rounded-full border border-[#adc6ff]/20 bg-[#adc6ff]/10 px-2.5 py-1 text-xs font-medium text-[#adc6ff]">
              Analytics
            </span>
          </div>

          <p className="mt-1 text-sm text-[#8c909f]">
            Analyze sales performance, leads, tasks, and customer activity
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8c909f]">
          <div className="h-2 w-2 rounded-full bg-[#4edea3]" />
          Live data
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#424754]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#adc6ff]/10">
              <BarChart3 className="h-4 w-4 text-[#adc6ff]" />
            </div>

            <span className="text-xs text-[#8c909f]">
              Total Deals
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#e2e1ed]">
            {totalDeals}
          </p>

          <p className="mt-1 text-xs text-[#8c909f]">
            {formatCurrency(totalDealValue)} total value
          </p>
        </div>

        <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#424754]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4edea3]/10">
              <TrendingUp className="h-4 w-4 text-[#4edea3]" />
            </div>

            <span className="text-xs text-[#8c909f]">
              Leads
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#e2e1ed]">
            {totalLeads}
          </p>

          <p className="mt-1 text-xs text-[#8c909f]">
            Across all lead stages
          </p>
        </div>

        <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#424754]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4edea3]/10">
              <CheckCircle2 className="h-4 w-4 text-[#4edea3]" />
            </div>

            <span className="text-xs text-[#8c909f]">
              Completed Tasks
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#e2e1ed]">
            {completedTasks}
          </p>

          <p className="mt-1 text-xs text-[#8c909f]">
            Tasks marked completed
          </p>
        </div>

        <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-5 transition hover:border-[#424754]">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ffb95f]/10">
              <MessageCircle className="h-4 w-4 text-[#ffb95f]" />
            </div>

            <span className="text-xs text-[#8c909f]">
              Activities
            </span>
          </div>

          <p className="mt-5 text-2xl font-semibold text-[#e2e1ed]">
            {totalActivities}
          </p>

          <p className="mt-1 text-xs text-[#8c909f]">
            Customer interactions
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
        <div className="border-b border-[#282a32] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium text-[#e2e1ed]">
                Monthly Deal Performance
              </h2>

              <p className="mt-1 text-xs text-[#8c909f]">
                Deal volume and value over time
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8c909f]">
              <span className="h-2 w-2 rounded-full bg-[#adc6ff]" />
              Deals
            </div>
          </div>
        </div>

        <div className="h-80 p-4 sm:h-96 sm:p-6">
          {monthlyChartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#8c909f]">
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
                  stroke="#33343d"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "#8c909f",
                    fontSize: 11
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#8c909f",
                    fontSize: 11
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#191b24",
                    border: "1px solid #424754",
                    borderRadius: "10px",
                    color: "#e2e1ed"
                  }}
                  labelStyle={{
                    color: "#e2e1ed"
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
                  fill="#adc6ff"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
          <div className="border-b border-[#282a32] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <BriefcaseBusiness className="h-4 w-4 text-[#adc6ff]" />
              </div>

              <div>
                <h2 className="font-medium text-[#e2e1ed]">
                  Deal Pipeline
                </h2>

                <p className="mt-1 text-xs text-[#8c909f]">
                  Deals and value by stage
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 p-4 sm:h-80 sm:p-6">
            {dealChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-[#8c909f]">
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
                  margin={{
                    left: 0,
                    right: 10
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#33343d"
                  />

                  <XAxis
                    type="number"
                    tick={{
                      fill: "#8c909f",
                      fontSize: 11
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={95}
                    tick={{
                      fill: "#8c909f",
                      fontSize: 11
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#191b24",
                      border: "1px solid #424754",
                      borderRadius: "10px",
                      color: "#e2e1ed"
                    }}
                    labelStyle={{
                      color: "#e2e1ed"
                    }}
                  />

                  <Bar
                    dataKey="deals"
                    fill="#4edea3"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
          <div className="border-b border-[#282a32] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <UserPlus className="h-4 w-4 text-[#4edea3]" />
              </div>

              <div>
                <h2 className="font-medium text-[#e2e1ed]">
                  Lead Distribution
                </h2>

                <p className="mt-1 text-xs text-[#8c909f]">
                  Leads by current status
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            {leadChartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-[#8c909f]">
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
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate text-sm text-[#c2c6d6]">
                        {item.status}
                      </span>

                      <span className="text-sm font-medium text-[#e2e1ed]">
                        {item.leads}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#282a32]">
                      <div
                        className="h-full rounded-full bg-[#adc6ff]"
                        style={{
                          width: `${percentage}%`
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-[11px] text-[#8c909f]">
                      {Math.round(percentage)}%
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
          <div className="border-b border-[#282a32] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffb95f]/10">
                <Clock3 className="h-4 w-4 text-[#ffb95f]" />
              </div>

              <div>
                <h2 className="font-medium text-[#e2e1ed]">
                  Task Status
                </h2>

                <p className="mt-1 text-xs text-[#8c909f]">
                  Current task completion status
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#282a32]">
            {taskStats.length === 0 ? (
              <div className="flex h-48 items-center justify-center px-5">
                <p className="text-sm text-[#8c909f]">
                  No task data available
                </p>
              </div>
            ) : (
              taskStats.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#ffb95f]" />

                    <span className="text-sm text-[#c2c6d6]">
                      {formatLabel(item._id)}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-[#e2e1ed]">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
          <div className="border-b border-[#282a32] px-5 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <MessageCircle className="h-4 w-4 text-[#adc6ff]" />
              </div>

              <div>
                <h2 className="font-medium text-[#e2e1ed]">
                  Activity Breakdown
                </h2>

                <p className="mt-1 text-xs text-[#8c909f]">
                  Customer interactions by type
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#282a32]">
            {activityChartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center px-5">
                <p className="text-sm text-[#8c909f]">
                  No activity data available
                </p>
              </div>
            ) : (
              activityChartData.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#adc6ff]" />

                    <span className="text-sm text-[#c2c6d6]">
                      {item.type}
                    </span>
                  </div>

                  <span className="text-sm font-medium text-[#e2e1ed]">
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
