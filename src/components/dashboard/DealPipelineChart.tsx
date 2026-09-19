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
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[#282a32] bg-[#11131b]">
        <div className="text-center">
          <p className="text-sm font-medium text-[#8c909f]">
            No deal data available
          </p>

          <p className="mt-1 text-xs text-[#555966]">
            Deal pipeline data will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-72 w-full">
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
            stroke="#282a32"
            vertical={false}
          />

          <XAxis
            dataKey="stage"
            tick={{
              fill: "#777b89",
              fontSize: 11
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />

          <YAxis
            tick={{
              fill: "#777b89",
              fontSize: 10
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `$${Number(value).toLocaleString()}`
            }
            width={65}
          />

          <Tooltip
            cursor={{
              fill: "rgba(173, 198, 255, 0.04)"
            }}
            contentStyle={{
              backgroundColor: "#191b24",
              border: "1px solid #3b3e49",
              borderRadius: "10px",
              color: "#fff",
              boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
            }}
            labelStyle={{
              color: "#e7e8ec",
              marginBottom: "4px"
            }}
            formatter={(value) => [
              `$${Number(value).toLocaleString()}`,
              "Value"
            ]}
          />

          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            fill="#adc6ff"
            maxBarSize={42}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}