"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Send, Smile, Paperclip, Phone, Video, Minimize2, Maximize2 } from "lucide-react"

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "فاطمة تمازيغت",
      content: "مرحباً! كيف حالك اليوم؟",
      time: "14:30",
      isMe: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      sender: "أنت",
      content: "الحمد لله، بخير. وأنت كيف حالك؟",
      time: "14:32",
      isMe: true,
    },
    {
      id: 3,
      sender: "فاطمة تمازيغت",
      content: "بخير أيضاً، شكراً لك. هل شاهدت المنشور الجديد عن المهرجان الثقافي؟",
      time: "14:33",
      isMe: false,
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ])

  const contacts = [
    { name: "فاطمة تمازيغت", status: "متصلة", avatar: "/placeholder.svg?height=40&width=40", unread: 2 },
    { name: "محمد أقبايلي", status: "متصل منذ 5 دقائق", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
    { name: "عائشة أمازيغية", status: "متصلة", avatar: "/placeholder.svg?height=40&width=40", unread: 1 },
    { name: "يوسف تمازغا", status: "غير متصل", avatar: "/placeholder.svg?height=40&width=40", unread: 0 },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "أنت",
        content: message,
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-xs">3</Badge>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 rtl" dir="rtl">
      <Card
        className={`w-80 shadow-2xl border-2 border-blue-200 rounded-2xl overflow-hidden transition-all ${isMinimized ? "h-16" : "h-96"}`}
      >
        {/* Chat Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>ف</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">فاطمة تمازيغت</CardTitle>
                <p className="text-xs text-blue-100">متصلة الآن</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <Video className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <CardContent className="p-0 h-64 overflow-y-auto bg-gray-50">
              <div className="p-3 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMe ? "justify-start" : "justify-end"}`}>
                    <div className={`flex items-end gap-2 max-w-[70%] ${msg.isMe ? "flex-row" : "flex-row-reverse"}`}>
                      {!msg.isMe && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 ${
                          msg.isMe
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isMe ? "text-blue-100" : "text-gray-500"}`}>{msg.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Message Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="اكتب رسالتك..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border-gray-300 focus:border-blue-500 rounded-full text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
