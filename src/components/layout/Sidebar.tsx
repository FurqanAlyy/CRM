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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <Link href="/dashboard" className="text-xl font-semibold tracking-tight text-zinc-900">
          CRM
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  )
}