"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, User, MessageCircle, Bell, Users, Home, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/components/auth-provider"

interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  type: string
  url: string
}

interface Notification {
  id: number
  type: string
  message: string
  timestamp: string
  read: boolean
  avatar: string
}

interface Message {
  id: number
  sender: string
  message: string
  timestamp: string
  read: boolean
  avatar: string
}

export default function Header() {
  const { user, loading, logout } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    setNotificationsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Fetch messages
  const fetchMessages = async () => {
    if (!user) return
    setMessagesLoading(true)
    try {
      const response = await fetch("/api/messages")
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // Handle search
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setSearchLoading(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
          const results = await response.json()
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setSearchLoading(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowResults(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 max-w-md mx-8">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Navigation Icons - Left */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/home">
                  <Button variant="ghost" size="sm" className="relative">
                    <Home className="h-5 w-5" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">ملف بياناتك الشخصية</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/member">متابعتك</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>محفوظاتك</DropdownMenuItem>
                    <DropdownMenuItem>كُن شريك التجمع</DropdownMenuItem>
                    <DropdownMenuItem>انضم لفريق التجمع</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">الإعدادات</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل خروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && fetchMessages()}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <MessageCircle className="h-5 w-5" />
                      {unreadMessages > 0 && <span className="badge-notification">{unreadMessages}</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">مراسلتك</h3>
                      {messagesLoading ? (
                        <p className="text-sm text-gray-500">جاري التحميل...</p>
                      ) : messages.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex items-start gap-3 p-2 rounded ${!message.read ? "bg-blue-50" : ""}`}
                            >
                              <img
                                src={message.avatar || "/placeholder.svg"}
                                alt={message.sender}
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{message.sender}</p>
                                <p className="text-xs text-gray-600 truncate">{message.message}</p>
                                <p className="text-xs text-gray-400">{message.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">ليس عندك أي رسائل</p>
                      )}
                    </div>
                    <div className="border-t p-2">
                      <Link href="/messages">
                        <Button variant="ghost" size="sm" className="w-full">
                          عرض جميع الرسائل
                        </Button>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadNotifications > 0 && <span className="badge-notification">{unreadNotifications}</span>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">الإشعارات</h3>
                      {notificationsLoading ? (
                        <p className="text-sm text-gray-500">جاري التحميل...</p>
                      ) : notifications.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-2 rounded ${!notification.read ? "bg-blue-50" : ""}`}
                            >
                              <img
                                src={notification.avatar || "/placeholder.svg"}
                                alt="User"
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-400">{notification.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">ليس عندك أي إشعارات</p>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Users className="h-5 w-5" />
                      <span className="badge-notification">9</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-80">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">أصدقاء أمازيغ</h3>
                      <p className="text-sm text-gray-500">يوجد 10 أصدقاء جديد</p>
                    </div>
                    <div className="border-t p-2">
                      <Link href="/friends">
                        <Button variant="ghost" size="sm" className="w-full">
                          عرض جميع الأصدقاء
                        </Button>
                      </Link>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">إنشاء حساب</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="أبحث في الامازيغية هويتنا"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 pl-8 text-right"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-4 text-center text-gray-500">جاري البحث...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => setShowResults(false)}
                        className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {result.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm line-clamp-1 mb-1">{result.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{result.content}</p>
                            <p className="text-xs text-gray-500">بواسطة {result.author}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">لا توجد نتائج للبحث</div>
                )}
              </div>
            )}
          </div>

          {/* Logo and Site Name - Right */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-10 w-auto" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
