"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, Search } from "lucide-react"

interface Friend {
  id: number
  name: string
  location: string
  occupation: string
  avatar: string
  isOnline?: boolean
  mutualFriends: number
}

interface FriendsData {
  friends: Friend[]
  suggestions: Friend[]
}

export default function FriendsPage() {
  const [friendsData, setFriendsData] = useState<FriendsData>({ friends: [], suggestions: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchFriends = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/friends")
      const data = await response.json()
      setFriendsData(data)
    } catch (error) {
      console.error("Error fetching friends:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  const filteredFriends = friendsData.friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <MobileSidebar title="أصدقاء من الأمازيغ" description="تواصل مع الأعضاء" />
        <div className="max-w-7xl mx-auto flex">
          <div className="flex-1 p-2 sm:p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MobileSidebar title="أصدقاء من الأمازيغ" description="تواصل مع الأعضاء" />
      <div className="max-w-7xl mx-auto flex">
        {/* Right Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content - Friends List */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="max-w-2xl mx-auto">
            {/* Mobile Friend Suggestions Button */}
            <div className="lg:hidden mb-4">
              <Button variant="outline" className="w-full bg-white">
                <UserPlus className="h-4 w-4 ml-2" />
                عرض اقتراحات الأصدقاء ({friendsData.suggestions.length})
              </Button>
            </div>

            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>اصدقائي ({friendsData.friends.length})</span>
              </div>
            </nav>

            {/* Search Bar */}
            <div className="mb-4 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="ابحث عن صديق"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 form-input-mobile"
              />
            </div>

            {/* Friends List */}
            <div className="bg-white rounded-lg border">
              <div className="p-3 sm:p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  جميع اصدقائي
                </h3>
              </div>
              <div className="divide-y">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <div key={friend.id} className="p-3 sm:p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={friend.avatar || "/placeholder.svg"}
                              alt={friend.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                            />
                            {friend.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="font-medium text-sm sm:text-base">{friend.name}</p>
                              {friend.isOnline && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 w-fit">
                                  متصل
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500">{friend.location}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{friend.occupation}</p>
                            <p className="text-xs text-blue-600">{friend.mutualFriends} أصدقاء مشتركين</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="flex-1 sm:flex-none bg-transparent">
                            رسالة
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent flex-1 sm:flex-none"
                          >
                            إزالة
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 sm:p-8 text-center text-gray-500">
                    {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد أصدقاء"}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Friend Suggestions Section */}
            <div className="lg:hidden mt-6">
              <div className="bg-white rounded-lg border">
                <div className="p-3 sm:p-4 border-b">
                  <h3 className="font-semibold flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    اقتراحات صداقة
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-3">
                  {friendsData.suggestions.map((friend) => (
                    <div key={friend.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={friend.avatar || "/placeholder.svg"} alt={friend.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{friend.name}</p>
                          <p className="text-sm text-gray-500">{friend.location}</p>
                          <p className="text-sm text-gray-600">{friend.occupation}</p>
                          <p className="text-xs text-blue-600">{friend.mutualFriends} أصدقاء مشتركين</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        إضافة صديق
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Section - Friend Suggestions */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              اقتراحات صداقة
            </h3>
            <div className="space-y-3">
              {friendsData.suggestions.map((friend) => (
                <div key={friend.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={friend.avatar || "/placeholder.svg"} alt={friend.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{friend.name}</p>
                      <p className="text-xs text-gray-500">{friend.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{friend.occupation}</p>
                  <p className="text-xs text-blue-600 mb-2">{friend.mutualFriends} أصدقاء مشتركين</p>
                  <Button size="sm" className="w-full text-xs">
                    إضافة صديق
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}