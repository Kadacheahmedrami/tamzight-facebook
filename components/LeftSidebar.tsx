"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import FriendSuggestions from "@/components/left-side-comps/friend-suggestions"
import { Session } from "next-auth"

interface TrendingTopic {
  id: number
  hashtag: string
  count: number
  color: string
}

interface LeftSidebarProps {
  session?: Session | null
}

export default function LeftSidebar({ session }: LeftSidebarProps) {
  const pathname = usePathname()
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [topicsLoading, setTopicsLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")

  // Color mapping for trending topics
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-50 text-blue-800',
      'green': 'bg-green-50 text-green-800',
      'red': 'bg-red-50 text-red-800',
      'yellow': 'bg-yellow-50 text-yellow-800',
      'purple': 'bg-purple-50 text-purple-800',
      'pink': 'bg-pink-50 text-pink-800',
      'indigo': 'bg-indigo-50 text-indigo-800',
      'gray': 'bg-gray-50 text-gray-800',
    }
    return colorMap[color] || 'bg-gray-50 text-gray-800'
  }

  // Check if current page is friends page
  const isFriendsPage = pathname.includes('/main/friends')

  // Get current user ID from session
  const getCurrentUserId = () => {
    if (session?.user) {
      // Try to get id from session (might be in sub property or email as fallback)
      const userId = (session.user as any).id || session.user.email
      if (userId) {
        setUserId(userId)
      }
    }
  }

  // Fetch trending topics
  const fetchTrendingTopics = async () => {
    setTopicsLoading(true)
    try {
      const response = await fetch('/api/main/trending')
      const data = await response.json()
      
      if (response.ok) {
        setTrendingTopics(data.topics || [])
      } else {
        console.error("Error fetching trending topics:", data.error)
      }
    } catch (error) {
      console.error("Error fetching trending topics:", error)
    } finally {
      setTopicsLoading(false)
    }
  }

  // Handle friend request sent callback
  const handleFriendRequestSent = (friendId: string) => {
    console.log(`Friend request sent to ${friendId}`)
    // You can add additional logic here if needed
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await fetchTrendingTopics()
      getCurrentUserId()
      setLoading(false)
    }

    fetchData()
  }, [pathname, session])

  return (
    <div className="hidden lg:block w-80 h-full overflow-y-auto p-4">
      {/* Conditional Content - Friends Suggestions or Ads */}
      {isFriendsPage ? (
        <div className="mb-4">
          <FriendSuggestions 
            userId={userId}
            onFriendRequestSent={handleFriendRequestSent}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-4 border mb-4">
          <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
          <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
          <Button variant="link" size="sm" className="text-[#4531fc] p-0 h-auto">
            شاهد جميع الاعلانات
          </Button>
        </div>
      )}

      {/* Trending Topics */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          المواضيع الشائعة
        </h3>
        
        {topicsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="mr-2 text-sm text-gray-500">جاري التحميل...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                className={`p-2 rounded text-sm flex justify-between items-center hover:opacity-80 transition-opacity cursor-pointer ${getColorClasses(topic.color)}`}
              >
                <span>{topic.hashtag}</span>
                <span className="text-xs opacity-70">{topic.count}</span>
              </div>
            ))}
            
            {trendingTopics.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">لا توجد مواضيع شائعة حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}