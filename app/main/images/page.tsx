"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, ImageIcon } from "lucide-react"
import PostCard from "@/components/post-card"

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
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  const fetchImages = async (category: string = "all", search: string = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (category && category !== "all") {
        params.append("category", category)
      }
      
      if (search.trim()) {
        params.append("search", search.trim())
      }

      const url = `/api/main/images${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      const data = await response.json()
      setImages(data)
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(selectedCategory, searchTerm)
  }, [selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchImages(selectedCategory, searchTerm)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Transform image data for PostCard
  const transformImageToPost = (imageItem: ImageData) => ({
    id: imageItem.id.toString(),
    title: imageItem.title,
    content: `${imageItem.description}\n\nالموقع: ${imageItem.location}\nالعلامات: ${imageItem.tags.join(', ')}`,
    author: imageItem.author,
    authorId: imageItem.id.toString(), // You might want to use a proper author ID
    timestamp: imageItem.timestamp,
    category: getCategoryArabic(imageItem.category),
    subCategory: imageItem.resolution,
    media: [{
      id: imageItem.id.toString(),
      type: 'image' as const,
      url: imageItem.image || "/placeholder.svg",
      alt: imageItem.title,
      resolution: imageItem.resolution
    }],
    baseRoute: 'images',
    stats: {
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 50) + 10,
      comments: Math.floor(Math.random() * 20) + 5,
      shares: Math.floor(Math.random() * 10) + 2
    }
  })

  const getCategoryArabic = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "heritage": "تراثية",
      "clothing": "ملابس",
      "nature": "طبيعة",
      "art": "فنون",
      "food": "طعام",
      "architecture": "عمارة"
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
          <span>صور امازيغية متنوعة</span>
        </div>
      </nav>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-4 mb-4 border space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="ابحث في الصور..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="pr-10"
            />
          </div>
          <Button type="submit" size="sm" className="bg-[#4531fc] hover:bg-blue-800">
            بحث
          </Button>
        </form>

        {/* Category Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض صور:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="heritage">صور تراثية</SelectItem>
              <SelectItem value="clothing">ملابس تقليدية</SelectItem>
              <SelectItem value="nature">مناظر طبيعية</SelectItem>
              <SelectItem value="art">فنون وحرف</SelectItem>
              <SelectItem value="food">طعام امازيغي</SelectItem>
              <SelectItem value="architecture">عمارة امازيغية</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => fetchImages(selectedCategory, searchTerm)} className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto">
            اعرض
          </Button>
        </div>
      </div>

      {/* Images Feed */}
      <div className="space-y-4">
        {images.length > 0 ? (
          images.map((imageItem) => (
            <PostCard
              key={imageItem.id}
              {...transformImageToPost(imageItem)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صور</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `لم يتم العثور على صور تحتوي على "${searchTerm}"`
                : "لا توجد صور في هذا القسم حالياً"
              }
            </p>
            {(selectedCategory !== "all" || searchTerm) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all")
                  setSearchTerm("")
                }}
                className="mt-4"
              >
                عرض جميع الصور
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}