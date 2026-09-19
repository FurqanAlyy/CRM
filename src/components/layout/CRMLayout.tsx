
"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function CRMLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#11131b]">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <Navbar
        onMenuClick={() =>
          setSidebarOpen((current) => !current)
        }
      />

      <main className="lg:ml-64 pt-16">
        <div className="p-4 sm:p-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
