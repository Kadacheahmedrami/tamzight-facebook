// pages/posts/page.tsx

"use client"

import { useEffect, useState } from "react"

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
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchPosts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/posts" : `/api/main/posts?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(category)
  }

  if (loading) {
    return (
    
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
    )
  }

  return (

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
                <label className="text-sm font-medium whitespace-nowrap">اعرض منشورات:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="history">تاريخية</SelectItem>
                    <SelectItem value="culture">ثقافية</SelectItem>
                    <SelectItem value="language">لغوية</SelectItem>
                    <SelectItem value="art">فنية</SelectItem>
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


     
  )
}
