"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import PostCard from "@/components/LatestSactionCards/post-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Session } from "next-auth"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  alt?: string
  duration?: string
  resolution?: string
}

interface User {
  id: number
  firstName: string
  lastName: string
  avatar?: string | null
  email: string
  createdAt: Date
  updatedAt: Date
}

interface Reaction {
  id: number
  emoji: string
  userId: number
  user: User
  createdAt: Date
}

interface Post {
  id: string
  originalId?: string // Add this field to track the original post ID
  title: string
  content: string
  description?: string | null
  author: string
  authorId: number
  authorData: User
  timestamp: string
  type: string
  category: string
  subcategory?: string | null
  media?: MediaItem[]
  image?: string | null
  images?: string[]
  reactions: Reaction[]
  _count: {
    likes: number
    comments: number
    shares: number
  }
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  price?: number
  currency?: string
  inStock?: boolean
  sizes?: string[]
  colors?: string[]
  userHasLiked?: boolean
  userReaction?: string | null
  reactionDetails?: any
  // Share-specific fields
  isShared?: boolean
  sharedBy?: User
  sharedAt?: string
  originalType?: string
  originalAuthor?: string
  originalAuthorData?: User
  shareId?: string
}

interface ApiResponse {
  success: boolean
  data: any[]
  meta: {
    total: number
    hasMore: boolean
    currentUserId?: string | null
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
  { value: "product", label: "المنتجات" },
  { value: "share", label: "المنشورات المشاركة" }
]

const LIMIT = 20

export default function PostsPageClient({ session }: { session: Session | null }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentOffset, setCurrentOffset] = useState(0)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const isLoadingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  const formatTimestamp = useCallback((timestamp: string | Date) => {
    if (!timestamp) return 'منذ وقت قصير'
    
    const diffInHours = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 1) return 'منذ وقت قصير'
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`
    
    return new Date(timestamp).toLocaleDateString('ar-SA', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    })
  }, [])

  const transformPost = useCallback((item: any): Post => {
    console.log('Raw API item:', {
      id: item.id,
      shareId: item.shareId,
      sharedBy: item.sharedBy,
      isShared: !!item.sharedBy,
      allKeys: Object.keys(item)
    })

    const media: MediaItem[] = []
    
    if (item.image) {
      media.push({
        id: `img-${item.id}`,
        type: 'image',
        url: item.image,
        alt: item.title || 'صورة'
      })
    }
    
    if (item.images?.length) {
      item.images.forEach((url: string, i: number) => {
        media.push({
          id: `img-${item.id}-${i}`,
          type: 'image',
          url,
          alt: item.title || 'صورة'
        })
      })
    }

    // Check if this is a shared post
    const isShared = !!item.sharedBy
    
    // For shared posts, we need to handle the original author vs the person who shared
    const displayAuthor = isShared 
      ? `${item.author.firstName} ${item.author.lastName}` // Original author
      : item.author 
        ? `${item.author.firstName} ${item.author.lastName}` 
        : 'مجهول'

    const sharedByName = isShared && item.sharedBy 
      ? `${item.sharedBy.firstName} ${item.sharedBy.lastName}`
      : undefined

    // Create a unique ID for shared posts vs original posts
    const uniqueId = isShared ? `share-${item.shareId}` : item.id?.toString() || Math.random().toString(36).substr(2, 9)
    const originalId = item.id?.toString()

    const transformedPost = {
      id: uniqueId, // Use unique ID that differentiates shares from originals
      originalId, // Keep track of the original post ID for API calls
      title: item.title || 'بدون عنوان',
      content: item.content || item.description || '',
      description: item.description || null,
      author: displayAuthor,
      authorId: item.authorId || item.author?.id || 0,
      authorData: item.author || { 
        id: parseInt(item.authorId) || 0, 
        firstName: 'مجهول', 
        lastName: '',
        email: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      timestamp: formatTimestamp(isShared ? item.sharedAt : item.timestamp),
      type: item.originalType || item.type || 'post',
      category: item.category || 'عام',
      subcategory: item.subcategory,
      media,
      image: item.image,
      images: item.images,
      reactions: item.reactions || [],
      _count: item._count || {
        likes: item.likes?.length || 0,
        comments: item.comments?.length || 0,
        shares: item.shares?.length || 0
      },
      stats: {
        views: item.views || 0,
        likes: item._count?.likes || item.likes?.length || 0,
        comments: item._count?.comments || item.comments?.length || 0,
        shares: item._count?.shares || item.shares?.length || 0
      },
      price: item.price,
      currency: item.currency,
      inStock: item.inStock,
      sizes: item.sizes,
      colors: item.colors,
      userHasLiked: item.userHasLiked || false,
      userReaction: item.userReaction,
      reactionDetails: item.reactionDetails,
      // Share-specific fields
      isShared,
      sharedBy: item.sharedBy ? {
        ...item.sharedBy,
        email: item.sharedBy.email || '',
        createdAt: new Date(item.sharedBy.createdAt || Date.now()),
        updatedAt: new Date(item.sharedBy.updatedAt || Date.now())
      } : undefined,
      sharedAt: isShared ? formatTimestamp(item.sharedAt) : undefined,
      originalType: item.originalType,
      originalAuthor: isShared ? displayAuthor : undefined,
      originalAuthorData: isShared ? item.author : undefined,
      shareId: isShared ? item.shareId : undefined
    }

    console.log('Transformed post:', {
      id: transformedPost.id,
      originalId: transformedPost.originalId,
      shareId: transformedPost.shareId,
      isShared: transformedPost.isShared,
      sharedBy: transformedPost.sharedBy
    })

    return transformedPost
  }, [formatTimestamp])

  const fetchPosts = useCallback(async (type = "all", offset = 0, isLoadMore = false) => {
    if (isLoadingRef.current || !isMountedRef.current) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
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
      
      if (type !== "all") params.append('type', type)

      const response = await fetch(`/api/main/latest?${params}`, {
        signal: abortController.signal
      })
      
      if (!isMountedRef.current || abortController.signal.aborted) {
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      
      if (!isMountedRef.current || abortController.signal.aborted) {
        return
      }
      
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.error || 'Invalid response format')
      }

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
      
      setHasMore(data.meta?.hasMore !== false && transformedPosts.length === LIMIT)
      
    } catch (error) {
      if (!isMountedRef.current) return
      
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل المنشورات'
      setError(errorMessage)
      
      if (!isLoadMore) setPosts([])
      setHasMore(false)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
      isLoadingRef.current = false
      
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }, [transformPost])

  const loadMore = useCallback(() => {
    if (!loadingMore && !isLoadingRef.current && hasMore && posts.length > 0 && isMountedRef.current) {
      fetchPosts(selectedType, currentOffset, true)
    }
  }, [loadingMore, hasMore, posts.length, selectedType, fetchPosts, currentOffset])

  const handleTypeChange = useCallback((type: string) => {
    if (!isMountedRef.current) return
    
    setSelectedType(type)
    setHasMore(true)
    setCurrentOffset(0)
    setPosts([])
    fetchPosts(type, 0, false)
  }, [fetchPosts])

  const refreshPosts = useCallback(() => {
    if (!isMountedRef.current) return
    
    setHasMore(true)
    setCurrentOffset(0)
    setPosts([])
    fetchPosts(selectedType, 0, false)
  }, [selectedType, fetchPosts])

  // Updated delete handler
  const handlePostDelete = useCallback((postId: string) => {
    console.log('Deleting post with ID:', postId)
    setPosts(prev => {
      const filtered = prev.filter(p => p.id !== postId)
      console.log('Posts before delete:', prev.length, 'After delete:', filtered.length)
      return filtered
    })
  }, [])

  // Updated update handler
  const handlePostUpdate = useCallback((postId: string, updatedData: any) => {
    setPosts(prev => prev.map(p => {
      // For original posts, match by originalId or id
      // For shared posts, we don't update the content since it's a reference
      if (!p.isShared && (p.originalId === postId || p.id === postId)) {
        return { ...p, ...updatedData }
      }
      return p
    }))
  }, [])

  useEffect(() => {
    if (!isMountedRef.current) return
    
    observerRef.current?.disconnect()

    if (!hasMore || loadingMore || isLoadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingRef.current && hasMore && posts.length > 0 && isMountedRef.current) {
          loadMore()
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    observerRef.current = observer

    return () => observer.disconnect()
  }, [hasMore, loadingMore, loadMore, posts.length])

  useEffect(() => {
    if (isMountedRef.current) {
      fetchPosts()
    }
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
      observerRef.current?.disconnect()
    }
  }, [])

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
          <div className="flex-row  justify-start items-center mb-4 flex gap-3">
            <div className="h-4 py-2 bg-gray-200  rounded-full w-10  "></div>
            <div className=" bg-gray-200 rounded-full h-2 w-2  "></div>
            <div className="h-4 py-2 bg-gray-200 rounded-full w-10"></div>
          </div>
            
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-60 bg-gray-200 rounded mb-3"></div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-3 bg-gray-200 rounded w-12"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const StatusMessage = ({ type, title, message }: { type: string, title: string, message: string }) => (
    <div className="text-center py-8">
      <div className={`${type === 'error' ? 'bg-red-50' : 'bg-gray-50'} rounded-lg p-8`}>
        <div className={`${type === 'error' ? 'text-red-400' : 'text-gray-400'} text-6xl mb-4`}>
          {type === 'error' ? '⚠️' : type === 'empty' ? '📝' : '🎉'}
        </div>
        <p className={`${type === 'error' ? 'text-red-600' : 'text-gray-600'} text-lg mb-2`}>{title}</p>
        <p className={`${type === 'error' ? 'text-red-500' : 'text-gray-500'} text-sm`}>{message}</p>
        {type === 'error' && (
          <Button onClick={refreshPosts} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 mt-4">
            إعادة المحاولة
          </Button>
        )}
        {type === 'end' && (
          <p className="text-gray-500 text-xs mt-1">المجموع: {posts.length} منشور</p>
        )}
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

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading && posts.length === 0 ? (
          <LoadingSkeleton />
        ) : error && posts.length === 0 ? (
          <StatusMessage type="error" title="حدث خطأ في تحميل المنشورات" message={error} />
        ) : posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <PostCard 
                key={`${post.id}-${index}`}
                id={post.originalId || post.id} // Use originalId for API calls, fallback to unique id
                title={post.title}
                content={post.content}
                author={post.author}
                authorId={post.authorId}
                authorData={post.authorData}
                timestamp={post.timestamp}
                category={post.category}
                subcategory={post.subcategory}
                type={post.type}
                image={post.image}
                images={post.images}
                stats={post.stats}
                baseRoute={`/main/${post.type}s`}
                session={session}
                userHasLiked={post.userHasLiked}
                userReaction={post.userReaction}
                reactionDetails={post.reactionDetails}
                price={post.price}
                currency={post.currency}
                inStock={post.inStock}
                sizes={post.sizes}
                sharedBy={post.sharedBy}
                sharedAt={post.sharedAt}
                originalType={post.originalType}
                shareId={post.shareId}
                onDelete={handlePostDelete} // Pass the unique ID handler
                onUpdate={handlePostUpdate} // Pass the updated handler
              />
            ))}
            
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
            
            {!hasMore && <StatusMessage type="end" title="تم عرض جميع المنشورات" message="" />}
            
            {error && (
              <div className="text-center py-4">
                <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل المزيد من المنشورات</p>
                <Button onClick={loadMore} variant="outline">إعادة المحاولة</Button>
              </div>
            )}
          </>
        ) : (
          <StatusMessage type="empty" title="لا توجد منشورات في هذا القسم" message="جرب تغيير الفئة أو أضف منشوراً جديداً" />
        )}
      </div>
    </div>
  )
}