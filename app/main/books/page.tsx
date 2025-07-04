"use client"

import { useEffect, useState } from "react"

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

export default function BooksPage() {
  const [books, setBooks] = useState<BookData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchBooks = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/books" : `/api/main/books?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error("Error fetching books:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchBooks(category)
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
          <Button size="sm" onClick={() => fetchBooks(selectedCategory)} className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto">
            اعرض الكتب
          </Button>
        </div>
      </div>

      {/* Books Feed */}
      <div className="space-y-4">
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
      </div>
    </div>
  )
}