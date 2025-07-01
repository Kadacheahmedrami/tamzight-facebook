"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rss, TrendingUp, Clock } from "lucide-react"

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

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()
      setStats({
        totalPosts: data.totalPosts,
        todayPosts: data.todayPosts,
        trendingPosts: data.trendingPosts,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch("/api/trending")
      const data = await response.json()
      setTrendingTopics(data)
    } catch (error) {
      console.error("Error fetching trending topics:", error)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchStats()
    fetchTrendingTopics()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(category)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Rss className="h-8 w-8" />
                <h1 className="text-2xl font-bold">آخر المنشورات</h1>
              </div>
              <p className="text-blue-100">تابع أحدث المنشورات والمحتوى الأمازيغي من جميع الأقسام</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">المنشورات الشائعة</p>
                    <p className="text-xl font-bold text-blue-600">{stats.trendingPosts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">منشورات اليوم</p>
                    <p className="text-xl font-bold text-green-600">{stats.todayPosts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Rss className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">إجمالي المنشورات</p>
                    <p className="text-xl font-bold text-yellow-600">{stats.totalPosts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض اخر منشورات حول:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
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
                <Button size="sm" onClick={() => fetchPosts(selectedCategory)}>
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

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border mb-4">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
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
