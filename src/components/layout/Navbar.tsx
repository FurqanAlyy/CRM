"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  Building2,
  BriefcaseBusiness,
  Check,
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

interface Notification {
  _id: string
  title: string
  message: string
  type: "task" | "deal" | "lead" | "system"
  read: boolean
  link?: string
  createdAt: string
}

export default function Navbar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const [notifications, setNotifications] =
    useState<Notification[]>([])

  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] =
    useState(false)

  const searchRef = useRef<HTMLDivElement>(null)
  const notificationRef =
    useRef<HTMLDivElement>(null)

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
    fetchNotifications()

    const interval = setInterval(
      fetchNotifications,
      60000
    )

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setResults([])
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false)
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

  async function fetchNotifications() {
    try {
      const response = await fetch(
        "/api/notifications"
      )

      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {
      setNotifications([])
    }
  }

  async function markAsRead(id: string) {
    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id
          })
        }
      )

      if (response.ok) {
        setNotifications((current) =>
          current.map((notification) =>
            notification._id === id
              ? {
                  ...notification,
                  read: true
                }
              : notification
          )
        )

        setUnreadCount((count) =>
          Math.max(0, count - 1)
        )
      }
    } catch {
      return
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            markAllRead: true
          })
        }
      )

      if (response.ok) {
        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            read: true
          }))
        )

        setUnreadCount(0)
      }
    } catch {
      return
    }
  }

  function handleNotificationClick(
    notification: Notification
  ) {
    if (!notification.read) {
      markAsRead(notification._id)
    }

    setShowNotifications(false)

    if (notification.link) {
      window.location.href =
        notification.link
    }
  }

  function getIcon(
    type: SearchResult["type"]
  ) {
    if (type === "contact") {
      return <User className="h-4 w-4" />
    }

    if (type === "company") {
      return <Building2 className="h-4 w-4" />
    }

    if (type === "lead") {
      return <UserPlus className="h-4 w-4" />
    }

    return (
      <BriefcaseBusiness className="h-4 w-4" />
    )
  }

  function formatNotificationDate(
    date: string
  ) {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric"
      }
    )
  }

  function handleResultClick(
    result: SearchResult
  ) {
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
                        {result.type} ·{" "}
                        {result.subtitle}
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
        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            onClick={() =>
              setShowNotifications(
                (current) => !current
              )
            }
            className="relative text-zinc-500 hover:text-zinc-300"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-200 px-1 text-[10px] font-medium text-zinc-900">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    Notifications
                  </p>

                  <p className="mt-0.5 text-xs text-zinc-600">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex h-32 items-center justify-center">
                    <p className="text-sm text-zinc-600">
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        key={notification._id}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`w-full border-b border-zinc-800 px-4 py-3 text-left last:border-b-0 hover:bg-zinc-800 ${
                          !notification.read
                            ? "bg-zinc-800/40"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-400">
                            {!notification.read && (
                              <span className="block h-2 w-2 rounded-full bg-zinc-200" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-zinc-300">
                                {notification.title}
                              </p>

                              <span className="shrink-0 text-[10px] text-zinc-600">
                                {formatNotificationDate(
                                  notification.createdAt
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

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