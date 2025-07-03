"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {

  TrendingUp,

} from "lucide-react"

interface Post {
  id: number
  title: string
  content: string
  author: string
  timestamp: string
  category: string
  image: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

interface Stats {
  totalPosts: number
  todayPosts: number
  trendingPosts: number
}

interface TrendingTopic {
  id: number
  hashtag: string
  count: number
  color: string
}

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, todayPosts: 0, trendingPosts: 0 })
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchPosts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/posts" : `/api/posts?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

 
  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch("/api/trending")
      const data = await response.json()
      setTrendingTopics(data)
    } catch (error) {
      console.error("Error fetching trending topics:", error)
      // Fallback sample data
      const sampleTopics = [
        { id: 1, hashtag: "#الأمازيغية", count: 125, color: "blue" },
        { id: 2, hashtag: "#تافيناغ", count: 89, color: "green" },
        { id: 3, hashtag: "#التراث_الأمازيغي", count: 67, color: "yellow" },
        { id: 4, hashtag: "#شمال_أفريقيا", count: 45, color: "red" },
      ]
      setTrendingTopics(sampleTopics)
    }
  }

  useEffect(() => {
    fetchPosts()
   
    fetchTrendingTopics()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(category)
  }

 
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
          <div className="w-64 p-4">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
              <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>منشورات حول الامة الامازيغ</span>
              </div>
            </nav>

      

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض اخر منشورات حول:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="nation">الأمة الأمازيغية</SelectItem>
                    <SelectItem value="language">اللغة الأمازيغية</SelectItem>
                    <SelectItem value="personalities">شخصيات امازيغية</SelectItem>
                    <SelectItem value="civilization">الحضارة الأمازيغية</SelectItem>
                    <SelectItem value="art">الفن الأمازيغي</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchPosts(selectedCategory)} className="bg-[#4531fc] hover:bg-blue-800  w-full sm:w-auto">
                  اعرض
                </Button>
              </div>
            </div>

            {/* Create Post */}
            <CreatePostModal />

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} {...post} />)
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد منشورات في هذا القسم</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border mb-4">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="text-[#4531fc] p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              المواضيع الشائعة
            </h3>
            <div className="space-y-2">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-2 bg-${topic.color}-50 rounded text-sm flex justify-between items-center`}
                >
                  <span>{topic.hashtag}</span>
                  <span className="text-xs text-gray-500">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}