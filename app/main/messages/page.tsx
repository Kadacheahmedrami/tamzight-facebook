"use client"

import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, Pin, MessageCircle, Users,
  Phone, Video, Settings, CheckCheck, Check, Clock
} from "lucide-react"

interface Friend {
  id: string; name: string; avatarUrl?: string; lastMessage: string; lastSeen: string
  isOnline?: boolean; unreadCount?: number; isPinned?: boolean; isArchived?: boolean
  messageStatus?: 'sent' | 'delivered' | 'read'; isTyping?: boolean; lastActivity?: Date
  isGroup?: boolean; groupMembers?: number
}

type FilterType = 'all' | 'unread' | 'groups'

const mockData: Friend[] = [
  { id: '1', name: 'أحمد', avatarUrl: '/avatar1.jpg', lastMessage: 'مرحبا! كيف حالك اليوم؟', lastSeen: 'قبل 2 دقائق', isOnline: true, unreadCount: 3, isPinned: true, messageStatus: 'read', lastActivity: new Date(Date.now() - 2 * 60 * 1000) },
  { id: '2', name: 'ليلى', avatarUrl: '/avatar2.jpg', lastMessage: 'كيف حالك؟ هل أنت متفرغ للحديث؟', lastSeen: 'اليوم - 08:00', isOnline: false, unreadCount: 1, messageStatus: 'delivered', isTyping: true, lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000) },
  { id: '3', name: 'سارة', avatarUrl: '/avatar3.jpg', lastMessage: 'أراك لاحقاً، سأكون مشغولة', lastSeen: 'أمس - 22:15', isOnline: false, messageStatus: 'sent', lastActivity: new Date(Date.now() - 26 * 60 * 60 * 1000) },
  { id: '4', name: 'محمد', avatarUrl: '/avatar4.jpg', lastMessage: 'شكراً لك على المساعدة', lastSeen: 'أمس - 15:30', isOnline: true, messageStatus: 'read', lastActivity: new Date(Date.now() - 33 * 60 * 60 * 1000) },
  { id: '5', name: 'فاطمة', avatarUrl: '/avatar5.jpg', lastMessage: 'هل تريد الخروج للغداء؟', lastSeen: 'منذ 3 أيام', isOnline: false, unreadCount: 2, isPinned: true, messageStatus: 'delivered', lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '6', name: 'خالد', avatarUrl: '/avatar6.jpg', lastMessage: 'تم إرسال الملفات بنجاح', lastSeen: 'منذ أسبوع', isOnline: true, messageStatus: 'read', lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: '7', name: 'مجموعة العمل', avatarUrl: '/group1.jpg', lastMessage: 'تم تحديث المشروع', lastSeen: 'منذ 5 دقائق', isOnline: true, unreadCount: 12, isGroup: true, groupMembers: 8, messageStatus: 'read', lastActivity: new Date(Date.now() - 5 * 60 * 1000) }
]

export default function MessagesListPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => setFriends(mockData), [])

  const filteredFriends = useMemo(() => {
    const filtered = friends.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.lastMessage.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      return filter === 'unread' ? f.unreadCount && f.unreadCount > 0 : filter === 'groups' ? f.isGroup : true
    })
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0)
    })
  }, [friends, search, filter])

  const getStatusIcon = (status?: string) => 
    status === 'sent' ? <Check className="w-3 h-3 text-gray-400" /> :
    status === 'delivered' ? <CheckCheck className="w-3 h-3 text-gray-400" /> :
    status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> :
    <Clock className="w-3 h-3 text-gray-400" />

  const totalUnread = friends.reduce((sum, f) => sum + (f.unreadCount || 0), 0)

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">الرسائل</h1>
            {totalUnread > 0 && <Badge variant="destructive" className="rounded-full">{totalUnread}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="ابحث عن صديق أو رسالة..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 bg-white" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'unread', label: 'غير مقروءة' },
            { key: 'groups', label: 'مجموعات', icon: <Users className="w-4 h-4 mr-1" /> }
          ].map(({ key, label, icon }) => (
            <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key as FilterType)} className="whitespace-nowrap">
              {icon}{label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredFriends.length > 0 ? filteredFriends.map(f => (
          <div key={f.id}>
            <Link href={`/main/messages/${f.id}`}>
              <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${f.unreadCount ? 'bg-blue-50/50' : ''}`}>
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    {f.avatarUrl ? <AvatarImage src={f.avatarUrl} alt={f.name} /> : 
                      <AvatarFallback className={f.isGroup ? 'bg-purple-100' : 'bg-blue-100'}>
                        {f.isGroup ? <Users className="w-6 h-6" /> : f.name.charAt(0)}
                      </AvatarFallback>
                    }
                  </Avatar>
                  {f.isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-medium ${f.unreadCount ? 'text-gray-900' : 'text-gray-700'}`}>{f.name}</h4>
                      {f.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                      {f.isGroup && <Badge variant="secondary" className="text-xs">{f.groupMembers} أعضاء</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{f.lastSeen}</span>
                      {f.unreadCount && <Badge className="rounded-full min-w-[20px] h-5 text-xs">{f.unreadCount}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {f.isTyping ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <div className="flex gap-1">
                            {[0, 100, 200].map(delay => (
                              <div key={delay} className="w-1 h-1 bg-green-600 rounded-full animate-bounce" style={{animationDelay: `${delay}ms`}}></div>
                            ))}
                          </div>
                          <span className="text-sm">يكتب...</span>
                        </div>
                      ) : (
                        <p className={`text-sm truncate ${f.unreadCount ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{f.lastMessage}</p>
                      )}
                    </div>
                    {!f.isTyping && <div className="flex items-center gap-1 ml-2">{getStatusIcon(f.messageStatus)}</div>}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-lg mb-2">لم يتم العثور على نتائج</p>
                <p className="text-gray-400 text-sm">جرب البحث بكلمات مختلفة</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}