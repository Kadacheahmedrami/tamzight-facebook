"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

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
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>منشورات أمازيغية</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض منشورات:</label>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختار قسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nation">الأمة الأمازيغية</SelectItem>
                    <SelectItem value="language">اللغة الأمازيغية</SelectItem>
                    <SelectItem value="personalities">شخصيات امازيغية</SelectItem>
                    <SelectItem value="civilization">الحضارة الأمازيغية</SelectItem>
                    <SelectItem value="words">كلمات امازيغية</SelectItem>
                    <SelectItem value="art">الفن الأمازيغي</SelectItem>
                    <SelectItem value="clothing">اللباس الأمازيغي</SelectItem>
                    <SelectItem value="marriage">الزواج الأمازيغي</SelectItem>
                    <SelectItem value="food">الاكل الأمازيغي</SelectItem>
                    <SelectItem value="crafts">الحرف الامازيغية</SelectItem>
                    <SelectItem value="other">منشورات اخرى</SelectItem>
                    <SelectItem value="all">الجميع</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">اعرض</Button>
              </div>
            </div>

            {/* Create Post */}
            <CreatePostModal />

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
