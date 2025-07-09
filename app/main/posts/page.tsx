"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/card-comps/post-card"
import CreatePostModal from "@/components/create-post/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  alt?: string
  duration?: string
  resolution?: string
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  media?: MediaItem[]
  image?: string
  images?: string[]
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
      
      // Transform the data to match PostCard expected format
      const transformedPosts = data.map((post: any) => ({
        ...post,
        id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
        authorId: post.authorId || post.author?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        category: "منشور", // Set main category as "منشور"
        subCategory: post.category || post.subCategory, // Move original category to subCategory
        media: post.media || [],
        images: post.images || []
      }))
      
      setPosts(transformedPosts)
    } catch (error) {
      console.error("Error fetching posts:", error)
      // Fallback sample data with proper structure
      const samplePosts: Post[] = [
     
      ]
      setPosts(samplePosts)
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
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
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
          <Button 
            size="sm" 
            onClick={() => fetchPosts(selectedCategory)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            اعرض
          </Button>
        </div>
      </div>

      {/* Create Post */}
      <CreatePostModal />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              id={post.id}
              title={post.title}
              content={post.content}
              author={post.author}
              authorId={post.authorId}
              timestamp={post.timestamp}
              category={post.category}
              subCategory={post.subCategory}
              media={post.media}
              image={post.image}
              images={post.images}
              baseRoute="/posts"
              stats={post.stats}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg mb-2">لا توجد منشورات في هذا القسم</p>
              <p className="text-gray-500 text-sm">جرب تغيير الفئة أو ابحث عن محتوى آخر</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}