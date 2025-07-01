"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, Eye, Heart, MessageCircle } from "lucide-react"

interface BookData {
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
  pages: number
  language: string
  isbn: string
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

  const getCategoryColor = (category: string) => {
    const colors = {
      language: "from-blue-500 to-blue-600",
      dictionaries: "from-green-500 to-green-600",
      atlas: "from-yellow-500 to-yellow-600",
      dialects: "from-red-500 to-red-600",
      default: "from-blue-500 to-green-500",
    }
    return colors[category as keyof typeof colors] || colors.default
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
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
                <span>كُتب امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض كُتب قسم:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48 border-blue-200">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="language">تعلم اللغة الامازيغية</SelectItem>
                    <SelectItem value="dictionaries">قواميس اللغة الامازيغية</SelectItem>
                    <SelectItem value="atlas">اطلس الامازيغ</SelectItem>
                    <SelectItem value="dialects">اللهجات الامازيغية</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => fetchBooks(selectedCategory)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 border-0"
                >
                  اعرض القسم
                </Button>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {books.length > 0 ? (
                books.map((book) => (
                  <Card key={book.id} className="overflow-hidden border-blue-100 hover:shadow-lg transition-shadow">
                    <div className="flex">
                      <div
                        className={`w-32 h-48 bg-gradient-to-br ${getCategoryColor(book.subcategory || "default")} flex items-center justify-center`}
                      >
                        <Book className="h-12 w-12 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              {book.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight text-blue-900">{book.title}</CardTitle>
                          <CardDescription className="text-sm text-green-700">بواسطة {book.author}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.content}</p>

                          <div className="space-y-2 text-xs text-gray-500 mb-3">
                            <div className="flex justify-between">
                              <span>عدد الصفحات:</span>
                              <span className="text-blue-600 font-medium">{book.pages} صفحة</span>
                            </div>
                            <div className="flex justify-between">
                              <span>اللغة:</span>
                              <span className="text-green-600 font-medium">{book.language}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ISBN:</span>
                              <span className="text-yellow-600 font-medium">{book.isbn}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3 text-blue-500" />
                                {book.stats.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                {book.stats.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3 text-green-500" />
                                {book.stats.comments}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                            >
                              اقرأ المزيد
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">لا توجد كتب في هذا القسم</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold mb-2 text-green-800">ساحة اعلانات</h3>
            <div className="h-32 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
