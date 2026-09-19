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
  Users
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
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3
  },
  {
    name: "AI Assistant",
    href: "/ai",
    icon: Sparkles
  }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#282a32] bg-[#0c0e16] lg:flex">
        <div className="flex h-16 items-center border-b border-[#282a32] px-6">
          <Link
            href="/dashboard"
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
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555966]">
            Main
          </p>

          <div className="space-y-1">
            {navigation.slice(0, 7).map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/reports"
                ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
            }`}
          >
            <BarChart3 className="h-[18px] w-[18px] text-[#777b89] group-hover:text-[#bfc2cc]" />
            Reports
          </Link>

          <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555966]">
            Intelligence
          </p>

          <Link
            href="/ai"
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === "/ai"
                ? "bg-[#adc6ff]/10 text-[#adc6ff]"
                : "text-[#8c909f] hover:bg-[#191b24] hover:text-white"
            }`}
          >
            <Sparkles className="h-[18px] w-[18px] text-[#4edea3] group-hover:text-[#4edea3]" />

            <span>AI Assistant</span>

            <span className="ml-auto rounded-full bg-[#4edea3]/10 px-1.5 py-0.5 text-[9px] font-semibold text-[#4edea3]">
              AI
            </span>
          </Link>
        </nav>

        <div className="border-t border-[#282a32] p-3">
          <Link
            href="/settings"
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

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#282a32] bg-[#0c0e16]/95 backdrop-blur lg:hidden">
        <nav className="flex h-16 items-center justify-around overflow-x-auto px-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[64px] flex-col items-center justify-center gap-1 text-[10px] font-medium ${
                  active
                    ? "text-[#adc6ff]"
                    : "text-[#777b89]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}