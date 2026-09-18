"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  Building2,
  BriefcaseBusiness,
  Search,
  User,
  UserPlus,
  X
} from "lucide-react"

interface SearchResult {
  id: string
  type: "contact" | "company" | "lead" | "deal"
  title: string
  subtitle: string
  url: string
}

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        searchCRM(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setResults([])
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  async function searchCRM(value: string) {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(value)}`
      )

      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function getIcon(type: SearchResult["type"]) {
    if (type === "contact") {
      return <User className="h-4 w-4" />
    }

    if (type === "company") {
      return <Building2 className="h-4 w-4" />
    }

    if (type === "lead") {
      return <UserPlus className="h-4 w-4" />
    }

    return <BriefcaseBusiness className="h-4 w-4" />
  }

  function handleResultClick(result: SearchResult) {
    window.location.href = result.url
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <div
        ref={searchRef}
        className="relative w-full max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search contacts, companies, leads..."
          className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-10 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-700"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {query && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
            {loading ? (
              <div className="px-4 py-4 text-sm text-zinc-500">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-sm text-zinc-500">
                No results found
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() =>
                      handleResultClick(result)
                    }
                    className="flex w-full items-center gap-3 border-b border-zinc-800 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-zinc-400">
                      {getIcon(result.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {result.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs capitalize text-zinc-600">
                        {result.type} · {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-6 flex items-center gap-4">
        <button className="relative text-zinc-500 hover:text-zinc-300">
          <Bell className="h-5 w-5" />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-zinc-400" />
        </button>

        <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
            FA
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-zinc-300">
              Furqan Ali
            </p>

            <p className="text-xs text-zinc-600">
              Sales Representative
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}