"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, ArrowLeft, MoreVertical } from "lucide-react"

interface Message {
  id: string
  fromMe: boolean
  text: string
  timestamp: string
  createdAt: Date
}

interface Friend {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  lastSeen: string
}

// Skeleton component for loading messages
const MessageSkeleton = () => (
  <div className="flex-1 p-4 space-y-4">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} animate-pulse`}
      >
        <div className={`max-w-[75%] rounded-2xl p-3 ${
          i % 2 === 0 ? 'bg-gray-200 rounded-bl-sm' : 'bg-blue-200 rounded-br-sm'
        }`}>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [page, setPage] = useState(1)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollToBottom = useRef(true)

  // Dummy friend list
  const friends: Friend[] = [
    { id: '1', name: 'أحمد', avatarUrl: '/avatar1.jpg', lastMessage: 'مرحبا!', lastSeen: 'متصل الآن' },
    { id: '2', name: 'ليلى', avatarUrl: '/avatar2.jpg', lastMessage: 'كيف حالك؟', lastSeen: 'اليوم - 08:00' },
    { id: '3', name: 'سارة', avatarUrl: '/avatar3.jpg', lastMessage: 'أراك لاحقاً', lastSeen: 'أمس - 22:15' },
    { id: '4', name: 'محمد', avatarUrl: '/avatar4.jpg', lastMessage: 'تم إرسال الملف', lastSeen: 'منذ ساعة' },
    { id: '5', name: 'فاطمة', avatarUrl: '/avatar5.jpg', lastMessage: 'هل تناولت الغداء؟', lastSeen: 'اليوم - 12:30' },
    { id: '6', name: 'خالد', avatarUrl: '/avatar6.jpg', lastMessage: 'أنا مشغول حالياً', lastSeen: 'أمس - 20:10' },
    { id: '7', name: 'نور', avatarUrl: '/avatar7.jpg', lastMessage: 'أراك لاحقاً!', lastSeen: 'منذ 3 أيام' },
    { id: '8', name: 'ياسمين', avatarUrl: '/avatar8.jpg', lastMessage: 'هل قرأت الكتاب؟', lastSeen: 'اليوم - 09:15' },
    { id: '9', name: 'سعيد', avatarUrl: '/avatar9.jpg', lastMessage: 'شكراً جزيلاً!', lastSeen: 'منذ 10 دقائق' },
    { id: '10', name: 'ندى', avatarUrl: '/avatar10.jpg', lastMessage: 'سأرسل لك الرابط', lastSeen: 'منذ 5 أيام' },
  ];
  
  const friend = friends.find(f => f.id === params.id)

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `قبل ${Math.floor(diffInMinutes / 60)} ساعة`
    return `قبل ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  // Generate dummy messages
  const generateDummyMessages = (pageNum: number): Message[] => {
    const messagesPerPage = 15
    const startIndex = (pageNum - 1) * messagesPerPage
    const dummyMessages = []
    
    for (let i = startIndex; i < startIndex + messagesPerPage && i < 50; i++) {
      const now = new Date()
      const messageTime = new Date(now.getTime() - (i * 30 * 60 * 1000))
      
      dummyMessages.push({
        id: `m${i + 1}`,
        fromMe: i % 3 === 0,
        text: i % 3 === 0 
          ? `رسالتي رقم ${i + 1}` 
          : `رسالة من ${friend?.name} رقم ${i + 1}`,
        timestamp: formatTimestamp(messageTime),
        createdAt: messageTime
      })
    }
    
    return dummyMessages.reverse()
  }

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current && shouldScrollToBottom.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [])

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true)
    shouldScrollToBottom.current = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const initialMessages = generateDummyMessages(1)
    setMessages(initialMessages)
    setIsLoading(false)
  }, [friend?.name])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return
    
    setIsLoadingMore(true)
    shouldScrollToBottom.current = false
    
    const container = messagesContainerRef.current
    const previousScrollHeight = container?.scrollHeight || 0
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const nextPage = page + 1
    const newMessages = generateDummyMessages(nextPage)
    
    if (newMessages.length === 0) {
      setHasMoreMessages(false)
    } else {
      setMessages(prev => [...newMessages, ...prev])
      setPage(nextPage)
      
      // Maintain scroll position
      if (container) {
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight
          const heightDifference = newScrollHeight - previousScrollHeight
          container.scrollTop = heightDifference
        }, 0)
      }
    }
    
    setIsLoadingMore(false)
  }, [isLoadingMore, hasMoreMessages, page, friend?.name])

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    
    if (scrollTop === 0 && !isLoadingMore && hasMoreMessages) {
      loadMoreMessages()
    }
  }, [isLoadingMore, hasMoreMessages, loadMoreMessages])

  // Send message
  const sendMessage = useCallback(() => {
    if (!text.trim()) return
    
    const newMessage: Message = {
      id: Date.now().toString(),
      fromMe: true,
      text: text.trim(),
      timestamp: 'الآن',
      createdAt: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setText("")
    shouldScrollToBottom.current = true
    
    // Simulate reply
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        fromMe: false,
        text: `رد على: ${newMessage.text}`,
        timestamp: 'الآن',
        createdAt: new Date()
      }
      setMessages(prev => [...prev, replyMessage])
      shouldScrollToBottom.current = true
    }, 2000)
  }, [text])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // Initial load effect
  useEffect(() => {
    loadInitialMessages()
  }, [params.id, loadInitialMessages])

  // Auto-scroll effect
  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottom.current) {
      // Use multiple timeouts to ensure scrolling works
      setTimeout(scrollToBottom, 0)
      setTimeout(scrollToBottom, 50)
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, scrollToBottom])

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="flex h-[80svh] md:h-[100svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {friend?.name?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">{friend?.name ?? "مستخدم مجهول"}</h3>
                <p className="text-xs text-green-600 font-medium">{friend?.lastSeen}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </header>

        <MessageSkeleton />
      </div>
    )
  }

  return (
    <div className="flex h-[80svh] overflow-hidden md:h-[90svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-blue-100">
              {friend?.avatarUrl ? (
                <AvatarImage src={friend.avatarUrl} alt={friend.name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {friend?.name?.charAt(0) || 'م'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{friend?.name ?? "مستخدم مجهول"}</h3>
              <p className="text-xs text-green-600 font-medium">{friend?.lastSeen}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </header>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0"
        onScroll={handleScroll}
      >
        {/* Loading indicator at top */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-2 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          </div>
        )}
        
        {/* End of messages indicator */}
        {!hasMoreMessages && (
          <div className="text-center py-6">
            <div className="inline-block px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-xs text-gray-500">بداية المحادثة</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] sm:max-w-[60%] md:max-w-lg rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                msg.fromMe 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm' 
                  : 'bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-gray-100/50'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center justify-end mt-1">
                <span 
                  className={`text-xs ${
                    msg.fromMe ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="اكتب رسالة..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="resize-none min-h-[44px] pr-4 pl-12 rounded-full border-gray-300/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/60 backdrop-blur-sm transition-all duration-200"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!text.trim()}
            size="sm"
            className="rounded-full h-11 w-11 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}