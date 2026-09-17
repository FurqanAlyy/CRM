"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"

interface Deal {
  _id: string
  title: string
  contact?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  company?: {
    _id: string
    name: string
  }
  lead?: {
    _id: string
    title: string
    status: string
  }
  amount: number
  stage:
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "closed_won"
    | "closed_lost"
  probability?: number
  expectedCloseDate?: string
  notes?: string
}

interface DealPipelineProps {
  deals: Deal[]
  onStageChange: (
    dealId: string,
    stage: Deal["stage"]
  ) => Promise<void>
  onEdit: (deal: Deal) => void
}

const stages: {
  key: Deal["stage"]
  label: string
}[] = [
  {
    key: "prospecting",
    label: "Prospecting"
  },
  {
    key: "qualification",
    label: "Qualification"
  },
  {
    key: "proposal",
    label: "Proposal"
  },
  {
    key: "negotiation",
    label: "Negotiation"
  },
  {
    key: "closed_won",
    label: "Closed Won"
  },
  {
    key: "closed_lost",
    label: "Closed Lost"
  }
]

export default function DealPipeline({
  deals,
  onStageChange,
  onEdit
}: DealPipelineProps) {
  const [draggedDeal, setDraggedDeal] =
    useState<string | null>(null)

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(amount)
  }

  function handleDragStart(dealId: string) {
    setDraggedDeal(dealId)
  }

  function handleDragOver(
    e: React.DragEvent<HTMLDivElement>
  ) {
    e.preventDefault()
  }

  async function handleDrop(
    stage: Deal["stage"]
  ) {
    if (!draggedDeal) {
      return
    }

    const deal = deals.find(
      (item) => item._id === draggedDeal
    )

    if (!deal || deal.stage === stage) {
      setDraggedDeal(null)
      return
    }

    await onStageChange(draggedDeal, stage)

    setDraggedDeal(null)
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="grid min-w-[1500px] grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter(
            (deal) => deal.stage === stage.key
          )

          const stageValue = stageDeals.reduce(
            (total, deal) => total + deal.amount,
            0
          )

          return (
            <div
              key={stage.key}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.key)}
              className="min-h-[500px] rounded-xl border border-zinc-800 bg-zinc-950/50"
            >
              <div className="border-b border-zinc-800 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">
                    {stage.label}
                  </h3>

                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                    {stageDeals.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-600">
                  {formatAmount(stageValue)}
                </p>
              </div>

              <div className="space-y-3 p-3">
                {stageDeals.map((deal) => (
                  <div
                    key={deal._id}
                    draggable
                    onDragStart={() =>
                      handleDragStart(deal._id)
                    }
                    onDoubleClick={() => onEdit(deal)}
                    className="cursor-grab rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm transition hover:border-zinc-700 active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-white">
                        {deal.title}
                      </h4>

                      <button
                        onClick={() => onEdit(deal)}
                        className="rounded-md p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {deal.company && (
                      <p className="mt-2 text-xs text-zinc-500">
                        {deal.company.name}
                      </p>
                    )}

                    {deal.contact && (
                      <p className="mt-1 text-xs text-zinc-600">
                        {deal.contact.firstName}{" "}
                        {deal.contact.lastName}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                      <span className="text-sm font-medium text-zinc-200">
                        {formatAmount(deal.amount)}
                      </span>

                      {deal.probability !== undefined && (
                        <span className="text-xs text-zinc-500">
                          {deal.probability}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-zinc-800">
                    <p className="text-xs text-zinc-600">
                      Drop deals here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}