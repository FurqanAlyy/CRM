import { Search, Bell } from "lucide-react"

export default function Navbar() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div className="relative w-80">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-400 focus:bg-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white">
            FA
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-900">
              User
            </p>

            <p className="text-xs text-zinc-500">
              Sales Representative
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}