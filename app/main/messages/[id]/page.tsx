// app/main/messages/[id]/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  fromMe: boolean
  text: string
  timestamp: string
}

interface Friend {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  lastSeen: string
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Dummy friend list (same as in MessagesListPage)
  const friends: Friend[] = [
    { id: '1', name: 'أحمد', avatarUrl: '/avatar1.jpg', lastMessage: 'مرحبا!', lastSeen: 'قبل 2 دقائق' },
    { id: '2', name: 'ليلى', avatarUrl: '/avatar2.jpg', lastMessage: 'كيف حالك؟', lastSeen: 'اليوم - 08:00' },
    { id: '3', name: 'سارة', avatarUrl: '/avatar3.jpg', lastMessage: 'أراك لاحقاً', lastSeen: 'أمس - 22:15' },
  ]

  const friend = friends.find(f => f.id === params.id)

  useEffect(() => {
    // TODO: fetch messages from API based on params.id
    setMessages([
      { id: 'm1', fromMe: false, text: 'مرحبا!', timestamp: 'قبل 10 دقائق' },
      { id: 'm2', fromMe: true, text: 'أهلاً، كيف حالك؟', timestamp: 'قبل 8 دقائق' },
    ])
  }, [params.id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim()) return
    setMessages(prev => [...prev, { id: Date.now().toString(), fromMe: true, text, timestamp: 'الآن' }])
    setText("")
  }

  return (
    <div className="flex h-[80svh]  md:h-[90%] flex-col md:flex-row">
      {/* Back link on mobile */}
      <div className="md:hidden mb-2">
        <Button variant="link" onClick={() => router.back()}>
          الرجوع
        </Button>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col border-l border-gray-200 p-4">
        <header className="flex items-center gap-3 mb-4">
          <Avatar>
            {friend?.avatarUrl ? (
              <AvatarImage src={friend.avatarUrl} alt={friend.name} />
            ) : (
              <AvatarFallback>{friend?.name?.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{friend?.name ?? "مستخدم مجهول"}</h3>
            <p className="text-xs text-gray-400">{friend?.lastSeen}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`${
                msg.fromMe ? 'self-end bg-blue-100' : 'self-start bg-gray-100'
              } rounded-lg p-2 max-w-xs`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs text-gray-400 block text-right">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Input
            placeholder="اكتب رسالة..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1"
          />
          <Button onClick={sendMessage}>ارسال</Button>
        </div>
      </div>
    </div>
  )
}
