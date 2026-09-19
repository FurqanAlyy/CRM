
"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bell,
  Building2,
  BriefcaseBusiness,
  Check,
  Menu,
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

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({
  onMenuClick
}: NavbarProps) {
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
    <header className="fixed left-0 right-0 top-0 z-[60] flex h-16 items-center border-b border-[#282a32] bg-[#0c0e16]/95 px-3 backdrop-blur sm:px-4 lg:left-64 lg:px-6">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#8c909f] transition hover:bg-[#191b24] hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        ref={searchRef}
        className="relative w-full max-w-md"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555966]" />

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search contacts, companies, leads..."
          className="h-10 w-full rounded-xl border border-[#282a32] bg-[#191b24] pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-[#555966] focus:border-[#4b5262] focus:bg-[#1d1f28]"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555966] transition hover:text-[#c4c7d0]"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {query && (
          <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24] shadow-2xl">
            {loading ? (
              <div className="px-4 py-4 text-sm text-[#777b89]">
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-sm text-[#777b89]">
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
                    className="flex w-full items-center gap-3 border-b border-[#282a32] px-4 py-3 text-left last:border-b-0 hover:bg-[#282a32]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#282a32] text-[#8c909f]">
                      {getIcon(result.type)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#e7e8ec]">
                        {result.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs capitalize text-[#777b89]">
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

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
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
            className="relative rounded-lg p-2 text-[#777b89] transition hover:bg-[#191b24] hover:text-[#d8dbe5]"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#adc6ff] px-1 text-[10px] font-semibold text-[#11131b]">
                {unreadCount > 9
                  ? "9+"
                  : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[calc(100vw-1.5rem)] max-w-80 overflow-hidden rounded-xl border border-[#282a32] bg-[#191b24] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#282a32] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#e7e8ec]">
                    Notifications
                  </p>

                  <p className="mt-0.5 text-xs text-[#777b89]">
                    {unreadCount} unread
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs text-[#8c909f] hover:text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex h-32 items-center justify-center">
                    <p className="text-sm text-[#777b89]">
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
                        className={`w-full border-b border-[#282a32] px-4 py-3 text-left last:border-b-0 hover:bg-[#282a32] ${
                          !notification.read
                            ? "bg-[#adc6ff]/5"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#555966]">
                            {!notification.read && (
                              <span className="block h-2 w-2 rounded-full bg-[#adc6ff]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-[#d8dbe5]">
                                {notification.title}
                              </p>

                              <span className="shrink-0 text-[10px] text-[#555966]">
                                {formatNotificationDate(
                                  notification.createdAt
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-[#777b89]">
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

        <div className="flex items-center gap-3 border-l border-[#282a32] pl-2 sm:pl-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#adc6ff] text-xs font-semibold text-[#11131b]">
            FA
          </div>

          <div className="hidden xl:block">
            <p className="text-sm font-medium text-[#d8dbe5]">
              Furqan Ali
            </p>

            <p className="text-xs text-[#777b89]">
              Sales Representative
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
