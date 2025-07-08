"use client"

import { useEffect, useState } from "react"


import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Search,
  User,
  Clock
} from "lucide-react"

interface TruthData {
  id: number
  title: string
  content: string
  author: string
  timestamp: string
  category: string
  subcategory: string
  image: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

export default function TruthsPage() {
  const [truths, setTruths] = useState<TruthData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchTruths = async (category = "all", search = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== "all") params.append("category", category)
      if (search) params.append("search", search)
      
      const url = `/api/main/truth${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      const data = await response.json()
      
      // Transform the data to match expected format
      const transformedTruths = data.map((truth: any) => ({
        ...truth,
        category: "حقيقة", // Set main category as "حقيقة"
        subcategory: truth.category || truth.subcategory // Move original category to subcategory
      }))
      
      setTruths(transformedTruths)
    } catch (error) {
      console.error("Error fetching truths:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTruths()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchTruths(category, searchTerm)
  }

  const handleSearch = () => {
    fetchTruths(selectedCategory, searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (loading) {
    return (

            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
        
    )
  }

  return (
  
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb - Hidden on mobile */}
            <nav className="mb-4 hidden lg:block">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>حقائق امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter and Search */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="text-sm font-medium whitespace-nowrap">اعرض حقائق:</label>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="اختار قسم الحقائق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الجميع</SelectItem>
                      <SelectItem value="history">تاريخية</SelectItem>
                      <SelectItem value="culture">ثقافية</SelectItem>
                      <SelectItem value="language">لغوية</SelectItem>
                      <SelectItem value="geography">جغرافية</SelectItem>
                      <SelectItem value="traditions">تقاليد</SelectItem>
                      <SelectItem value="personalities">شخصيات</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    onClick={() => fetchTruths(selectedCategory, searchTerm)} 
                    className="bg-[#4531fc] w-full sm:w-auto"
                  >
                    اعرض الحقائق
                  </Button>
                </div>
                
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ابحث في الحقائق..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch} size="sm" className="bg-[#4531fc]">
                    بحث
                  </Button>
                </div>
              </div>
            </div>

            {/* Truths Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {truths.length > 0 ? (
                truths.map((truth) => (
                  <Card key={truth.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={truth.image || "/placeholder.svg?height=200&width=600"}
                        alt={truth.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        {truth.subcategory}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg leading-tight line-clamp-2">{truth.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4" />
                        <span>بقلم: {truth.author}</span>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{truth.content}</p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Clock className="h-3 w-3" />
                        <span>{truth.timestamp}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{truth.stats.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-gray-600">{truth.stats.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-gray-600">{truth.stats.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-600">{truth.stats.shares}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          قراءة المزيد
                        </Button>
                        <Button size="sm" className="flex-1 bg-[#4531fc] hover:bg-blue-800">
                          <Heart className="h-3 w-3 mr-1" />
                          إعجاب
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Share2 className="h-3 w-3 mr-1" />
                          مشاركة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">لا توجد حقائق في هذا القسم</div>
              )}
            </div>
          </div>
   
  )
}