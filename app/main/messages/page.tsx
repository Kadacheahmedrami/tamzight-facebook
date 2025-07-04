/* app/main/messages/page.tsx */
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface Friend {
  id: string
  name: string
  avatarUrl?: string
  lastMessage: string
  lastSeen: string
}

export default function MessagesListPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    // TODO: replace with real API call
    setFriends([
      { id: '1', name: 'أحمد', avatarUrl: '/avatar1.jpg', lastMessage: 'مرحبا!', lastSeen: 'قبل 2 دقائق' },
      { id: '2', name: 'ليلى', avatarUrl: '/avatar2.jpg', lastMessage: 'كيف حالك؟', lastSeen: 'اليوم - 08:00' },
      { id: '3', name: 'سارة', avatarUrl: '/avatar3.jpg', lastMessage: 'أراك لاحقاً', lastSeen: 'أمس - 22:15' },
    ])
  }, [])

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Sidebar on md+, full width on mobile */}
      <aside className="w-full md:w-1/3 border-r border-gray-200 p-4">
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="ابحث عن صديق أو رسالة"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" variant="ghost" className="p-2" aria-label="بحث">
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-80px)]">
          {filtered.length > 0 ? (
            filtered.map(friend => (
              <Link href={`/main/messages/${friend.id}`} key={friend.id}>
                <Card className="flex items-center gap-3 p-3 hover:bg-gray-50 transition cursor-pointer">
                  <Avatar>
                    {friend.avatarUrl ? (
                      <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                    ) : (
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{friend.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{friend.lastMessage}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{friend.lastSeen}</span>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">لم يتم العثور على نتائج</p>
          )}
        </div>
      </aside>

      <main className="flex-1 p-4 flex flex-col justify-center items-center">
        <p className="text-gray-400">اختر محادثة من القائمة للبدء</p>
      </main>
    </div>
  )
}
