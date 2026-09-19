import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function CRMLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#11131b]">
      <Sidebar />

      <Navbar />

      <main className="lg:ml-64 pt-16">
        <div className="p-4 sm:p-5 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}