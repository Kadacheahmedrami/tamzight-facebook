"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import PostCard from "@/components/card-comps/post-card"
import CreatePostModal from "@/components/create-post/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Filter } from "lucide-react"

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

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalPosts: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
}

export default function PostsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all")
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "")
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || "1"))
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const POSTS_PER_PAGE = 10

  // Debounced search query
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Categories configuration
  const categories = useMemo(() => [
    { value: "all", label: "الجميع" },
    { value: "history", label: "تاريخية" },
    { value: "culture", label: "ثقافية" },
    { value: "language", label: "لغوية" },
    { value: "art", label: "فنية" },
    { value: "news", label: "أخبار" },
    { value: "tradition", label: "تراثية" }
  ], [])

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

  // Update URL with current filters
  const updateURL = useCallback((category: string, search: string, page: number) => {
    const params = new URLSearchParams()
    
    if (category !== "all") params.set('category', category)
    if (search) params.set('search', search)
    if (page > 1) params.set('page', page.toString())
    
    const queryString = params.toString()
    const url = queryString ? `?${queryString}` : ''
    
    router.replace(`/main/posts${url}`, { scroll: false })
  }, [router])

  // Fetch posts function
  const fetchPosts = async (category = "all", search = "", page = 1, append = false) => {
    if (page === 1) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: POSTS_PER_PAGE.toString()
      })
      
      if (category !== "all") params.set('category', category)
      if (search.trim()) params.set('search', search.trim())
      
      const response = await fetch(`/api/main/posts?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform the data to match PostCard expected format
      const transformedPosts = data.posts?.map((post: any) => ({
        ...post,
        id: post.id?.toString() || Math.random().toString(36).substr(2, 9),
        authorId: post.authorId || post.author?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        category: "منشور", // Set main category as "منشور"
        subCategory: post.subcategory || post.category, // Use subcategory from API
        media: post.media || [],
        images: post.images || []
      })) || []

      setPagination(data.pagination)
      
      if (append) {
        setPosts(prev => [...prev, ...transformedPosts])
      } else {
        setPosts(transformedPosts)
      }

      // Update URL
      updateURL(category, search, page)

    } catch (error) {
      console.error("Error fetching posts:", error)
      setError("فشل في تحميل المنشورات. يرجى المحاولة مرة أخرى.")
      
      // Fallback for first page only
      if (page === 1) {
        setPosts([])
        setPagination(null)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsRefreshing(false)
    }
  }

  // Scroll event handler for infinite scrolling
  const handleScroll = useCallback(() => {
    if (loadingMore || !pagination?.hasNextPage) return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight

    // Load more when user scrolls to bottom (with 100px buffer)
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchPosts(selectedCategory, debouncedSearchQuery, nextPage, true)
    }
  }, [currentPage, selectedCategory, debouncedSearchQuery, loadingMore, pagination])

  // Effect for scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Effect for initial load and filter changes
  useEffect(() => {
    setCurrentPage(1)
    setPosts([])
    fetchPosts(selectedCategory, debouncedSearchQuery, 1, false)
  }, [selectedCategory, debouncedSearchQuery])

  // Effect for URL params on mount
  useEffect(() => {
    const urlCategory = searchParams.get('category') || "all"
    const urlSearch = searchParams.get('search') || ""
    const urlPage = parseInt(searchParams.get('page') || "1")
    
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory)
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch)
    if (urlPage !== currentPage) setCurrentPage(urlPage)
  }, [searchParams])

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    setPosts([])
    setError(null)
  }

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    setPosts([])
    setError(null)
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setCurrentPage(1)
    setPosts([])
    setError(null)
    fetchPosts(selectedCategory, debouncedSearchQuery, 1, false)
  }

  // Clear filters
  const clearFilters = () => {
    setSelectedCategory("all")
    setSearchQuery("")
    setCurrentPage(1)
    setPosts([])
    setError(null)
  }

  // Get current category label
  const getCurrentCategoryLabel = () => {
    return categories.find(cat => cat.value === selectedCategory)?.label || "الجميع"
  }

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>منشورات حول الامة الامازيغ</span>
            {selectedCategory !== "all" && (
              <>
                <span>/</span>
                <span className="text-blue-600">{getCurrentCategoryLabel()}</span>
              </>
            )}
          </div>
        </nav>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-4 border">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="ابحث في المنشورات..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium whitespace-nowrap">اعرض منشورات:</label>
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="اختار قسم" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  onClick={handleRefresh} 
                  className="bg-[#4531fc] hover:bg-blue-800 flex-1 sm:flex-none"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? "جاري التحديث..." : "تحديث"}
                </Button>
                
                {(selectedCategory !== "all" || searchQuery) && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={clearFilters}
                    className="flex-1 sm:flex-none"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
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
          {selectedCategory !== "all" && (
            <>
              <span>/</span>
              <span className="text-blue-600">{getCurrentCategoryLabel()}</span>
            </>
          )}
        </div>
      </nav>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث في المنشورات..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium whitespace-nowrap">اعرض منشورات:</label>
            </div>
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="اختار قسم" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                size="sm" 
                onClick={handleRefresh} 
                className="bg-[#4531fc] hover:bg-blue-800 flex-1 sm:flex-none"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? "جاري التحديث..." : "تحديث"}
              </Button>
              
              {(selectedCategory !== "all" || searchQuery) && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1 sm:flex-none"
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {pagination && (
        <div className="mb-4 text-sm text-gray-600">
          <span>
            عرض {posts.length} من أصل {pagination.totalPosts} منشور
            {(selectedCategory !== "all" || searchQuery) && (
              <span className="mr-2">
                {searchQuery && `• البحث: "${searchQuery}"`}
                {selectedCategory !== "all" && `• القسم: ${getCurrentCategoryLabel()}`}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Create Post */}
      <CreatePostModal />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            className="mt-2"
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

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
                baseRoute="/main/posts"
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
            {pagination && !pagination.hasNextPage && posts.length > 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="text-gray-400 text-4xl mb-2">✨</div>
                  <p className="text-gray-600 text-sm">تم عرض جميع المنشورات</p>
                  {pagination.totalPosts > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      إجمالي {pagination.totalPosts} منشور
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : !loading && (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">
                {searchQuery ? "🔍" : "📝"}
              </div>
              <p className="text-gray-600 text-lg mb-2">
                {searchQuery 
                  ? `لا توجد نتائج للبحث "${searchQuery}"`
                  : "لا توجد منشورات في هذا القسم"
                }
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery 
                  ? "جرب كلمات مختلفة أو تحقق من الإملاء"
                  : "جرب تغيير الفئة أو ابحث عن محتوى آخر"
                }
              </p>
              {(selectedCategory !== "all" || searchQuery) && (
                <Button 
                  size="sm" 
                  onClick={clearFilters}
                  variant="outline"
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}