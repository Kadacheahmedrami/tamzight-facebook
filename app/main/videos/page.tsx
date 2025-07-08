"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play } from "lucide-react"
import PostCard from "@/components/post-card"

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

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchVideos = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/videos" : `/api/main/videos?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setVideos(data)
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchVideos(category)
  }

  // Transform video data for PostCard
  const transformVideoToPost = (video: VideoData) => ({
    id: video.id.toString(),
    title: video.title,
    content: `${video.content}\n\nاللغة: ${video.language}\nالجودة: ${video.quality}`,
    author: video.author,
    authorId: video.id.toString(), // You might want to use a proper author ID
    timestamp: video.timestamp,
    category: getCategoryArabic(video.category),
    subCategory: video.duration,
    media: [{
      id: video.id.toString(),
      type: 'video' as const,
      url: `/api/videos/${video.id}`, // Assuming this would be the video URL
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
          <span>فيديوهات أمازيغية متنوعة</span>
        </div>
      </nav>

      {/* Filter */}
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
          <Button size="sm" onClick={() => fetchVideos(selectedCategory)} className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto">
            اعرض
          </Button>
        </div>
      </div>

      {/* Videos Feed */}
      <div className="space-y-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <PostCard
              key={video.id}
              {...transformVideoToPost(video)}
            />
          ))
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
                  fetchVideos("all")
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