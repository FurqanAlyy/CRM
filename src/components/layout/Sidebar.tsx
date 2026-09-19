
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BarChart3,
  Building2,
  CheckSquare,
  Handshake,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  Users,
  X
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users
  },
  {
    name: "Companies",
    href: "/companies",
    icon: Building2
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Target
  },
  {
    name: "Deals",
    href: "/deals",
    icon: Handshake
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare
  },
  {
    name: "Activities",
    href: "/activities",
    icon: Activity
  }
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({
  open,
  onClose
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {open && (
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#282a32] bg-[#0c0e16] transition-transform duration-300 ease-in-out lg:z-40 lg:w-64 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#282a32] px-6">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#adc6ff]">
              <span className="text-sm font-bold text-[#11131b]">
                C
              </span>
            </div>

            <span className="text-lg font-semibold tracking-tight text-white">
              CRM
            </span>
          </Link>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#777b89] transition hover:bg-[#191b24] hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555966]">
            Main
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                      : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${
                      active
                        ? "text-[#adc6ff]"
                        : "text-[#777b89] group-hover:text-[#bfc2cc]"
                    }`}
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#adc6ff]" />
                  )}
                </Link>
              )
            })}
          </div>

          <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555966]">
            Analytics
          </p>

          <Link
            href="/reports"
            onClick={onClose}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/reports"
                ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
            }`}
          >
            <BarChart3
              className={`h-[18px] w-[18px] ${
                pathname === "/reports"
                  ? "text-[#adc6ff]"
                  : "text-[#777b89] group-hover:text-[#bfc2cc]"
              }`}
            />

            <span>Reports</span>

            {pathname === "/reports" && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#adc6ff]" />
            )}
          </Link>

          <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555966]">
            Intelligence
          </p>

          <Link
            href="/ai"
            onClick={onClose}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/ai"
                ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
            }`}
          >
            <Sparkles
              className={`h-[18px] w-[18px] ${
                pathname === "/ai"
                  ? "text-[#adc6ff]"
                  : "text-[#4edea3]"
              }`}
            />

            <span>AI Assistant</span>

            <span className="ml-auto rounded-full bg-[#4edea3]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#4edea3]">
              AI
            </span>
          </Link>
        </nav>

        <div className="shrink-0 border-t border-[#282a32] p-3">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/settings"
                ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </Link>
        </div>
      </aside>
    </>
  )
}
