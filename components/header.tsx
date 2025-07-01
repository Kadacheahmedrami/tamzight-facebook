"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, User, MessageCircle, Bell, Users, Home, X, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    setMobileMenuOpen(false)
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length

  if (loading) {
    return (
      <header className="bg-gradient-to-r from-blue-600 via-teal-600 to-green-600 border-b border-blue-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="flex-1 max-w-md mx-4 sm:mx-8">
              <div className="h-8 sm:h-10 bg-white/20 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center">
              <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-8 sm:h-10 w-auto" />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-gradient-to-r to-blue-600 via-teal-600 from-green-600 border-b border-blue-300 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu Button & Navigation - Left */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                {/* Mobile Menu */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20 hover:text-white">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 p-0">
                      <div className="flex flex-col h-full">
                        {/* Custom close button on the left */}
                        <div className="absolute left-4 top-4 z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMobileMenuOpen(false)}
                            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">إغلاق</span>
                          </Button>
                        </div>

                        {/* User Profile Section */}
                        <div className="p-4 pt-12 border-b bg-gradient-to-r from-blue-600 to-green-600 text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-blue-100">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex-1 p-4 space-y-2">
                          <Link href="/home" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-lg p-3 flex items-center gap-3 transition-all">
                            <Home className="h-5 w-5" />
                            <span>الصفحة الرئيسية</span>
                          </Link>
                          <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item text-teal-700 hover:bg-teal-50 hover:text-teal-800 rounded-lg p-3 flex items-center gap-3 transition-all">
                            <User className="h-5 w-5" />
                            <span>ملفي الشخصي</span>
                          </Link>
                          <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item text-green-700 hover:bg-green-50 hover:text-green-800 rounded-lg p-3 flex items-center gap-3 transition-all">
                            <MessageCircle className="h-5 w-5" />
                            <span>الرسائل</span>
                            {unreadMessages > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadMessages}
                              </span>
                            )}
                          </Link>
                          <Link href="/friends" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item text-amber-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg p-3 flex items-center gap-3 transition-all">
                            <Users className="h-5 w-5" />
                            <span>الأصدقاء</span>
                          </Link>
                          <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item text-slate-700 hover:bg-slate-50 hover:text-slate-800 rounded-lg p-3 flex items-center gap-3 transition-all">
                            <User className="h-5 w-5" />
                            <span>الإعدادات</span>
                          </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="p-4 border-t">
                          <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full text-red-600 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400"
                          >
                            <LogOut className="h-4 w-4 ml-2" />
                            تسجيل خروج
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/home">
                    <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20 hover:text-white transition-colors border border-white/20 hover:border-white/40">
                      <Home className="h-5 w-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20 hover:text-white transition-colors border border-white/20 hover:border-white/40">
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
                        <h3 className="font-semibold mb-2">ملف بياناتك الشخصية</h3>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-blue-100">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <DropdownMenuItem asChild className="text-blue-700 hover:bg-blue-100">
                        <Link href="/member">متابعتك</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-teal-700 hover:bg-teal-100">محفوظاتك</DropdownMenuItem>
                      <DropdownMenuItem className="text-green-700 hover:bg-green-100">كُن شريك التجمع</DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-700 hover:bg-amber-100">انضم لفريق التجمع</DropdownMenuItem>
                      <DropdownMenuItem asChild className="text-slate-700 hover:bg-slate-100">
                        <Link href="/settings">الإعدادات</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-100">
                        <LogOut className="h-4 w-4 ml-2" />
                        تسجيل خروج
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu onOpenChange={(open) => open && fetchMessages()}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20 hover:text-white transition-colors border border-white/20 hover:border-white/40">
                        <MessageCircle className="h-5 w-5" />
                        {unreadMessages > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">{unreadMessages}</span>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
                      <div className="p-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                        <h3 className="font-semibold mb-2">مراسلتك</h3>
                        {messagesLoading ? (
                          <p className="text-sm text-green-100">جاري التحميل...</p>
                        ) : messages.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex items-start gap-3 p-2 rounded ${!message.read ? "bg-white/20" : "bg-white/10"}`}
                              >
                                <img
                                  src={message.avatar || "/placeholder.svg"}
                                  alt={message.sender}
                                  className="w-8 h-8 rounded-full border border-white/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{message.sender}</p>
                                  <p className="text-xs text-green-100 truncate">{message.message}</p>
                                  <p className="text-xs text-green-200">{message.timestamp}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-green-100">ليس عندك أي رسائل</p>
                        )}
                      </div>
                      <div className="border-t border-green-200 p-2">
                        <Link href="/messages">
                          <Button variant="ghost" size="sm" className="w-full text-green-700 hover:bg-green-100">
                            عرض جميع الرسائل
                          </Button>
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20 hover:text-white transition-colors border border-white/20 hover:border-white/40">
                        <Bell className="h-5 w-5" />
                        {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">{unreadNotifications}</span>}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                      <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
                        <h3 className="font-semibold mb-2">الإشعارات</h3>
                        {notificationsLoading ? (
                          <p className="text-sm text-amber-100">جاري التحميل...</p>
                        ) : notifications.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`flex items-start gap-3 p-2 rounded ${!notification.read ? "bg-white/20" : "bg-white/10"}`}
                              >
                                <img
                                  src={notification.avatar || "/placeholder.svg"}
                                  alt="User"
                                  className="w-8 h-8 rounded-full border border-white/30"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white">{notification.message}</p>
                                  <p className="text-xs text-amber-200">{notification.timestamp}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-amber-100">ليس عندك أي إشعارات</p>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20 hover:text-white transition-colors border border-white/20 hover:border-white/40">
                        <Users className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">9</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
                      <div className="p-4 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
                        <h3 className="font-semibold mb-2">أصدقاء أمازيغ</h3>
                        <p className="text-sm text-blue-100">يوجد 10 أصدقاء جديد</p>
                      </div>
                      <div className="border-t border-blue-200 p-2">
                        <Link href="/friends">
                          <Button variant="ghost" size="sm" className="w-full text-blue-700 hover:bg-blue-100">
                            عرض جميع الأصدقاء
                          </Button>
                        </Link>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Quick Actions */}
                <div className="md:hidden flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="relative p-2 text-white hover:bg-white/20 hover:text-white" onClick={() => fetchNotifications()}>
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-white">
                        {unreadNotifications}
                      </span>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" className="relative p-2 text-white hover:bg-white/20 hover:text-white" onClick={() => fetchMessages()}>
                    <MessageCircle className="h-4 w-4" />
                    {unreadMessages > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center border border-white">
                        {unreadMessages}
                      </span>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-md">
                    إنشاء حساب
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-2 sm:mx-8 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                type="text"
                placeholder="أبحث في الامازيغية هويتنا"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 sm:pr-10 pl-6 sm:pl-8 text-right text-sm sm:text-base h-8 sm:h-10 form-input-mobile bg-white/90 border-white/30 focus:bg-white focus:border-blue-300 placeholder:text-blue-400"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-600"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-blue-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-4 text-center text-blue-600 text-sm">جاري البحث...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        onClick={() => setShowResults(false)}
                        className="block px-3 sm:px-4 py-2 sm:py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 border-b border-blue-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-gradient-to-r from-blue-500 to-teal-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                                {result.type}
                              </span>
                            </div>
                            <h4 className="font-medium text-xs sm:text-sm line-clamp-1 mb-1 text-blue-900">{result.title}</h4>
                            <p className="text-xs text-teal-700 line-clamp-2 mb-1">{result.content}</p>
                            <p className="text-xs text-amber-600">بواسطة {result.author}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-blue-600 text-sm">لا توجد نتائج للبحث</div>
                )}
              </div>
            )}
          </div>

          {/* Logo and Site Name - Right */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/" className="flex items-center">
              <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-8 sm:h-10 w-auto drop-shadow-md" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}