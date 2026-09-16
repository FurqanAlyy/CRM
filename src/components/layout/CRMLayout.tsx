import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function CRMLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}