"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

interface User {
  id: number
  firstName: string
  lastName: string
  location: string | null
  occupation: string | null
  avatar: string | null
}

interface FriendSuggestionsProps {
  userId: string
  onFriendRequestSent: (friendId: string) => void
}

export default function FriendSuggestions({ userId, onFriendRequestSent }: FriendSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/main/friends/suggestions?userId=${userId}`)
      setSuggestions(res.ok ? (await res.json()).suggestions || [] : [])
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (receiverId: number) => {
    setSuggestions(prev => prev.filter(s => s.id !== receiverId))
    onFriendRequestSent(receiverId.toString())
    try {
      await fetch('/api/main/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, receiverId })
      })
    } catch (error) {
      console.error("Error sending request:", error)
    }
  }

  useEffect(() => { fetchSuggestions() }, [])

  const UserCard = ({ user, children }: { user: User, children?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0">
      <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => router.push(`/main/member/${user.id}`)}>
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user.firstName} {user.lastName}</p>
          {user.location && <p className="text-sm text-gray-500">{user.location}</p>}
          {user.occupation && <p className="text-sm text-gray-600">{user.occupation}</p>}
        </div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  )

  const SkeletonCard = () => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex flex-col gap-2 w-full">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
    </div>
  )

  const Section = ({ title, count, children }: { title: string, count: number, children: React.ReactNode }) => (
    <div className="bg-white rounded-lg border mb-6 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-[#4531fc] flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {title} {count > 0 && `(${count})`}
        </h3>
      </div>
      {children}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Section title="أشخاص قد تعرفهم" count={suggestions.length}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : suggestions.length > 0 ? (
          suggestions.map(suggestion => (
            <UserCard key={suggestion.id} user={suggestion}>
              <Button size="sm" className="bg-[#4531fc] hover:bg-blue-900 p-2" onClick={() => sendRequest(suggestion.id)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </UserCard>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">لا توجد اقتراحات جديدة</div>
        )}
      </Section>
    </div>
  )
}
