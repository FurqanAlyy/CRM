import type { Metadata } from "next"
import "./globals.css"
import CRMLayout from "@/components/layout/CRMLayout"

export const metadata: Metadata = {
  title: "CRM",
  description: "Customer Relationship Management System"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CRMLayout>{children}</CRMLayout>
      </body>
    </html>
  )
}