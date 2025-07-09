"use client"

import { useEffect, useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Book,
  Download,
  Eye,
  Star,
} from "lucide-react"

interface BookData {
  id: number
  title: string
  author: string
  description: string
  category: string
  language: string
  pages: number
  publishYear: string
  image: string
  downloadUrl: string
  rating: number
  downloads: number
  fileSize: string
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="overflow-hidden animate-pulse">
        <div className="flex h-56">
          {/* Book Image Skeleton */}
          <div className="relative w-40 flex-shrink-0">
            <div className="w-full h-full bg-gray-200 rounded-l-lg"></div>
            <div className="absolute top-2 left-2 bg-gray-300 text-xs px-2 py-1 rounded w-12 h-5"></div>
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 flex flex-col">
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gray-200 rounded-full px-3 py-1 w-16 h-6"></div>
              </div>
              <div className="bg-gray-200 rounded w-3/4 h-5 mb-2"></div>
              <div className="bg-gray-200 rounded w-1/2 h-4"></div>
            </CardHeader>
            
            <CardContent className="pt-0 flex-1 flex flex-col justify-between">
              <div>
                <div className="space-y-2 mb-4">
                  <div className="bg-gray-200 rounded w-full h-3"></div>
                  <div className="bg-gray-200 rounded w-5/6 h-3"></div>
                  <div className="bg-gray-200 rounded w-2/3 h-3"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex justify-between">
                    <div className="bg-gray-200 rounded w-12 h-3"></div>
                    <div className="bg-gray-200 rounded w-16 h-3"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 rounded w-12 h-3"></div>
                    <div className="bg-gray-200 rounded w-8 h-3"></div>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <div className="bg-gray-200 rounded w-16 h-3"></div>
                    <div className="bg-gray-200 rounded w-12 h-3"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-200 rounded w-4 h-4"></div>
                    <div className="bg-gray-200 rounded w-8 h-3"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="bg-gray-200 rounded w-4 h-4"></div>
                    <div className="bg-gray-200 rounded w-8 h-3"></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <div className="bg-gray-200 rounded flex-1 h-8"></div>
                <div className="bg-gray-200 rounded flex-1 h-8"></div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    ))}
  </div>
)

export default function BooksPage() {
  const [books, setBooks] = useState<BookData[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchBooks = async (category = "all", pageNumber = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    
    try {
      // For now, use the original API structure without pagination params
      // You can modify this when your API supports pagination
      const url = category === "all" ? "/api/main/books" : `/api/main/books?category=${category}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      // Handle different response structures
      let booksData = []
      if (Array.isArray(data)) {
        // If data is directly an array of books
        booksData = data
      } else if (data && Array.isArray(data.books)) {
        // If data has a books property
        booksData = data.books
      } else if (data && Array.isArray(data.data)) {
        // If data has a data property
        booksData = data.data
      }
      
      if (isLoadMore) {
        // For now, simulate pagination by slicing the data
        // This is a temporary solution until your API supports pagination
        const startIndex = (pageNumber - 1) * 10
        const endIndex = pageNumber * 10
        const pageData = booksData.slice(startIndex, endIndex)
        
        if (pageData.length > 0) {
          setBooks(prev => [...prev, ...pageData])
        }
        setHasMore(endIndex < booksData.length)
      } else {
        // For initial load, get first 10 items
        const initialData = booksData.slice(0, 10)
        setBooks(initialData)
        setHasMore(booksData.length > 10)
      }
      
    } catch (error) {
      console.error("Error fetching books:", error)
      // Set empty array on error
      if (!isLoadMore) {
        setBooks([])
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
    fetchBooks(selectedCategory, 1)
    setPage(1)
  }, [selectedCategory])

  useEffect(() => {
    if (page > 1) {
      fetchBooks(selectedCategory, page, true)
    }
  }, [page, selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setBooks([])
    setPage(1)
    setHasMore(true)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>كُتب امازيغية متنوعة</span>
        </div>
      </nav>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض كتب:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم الكتب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="language">تعليم اللغة</SelectItem>
              <SelectItem value="history">تاريخية</SelectItem>
              <SelectItem value="culture">ثقافية</SelectItem>
              <SelectItem value="literature">أدبية</SelectItem>
              <SelectItem value="children">أطفال</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={() => {
              setBooks([])
              setPage(1)
              setHasMore(true)
              fetchBooks(selectedCategory, 1)
            }} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "جاري التحميل..." : "اعرض الكتب"}
          </Button>
        </div>
      </div>

      {/* Books Feed */}
      <div className="space-y-4">
        {loading && books.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            {books.length > 0 ? (
              books.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex h-56">
                    {/* Book Image Section */}
                    <div className="relative w-40 flex-shrink-0">
                      <img
                        src={book.image || "/placeholder.svg?height=224&width=160"}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {book.fileSize}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 rounded-l-lg">
                        <Book className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col">
                      <CardHeader className="pb-2 flex-shrink-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{book.category}</Badge>
                        </div>
                        <CardTitle className="text-base leading-tight line-clamp-2">{book.title}</CardTitle>
                        <CardDescription className="text-sm">بقلم: {book.author}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{book.description}</p>

                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-4">
                            <div className="flex justify-between">
                              <span>اللغة:</span>
                              <span>{book.language}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>الصفحات:</span>
                              <span>{book.pages}</span>
                            </div>
                            <div className="flex justify-between col-span-2">
                              <span>سنة النشر:</span>
                              <span>{book.publishYear}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{book.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Download className="h-4 w-4" />
                              <span>{book.downloads}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            معاينة
                          </Button>
                          <Button size="sm" className="bg-[#4531fc] hover:bg-blue-800 flex-1">
                            <Download className="h-4 w-4 mr-1" />
                            تحميل
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">لا توجد كتب في هذا القسم</div>
            )}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="space-y-4">
                <LoadingSkeleton />
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && books.length > 0 && (
              <div className="text-center py-8 text-gray-500 border-t">
                تم عرض جميع الكتب المتاحة
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}