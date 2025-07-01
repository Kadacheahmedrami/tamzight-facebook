"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
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
      const url = category === "all" ? "/api/books" : `/api/books?category=${category}`
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

      {/* Mobile Navigation */}
      <MobileSidebar 
        title="كُتب امازيغية متنوعة"
        description="مكتبة الكتب الامازيغية"
      />

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
                <Button size="sm" onClick={() => fetchBooks(selectedCategory)} className="w-full sm:w-auto">
                  اعرض الكتب
                </Button>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.length > 0 ? (
                books.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={book.image || "/placeholder.svg?height=200&width=150"}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {book.category}
                      </Badge>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {book.fileSize}
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm leading-tight line-clamp-2">{book.title}</CardTitle>
                      <CardDescription className="text-xs">بقلم: {book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{book.description}</p>

                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        <div className="flex justify-between">
                          <span>اللغة:</span>
                          <span>{book.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الصفحات:</span>
                          <span>{book.pages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>سنة النشر:</span>
                          <span>{book.publishYear}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{book.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Download className="h-3 w-3" />
                          <span>{book.downloads}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          معاينة
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          تحميل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">لا توجد كتب في هذا القسم</div>
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