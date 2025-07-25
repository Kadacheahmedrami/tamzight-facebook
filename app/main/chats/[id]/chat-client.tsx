"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react"
import { pusherClient } from "@/lib/pusher"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderAvatar?: string
  timestamp: string
  isOwn: boolean
  messageType?: string
  attachment?: any
  read?: boolean
  createdAt?: Date
}

interface Conversation {
  conversationId: string
  participant: {
    id: string
    name: string
    avatar?: string
    isOnline: boolean
    lastSeen?: string
  }
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

interface Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface ChatClientProps {
  userId: string
  session: Session
}

// Skeleton component for loading messages
const MessageSkeleton = () => (
  <div className="flex-1 p-4 space-y-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} animate-pulse`}>
        <div
          className={`max-w-[75%] rounded-2xl p-3 ${
            i % 2 === 0 ? "bg-gray-200 rounded-bl-sm" : "bg-blue-200 rounded-br-sm"
          }`}
        >
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function ChatClient({ userId, session }: ChatClientProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollToBottom = useRef(true)

  // Generate first letter for avatar fallback
  const getAvatarLetter = (name: string) => {
    return name.charAt(0) || "م"
  }

  // Format timestamp
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "الآن"
    if (diffInMinutes < 60) return `قبل ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `قبل ${Math.floor(diffInMinutes / 60)} ساعة`
    return `قبل ${Math.floor(diffInMinutes / 1440)} يوم`
  }

  // Load messages from API
  const loadMessages = useCallback(
    async (pageNum: number) => {
      try {
        console.log("Loading messages for user:", userId, "page:", pageNum)
        const response = await fetch(`/api/main/chats/${userId}?page=${pageNum}&limit=20`)

        if (!response.ok) {
          console.error("API response not ok:", response.status, response.statusText)
          if (response.status === 404) {
            throw new Error("المستخدم غير موجود")
          }
          if (response.status === 401) {
            throw new Error("غير مصرح لك بالوصول")
          }
          throw new Error("فشل في جلب الرسائل")
        }

        const data: Conversation = await response.json()
        console.log("Loaded conversation data:", data)
        return data
      } catch (err) {
        console.error("Error loading messages:", err)
        throw err
      }
    },
    [userId],
  )

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

      const chatData = await loadMessages(1)
      setConversation(chatData)
      setMessages(chatData.messages)
      setHasMoreMessages(chatData.pagination.hasMore)
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ في جلب الرسائل")
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
      const chatData = await loadMessages(nextPage)

      if (chatData.messages.length === 0) {
        setHasMoreMessages(false)
      } else {
        setMessages((prev) => [...chatData.messages, ...prev])
        setPage(nextPage)
        setHasMoreMessages(chatData.pagination.hasMore)

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
      console.error("Error loading more messages:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMoreMessages, page, loadMessages])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.currentTarget

      if (scrollTop === 0 && !isLoadingMore && hasMoreMessages) {
        loadMoreMessages()
      }
    },
    [isLoadingMore, hasMoreMessages, loadMoreMessages],
  )

  // Send message
  const sendMessage = useCallback(async () => {
    if (!text.trim()) return

    try {
      const tempId = Date.now().toString()
      const newMessage: Message = {
        id: tempId,
        content: text.trim(),
        senderId: session.user.id,
        senderName: "أنت",
        timestamp: new Date().toISOString(),
        isOwn: true,
        messageType: "TEXT",
      }

      // Add message to UI immediately (optimistic update)
      setMessages((prev) => [...prev, newMessage])
      setText("")
      shouldScrollToBottom.current = true

      // Send to API
      const response = await fetch(`/api/main/chats/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.content,
          messageType: "TEXT",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update message with server response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId ? { ...result.message, createdAt: new Date(result.message.timestamp) } : msg,
          ),
        )
      } else {
        // Remove message if sending failed
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
        throw new Error("فشل في إرسال الرسالة")
      }
    } catch (err) {
      console.error("Error sending message:", err)
    }
  }, [text, userId, session.user.id])

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage],
  )

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversation) return

    try {
      await fetch(`/api/main/chats/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "markAsRead",
        }),
      })
    } catch (err) {
      console.error("Error marking messages as read:", err)
    }
  }, [userId, conversation])

  // Set up real-time messaging
  useEffect(() => {
    if (!conversation) return

    const conversationId = conversation.conversationId
    const channel = pusherClient.subscribe(`chat_${conversationId}`)

    // Listen for new messages
    channel.bind("new-message", (data: any) => {
      if (data.senderId !== session.user.id) {
        setMessages((prev) => [
          ...prev,
          {
            ...data.message,
            isOwn: false,
          },
        ])
        shouldScrollToBottom.current = true
      }
    })

    // Listen for message edits
    channel.bind("message-edited", (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, content: data.newContent, editedAt: data.editedAt } : msg,
        ),
      )
    })

    // Listen for message deletions
    channel.bind("message-deleted", (data: any) => {
      if (data.deleteType === "hard") {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId))
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, content: "This message was deleted", isDeleted: true } : msg,
          ),
        )
      }
    })

    // Listen for typing indicators
    channel.bind("user-typing", (data: any) => {
      if (data.userId !== session.user.id) {
        setIsTyping(data.isTyping)
      }
    })

    return () => {
      pusherClient.unsubscribe(`chat_${conversationId}`)
    }
  }, [conversation, session.user.id])

  // Initial load effect
  useEffect(() => {
    if (userId) {
      loadInitialMessages()
    }
  }, [userId, loadInitialMessages])

  // Auto-scroll effect
  useEffect(() => {
    if (messages.length > 0 && shouldScrollToBottom.current) {
      setTimeout(scrollToBottom, 0)
      setTimeout(scrollToBottom, 50)
      setTimeout(scrollToBottom, 100)
    }
  }, [messages, scrollToBottom])

  // Mark as read when component mounts or conversation changes
  useEffect(() => {
    if (conversation && !isLoading) {
      markAsRead()
    }
  }, [conversation, isLoading, markAsRead])

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
    <div
      className="flex h-[80svh] overflow-hidden md:h-[90svh] flex-col bg-gradient-to-br from-slate-50 to-blue-50/30"
      dir="rtl"
    >
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
                {conversation.participant.avatar ? (
                  <AvatarImage
                    src={conversation.participant.avatar || "/placeholder.svg"}
                    alt={conversation.participant.name}
                  />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                    {getAvatarLetter(conversation.participant.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              {conversation.participant.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{conversation.participant.name}</h3>
              </div>
              <p className="text-xs text-gray-500">
                {conversation.participant.isOnline ? (
                  <span className="text-green-600 font-medium">متصل الآن</span>
                ) : (
                  conversation.participant.lastSeen || "غير متصل"
                )}
                {isTyping && <span className="text-green-600 font-medium"> - يكتب...</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200"
          >
            <Video className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200"
          >
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
        {!hasMoreMessages && messages.length > 0 && (
          <div className="text-center py-6">
            <div className="inline-block px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-xs text-gray-500">بداية المحادثة</span>
            </div>
          </div>
        )}

        {/* No messages */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="inline-block px-6 py-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm">
              <span className="text-sm text-gray-500">لا توجد رسائل بعد</span>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] sm:max-w-[60%] md:max-w-lg rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                msg.isOwn
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                  : "bg-white/90 backdrop-blur-sm text-gray-800 rounded-bl-sm border border-gray-100/50"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center justify-end mt-1 gap-2">
                <span className={`text-xs ${msg.isOwn ? "text-blue-100" : "text-gray-400"}`}>
                  {formatTimestamp(msg.timestamp)}
                </span>
                {msg.isOwn && (
                  <div className="flex items-center">
                    {msg.read ? (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 bg-blue-200 rounded-full"></div>
                    )}
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
              onChange={(e) => setText(e.target.value)}
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
