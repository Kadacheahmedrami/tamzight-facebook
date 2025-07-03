"use client"

import { useEffect, useState } from "react"

import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Play,
  Eye,
  Heart,
  Clock,
} from "lucide-react"

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
      const url = category === "all" ? "/api/videos" : `/api/videos?category=${category}`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        
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
  

   

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>فيديوهات أمازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اختار فيديوهات:</label>
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
                <Button size="sm" onClick={() => fetchVideos(selectedCategory)} className="w-full bg-[#4531fc] sm:w-auto">
                  اعرض
                </Button>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.length > 0 ? (
                videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={video.image || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </div>
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {video.quality}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{video.category}</Badge>
                      </div>
                      <CardTitle className="text-sm leading-tight line-clamp-2">{video.title}</CardTitle>
                      <CardDescription className="text-xs">{video.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{video.content}</p>

                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        <div className="flex justify-between">
                          <span>اللغة:</span>
                          <span>{video.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>تاريخ النشر:</span>
                          <span>{video.timestamp.split(" ")[3]}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.stats.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {video.stats.likes}
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          مشاهدة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">لا توجد فيديوهات في هذا القسم</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 p-4">
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