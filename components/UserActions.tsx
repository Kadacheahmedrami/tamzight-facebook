"use client"

import { useState } from "react"
import { signOut, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

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
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return
    setNotificationsLoading(true)
    try {
      const response = await fetch("/api/main/notifications")
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
      const response = await fetch("/api/main/mess")
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك مرة أخرى",
        })
        // Clear form
        setLoginEmail("")
        setLoginPassword("")
        
        // Force a full page refresh to update server components
        window.location.href = "/main"
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء محاولة تسجيل الدخول",
        variant: "destructive",
      })
    } finally {
      setIsLoggingIn(false)
    }
  }
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: true
      })
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      })
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length
  const unreadMessages = messages.filter((m) => !m.read).length

  return (
    <div className="flex items-center gap-2 relative">
      {user ? (
        <>
          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Profile Icon */}
            <div className="group">
              <Link href={"/main/member"}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
                >
                  <i className="fas fa-user-circle text-xl"></i>
                </Button>
              </Link>
              
              {/* Hover Dropdown for Profile */}
              <div className="absolute -left-28 top-full mt-2 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-circle text-xl text-gray-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
                  {/* Content */}
                  <div className="flex-1 py-2 overflow-y-auto">
                          <Link href="/main/member" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i className="fas fa-user-edit text-gray-500 ml-3"></i>
                            <span>متابعتك</span>
                          </Link>
                          <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                            <i className="fas fa-bookmark text-gray-500 ml-3"></i>
                            <span>محفوظاتك</span>
                          </div>
                          <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                            <i className="fas fa-handshake text-gray-500 ml-3"></i>
                            <span>كُن شريك التجمع</span>
                          </div>
                          <div className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                            <i className="fas fa-users text-gray-500 ml-3"></i>
                            <span>انضم لفريق التجمع</span>
                          </div>
                          <div className="border-t border-gray-200 mt-2 pt-2">
                            <div onClick={handleSignOut} className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors">
                              <i className="fas fa-sign-out-alt text-red-600 ml-3"></i>
                              <span>تسجيل خروج</span>
                            </div>
                          </div>
                    </div>
              </div>
            </div>

            {/* Messages Icon */}
            <div className="group" onMouseEnter={fetchMessages}>
              <Link href={"/main/messages"}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
                >
                  <i className="fas fa-comments text-lg"></i>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
              </Link>
              
              {/* Hover Dropdown for Messages */}
              <div className="absolute -left-28 top-full mt-2 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">مراسلتك</h3>
                    {unreadMessages > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadMessages} جديد
                      </span>
                    )}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                      <span className="ml-2 text-sm text-gray-600">جاري التحميل...</span>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="py-2">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${!message.read ? "bg-blue-50 border-l-4 border-blue-400" : ""}`}
                        >
                          <img
                            src={message.avatar || "/placeholder.svg"}
                            alt={message.sender}
                            className="w-8 h-8 rounded-full bg-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{message.sender}</p>
                            <p className="text-sm text-gray-600 truncate">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <i className="fas fa-inbox text-2xl mb-2"></i>
                      <p className="text-sm">ليس عندك أي رسائل</p>
                    </div>
                  )}
                </div>
                {/* Footer */}
                {messages.length > 0 && (
                  <div className="border-t border-gray-200 p-2 shrink-0">
                    <Link href="/main/messages" className="block w-full p-2 text-sm text-center text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      عرض جميع الرسائل
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications Icon */}
            <div className="group" onMouseEnter={fetchNotifications}>
              <Link href={"/main/notifications"}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
                >
                  <i className="fas fa-bell text-lg"></i>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>
              
              {/* Hover Dropdown for Notifications */}
              <div className="absolute -left-28 top-full mt-2 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                    {unreadNotifications > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadNotifications} جديد
                      </span>
                    )}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                      <span className="ml-2 text-sm text-gray-600">جاري التحميل...</span>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50 border-l-4 border-blue-400" : ""}`}
                        >
                          <img
                            src={notification.avatar || "/placeholder.svg"}
                            alt="User"
                            className="w-8 h-8 rounded-full bg-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <i className="fas fa-bell-slash text-2xl mb-2"></i>
                      <p className="text-sm">ليس عندك أي إشعارات</p>
                    </div>
                  )}
                </div>
                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t border-gray-200 p-2 shrink-0">
                    <Link href="/main/notifications" className="block w-full p-2 text-sm text-center text-gray-600 hover:bg-gray-50 rounded transition-colors">
                      عرض جميع الإشعارات
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Friends Icon */}
            <div className="group">
              <Link href={"/main/friends"}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
                >
                  <i className="fas fa-user-friends text-lg"></i>
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    9
                  </span>
                </Button>
              </Link>
              
              {/* Hover Dropdown for Friends */}
              <div className="absolute -left-28 top-full mt-2 w-80 h-96 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">أصدقاء أمازيغ</h3>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      9 جديد
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-user-friends text-2xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600 mb-4">يوجد 9 طلبات صداقة جديدة</p>
                    <Link href="/main/friends" className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                      عرض جميع الأصدقاء
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Icons - Simple clickable buttons without dropdowns */}
          <div className="md:hidden flex items-center gap-2">
            {/* Profile Icon */}
            <Link href={"/main/member"}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
              >
                <i className="fas fa-user-circle text-xl"></i>
              </Button>
            </Link>

            {/* Messages Icon */}
            <Link href={"/main/messages"}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
              >
                <i className="fas fa-comments text-lg"></i>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Button>
            </Link>

            {/* Notifications Icon */}
            <Link href={"/main/notifications"}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
              >
                <i className="fas fa-bell text-lg"></i>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </Link>

            {/* Friends Icon */}
            <Link href={"/main/friends"}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 hover:text-[#4531fc] p-0 transition-colors"
              >
                <i className="fas fa-user-friends text-lg"></i>
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  9
                </span>
              </Button>
            </Link>
          </div>
        </>
      ) : (
        /* Authentication Form - When user is not authenticated */
        <div className="flex items-center gap-2">
          {/* Desktop Login Form */}
          <div className="hidden md:flex items-center gap-2">
            <form onSubmit={handleSignIn} className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-40 h-8 text-sm text-right"
                required
                disabled={isLoggingIn}
              />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-32 h-8 text-sm text-right"
                required
                disabled={isLoggingIn}
              />
              
              <Button 
                type="submit" 
                size="sm" 
                className="bg-[#4531fc] hover:bg-blue-700 text-white px-4 h-8"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري...
                  </div>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-1"></i>
                    دخول
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Mobile Login Buttons */}
          <div className="md:hidden flex items-center gap-1">
            <Link href="/auth/login">
              <Button variant="outline" size="sm" className="text-xs px-2 h-8">
                دخول
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="text-xs px-2 h-8 bg-[#4531fc] hover:bg-blue-700">
                تسجيل
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}