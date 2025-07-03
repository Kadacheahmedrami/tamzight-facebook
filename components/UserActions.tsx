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
      const response = await fetch("/api/main/messages")
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
        // This is the most reliable way to ensure the header updates
        window.location.href = "/main"
        
        // Alternative: Use router.refresh() then navigate (less reliable)
        // router.refresh()
        // router.push("/main")
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
        redirect: true // This ensures a full page refresh
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
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {/* Desktop Icons */}
          <div className=" md:flex items-center gap-3">
            {/* Profile Icon */}
            <Link href={"/main/member"} className="group relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 p-0"
              >
                <i className="fas fa-user-circle text-xl"></i>
              </Button>
              
              {/* Hover Dropdown for Profile */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-[#4531fc] text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">ملف بياناتك الشخصية</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-circle text-xl"></i>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.name || user.email}
                      </p>
                      <p className="text-sm text-blue-100">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link href="/main/member" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">متابعتك</Link>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">محفوظاتك</div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">كُن شريك التجمع</div>
                  <div className="px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors">انضم لفريق التجمع</div>
                  <div onClick={handleSignOut} className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer transition-colors flex items-center">
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    تسجيل خروج
                  </div>
                </div>
              </div>
            </Link>

            {/* Messages Icon */}
            <Link href={"/main/messages"} className="group relative" onMouseEnter={fetchMessages}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 p-0"
              >
                <i className="fas fa-comments text-lg"></i>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            </Link>

            {/* Notifications Icon */}
            <Link href={"/main/notifications"} className="group relative" onMouseEnter={fetchNotifications}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 p-0"
              >
                <i className="fas fa-bell text-lg"></i>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
            </Link>

            {/* Friends Icon */}
            <Link href={"/main/friends"} className="group relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative h-10 w-10 rounded-full mx-2 md:mx-0 bg-gray-50 border border-blue-200 text-[#4531fc] hover:bg-blue-50 p-0"
              >
               <i className="fas fa-user-friends text-lg"></i>

                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  9
                </span>
              </Button>
              
              {/* Hover Dropdown for Friends */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 bg-[#4531fc] text-white rounded-t-lg">
                  <h3 className="font-semibold mb-2">أصدقاء أمازيغ</h3>
                  <p className="text-sm">يوجد 10 أصدقاء جديد</p>
                </div>
                <div className="p-2">
                  <Link href="/main/friends" className="block w-full p-2 text-sm text-center hover:bg-gray-50 rounded transition-colors">
                    عرض جميع الأصدقاء
                  </Link>
                </div>
              </div>
            </Link>
          </div>
        </>
      ) : (
        /* Authentication Form - When user is not authenticated */
        <div className="flex items-center gap-2">
          {/* Desktop Login Form */}
          <div className=" md:flex items-center gap-2">
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