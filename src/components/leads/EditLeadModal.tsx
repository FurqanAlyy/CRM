"use client"

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"

interface Contact {
  _id: string
  firstName: string
  lastName: string
}

interface Company {
  _id: string
  name: string
}

interface Lead {
  _id: string
  title: string
  contact?: {
    _id: string
    firstName: string
    lastName: string
  }
  company?: {
    _id: string
    name: string
  }
  source?: string
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted"
  value?: number
  probability?: number
  expectedCloseDate?: string
  notes?: string
}

interface EditLeadModalProps {
  lead: Lead
  onClose: () => void
  onUpdated: () => void
}

export default function EditLeadModal({
  lead,
  onClose,
  onUpdated
}: EditLeadModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])

  const [form, setForm] = useState({
    title: lead.title,
    contact: lead.contact?._id || "",
    company: lead.company?._id || "",
    source: lead.source || "",
    status: lead.status,
    value: lead.value?.toString() || "",
    probability: lead.probability?.toString() || "",
    expectedCloseDate: lead.expectedCloseDate
      ? new Date(lead.expectedCloseDate)
          .toISOString()
          .split("T")[0]
      : "",
    notes: lead.notes || ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
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
    }
  }

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      const data = await response.json()

      if (response.ok) {
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error(error)
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: lead._id,
          ...form,
          value: form.value
            ? Number(form.value)
            : undefined,
          probability: form.probability
            ? Number(form.probability)
            : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to update lead")
        return
      }

      onUpdated()
      onClose()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Edit Lead
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Update lead information
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Lead title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Contact
              </label>

              <select
                name="contact"
                value={form.contact}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              >
                <option value="">No contact</option>

                {contacts.map((contact) => (
                  <option
                    key={contact._id}
                    value={contact._id}
                  >
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Company
              </label>

              <select
                name="company"
                value={form.company}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              >
                <option value="">No company</option>

                {companies.map((company) => (
                  <option
                    key={company._id}
                    value={company._id}
                  >
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Lead source
              </label>

              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              >
                <option value="">Select source</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Email">Email</option>
                <option value="Social Media">Social Media</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Potential value
              </label>

              <input
                name="value"
                type="number"
                min="0"
                value={form.value}
                onChange={handleChange}
                placeholder="5000"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Probability %
              </label>

              <input
                name="probability"
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={handleChange}
                placeholder="50"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Expected close
              </label>

              <input
                name="expectedCloseDate"
                type="date"
                value={form.expectedCloseDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}