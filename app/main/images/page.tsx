"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ImageIcon,
  Search,
} from "lucide-react"

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

      const url = `/api/images${params.toString() ? `?${params.toString()}` : ""}`
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

  const handleClearFilters = () => {
    setSelectedCategory("all")
    setSearchTerm("")
    fetchImages("all", "")
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
                <span>صور امازيغية متنوعة</span>
                {selectedCategory !== "all" && (
                  <>
                    <span>/</span>
                    <span className="text-blue-600 font-medium">
                      {selectedCategory === "heritage" && "صور تراثية"}
                      {selectedCategory === "clothing" && "ملابس تقليدية"}
                      {selectedCategory === "nature" && "مناظر طبيعية"}
                      {selectedCategory === "art" && "فنون وحرف"}
                      {selectedCategory === "food" && "طعام امازيغي"}
                      {selectedCategory === "architecture" && "عمارة امازيغية"}
                    </span>
                  </>
                )}
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
                <Button type="submit" size="sm" className="bg-[#4531fc] hover:bg-blue-800 ">
                  بحث
                </Button>
              </form>

              {/* Category Filter */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض صور قسم:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
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
                {(selectedCategory !== "all" || searchTerm) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCategory("all")
                      setSearchTerm("")
                    }}
                    className="w-full sm:w-auto"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 text-sm text-gray-600">
              {loading ? (
                "جاري البحث..."
              ) : (
                <>
                  تم العثور على {images.length} صورة
                  {selectedCategory !== "all" && (
                    <span className="text-blue-600 font-medium">
                      {" "}في قسم "
                      {selectedCategory === "heritage" && "صور تراثية"}
                      {selectedCategory === "clothing" && "ملابس تقليدية"}
                      {selectedCategory === "nature" && "مناظر طبيعية"}
                      {selectedCategory === "art" && "فنون وحرف"}
                      {selectedCategory === "food" && "طعام امازيغي"}
                      {selectedCategory === "architecture" && "عمارة امازيغية"}
                      "
                    </span>
                  )}
                  {searchTerm && (
                    <span className="text-blue-600 font-medium">
                      {" "}للبحث "{searchTerm}"
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Images Grid */}
            {images.length === 0 && !loading ? (
              <div className="text-center py-12">
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((imageItem) => (
                  <div
                    key={imageItem.id}
                    className="bg-white rounded-lg border overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={imageItem.image || "/placeholder.svg"}
                        alt={imageItem.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary">
                          {imageItem.category === "heritage" && "تراثية"}
                          {imageItem.category === "clothing" && "ملابس"}
                          {imageItem.category === "nature" && "طبيعة"}
                          {imageItem.category === "art" && "فنون"}
                          {imageItem.category === "food" && "طعام"}
                          {imageItem.category === "architecture" && "عمارة"}
                          {!["heritage", "clothing", "nature", "art", "food", "architecture"].includes(imageItem.category) && imageItem.category}
                        </Badge>
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
            )}
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