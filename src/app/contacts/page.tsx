"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  Check,
  Edit3,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  Users
} from "lucide-react"
import AddContactModal from "@/components/contacts/AddContactModal"
import EditContactModal from "@/components/contacts/EditContactModal"

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
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
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
      contact.jobTitle?.toLowerCase().includes(value) ||
      contact.company?.name.toLowerCase().includes(value)
    )
  })

  const activeContacts = useMemo(
    () => contacts.filter((contact) => contact.status === "active").length,
    [contacts]
  )

  const inactiveContacts = contacts.length - activeContacts

  const activePercentage =
    contacts.length > 0
      ? Math.round((activeContacts / contacts.length) * 100)
      : 0

  const inactivePercentage =
    contacts.length > 0
      ? Math.round((inactiveContacts / contacts.length) * 100)
      : 0

  async function deleteContact(contact: Contact) {
    const confirmed = window.confirm(
      `Delete ${contact.firstName} ${contact.lastName}?`
    )

    if (!confirmed) return

    const response = await fetch(`/api/contacts?id=${contact._id}`, {
      method: "DELETE"
    })

    const data = await response.json()

    if (!response.ok) {
      window.alert(data.message || "Failed to delete contact")
      return
    }

    fetchContacts()
  }

  return (
    <div className="min-h-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed]">
              Contacts
            </h1>

            <span className="rounded-full bg-[#282a32] px-2.5 py-1 text-xs font-medium text-[#adc6ff]">
              {contacts.length} records
            </span>
          </div>

          <p className="mt-1.5 text-sm text-[#8c909f]">
            Manage your customer relationships and contacts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex h-9 items-center gap-2 rounded bg-[#4d8eff] px-4 text-sm font-medium text-[#00285d] shadow-sm transition hover:bg-[#6da4ff]"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-[#191b24] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8c909f]">
              Total Directory
            </span>

            <Users className="h-[18px] w-[18px] text-[#adc6ff]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#e2e1ed]">
              {contacts.length}
            </span>

            <span className="text-xs text-[#8c909f]">
              contacts
            </span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#33343d]">
            <div className="h-full w-full rounded-full bg-[#adc6ff]" />
          </div>
        </div>

        <div className="rounded-lg bg-[#191b24] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8c909f]">
              Active Contacts
            </span>

            <Check className="h-[18px] w-[18px] text-[#4edea3]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#e2e1ed]">
              {activeContacts}
            </span>

            <span className="text-xs text-[#4edea3]">
              {activePercentage}%
            </span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#33343d]">
            <div
              className="h-full rounded-full bg-[#4edea3]"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#191b24] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8c909f]">
              Inactive Contacts
            </span>

            <Users className="h-[18px] w-[18px] text-[#8c909f]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#e2e1ed]">
              {inactiveContacts}
            </span>

            <span className="text-xs text-[#8c909f]">
              {inactivePercentage}%
            </span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#33343d]">
            <div
              className="h-full rounded-full bg-[#8c909f]"
              style={{ width: `${inactivePercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#191b24] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8c909f]">
              Search Results
            </span>

            <Search className="h-[18px] w-[18px] text-[#ffb95f]" />
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-[#e2e1ed]">
              {filteredContacts.length}
            </span>

            <span className="text-xs text-[#8c909f]">
              matching
            </span>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#33343d]">
            <div
              className="h-full rounded-full bg-[#ffb95f]"
              style={{
                width:
                  contacts.length > 0
                    ? `${Math.round(
                        (filteredContacts.length / contacts.length) * 100
                      )}%`
                    : "0%"
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="rounded-lg bg-[#191b24] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c909f]" />

            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded bg-[#1d1f28] pl-9 pr-4 text-sm text-[#e2e1ed] outline-none placeholder:text-[#8c909f] transition focus:bg-[#282a32]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded bg-[#1d1f28] p-0.5">
              <div className="rounded bg-[#282a32] px-3 py-1.5 text-xs font-medium text-[#e2e1ed]">
                All
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#c2c6d6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4edea3]" />
                Active
                <span className="text-[#8c909f]">{activeContacts}</span>
              </div>

              <div className="hidden items-center gap-1.5 px-3 py-1.5 text-xs text-[#c2c6d6] sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#8c909f]" />
                Inactive
                <span className="text-[#8c909f]">{inactiveContacts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="overflow-hidden rounded-lg bg-[#0c0e16]">
        {loading ? (
          <div className="flex h-72 items-center justify-center text-sm text-[#8c909f]">
            Loading contacts...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#282a32]">
              <Users className="h-5 w-5 text-[#8c909f]" />
            </div>

            <p className="text-sm font-medium text-[#e2e1ed]">
              No contacts found
            </p>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              Try adjusting your search or add a new contact to your directory.
            </p>

            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 rounded bg-[#4d8eff] px-4 py-2 text-sm font-medium text-[#00285d] transition hover:bg-[#6da4ff]"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="h-10 bg-[#191b24]">
                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Contact
                    </th>

                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Job Title
                    </th>

                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Company
                    </th>

                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Email
                    </th>

                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Phone
                    </th>

                    <th className="px-4 text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Status
                    </th>

                    <th className="px-4 text-right text-xs font-medium uppercase tracking-wider text-[#8c909f]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredContacts.map((contact, index) => {
                    const initials =
                      `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase()

                    return (
                      <tr
                        key={contact._id}
                        className={`group h-14 transition-colors hover:bg-[#191b24] ${
                          index % 2 === 1 ? "bg-[#0f1118]" : "bg-[#0c0e16]"
                        }`}
                      >
                        <td className="px-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#adc6ff]/15 text-xs font-semibold text-[#adc6ff]">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#e2e1ed] transition group-hover:text-[#adc6ff]">
                                {contact.firstName} {contact.lastName}
                              </p>

                              {contact.company && (
                                <p className="truncate text-xs text-[#8c909f]">
                                  {contact.company.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[180px] px-4">
                          <span className="block truncate text-sm text-[#c2c6d6]">
                            {contact.jobTitle || "—"}
                          </span>
                        </td>

                        <td className="px-4">
                          <div className="flex max-w-[150px] items-center gap-2">
                            {contact.company ? (
                              <>
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#282a32]">
                                  <Building2 className="h-3.5 w-3.5 text-[#adc6ff]" />
                                </div>

                                <span className="truncate text-sm text-[#e2e1ed]">
                                  {contact.company.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-[#8c909f]">
                                —
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="max-w-[210px] px-4">
                          {contact.email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 flex-shrink-0 text-[#8c909f]" />

                              <span className="truncate text-xs text-[#8c909f]">
                                {contact.email}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#8c909f]">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4">
                          {contact.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0 text-[#8c909f]" />

                              <span className="whitespace-nowrap text-xs text-[#8c909f]">
                                {contact.phone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#8c909f]">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                              contact.status === "active"
                                ? "bg-[#4edea3]/10 text-[#4edea3]"
                                : "bg-[#33343d] text-[#8c909f]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                contact.status === "active"
                                  ? "bg-[#4edea3]"
                                  : "bg-[#8c909f]"
                              }`}
                            />

                            {contact.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingContact(contact)}
                              title="Edit Contact"
                              className="flex h-8 w-8 items-center justify-center rounded text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#adc6ff]"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => deleteContact(contact)}
                              title="Delete Contact"
                              className="flex h-8 w-8 items-center justify-center rounded text-[#8c909f] transition hover:bg-red-950/30 hover:text-[#ffb4ab]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                            <button
                              title="More Options"
                              className="flex h-8 w-8 items-center justify-center rounded text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Contact Cards */}
            <div className="divide-y divide-[#282a32] md:hidden">
              {filteredContacts.map((contact) => {
                const initials =
                  `${contact.firstName[0] || ""}${contact.lastName[0] || ""}`.toUpperCase()

                return (
                  <div
                    key={contact._id}
                    className="bg-[#0c0e16] p-4 transition hover:bg-[#191b24]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#adc6ff]/15 text-sm font-semibold text-[#adc6ff]">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#e2e1ed]">
                            {contact.firstName} {contact.lastName}
                          </p>

                          <p className="truncate text-xs text-[#8c909f]">
                            {contact.jobTitle || "No job title"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${
                          contact.status === "active"
                            ? "bg-[#4edea3]/10 text-[#4edea3]"
                            : "bg-[#33343d] text-[#8c909f]"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {contact.company && (
                        <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {contact.company.name}
                          </span>
                        </div>
                      )}

                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}

                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#8c909f]">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#282a32] pt-3">
                      <button
                        onClick={() => setEditingContact(contact)}
                        className="flex items-center gap-1.5 rounded bg-[#282a32] px-3 py-2 text-xs text-[#c2c6d6] transition hover:text-[#adc6ff]"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteContact(contact)}
                        className="flex items-center gap-1.5 rounded bg-[#282a32] px-3 py-2 text-xs text-[#c2c6d6] transition hover:text-[#ffb4ab]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-[#282a32] bg-[#191b24] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#8c909f]">
                Showing{" "}
                <span className="font-medium text-[#e2e1ed]">
                  {filteredContacts.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#e2e1ed]">
                  {contacts.length}
                </span>{" "}
                contacts
              </p>

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-left text-xs text-[#adc6ff] hover:underline sm:text-right"
                >
                  Clear search
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onCreated={fetchContacts}
        />
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onUpdated={fetchContacts}
        />
      )}
    </div>
  )
}