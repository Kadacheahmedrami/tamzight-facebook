"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ImageData {
  id: number
  title: string
  description: string
  category: string
  image: string
  author: string
  timestamp: string
  location: string
  resolution: string
  tags: string[]
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images")
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>صور امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض صور قسم:</label>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heritage">صور تراثية</SelectItem>
                    <SelectItem value="clothing">ملابس تقليدية</SelectItem>
                    <SelectItem value="nature">مناظر طبيعية</SelectItem>
                    <SelectItem value="art">فنون وحرف</SelectItem>
                    <SelectItem value="food">طعام امازيغي</SelectItem>
                    <SelectItem value="architecture">عمارة امازيغية</SelectItem>
                    <SelectItem value="all">الجميع</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">اعرض القسم</Button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((imageItem) => (
                <div
                  key={imageItem.id}
                  className="bg-white rounded-lg border overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <Image
                      src={imageItem.image || "/placeholder.svg"}
                      alt={imageItem.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">{imageItem.category}</Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {imageItem.resolution}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{imageItem.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{imageItem.description}</p>

                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>المصور:</span>
                        <span>{imageItem.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الموقع:</span>
                        <span>{imageItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التاريخ:</span>
                        <span>{imageItem.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {imageItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      عرض بالحجم الكامل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
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
