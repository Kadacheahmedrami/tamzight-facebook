"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Eye,
  Calendar,
  CheckCircle,
  X,
  Settings
} from "lucide-react"

interface NotificationData {
  id: number
  type: "like" | "comment" | "share" | "follow" | "view" | "system"
  title: string
  content: string
  user?: {
    name: string
    avatar: string
    username: string
  }
  timestamp: string
  read: boolean
  actionUrl?: string
  relatedContent?: {
    type: "video" | "post" | "profile"
    title: string
    thumbnail?: string
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async (filterType = "all") => {
    setLoading(true)
    try {
      const url = filterType === "all" ? "/api/main/notifications" : `/api/main/notifications?type=${filterType}`
      const response = await fetch(url)
      const data = await response.json()
      setNotifications(data)
      setUnreadCount(data.filter((n: NotificationData) => !n.read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Mock data for demo
      const mockNotifications: NotificationData[] = [
        {
          id: 1,
          type: "like",
          title: "إعجاب جديد",
          content: "أعجب بفيديو الأمازيغية الخاص بك",
          user: {
            name: "أحمد الأمازيغي",
            avatar: "/placeholder.svg",
            username: "ahmed_amazigh"
          },
          timestamp: "منذ 5 دقائق",
          read: false,
          relatedContent: {
            type: "video",
            title: "تعلم الأمازيغية - الدرس الأول",
            thumbnail: "/placeholder.svg"
          }
        },
        {
          id: 2,
          type: "comment",
          title: "تعليق جديد",
          content: "علق على فيديو: 'شكرا لك على هذا المحتوى الرائع!'",
          user: {
            name: "فاطمة تامازيغت",
            avatar: "/placeholder.svg",
            username: "fatima_tamazight"
          },
          timestamp: "منذ 15 دقيقة",
          read: false,
          relatedContent: {
            type: "video",
            title: "الثقافة الأمازيغية عبر التاريخ",
            thumbnail: "/placeholder.svg"
          }
        },
        {
          id: 3,
          type: "follow",
          title: "متابع جديد",
          content: "بدأ في متابعتك",
          user: {
            name: "يوسف أزيلال",
            avatar: "/placeholder.svg",
            username: "youssef_azilal"
          },
          timestamp: "منذ ساعة",
          read: true
        },
        {
          id: 4,
          type: "share",
          title: "مشاركة جديدة",
          content: "شارك فيديو الأمازيغية الخاص بك",
          user: {
            name: "مريم إيمازيغن",
            avatar: "/placeholder.svg",
            username: "mariam_imazighen"
          },
          timestamp: "منذ 2 ساعة",
          read: true,
          relatedContent: {
            type: "video",
            title: "الموسيقى الأمازيغية التقليدية",
            thumbnail: "/placeholder.svg"
          }
        },
        {
          id: 5,
          type: "system",
          title: "تحديث النظام",
          content: "تم إضافة ميزات جديدة للتطبيق",
          user: {
            name: "إدارة الموقع",
            avatar: "/placeholder.svg",
            username: "admin"
          },
          timestamp: "منذ يوم",
          read: false
        }
      ]
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    fetchNotifications(filterType)
  }

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "share":
        return <Share2 className="h-4 w-4 text-green-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-purple-500" />
      case "view":
        return <Eye className="h-4 w-4 text-orange-500" />
      case "system":
        return <Bell className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getFilterLabel = (type: string) => {
    switch (type) {
      case "like":
        return "الإعجابات"
      case "comment":
        return "التعليقات"
      case "share":
        return "المشاركات"
      case "follow":
        return "المتابعون"
      case "system":
        return "النظام"
      default:
        return "الجميع"
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6 text-[#4531fc]" />
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            قراءة الكل
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض إشعارات:</label>
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار نوع الإشعار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="like">الإعجابات</SelectItem>
              <SelectItem value="comment">التعليقات</SelectItem>
              <SelectItem value="share">المشاركات</SelectItem>
              <SelectItem value="follow">المتابعون</SelectItem>
              <SelectItem value="system">النظام</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={() => fetchNotifications(filter)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            تحديث
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`overflow-hidden transition-all hover:shadow-md ${
                !notification.read ? 'border-r-4 border-r-[#4531fc] bg-blue-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={notification.user?.avatar || "/placeholder.svg"}
                      alt={notification.user?.name || "مستخدم"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getNotificationIcon(notification.type)}
                          <span className="text-sm font-medium">{notification.title}</span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#4531fc] rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{notification.user?.name || "مستخدم مجهول"}</span>
                          {" "}
                          {notification.content}
                        </p>

                        {/* Related Content */}
                        {notification.relatedContent && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                            {notification.relatedContent.thumbnail && (
                              <img
                                src={notification.relatedContent.thumbnail}
                                alt=""
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="text-xs text-gray-600 line-clamp-1">
                              {notification.relatedContent.title}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {notification.timestamp}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs"
                              >
                                تحديد كمقروء
                              </Button>
                            )}
                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                عرض
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">لا توجد إشعارات</p>
            <p className="text-sm text-gray-400">ستظهر إشعاراتك هنا عندما يتفاعل الآخرون مع محتواك</p>
          </div>
        )}
      </div>
    </div>
  )
}