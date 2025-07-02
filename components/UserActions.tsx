"use client"

import { useState } from "react"
import Link from "next/link"
import { CircleUserRoundIcon, MessageCircle, BellRing, Users, House, X, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuthContext } from "@/components/auth-provider"

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

interface UserActionsProps {
  user: any
  loginEmail: string
  setLoginEmail: (email: string) => void
  loginPassword: string
  setLoginPassword: (password: string) => void
  handleLogin: (e: React.FormEvent) => void
}

export default function UserActions({ 
  user, 
  loginEmail, 
  setLoginEmail, 
  loginPassword, 
  setLoginPassword, 
  handleLogin 
}: UserActionsProps) {
  const { logout } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 text-blue-600 hover:bg-blue-50">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Custom close button */}
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
                  <div className="p-4 pt-12 border-b bg-blue-600 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <CircleUserRoundIcon className="h-6 w-6" />
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
                   
                    <Link href="/member" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 hover:bg-blue-50 rounded-lg p-3 flex items-center gap-3 transition-all">
                      <CircleUserRoundIcon className="h-5 w-5" />
                      <span>ملفي الشخصي</span>
                    </Link>
                    <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 hover:bg-blue-50 rounded-lg p-3 flex items-center gap-3 transition-all">
                      <MessageCircle className="h-5 w-5 fill-current" />
                      <span>الرسائل</span>
                      {unreadMessages > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadMessages}
                        </span>
                      )}
                    </Link>
                    <Link href="/friends" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 hover:bg-blue-50 rounded-lg p-3 flex items-center gap-3 transition-all">
                      <Users className="h-5 w-5 fill-current" />
                      <span>الأصدقاء</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="p-4 border-t">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل خروج
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Profile Icon */}
            <div className="group relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-blue-600 hover:bg-blue-50 p-0"
              >
                <CircleUserRoundIcon className="h-6 w-6" />
              </Button>
              
              {/* Hover Dropdown for Profile */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-blue-600 text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">ملف بياناتك الشخصية</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CircleUserRoundIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-blue-100">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link href="/member" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">متابعتك</Link>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">محفوظاتك</div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">كُن شريك التجمع</div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">انضم لفريق التجمع</div>
                  <div onClick={handleLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer transition-colors flex items-center">
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل خروج
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Icon */}
            <div className="group relative" onMouseEnter={fetchMessages}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-blue-600 hover:bg-blue-50 p-0"
              >
                <MessageCircle className="h-6 w-6 fill-current" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Button>
              
              {/* Hover Dropdown for Messages */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-green-600 text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">مراسلتك</h3>
                  {messagesLoading ? (
                    <p className="text-sm">جاري التحميل...</p>
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
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.sender}</p>
                            <p className="text-xs truncate">{message.message}</p>
                            <p className="text-xs opacity-75">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">ليس عندك أي رسائل</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications Icon */}
            <div className="group relative" onMouseEnter={fetchNotifications}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-blue-600 hover:bg-blue-50 p-0"
              >
                <BellRing className="h-6 w-6 fill-current" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              
              {/* Hover Dropdown for Notifications */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-orange-600 text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">الإشعارات</h3>
                  {notificationsLoading ? (
                    <p className="text-sm">جاري التحميل...</p>
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
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs opacity-75">{notification.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">ليس عندك أي إشعارات</p>
                  )}
                </div>
              </div>
            </div>

            {/* Friends Icon */}
            <div className="group relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-blue-600 hover:bg-blue-50 p-0"
              >
                <Users className="h-6 w-6 fill-current" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  9
                </span>
              </Button>
              
              {/* Hover Dropdown for Friends */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-blue-600 text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">أصدقاء أمازيغ</h3>
                  <p className="text-sm">يوجد 10 أصدقاء جديد</p>
                </div>
                <div className="p-2">
                  <Link href="/friends" className="block w-full p-2 text-sm text-center hover:bg-gray-50 rounded transition-colors">
                    عرض جميع الأصدقاء
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Icons */}
          <div className="md:hidden flex items-center gap-1">
            <Button variant="ghost" size="sm" className="relative p-2 text-blue-600 hover:bg-blue-50">
              <BellRing className="h-4 w-4 fill-current" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="relative p-2 text-blue-600 hover:bg-blue-50">
              <MessageCircle className="h-4 w-4 fill-current" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Button>
          </div>
        </>
      ) : (
        /* Authentication Form - When user is not authenticated */
        <div className="flex items-center gap-2">
          {/* Desktop Login Form */}
          <div className="hidden md:flex items-center gap-2">
            <form onSubmit={handleLogin} className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-40 h-8 text-sm text-right"
                required
              />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-32 h-8 text-sm text-right"
                required
              />
              <Button 
                type="submit" 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-8"
              >
                دخول
              </Button>
            </form>
          </div>

          {/* Mobile Login Buttons */}
          <div className="md:hidden flex items-center gap-1">
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-xs px-2 h-8">
                دخول
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs px-2 h-8 bg-blue-600 hover:bg-blue-700">
                تسجيل
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}