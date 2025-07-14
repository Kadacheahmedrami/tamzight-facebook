"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Check, X } from "lucide-react"

interface FriendRequest {
  id: number
  senderId: number
  receiverId: number
  status: string
  sender: {
    id: number
    firstName: string
    lastName: string
    location: string
    occupation: string
    avatar: string
  }
  receiver: {
    id: number
    firstName: string
    lastName: string
    location: string
    occupation: string
    avatar: string
  }
}

interface Suggestion {
  id: number
  firstName: string
  lastName: string
  location: string
  occupation: string
  avatar: string
}

interface FriendsData {
  suggestions: Suggestion[]
  pendingRequests: {
    received: FriendRequest[]
    sent: FriendRequest[]
  }
}

export default function FriendsPage() {
  const [friendsData, setFriendsData] = useState<FriendsData>({ 
    suggestions: [],
    pendingRequests: { received: [], sent: [] }
  })
  const [loading, setLoading] = useState(true)

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/main/friends/suggestions')
      const data = await response.json()
      
      if (response.ok) {
        setFriendsData(prev => ({
          ...prev,
          suggestions: data.suggestions || []
        }))
      } else {
        console.error("Error fetching suggestions:", data.error)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/main/friends/pending')
      const data = await response.json()
      
      if (response.ok) {
        setFriendsData(prev => ({
          ...prev,
          pendingRequests: {
            received: data.received || [],
            sent: data.sent || []
          }
        }))
      } else {
        console.error("Error fetching pending requests:", data.error)
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleSendFriendRequest = async (receiverId: number) => {
    try {
      const response = await fetch('/api/main/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId }),
      })

      if (response.ok) {
        setFriendsData(prev => ({
          ...prev,
          suggestions: prev.suggestions.filter(suggestion => suggestion.id !== receiverId)
        }))
        // Refresh pending requests to show the new sent request
        fetchPendingRequests()
      } else {
        const data = await response.json()
        console.error("Error sending friend request:", data.error)
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const handleAcceptFriendRequest = async (senderId: number, receiverId: number) => {
    try {
      const response = await fetch('/api/main/friends/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderId, receiverId }),
      })

      if (response.ok) {
        // Remove from pending requests
        setFriendsData(prev => ({
          ...prev,
          pendingRequests: {
            ...prev.pendingRequests,
            received: prev.pendingRequests.received.filter(req => req.senderId !== senderId)
          }
        }))
        // Refresh suggestions to remove the accepted user
        fetchSuggestions()
      } else {
        const data = await response.json()
        console.error("Error accepting friend request:", data.error)
      }
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const handleDeclineFriendRequest = async (senderId: number, receiverId: number) => {
    try {
      const response = await fetch('/api/main/friends/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ senderId, receiverId }),
      })

      if (response.ok) {
        // Remove from pending requests
        setFriendsData(prev => ({
          ...prev,
          pendingRequests: {
            ...prev.pendingRequests,
            received: prev.pendingRequests.received.filter(req => req.senderId !== senderId)
          }
        }))
      } else {
        const data = await response.json()
        console.error("Error declining friend request:", data.error)
      }
    } catch (error) {
      console.error("Error declining friend request:", error)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchSuggestions(),
      fetchPendingRequests()
    ])
    setLoading(false)
  }

  useEffect(() => {
    loadAllData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto flex">
          <div className="flex-1 p-2 sm:p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Pending Friend Requests */}
      {friendsData.pendingRequests.received.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg border">
            <div className="p-3 sm:p-4 border-b">
              <h3 className="font-semibold text-[#4531fc] flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#4531fc]" />
                طلبات الصداقة ({friendsData.pendingRequests.received.length})
              </h3>
            </div>
            <div className="divide-y">
              {friendsData.pendingRequests.received.map((request) => (
                <div key={request.id} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.sender.avatar || "/placeholder.svg"}
                        alt={`${request.sender.firstName} ${request.sender.lastName}`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-sm sm:text-base">
                          {request.sender.firstName} {request.sender.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">{request.sender.location}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{request.sender.occupation}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        size="sm" 
                        className="bg-[#4531fc] hover:bg-blue-900 flex-1 sm:flex-none"
                        onClick={() => handleAcceptFriendRequest(request.senderId, request.receiverId)}
                      >
                        <Check className="h-4 w-4 ml-1" />
                        قبول
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent flex-1 sm:flex-none"
                        onClick={() => handleDeclineFriendRequest(request.senderId, request.receiverId)}
                      >
                        <X className="h-4 w-4 ml-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sent Friend Requests */}
      {friendsData.pendingRequests.sent.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg border">
            <div className="p-3 sm:p-4 border-b">
              <h3 className="font-semibold text-gray-600 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-gray-600" />
                طلبات مرسلة ({friendsData.pendingRequests.sent.length})
              </h3>
            </div>
            <div className="divide-y">
              {friendsData.pendingRequests.sent.map((request) => (
                <div key={request.id} className="p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.receiver.avatar || "/placeholder.svg"}
                      alt={`${request.receiver.firstName} ${request.receiver.lastName}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {request.receiver.firstName} {request.receiver.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{request.receiver.location}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{request.receiver.occupation}</p>
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 mt-1">
                        في انتظار الرد
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Friend Suggestions - Mobile Only */}
      <div className="bg-white rounded-lg border sm:hidden">
        <div className="p-3 sm:p-4 border-b">
          <h3 className="font-semibold text-[#4531fc] flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#4531fc]" />
            أشخاص قد تعرفهم
          </h3>
        </div>
        <div className="divide-y">
          {friendsData.suggestions.length > 0 ? (
            friendsData.suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-3 sm:p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={suggestion.avatar || "/placeholder.svg"}
                      alt={`${suggestion.firstName} ${suggestion.lastName}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-sm sm:text-base">
                        {suggestion.firstName} {suggestion.lastName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{suggestion.location}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{suggestion.occupation}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      className="bg-[#4531fc] hover:bg-blue-900 flex-1 sm:flex-none"
                      onClick={() => handleSendFriendRequest(suggestion.id)}
                    >
                      <UserPlus className="h-4 w-4 ml-1" />
                      إضافة صديق
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              لا توجد اقتراحات جديدة
            </div>
          )}
        </div>
      </div>
    </div>
  )
}