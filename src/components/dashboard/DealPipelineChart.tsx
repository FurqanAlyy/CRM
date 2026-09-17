"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface DealPipelineChartProps {
  data: {
    _id: string
    count: number
    value: number
  }[]
}

export default function DealPipelineChart({
  data
}: DealPipelineChartProps) {
  const chartData = data.map((item) => ({
    stage: item._id
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ),
    value: item.value,
    deals: item.count
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-600">
          No deal data available
        </p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 5
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
          />

          <XAxis
            dataKey="stage"
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
            tickFormatter={(value) =>
              `$${value.toLocaleString()}`
            }
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px"
            }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Value"
            ]}
          />

          <Bar
            dataKey="value"
            radius={[5, 5, 0, 0]}
            fill="#a1a1aa"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}