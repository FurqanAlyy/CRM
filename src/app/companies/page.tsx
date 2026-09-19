"use client"

import { useEffect, useState } from "react"
import {
  Building2,
  Globe,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Users
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

  const companiesWithWebsite = companies.filter(
    (company) => company.website
  ).length

  const companiesWithEmail = companies.filter(
    (company) => company.email
  ).length

  const companiesWithPhone = companies.filter(
    (company) => company.phone
  ).length

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#e2e1ed] sm:text-3xl">
              Companies
            </h1>

            <span className="rounded-md border border-[#424754] bg-[#1d1f28] px-2 py-1 text-xs font-medium text-[#c2c6d6]">
              {companies.length} records
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c909f]">
            Manage your organizations, company information, and business relationships.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#adc6ff] px-4 py-2.5 text-sm font-semibold text-[#11131b] transition hover:bg-[#c4d6ff] lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Company
        </button>
      </div>

      {!loading && companies.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Total Companies
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {companies.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Building2 className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Organizations in your CRM
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Websites
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {companiesWithWebsite}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4edea3]/10">
                <Globe className="h-5 w-5 text-[#4edea3]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Companies with websites
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Email Contacts
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {companiesWithEmail}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb95f]/10">
                <Mail className="h-5 w-5 text-[#ffb95f]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Companies with email addresses
            </p>
          </div>

          <div className="rounded-xl border border-[#282a32] bg-[#191b24] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#8c909f]">
                  Phone Contacts
                </p>

                <p className="mt-2 text-2xl font-semibold text-[#e2e1ed]">
                  {companiesWithPhone}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#adc6ff]/10">
                <Phone className="h-5 w-5 text-[#adc6ff]" />
              </div>
            </div>

            <p className="mt-3 text-xs text-[#8c909f]">
              Companies with phone numbers
            </p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24]">
        <div className="flex flex-col gap-4 border-b border-[#282a32] p-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#e2e1ed]">
                Company Directory
              </h2>

              <span className="rounded-md bg-[#282a32] px-2 py-0.5 text-xs text-[#c2c6d6]">
                {filteredCompanies.length}
              </span>
            </div>

            <p className="mt-1 text-xs text-[#8c909f]">
              Search and manage your company records
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c909f]" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
              className="w-full rounded-lg border border-[#424754] bg-[#11131b] py-2.5 pl-9 pr-4 text-sm text-[#e2e1ed] outline-none transition placeholder:text-[#8c909f] focus:border-[#adc6ff]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#8c909f]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#424754] border-t-[#adc6ff]" />
              Loading companies...
            </div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#282a32] bg-[#11131b]">
              <Building2 className="h-6 w-6 text-[#8c909f]" />
            </div>

            <h3 className="text-sm font-semibold text-[#e2e1ed]">
              No companies found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#8c909f]">
              {search
                ? "Try changing your search."
                : "Add your first company to get started."}
            </p>

            {!search && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-[#adc6ff] transition hover:text-[#c4d6ff]"
              >
                <Plus className="h-4 w-4" />
                Add Company
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#282a32] bg-[#11131b]/40 text-left">
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Company
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Industry
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Size
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Contact
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Website
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-[#8c909f]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCompanies.map((company) => (
                  <tr
                    key={company._id}
                    className="border-b border-[#282a32]/70 last:border-0 transition hover:bg-[#282a32]/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#424754] bg-[#282a32] text-sm font-semibold text-[#adc6ff]">
                          {company.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#e2e1ed]">
                            {company.name}
                          </p>

                          {company.address && (
                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#8c909f]">
                              {company.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {company.industry ? (
                        <span className="inline-flex rounded-md border border-[#424754] bg-[#282a32]/60 px-2.5 py-1 text-xs font-medium text-[#c2c6d6]">
                          {company.industry}
                        </span>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#c2c6d6]">
                      {company.size || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {company.email ? (
                          <div className="flex max-w-[210px] items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-[#8c909f]" />
                            <span className="truncate text-sm text-[#c2c6d6]">
                              {company.email}
                            </span>
                          </div>
                        ) : null}

                        {company.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-[#8c909f]" />
                            <span className="text-xs text-[#8c909f]">
                              {company.phone}
                            </span>
                          </div>
                        ) : null}

                        {!company.email && !company.phone && (
                          <span className="text-sm text-[#8c909f]">
                            —
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {company.website ? (
                        <div className="flex max-w-[190px] items-center gap-2">
                          <Globe className="h-3.5 w-3.5 shrink-0 text-[#8c909f]" />

                          <span className="truncate text-sm text-[#adc6ff]">
                            {company.website}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8c909f]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="relative px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === company._id
                                ? null
                                : company._id
                            )
                          }
                          className="rounded-lg p-2 text-[#8c909f] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openMenu === company._id && (
                          <div className="absolute right-5 top-12 z-20 w-32 overflow-hidden rounded-lg border border-[#424754] bg-[#191b24] shadow-2xl">
                            <button
                              onClick={() => {
                                setEditingCompany(company)
                                setOpenMenu(null)
                              }}
                              className="block w-full px-4 py-2.5 text-left text-sm text-[#c2c6d6] transition hover:bg-[#282a32] hover:text-[#e2e1ed]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(company)}
                              className="block w-full px-4 py-2.5 text-left text-sm text-[#ffb4ab] transition hover:bg-red-950/30"
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

        {!loading && filteredCompanies.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#282a32] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#8c909f]">
              Showing{" "}
              <span className="font-medium text-[#c2c6d6]">
                {filteredCompanies.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#c2c6d6]">
                {companies.length}
              </span>{" "}
              companies
            </p>

            <div className="flex items-center gap-2 text-xs text-[#8c909f]">
              <Users className="h-3.5 w-3.5" />
              Company directory
            </div>
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