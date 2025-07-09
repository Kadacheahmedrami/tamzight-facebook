"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, ImageIcon } from "lucide-react"
import PostCard from "@/components/card-comps/post-card"

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

// Loading skeleton component for images
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="bg-gray-200 rounded-full px-3 py-1 w-16 h-6"></div>
        </div>
        
        {/* Content */}
        <div className="mb-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Image placeholder */}
        <div className="h-64 bg-gray-200 rounded mb-3"></div>
        
        {/* Footer stats */}
        <div className="flex gap-4 pt-3 border-t">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [allImages, setAllImages] = useState<ImageData[]>([]) // Store all images for client-side pagination

  const fetchImages = async (category: string = "all", search: string = "", pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    try {
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
      
      // Handle different response structures
      let imagesData = []
      if (Array.isArray(data)) {
        imagesData = data
      } else if (data && Array.isArray(data.images)) {
        imagesData = data.images
      } else if (data && Array.isArray(data.data)) {
        imagesData = data.data
      }

      if (isLoadMore) {
        // Client-side pagination simulation
        const startIndex = (pageNumber - 1) * 10
        const endIndex = pageNumber * 10
        const pageData = allImages.slice(startIndex, endIndex)
        
        if (pageData.length > 0) {
          setImages(prev => [...prev, ...pageData])
        }
        setHasMore(endIndex < allImages.length)
      } else {
        // Store all images for pagination
        setAllImages(imagesData)
        // Show first 10 images
        const initialData = imagesData.slice(0, 10)
        setImages(initialData)
        setHasMore(imagesData.length > 10)
      }

    } catch (error) {
      console.error("Error fetching images:", error)
      if (!isLoadMore) {
        setImages([])
        setAllImages([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 1000) {
      if (hasMore && !loading && !loadingMore) {
        setPage(prev => prev + 1)
      }
    }
  }, [hasMore, loading, loadingMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    fetchImages(selectedCategory, searchTerm, 1)
    setPage(1)
  }, [selectedCategory])

  useEffect(() => {
    if (page > 1) {
      fetchImages(selectedCategory, searchTerm, page, true)
    }
  }, [page])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setImages([])
    setAllImages([])
    setPage(1)
    setHasMore(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setImages([])
    setAllImages([])
    setPage(1)
    setHasMore(true)
    fetchImages(selectedCategory, searchTerm, 1)
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const resetFilters = () => {
    setSelectedCategory("all")
    setSearchTerm("")
    setImages([])
    setAllImages([])
    setPage(1)
    setHasMore(true)
  }

  // Transform image data for PostCard
  const transformImageToPost = (imageItem: ImageData) => ({
    id: imageItem.id.toString(),
    title: imageItem.title,
    content: `${imageItem.description}\n\nالموقع: ${imageItem.location}\nالعلامات: ${imageItem.tags.join(', ')}`,
    author: imageItem.author,
    authorId: imageItem.id.toString(),
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
          <Button 
            type="submit" 
            size="sm" 
            className="bg-[#4531fc] hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? "جاري البحث..." : "بحث"}
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
          <Button 
            size="sm" 
            onClick={() => {
              setImages([])
              setAllImages([])
              setPage(1)
              setHasMore(true)
              fetchImages(selectedCategory, searchTerm, 1)
            }} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "جاري التحميل..." : "اعرض"}
          </Button>
        </div>
      </div>

      {/* Images Feed */}
      <div className="space-y-4">
        {loading && images.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
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
                    onClick={resetFilters}
                    className="mt-4"
                  >
                    عرض جميع الصور
                  </Button>
                )}
              </div>
            )}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="space-y-4">
                <LoadingSkeleton />
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && images.length > 0 && (
              <div className="text-center py-8 text-gray-500 border-t">
                تم عرض جميع الصور المتاحة
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}