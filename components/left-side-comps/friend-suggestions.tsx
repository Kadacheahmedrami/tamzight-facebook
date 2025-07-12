"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users } from "lucide-react"

interface Friend {
  id: number
  name: string
  location: string
  occupation: string
  avatar: string
  isOnline?: boolean
  mutualFriends: number
}

interface FriendSuggestionsProps {
  suggestions: Friend[]
  onAddFriend?: (friendId: number) => void
}

export default function FriendSuggestions({ suggestions, onAddFriend }: FriendSuggestionsProps) {
  const handleAddFriend = (friendId: number) => {
    if (onAddFriend) {
      onAddFriend(friendId)
    }
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
                    alt={friend.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate text-sm">{friend.name}</p>
                    {friend.isOnline && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        متصل
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{friend.location}</p>
                  <p className="text-xs text-gray-600 truncate">{friend.occupation}</p>
                  <p className="text-xs text-[#4531fc] mt-1">
                    {friend.mutualFriends} أصدقاء مشتركين
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-[#4531fc] hover:bg-blue-900 flex-1 text-xs"
                  onClick={() => handleAddFriend(friend.id)}
                >
                  إضافة صديق
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-700 bg-transparent px-3"
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
          <Button variant="outline" className="w-full text-sm">
            عرض المزيد من الاقتراحات
          </Button>
        </div>
      )}
    </div>
  )
}