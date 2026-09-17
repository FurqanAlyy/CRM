"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface LeadChartProps {
  data: {
    _id: string
    count: number
  }[]
}

const COLORS = [
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#52525b",
  "#3f3f46"
]

export default function LeadChart({
  data
}: LeadChartProps) {
  const chartData = data.map((item) => ({
    name: item._id.replace("_", " "),
    value: item.count
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-zinc-600">
          No lead data available
        </p>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              color: "#fff"
            }}
            itemStyle={{
              color: "#fff"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}