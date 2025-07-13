"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, ArrowLeft, MoreVertical, Users, Phone, Video } from "lucide-react"

interface Message {
  id: string
  fromMe: boolean
  text: string
  timestamp: string
  createdAt: Date
  status?: 'sent' | 'delivered' | 'read'
}

interface Conversation {
  id: string
  name: string
  avatarUrl?: string
  isOnline?: boolean
  isGroup?: boolean
  groupMembers?: number
  lastSeen?: string
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
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollToBottom = useRef(true)

  // Get conversation ID from params
  const conversationId = params.id

  // Generate first letter for avatar fallback
  const getAvatarLetter = (name: string) => {
    return name.charAt(0) || 'م'
  }

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'الآن'
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `قبل ${Math.floor(diffInMinutes / 60)} ساعة`
    return `قبل ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  // Fetch conversation data
  const fetchConversation = useCallback(async () => {
    try {
      const response = await fetch(`/api/main/messages/${conversationId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('المحادثة غير موجودة')
        }
        if (response.status === 401) {
          throw new Error('غير مصرح لك بالوصول')
        }
        throw new Error('فشل في جلب بيانات المحادثة')
      }
      
      const data = await response.json()
      setConversation(data)
    } catch (err) {
      console.error('Error fetching conversation:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب بيانات المحادثة')
    }
  }, [conversationId])

  // Generate dummy messages (replace with actual API call)
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
          : `رسالة من ${conversation?.name || 'المستخدم'} رقم ${i + 1}`,
        timestamp: formatTimestamp(messageTime),
        createdAt: messageTime,
        status: i % 3 === 0 ? (i % 2 === 0 ? 'read' : 'delivered') : undefined
      })
    }
    
    return dummyMessages.reverse()
  }

  // Load messages from API
  const loadMessages = useCallback(async (pageNum: number) => {
    try {
      // Replace with actual API call
      const response = await fetch(`/api/main/messages/${conversationId}/messages?page=${pageNum}`)
      
      if (!response.ok) {
        throw new Error('فشل في جلب الرسائل')
      }
      
      // For now, simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newMessages = generateDummyMessages(pageNum)
      return newMessages
    } catch (err) {
      console.error('Error loading messages:', err)
      throw err
    }
  }, [conversationId, conversation?.name])

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current && shouldScrollToBottom.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [])

  // Load initial messages
  const loadInitialMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      shouldScrollToBottom.current = true
      
      const initialMessages = await loadMessages(1)
      setMessages(initialMessages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب الرسائل')
    } finally {
      setIsLoading(false)
    }
  }, [loadMessages])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return
    
    try {
      setIsLoadingMore(true)
      shouldScrollToBottom.current = false
      
      const container = messagesContainerRef.current
      const previousScrollHeight = container?.scrollHeight || 0
      
      const nextPage = page + 1
      const newMessages = await loadMessages(nextPage)
      
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
    } catch (err) {
      console.error('Error loading more messages:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMoreMessages, page, loadMessages])

  // Handle scroll for infinite loading
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    
    if (scrollTop === 0 && !isLoadingMore && hasMoreMessages) {
      loadMoreMessages()
    }
  }, [isLoadingMore, hasMoreMessages, loadMoreMessages])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!text.trim()) return
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        fromMe: true,
        text: text.trim(),
        timestamp: 'الآن',
        createdAt: new Date(),
        status: 'sent'
      }
      
      // Add message to UI immediately
      setMessages(prev => [...prev, newMessage])
      setText("")
      shouldScrollToBottom.current = true
      
      // Send to API
      const response = await fetch(`/api/main/messages/${conversationId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage.text,
          tempId: newMessage.id
        })
      })
      
      if (response.ok) {
        const sentMessage = await response.json()
        // Update message with server response
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, id: sentMessage.id, status: 'delivered' }
            : msg
        ))
      }
      
      // Simulate reply (remove in production)
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
      
    } catch (err) {
      console.error('Error sending message:', err)
      // Handle error - maybe show notification
    }
  }, [text, conversationId])

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  // Initial load effect
  useEffect(() => {
    if (conversationId) {
      fetchConversation()
      loadInitialMessages()
    }
  }, [conversationId, fetchConversation, loadInitialMessages])

  // Auto-scroll effect
  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottom.current) {
      setTimeout(scrollToBottom, 0)
      setTimeout(scrollToBottom, 50)
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, scrollToBottom])

  // Show error if conversation not found
  if (error && !isLoading) {
    return (
      <div className="flex h-[80svh] md:h-[100svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null)
              fetchConversation()
              loadInitialMessages()
            }} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    )
  }

  // Show loading skeleton
  if (isLoading || !conversation) {
    return (
      <div className="flex h-[80svh] md:h-[100svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Loading Header */}
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
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        </header>

        <MessageSkeleton />
      </div>
    )
  }

  return (
    <div className="flex h-[80svh] overflow-hidden md:h-[90svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30" dir="rtl">
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
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                {conversation.avatarUrl ? (
                  <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />
                ) : (
                  <AvatarFallback className={`bg-gradient-to-br ${
                    conversation.isGroup 
                      ? 'from-purple-500 to-pink-600' 
                      : 'from-blue-500 to-purple-600'
                  } text-white font-medium`}>
                    {conversation.isGroup ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      getAvatarLetter(conversation.name)
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
              {conversation.isOnline && !conversation.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
                {conversation.isGroup && (
                  <span className="text-xs text-gray-500">
                    ({conversation.groupMembers} أعضاء)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {conversation.isOnline ? (
                  <span className="text-green-600 font-medium">متصل الآن</span>
                ) : (
                  conversation.lastSeen || 'غير متصل'
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
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
              <div className="flex items-center justify-end mt-1 gap-2">
                <span 
                  className={`text-xs ${
                    msg.fromMe ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
                {msg.fromMe && msg.status && (
                  <div className="flex items-center">
                    {msg.status === 'sent' && <div className="w-2 h-2 border border-blue-200 rounded-full"></div>}
                    {msg.status === 'delivered' && <div className="w-2 h-2 bg-blue-200 rounded-full"></div>}
                    {msg.status === 'read' && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                  </div>
                )}
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