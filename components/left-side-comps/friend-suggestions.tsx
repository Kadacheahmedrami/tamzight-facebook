"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Loader2 } from "lucide-react"

interface Friend {
  id: string
  firstName: string
  lastName: string
  location: string
  occupation: string
  avatar: string
  isOnline?: boolean
  mutualFriends?: number
}

interface FriendSuggestionsProps {
  userId: string
  onFriendRequestSent?: (friendId: string) => void
}

export default function FriendSuggestions({ userId, onFriendRequestSent }: FriendSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/main/friends/suggestions?userId=${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        // Backend returns 'suggestions' not 'friends'
        setSuggestions(data.suggestions || [])
      } else {
        console.error("Error fetching suggestions:", data.error)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (friendId: string) => {
    if (!userId) return
    
    setSendingRequest(friendId)
    try {
      const response = await fetch("/api/main/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: friendId,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Remove the friend from suggestions after successful request
        setSuggestions(prev => prev.filter(friend => friend.id !== friendId))
        
        // Call the callback if provided
        if (onFriendRequestSent) {
          onFriendRequestSent(friendId)
        }
      } else {
        console.error("Error sending friend request:", data.error)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    } finally {
      setSendingRequest(null)
    }
  }

  const handleIgnore = (friendId: string) => {
    // Remove from suggestions (you might want to store ignored suggestions in backend)
    setSuggestions(prev => prev.filter(friend => friend.id !== friendId))
  }

  useEffect(() => {
    fetchSuggestions()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border h-fit sticky top-4">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-[#4531fc] flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#4531fc]" />
            اقتراحات صداقة
          </h3>
        </div>
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#4531fc]" />
          <span className="mr-2 text-sm text-gray-500">جاري التحميل...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border h-fit sticky top-4">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-[#4531fc] flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#4531fc]" />
          اقتراحات صداقة
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {suggestions.length} اقتراح متاح
        </p>
      </div>
      
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {suggestions.length > 0 ? (
          suggestions.map((friend) => (
            <div key={friend.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img 
                    src={friend.avatar || "/placeholder.svg"} 
                    alt={`${friend.firstName} ${friend.lastName}`} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate text-sm">
                      {friend.firstName} {friend.lastName}
                    </p>
                    {friend.isOnline && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        متصل
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{friend.location}</p>
                  <p className="text-xs text-gray-600 truncate">{friend.occupation}</p>
                  {friend.mutualFriends && (
                    <p className="text-xs text-[#4531fc] mt-1">
                      {friend.mutualFriends} أصدقاء مشتركين
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-[#4531fc] hover:bg-blue-900 flex-1 text-xs"
                  onClick={() => handleAddFriend(friend.id)}
                  disabled={sendingRequest === friend.id}
                >
                  {sendingRequest === friend.id ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin ml-1" />
                      إرسال...
                    </>
                  ) : (
                    "إضافة صديق"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-700 bg-transparent px-3"
                  onClick={() => handleIgnore(friend.id)}
                  disabled={sendingRequest === friend.id}
                >
                  تجاهل
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">لا توجد اقتراحات حالياً</p>
          </div>
        )}
      </div>
      
      {suggestions.length > 5 && (
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={fetchSuggestions}
          >
            تحديث الاقتراحات
          </Button>
        </div>
      )}
    </div>
  )
}