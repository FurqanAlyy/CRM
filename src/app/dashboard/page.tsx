import CRMLayout from "@/components/layout/CRMLayout"

const stats = [
  {
    title: "Total Contacts",
    value: "1,248"
  },
  {
    title: "Active Leads",
    value: "86"
  },
  {
    title: "Open Deals",
    value: "32"
  },
  {
    title: "Pipeline Value",
    value: "$248,500"
  }
]

export default function DashboardPage() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Overview of your sales activity and pipeline.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <p className="text-sm text-zinc-500">
                {stat.title}
              </p>

              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-semibold text-zinc-900">
              Deals by Stage
            </h2>

            <div className="mt-6 flex h-64 items-center justify-center text-sm text-zinc-400">
              Chart will be added later
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="font-semibold text-zinc-900">
              Recent Activities
            </h2>

            <div className="mt-6 space-y-4">
              <div className="border-b border-zinc-100 pb-4">
                <p className="text-sm font-medium text-zinc-900">
                  Proposal sent to Acme Corp
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  2 hours ago
                </p>
              </div>

              <div className="border-b border-zinc-100 pb-4">
                <p className="text-sm font-medium text-zinc-900">
                  Follow-up call with Sarah
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  5 hours ago
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-900">
                  New lead added
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Yesterday
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CRMLayout>
  )
}