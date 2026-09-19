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
  "#adc6ff",
  "#4edea3",
  "#ffb95f",
  "#8c909f",
  "#4d8eff"
]

export default function LeadChart({
  data
}: LeadChartProps) {
  const chartData = data.map((item) => ({
    name: item._id
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ),
    value: item.count
  }))

  const totalLeads = chartData.reduce(
    (total, item) => total + item.value,
    0
  )

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[#282a32] bg-[#11131b]">
        <div className="text-center">
          <p className="text-sm font-medium text-[#8c909f]">
            No lead data available
          </p>

          <p className="mt-1 text-xs text-[#555966]">
            Lead distribution will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-72 flex-col items-center justify-center gap-5 sm:flex-row">
      <div className="relative h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
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
                backgroundColor: "#191b24",
                border: "1px solid #3b3e49",
                borderRadius: "10px",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
              }}
              itemStyle={{
                color: "#f4f4f6"
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white">
            {totalLeads}
          </span>

          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-[#777b89]">
            Total Leads
          </span>
        </div>
      </div>

      <div className="w-full max-w-[180px] space-y-3">
        {chartData.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[index % COLORS.length]
                }}
              />

              <span className="truncate text-xs capitalize text-[#a9acb6]">
                {item.name}
              </span>
            </div>

            <span className="text-xs font-medium text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}