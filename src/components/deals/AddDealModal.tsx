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
  status: string
}

interface AddDealModalProps {
  onClose: () => void
  onCreated: () => void
}

export default function AddDealModal({
  onClose,
  onCreated
}: AddDealModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [leads, setLeads] = useState<Lead[]>([])

  const [form, setForm] = useState({
    title: "",
    contact: "",
    company: "",
    lead: "",
    amount: "",
    stage: "prospecting",
    probability: "",
    expectedCloseDate: "",
    notes: ""
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContacts()
    fetchCompanies()
    fetchLeads()
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

  async function fetchLeads() {
    try {
      const response = await fetch("/api/leads")
      const data = await response.json()

      if (response.ok) {
        setLeads(data.leads)
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
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          probability: form.probability
            ? Number(form.probability)
            : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to create deal")
        return
      }

      onCreated()
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
              Add Deal
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Create a new sales opportunity
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
              Deal title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Website redesign project"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Lead
              </label>

              <select
                name="lead"
                value={form.lead}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              >
                <option value="">No lead</option>

                {leads.map((lead) => (
                  <option
                    key={lead._id}
                    value={lead._id}
                  >
                    {lead.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">
                Deal amount
              </label>

              <input
                name="amount"
                type="number"
                min="0"
                required
                value={form.amount}
                onChange={handleChange}
                placeholder="10000"
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
              Pipeline stage
            </label>

            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
            >
              <option value="prospecting">
                Prospecting
              </option>

              <option value="qualification">
                Qualification
              </option>

              <option value="proposal">
                Proposal
              </option>

              <option value="negotiation">
                Negotiation
              </option>

              <option value="closed_won">
                Closed Won
              </option>

              <option value="closed_lost">
                Closed Lost
              </option>
            </select>
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
              placeholder="Add notes about this deal..."
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
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

              {loading ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}