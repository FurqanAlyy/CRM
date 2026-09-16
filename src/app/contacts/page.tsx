"use client"

import { useEffect, useState } from "react"
import { Plus, Search, MoreHorizontal, Users } from "lucide-react"
import AddContactModal from "@/components/contacts/AddContactModal"

interface Contact {
  _id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  status: "active" | "inactive"
  notes?: string
  company?: {
    _id: string
    name: string
  }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  async function fetchContacts() {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()

      if (response.ok) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const value = search.toLowerCase()

    return (
      contact.firstName.toLowerCase().includes(value) ||
      contact.lastName.toLowerCase().includes(value) ||
      contact.email?.toLowerCase().includes(value) ||
      contact.jobTitle?.toLowerCase().includes(value)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Contacts
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Manage your customer contacts
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
            Loading contacts...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-zinc-800 p-3">
              <Users className="h-5 w-5 text-zinc-400" />
            </div>

            <p className="text-sm font-medium text-zinc-300">
              No contacts found
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Try a different search or add a new contact.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Contact
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Job Title
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Status
                  </th>

                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody>
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-300">
                          {contact.firstName[0]}
                          {contact.lastName[0]}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {contact.firstName} {contact.lastName}
                          </p>

                          {contact.company && (
                            <p className="text-xs text-zinc-500">
                              {contact.company.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {contact.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {contact.phone || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {contact.jobTitle || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          contact.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onCreated={fetchContacts}
        />
      )}
    </div>
  )
}