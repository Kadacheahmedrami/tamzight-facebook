"use client"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
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

  // Example friend list
  const friends: Friend[] = [
    { id: '1', name: 'أحمد', avatarUrl: '/avatar1.jpg', lastMessage: 'مرحبا!', lastSeen: 'قبل 2 دقائق' },
    { id: '2', name: 'ليلى', avatarUrl: '/avatar2.jpg', lastMessage: 'كيف حالك؟', lastSeen: 'اليوم - 08:00' },
    { id: '3', name: 'سارة', avatarUrl: '/avatar3.jpg', lastMessage: 'أراك لاحقاً', lastSeen: 'أمس - 22:15' },
  ]
  const friend = friends.find(f => f.id === params.id)

  useEffect(() => {
    // fetch messages
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
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), fromMe: true, text, timestamp: 'الآن' }
    ])
    setText("")
  }

  return (
    <div className="flex h-[80svh] md:h-[90%] bg-gray-50">
      {/* Sidebar on larger screens */}
      <div className="hidden md:flex flex-col w-1/3 border-r bg-white shadow-lg">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl">
          المحادثات
        </div>
        <div className="flex-1 overflow-y-auto">
          {friends.map(f => (
            <div
              key={f.id}
              onClick={() => router.push(`/main/messages/${f.id}`)}
              className="flex items-center gap-3 p-4 hover:bg-gray-100 cursor-pointer transition"
            >
              <Avatar className="ring-2 ring-purple-300">
                {f.avatarUrl ? <AvatarImage src={f.avatarUrl} alt={f.name} /> : <AvatarFallback>{f.name.charAt(0)}</AvatarFallback>}
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-800">{f.name}</h4>
                  <span className="text-xs text-gray-400">{f.lastSeen}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{f.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center gap-4 p-4 bg-white shadow-sm sticky top-0 z-10">
          <Button variant="link" className="md:hidden p-0" onClick={() => router.back()}>
            الرجوع
          </Button>
          <Avatar className="ring-4 ring-purple-200">
            {friend?.avatarUrl ? <AvatarImage src={friend.avatarUrl} alt={friend.name} /> : <AvatarFallback>{friend?.name?.charAt(0)}</AvatarFallback>}
          </Avatar>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{friend?.name ?? "مستخدم مجهول"}</h3>
            <p className="text-sm text-gray-500">{friend?.lastSeen}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('/pattern.svg')] bg-repeat">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`${msg.fromMe ? 'self-end bg-purple-100 text-gray-900' : 'self-start bg-white text-gray-800'} shadow rounded-2xl p-3 max-w-md transition-all`}
            >
              <p className="break-words">{msg.text}</p>
              <span className="block text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-white border-t flex items-center gap-3">
          <Input
            placeholder="اكتب رسالة..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 rounded-full border-gray-300 focus:border-purple-400 focus:ring-purple-200"
          />
          <Button
            onClick={sendMessage}
            className="bg-[#4531fc] hover:bg-purple-700 text-white rounded-full px-4 py-2 shadow-lg transition"
          >
            ارسال
          </Button>
        </div>
      </div>
    </div>
  )
}
