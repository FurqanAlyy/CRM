"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  MoreHorizontal,
  Plus,
  Search
} from "lucide-react"
import AddCompanyModal from "@/components/companies/AddCompanyModal"
import EditCompanyModal from "@/components/companies/EditCompanyModal"

interface Company {
  _id: string
  name: string
  website?: string
  industry?: string
  size?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies")
      const data = await response.json()

      if (response.ok) {
        setCompanies(data.companies)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(company: Company) {
    const confirmed = window.confirm(
      `Delete ${company.name}?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(
        `/api/companies?id=${company._id}`,
        {
          method: "DELETE"
        }
      )

      const data = await response.json()

      if (!response.ok) {
        window.alert(data.message || "Failed to delete company")
        return
      }

      setOpenMenu(null)
      fetchCompanies()
    } catch {
      window.alert("Something went wrong")
    }
  }

  const filteredCompanies = companies.filter((company) => {
    const value = search.toLowerCase()

    return (
      company.name.toLowerCase().includes(value) ||
      company.industry?.toLowerCase().includes(value) ||
      company.email?.toLowerCase().includes(value) ||
      company.website?.toLowerCase().includes(value)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Companies
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage companies and organizations
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          <p className="text-sm text-zinc-500">
            {filteredCompanies.length} companies
          </p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-zinc-500">
            Loading companies...
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <Building2 className="h-6 w-6 text-zinc-500" />
            </div>

            <h3 className="text-sm font-medium text-white">
              No companies found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {search
                ? "Try changing your search."
                : "Add your first company to get started."}
            </p>

            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-sm font-medium text-white hover:underline"
              >
                Add Company
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-zinc-800 text-left">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Company
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Industry
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Size
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Phone
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCompanies.map((company) => (
                  <tr
                    key={company._id}
                    className="border-b border-zinc-800/70 last:border-0 hover:bg-zinc-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
                          {company.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-white">
                            {company.name}
                          </p>

                          {company.website && (
                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-zinc-500">
                              {company.website}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {company.industry || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {company.size || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {company.email || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {company.phone || "—"}
                    </td>

                    <td className="relative px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === company._id
                                ? null
                                : company._id
                            )
                          }
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenu === company._id && (
                          <div className="absolute right-6 top-12 z-20 w-32 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
                            <button
                              onClick={() => {
                                setEditingCompany(company)
                                setOpenMenu(null)
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(company)}
                              className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-950/30"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddCompanyModal
          onClose={() => setShowModal(false)}
          onCreated={fetchCompanies}
        />
      )}

      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onUpdated={fetchCompanies}
        />
      )}
    </div>
  )
}