"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const POSTS_PER_PAGE = 10

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  )

  const fetchPosts = async (category = "all", page = 1, append = false) => {
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const url = category === "all" 
        ? `/api/main/posts?page=${page}&limit=${POSTS_PER_PAGE}` 
        : `/api/main/posts?category=${category}&page=${page}&limit=${POSTS_PER_PAGE}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      // Transform the data to match PostCard expected format
      const transformedPosts = data.posts?.map((post: any) => ({
        ...post,
        id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
        authorId: post.authorId || post.author?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        category: "منشور", // Set main category as "منشور"
        subCategory: post.category || post.subCategory, // Move original category to subCategory
        media: post.media || [],
        images: post.images || []
      })) || []

      // Check if there are more posts
      const totalPosts = data.total || transformedPosts.length
      const hasMorePosts = (page * POSTS_PER_PAGE) < totalPosts

      setHasMore(hasMorePosts)
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts])
      } else {
        setPosts(transformedPosts)
      }

    } catch (error) {
      console.error("Error fetching posts:", error)
      
      // Fallback sample data with proper structure (only for first page)
      if (page === 1) {
        const samplePosts: Post[] = [
          // You can add some sample posts here for fallback
        ]
        setPosts(samplePosts)
        setHasMore(false)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsRefreshing(false)
    }
  }

  // Scroll event handler for infinite scrolling
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight

    // Load more when user scrolls to bottom (with 100px buffer)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchPosts(selectedCategory, nextPage, true)
    }
  }, [currentPage, selectedCategory, loadingMore, hasMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchPosts(selectedCategory, 1, false)
  }, [selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setHasMore(true)
    setPosts([]) // Clear existing posts
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setCurrentPage(1)
    setHasMore(true)
    setPosts([])
    fetchPosts(selectedCategory, 1, false)
  }

  if (loading && posts.length === 0) {
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
              onClick={handleRefresh} 
              className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
              disabled={isRefreshing}
            >
              {isRefreshing ? "جاري التحميل..." : "اعرض"}
            </Button>
          </div>
        </div>

        {/* Create Post */}
        <CreatePostModal />

        {/* Loading Skeleton */}
        <LoadingSkeleton />
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
            onClick={handleRefresh} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={isRefreshing}
          >
            {isRefreshing ? "جاري التحميل..." : "اعرض"}
          </Button>
        </div>
      </div>

      {/* Create Post */}
      <CreatePostModal />

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
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
            ))}
            
            {/* Load More Indicator */}
            {loadingMore && (
              <div className="py-4">
                <LoadingSkeleton />
              </div>
            )}
            
            {/* End of Posts Indicator */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-gray-400 text-4xl mb-2">✨</div>
                  <p className="text-gray-600 text-sm">تم عرض جميع المنشورات</p>
                </div>
              </div>
            )}
          </>
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