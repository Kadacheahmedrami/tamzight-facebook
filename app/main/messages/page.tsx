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
  Phone, Video, Settings, CheckCheck, Check, Clock, Loader2
} from "lucide-react"

interface Conversation {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  lastSeen: string
  isOnline?: boolean
  unreadCount?: number
  isPinned?: boolean
  isArchived?: boolean
  messageStatus?: 'sent' | 'delivered' | 'read'
  isTyping?: boolean
  lastActivity?: Date
  isGroup?: boolean
  groupMembers?: number
}

type FilterType = 'all' | 'unread' | 'groups'

export default function MessagesListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/main/messages')
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('غير مصرح لك بالوصول')
        }
        throw new Error('فشل في جلب المحادثات')
      }
      
      const data = await response.json()
      
      // Convert lastActivity string back to Date object for sorting
      const processedData = data.map((conversation: any) => ({
        ...conversation,
        lastActivity: new Date(conversation.lastActivity)
      }))
      
      setConversations(processedData)
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب المحادثات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const filteredConversations = useMemo(() => {
    const filtered = conversations.filter(conversation => {
      const matchesSearch = conversation.name.toLowerCase().includes(search.toLowerCase()) || 
                           conversation.lastMessage.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      
      switch (filter) {
        case 'unread':
          return conversation.unreadCount && conversation.unreadCount > 0
        case 'groups':
          return conversation.isGroup
        default:
          return true
      }
    })
    
    return filtered.sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      // Then sort by last activity
      return (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0)
    })
  }, [conversations, search, filter])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return <Clock className="w-3 h-3 text-gray-400" />
    }
  }

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0)

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">جاري تحميل المحادثات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchConversations} className="bg-blue-600 hover:bg-blue-700">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">الرسائل</h1>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {totalUnread}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" title="مكالمة">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="مكالمة فيديو">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" title="الإعدادات">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="ابحث عن صديق أو رسالة..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pr-10 bg-white text-right" 
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'unread', label: 'غير مقروءة' },
            { key: 'groups', label: 'مجموعات', icon: <Users className="w-4 h-4 ml-1" /> }
          ].map(({ key, label, icon }) => (
            <Button 
              key={key} 
              variant={filter === key ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setFilter(key as FilterType)} 
              className="whitespace-nowrap"
            >
              {label}{icon}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <div key={conversation.id}>
              <Link href={`/main/messages/${conversation.id}`}>
                <div className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                  conversation.unreadCount && conversation.unreadCount > 0 ? 'bg-blue-50/50' : ''
                }`}>
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      {conversation.avatarUrl ? (
                        <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
                      ) : (
                        <AvatarFallback className={conversation.isGroup ? 'bg-purple-100' : 'bg-blue-100'}>
                          {conversation.isGroup ? (
                            <Users className="w-6 h-6 text-purple-600" />
                          ) : (
                            <span className="text-blue-600 font-medium">
                              {conversation.name.charAt(0)}
                            </span>
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {conversation.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${conversation.unreadCount && conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conversation.name}
                        </h4>
                        {conversation.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                        {conversation.isGroup && (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.groupMembers} أعضاء
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{conversation.lastSeen}</span>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="rounded-full min-w-[20px] h-5 text-xs bg-blue-600">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {conversation.isTyping ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="flex gap-1">
                              {[0, 100, 200].map(delay => (
                                <div 
                                  key={delay} 
                                  className="w-1 h-1 bg-green-600 rounded-full animate-bounce" 
                                  style={{animationDelay: `${delay}ms`}}
                                ></div>
                              ))}
                            </div>
                            <span className="text-sm">يكتب...</span>
                          </div>
                        ) : (
                          <p className={`text-sm truncate ${
                            conversation.unreadCount && conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                        )}
                      </div>
                      {!conversation.isTyping && (
                        <div className="flex items-center gap-1 mr-2">
                          {getStatusIcon(conversation.messageStatus)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-lg mb-2">
                  {search || filter !== 'all' ? 'لم يتم العثور على نتائج' : 'لا توجد محادثات'}
                </p>
                <p className="text-gray-400 text-sm">
                  {search || filter !== 'all' ? 'جرب البحث بكلمات مختلفة' : 'ابدأ محادثة جديدة مع أصدقائك'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}