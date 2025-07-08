"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
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

interface ApiResponse {
  error: string
  success: boolean
  data: any[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    type: string
  }
}

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    limit: 20,
    offset: 0,
    total: 0
  })

  // Refs for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false) // Prevent multiple simultaneous requests
  const abortControllerRef = useRef<AbortController | null>(null) // For request cancellation

  // Transform API data to match PostCard format
  const transformPost = useCallback((item: any): Post => ({
    id: item.id?.toString() || Math.random().toString(36).substr(2, 9),
    title: item.title || 'بدون عنوان',
    content: item.content || item.description || '',
    author: item.author ? `${item.author.firstName} ${item.author.lastName}` : 'مجهول',
    authorId: item.author?.id?.toString() || 'unknown',
    timestamp: formatTimestamp(item.timestamp),
    category: item.type || 'عام',
    subCategory: item.category || undefined,
    media: [],
    image: item.image || undefined,
    images: item.images || [],
    stats: {
      views: item.views || Math.floor(Math.random() * 1000) + 100,
      likes: item._count?.likes || 0,
      comments: item._count?.comments || 0,
      shares: item._count?.shares || 0
    }
  }), [])

  const fetchPosts = useCallback(async (type = "all", offset = 0, isLoadMore = false) => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current) {
      console.log('Request already in progress, skipping...')
      return
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    isLoadingRef.current = true

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString()
      })
      
      if (type !== "all") {
        params.append('type', type)
      }

      const url = `/api/main/latest?${params.toString()}`
      console.log(`Fetching: ${url}`)
      
      const response = await fetch(url, {
        signal: abortController.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        const transformedPosts = data.data.map(transformPost)
        
        if (isLoadMore) {
          // Append new posts to existing ones
          setPosts(prev => {
            // Prevent duplicates
            const existingIds = new Set(prev.map(p => p.id))
            const newPosts = transformedPosts.filter(p => !existingIds.has(p.id))
            console.log(`Adding ${newPosts.length} new posts to existing ${prev.length} posts`)
            return [...prev, ...newPosts]
          })
        } else {
          // Replace posts for new type/filter
          setPosts(transformedPosts)
          console.log(`Replaced with ${transformedPosts.length} posts`)
        }
        
        // Update pagination state with current offset
        setPagination({
          limit: data.meta.limit,
          offset: data.meta.offset,
          total: data.meta.total
        })
        
        // Update hasMore based on API response
        setHasMore(data.meta.hasMore)
        
        console.log(`Loaded ${transformedPosts.length} posts, hasMore: ${data.meta.hasMore}, offset: ${data.meta.offset}`)
      } else {
        throw new Error(data.error || 'Failed to fetch posts')
      }
    } catch (error) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        return
      }
      
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
      
      // Clean up abort controller
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }, [pagination.limit, transformPost])

  const formatTimestamp = useCallback((timestamp: string | Date) => {
    if (!timestamp) return 'منذ وقت قصير'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return 'منذ وقت قصير'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة${diffInHours > 1 ? '' : ''}`
    if (diffInDays < 7) return `منذ ${diffInDays} يوم${diffInDays > 1 ? '' : ''}`
    
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }, [])

  // Load more posts when intersection observer triggers
  const loadMore = useCallback(() => {
    if (!loadingMore && !isLoadingRef.current && hasMore && posts.length > 0) {
      // Use the next offset from pagination state
      const nextOffset = pagination.offset + pagination.limit
      console.log(`Loading more posts with offset: ${nextOffset}, current posts: ${posts.length}`)
      fetchPosts(selectedType, nextOffset, true)
    }
  }, [loadingMore, hasMore, posts.length, selectedType, fetchPosts, pagination.offset, pagination.limit])

  // Handle type change
  const handleTypeChange = useCallback((type: string) => {
    console.log(`Changing type to: ${type}`)
    setSelectedType(type)
    setHasMore(true)
    setPagination(prev => ({ ...prev, offset: 0 }))
    fetchPosts(type, 0, false)
  }, [fetchPosts])

  // Refresh posts
  const refreshPosts = useCallback(() => {
    console.log('Refreshing posts')
    setHasMore(true)
    setPagination(prev => ({ ...prev, offset: 0 }))
    fetchPosts(selectedType, 0, false)
  }, [selectedType, fetchPosts])

  // Set up intersection observer
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!hasMore || loadingMore || isLoadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingRef.current && hasMore) {
          console.log('Intersection observer triggered')
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
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

  // Cleanup on unmount
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

  // Error component
  const ErrorDisplay = () => (
    <div className="text-center py-8">
      <div className="bg-red-50 rounded-lg p-8">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-2">حدث خطأ في تحميل المنشورات</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <Button 
          onClick={refreshPosts}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          إعادة المحاولة
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
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
          <label className="text-sm font-medium whitespace-nowrap">اعرض اخر منشورات حول:</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم لعرضه" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="post">المنشورات</SelectItem>
              <SelectItem value="book">الكتب</SelectItem>
              <SelectItem value="idea">الأفكار</SelectItem>
              <SelectItem value="image">الصور</SelectItem>
              <SelectItem value="video">الفيديوهات</SelectItem>
              <SelectItem value="truth">الحقائق</SelectItem>
              <SelectItem value="question">الأسئلة</SelectItem>
              <SelectItem value="ad">الإعلانات</SelectItem>
              <SelectItem value="product">المنتجات</SelectItem>
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

      {/* Error Display */}
      {error && posts.length === 0 && <ErrorDisplay />}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length > 0 ? (
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
                category={post.category}
                subCategory={post.subCategory}
                media={post.media}
                image={post.image}
                images={post.images}
                baseRoute="/main/posts"
                stats={post.stats}
              />
            ))}
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="h-20 flex items-center justify-center"
              >
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm">جاري تحميل المزيد...</span>
                  </div>
                )}
              </div>
            )}
            
            {/* End of posts indicator */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-gray-400 text-4xl mb-2">🎉</div>
                  <p className="text-gray-600 text-sm">تم عرض جميع المنشورات</p>
                  <p className="text-gray-500 text-xs mt-1">المجموع: {posts.length} منشور</p>
                </div>
              </div>
            )}
          </>
        ) : !loading && !error && (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-600 text-lg mb-2">لا توجد منشورات في هذا القسم</p>
              <p className="text-gray-500 text-sm">جرب تغيير الفئة أو أضف منشوراً جديداً</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}