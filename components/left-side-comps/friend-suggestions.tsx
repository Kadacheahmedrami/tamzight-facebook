"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Check, X } from "lucide-react"

interface User {
  id: number
  firstName: string
  lastName: string
  location: string | null
  occupation: string | null
  avatar: string | null
}

interface FriendRequest {
  id: number
  senderId: number
  receiverId: number
  sender: User
  receiver: User
}

interface FriendsData {
  suggestions: User[]
  pendingRequests: {
    received: FriendRequest[]
    sent: FriendRequest[]
  }
}

export default function FriendsPage() {
  const [data, setData] = useState<FriendsData>({ 
    suggestions: [], 
    pendingRequests: { received: [], sent: [] } 
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = async () => {
    try {
      const [suggestionsRes, pendingRes] = await Promise.all([
        fetch('/api/main/friends/suggestions'),
        fetch('/api/main/friends/pending')
      ])
      
      const suggestions = suggestionsRes.ok ? (await suggestionsRes.json()).suggestions || [] : []
      const pending = pendingRes.ok ? await pendingRes.json() : { received: [], sent: [] }
      
      setData({ suggestions, pendingRequests: { received: pending.received || [], sent: pending.sent || [] } })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const apiCall = async (endpoint: string, body: any) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) fetchData()
      else console.error("API Error:", await res.json())
    } catch (error) {
      console.error("Request failed:", error)
    }
  }

  const sendRequest = (receiverId: number) => {
    setData(prev => ({ ...prev, suggestions: prev.suggestions.filter(s => s.id !== receiverId) }))
    apiCall('/api/main/friends/request', { receiverId })
  }

  const handleRequest = (action: string, senderId: number, receiverId: number) => {
    setData(prev => ({
      ...prev,
      pendingRequests: {
        ...prev.pendingRequests,
        received: prev.pendingRequests.received.filter(r => r.senderId !== senderId)
      }
    }))
    apiCall(`/api/main/friends/${action}`, { senderId, receiverId })
  }

  const viewProfile = (userId: number) => {
    router.push(`/main/member/${userId}`)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>

  const UserCard = ({ user, children, showBadge = false }: { 
    user: User, 
    children?: React.ReactNode, 
    showBadge?: boolean 
  }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0">
      <div 
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={() => viewProfile(user.id)}
      >
        <img
          src={user.avatar || "/placeholder.svg"}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-gray-500">{user.location}</p>
          <p className="text-sm text-gray-600">{user.occupation}</p>
          {showBadge && <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 mt-1">في انتظار الرد</Badge>}
        </div>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  )

  const Section = ({ title, count, children, color = "text-[#4531fc]" }: {
    title: string,
    count: number,
    children: React.ReactNode,
    color?: string
  }) => (
    <div className="bg-white rounded-lg border mb-6 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className={`font-semibold ${color} flex items-center gap-2`}>
          <UserPlus className="h-5 w-5" />
          {title} {count > 0 && `(${count})`}
        </h3>
      </div>
      {children}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Pending Requests */}
      {data.pendingRequests.received.length > 0 && (
        <Section title="طلبات الصداقة" count={data.pendingRequests.received.length}>
          {data.pendingRequests.received.map(req => (
            <UserCard key={req.id} user={req.sender}>
              <Button size="sm" className="bg-[#4531fc] hover:bg-blue-900 p-2" onClick={() => handleRequest('accept', req.senderId, req.receiverId)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 p-2" onClick={() => handleRequest('decline', req.senderId, req.receiverId)}>
                <X className="h-4 w-4" />
              </Button>
            </UserCard>
          ))}
        </Section>
      )}

      {/* Sent Requests */}
      {data.pendingRequests.sent.length > 0 && (
        <Section title="طلبات مرسلة" count={data.pendingRequests.sent.length} color="text-gray-600">
          {data.pendingRequests.sent.map(req => (
            <UserCard key={req.id} user={req.receiver} showBadge />
          ))}
        </Section>
      )}

      {/* Suggestions */}
      <Section title="أشخاص قد تعرفهم" count={0}>
        {data.suggestions.length > 0 ? (
          data.suggestions.map(suggestion => (
            <UserCard key={suggestion.id} user={suggestion}>
              <Button size="sm" className="bg-[#4531fc] hover:bg-blue-900 p-2" onClick={() => sendRequest(suggestion.id)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </UserCard>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            لا توجد اقتراحات جديدة
          </div>
        )}
      </Section>
    </div>
  )
}