"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import PostCard from "@/components/LatestSactionCards/post-card"
import CreatePostModal from "@/components/CreateModals/create-post-modal"
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

interface Reaction {
  id: number
  emoji: string
  userId: number
  user: { firstName: string; lastName: string }
}

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  type: string // Content type (post, book, idea, etc.)
  category: string // Original category from API
  media?: MediaItem[]
  image?: string
  images?: string[]
  reactions: Reaction[]
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

interface ApiResponse {
  success: boolean
  data: any[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    type: string
  }
  error: string | null
}

const CONTENT_TYPES = [
  { value: "all", label: "الجميع" },
  { value: "post", label: "المنشورات" },
  { value: "book", label: "الكتب" },
  { value: "idea", label: "الأفكار" },
  { value: "image", label: "الصور" },
  { value: "video", label: "الفيديوهات" },
  { value: "truth", label: "الحقائق" },
  { value: "question", label: "الأسئلة" },
  { value: "ad", label: "الإعلانات" },
  { value: "product", label: "المنتجات" }
]

const LIMIT = 20

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const formatTimestamp = useCallback((timestamp: string | Date) => {
    if (!timestamp) return 'منذ وقت قصير'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return 'منذ وقت قصير'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`
    
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }, [])

  const transformPost = useCallback((item: any): Post => ({
    id: item.id?.toString() || Math.random().toString(36).substr(2, 9),
    title: item.title || 'بدون عنوان',
    content: item.content || item.description || '',
    author: item.author ? `${item.author.firstName} ${item.author.lastName}` : 'مجهول',
    authorId: item.author?.id?.toString() || 'unknown',
    timestamp: formatTimestamp(item.timestamp),
    type: item.type, // Keep original type
    category: item.category || 'عام', // Keep original category
    media: [],
    image: item.image || undefined,
    images: item.images || [],
    reactions: item.reactions || [], // Pass reactions from API
    stats: {
      views: item.views || Math.floor(Math.random() * 1000) + 100,
      likes: item._count?.likes || 0,
      comments: item._count?.comments || 0,
      shares: item._count?.shares || 0
    }
  }), [formatTimestamp])

  const fetchPosts = useCallback(async (type = "all", offset = 0, isLoadMore = false) => {
    if (isLoadingRef.current) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController
    isLoadingRef.current = true

    isLoadMore ? setLoadingMore(true) : setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: offset.toString()
      })
      
      if (type !== "all") {
        params.append('type', type)
      }

      const response = await fetch(`/api/main/latest?${params.toString()}`, {
        signal: abortController.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        const transformedPosts = data.data.map(transformPost)
        
        if (isLoadMore) {
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id))
            const newPosts = transformedPosts.filter(p => !existingIds.has(p.id))
            return [...prev, ...newPosts]
          })
          setCurrentOffset(offset + transformedPosts.length)
        } else {
          setPosts(transformedPosts)
          setCurrentOffset(transformedPosts.length)
        }
        
        setTotalItems(data.meta.total)
        setHasMore(data.meta.hasMore)
      } else {
        throw new Error(data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      
      console.error("Error fetching posts:", error)
      setError(error instanceof Error ? error.message : 'حدث خطأ في تحميل المنشورات')
      
      if (!isLoadMore) {
        setPosts([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      isLoadingRef.current = false
      
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }, [transformPost])

  const loadMore = useCallback(() => {
    if (!loadingMore && !isLoadingRef.current && hasMore && posts.length > 0) {
      fetchPosts(selectedType, currentOffset, true)
    }
  }, [loadingMore, hasMore, posts.length, selectedType, fetchPosts, currentOffset])

  const handleTypeChange = useCallback((type: string) => {
    setSelectedType(type)
    setHasMore(true)
    setCurrentOffset(0)
    setTotalItems(0)
    fetchPosts(type, 0, false)
  }, [fetchPosts])

  const refreshPosts = useCallback(() => {
    setHasMore(true)
    setCurrentOffset(0)
    setTotalItems(0)
    fetchPosts(selectedType, 0, false)
  }, [selectedType, fetchPosts])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!hasMore || loadingMore || isLoadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMore) {
          loadMore()
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loadingMore, loadMore])

  // Initial load
  useEffect(() => {
    fetchPosts()
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

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
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded w-12"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const ErrorDisplay = () => (
    <div className="text-center py-8">
      <div className="bg-red-50 rounded-lg p-8">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-2">حدث خطأ في تحميل المنشورات</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <Button onClick={refreshPosts} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="text-center py-8">
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <p className="text-gray-600 text-lg mb-2">لا توجد منشورات في هذا القسم</p>
        <p className="text-gray-500 text-sm">جرب تغيير الفئة أو أضف منشوراً جديداً</p>
      </div>
    </div>
  )

  const EndOfPosts = () => (
    <div className="text-center py-8">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="text-gray-400 text-4xl mb-2">🎉</div>
        <p className="text-gray-600 text-sm">تم عرض جميع المنشورات</p>
        <p className="text-gray-500 text-xs mt-1">المجموع: {posts.length} من {totalItems} منشور</p>
      </div>
    </div>
  )


  
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
          <label className="text-sm font-medium whitespace-nowrap">اعرض اخر منشورات حول:</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم لعرضه" />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={refreshPosts} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'اعرض'}
          </Button>
        </div>
      </div>

      {/* Create Post */}
      <CreatePostModal />

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <LoadingSkeleton />
        ) : error && posts.length === 0 ? (
          <ErrorDisplay />
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <PostCard 
                key={`${post.id}-${index}`}
                id={post.id}
                title={post.title}
                content={post.content}
                author={post.author}
                authorId={post.authorId}
                timestamp={post.timestamp}
                type={post.type}
                category={post.category}
                media={post.media}
                image={post.image}
                images={post.images}
                reactions={post.reactions}
                baseRoute={`/main/${post.type}s`} // Dynamic route based on type
                stats={post.stats}
              />
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm">جاري تحميل المزيد...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* End of posts indicator */}
            {!hasMore && <EndOfPosts />}
            
            {/* Load more error */}
            {error && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل المزيد من المنشورات</p>
                <Button onClick={loadMore} variant="outline">إعادة المحاولة</Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}