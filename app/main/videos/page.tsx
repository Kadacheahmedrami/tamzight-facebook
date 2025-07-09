"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play } from "lucide-react"
import PostCard from "@/components/card-comps/post-card"

interface VideoData {
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
  duration: string
  quality: string
  language: string
}

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

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchVideos = async (category = "all", pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const url = category === "all" 
        ? `/api/main/videos?page=${pageNum}&limit=10`
        : `/api/main/videos?category=${category}&page=${pageNum}&limit=10`
      
      const response = await fetch(url)
      const data = await response.json()
      
      // Handle the response structure - adjust based on your API
      const videosData = Array.isArray(data) ? data : data.videos || []
      const hasMoreData = data.hasMore !== undefined ? data.hasMore : videosData.length === 10
      
      if (append) {
        setVideos(prev => [...prev, ...videosData])
      } else {
        setVideos(videosData)
      }
      
      setHasMore(hasMoreData)
    } catch (error) {
      console.error("Error fetching videos:", error)
      // Set empty array on error to prevent undefined length error
      if (!append) {
        setVideos([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchVideos(selectedCategory, nextPage, true)
    }
  }, [selectedCategory, page, loadingMore, hasMore])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPage(1)
    setHasMore(true)
    fetchVideos(category, 1, false)
  }

  // Transform video data for PostCard
  const transformVideoToPost = (video: VideoData) => ({
    id: video.id.toString(),
    title: video.title,
    content: `${video.content}\n\nاللغة: ${video.language}\nالجودة: ${video.quality}`,
    author: video.author,
    authorId: video.id.toString(),
    timestamp: video.timestamp,
    category: getCategoryArabic(video.category),
    subCategory: video.duration,
    media: [{
      id: video.id.toString(),
      type: 'video' as const,
      url: `/api/videos/${video.id}`,
      thumbnail: video.image || "/placeholder.svg",
      alt: video.title,
      duration: video.duration
    }],
    baseRoute: 'videos',
    stats: video.stats
  })

  const getCategoryArabic = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "educational": "تعليمية",
      "cultural": "ثقافية", 
      "historical": "تاريخية"
    }
    return categoryMap[category] || category
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb - Always visible */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>فيديوهات أمازيغية متنوعة</span>
        </div>
      </nav>

      {/* Filter - Always visible */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض فيديوهات:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="educational">فيديوهات تعليمية</SelectItem>
              <SelectItem value="cultural">فيديوهات ثقافية</SelectItem>
              <SelectItem value="historical">فيديوهات تاريخية</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={() => handleCategoryChange(selectedCategory)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            اعرض
          </Button>
        </div>
      </div>

      {/* Videos Feed */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : videos.length > 0 ? (
          <>
            {videos.map((video) => (
              <PostCard
                key={video.id}
                {...transformVideoToPost(video)}
              />
            ))}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="py-4">
                <LoadingSkeleton />
              </div>
            )}
            
            {/* Load more button (fallback for infinite scroll) */}
            {!loadingMore && hasMore && (
              <div className="text-center py-4">
                <Button 
                  onClick={loadMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  تحميل المزيد
                </Button>
              </div>
            )}
            
            {/* End of results message */}
            {!hasMore && videos.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                لا توجد المزيد من الفيديوهات
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Play className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فيديوهات</h3>
            <p className="text-gray-500">لا توجد فيديوهات في هذا القسم حالياً</p>
            {selectedCategory !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all")
                  setPage(1)
                  setHasMore(true)
                  fetchVideos("all", 1, false)
                }}
                className="mt-4"
              >
                عرض جميع الفيديوهات
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}