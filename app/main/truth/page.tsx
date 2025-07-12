"use client"

import { useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import CreatePostModal from "@/components/create-post/create-post-modal"

import {
  Heart,
  MessageCircle,
  Share2,
  Eye,
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
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [error, setError] = useState<string | null>(null)

  const TRUTHS_PER_PAGE = 10

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <div className="relative">
            <div className="w-full h-48 bg-gray-200"></div>
            <div className="absolute top-2 right-2 w-16 h-6 bg-gray-300 rounded"></div>
          </div>
          
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const fetchTruths = async (category = "all") => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (category !== "all") params.append("category", category)
      params.append("page", "1")
      params.append("limit", TRUTHS_PER_PAGE.toString())
      
      const url = `/api/main/truth${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform the data to match expected format
      const transformedTruths = data.truths?.map((truth: any) => ({
        ...truth,
        category: "حقيقة", // Set main category as "حقيقة"
        subcategory: truth.category || truth.subcategory // Move original category to subcategory
      })) || []

      setTruths(transformedTruths)

    } catch (error) {
      console.error("Error fetching truths:", error)
      setError("فشل في تحميل الحقائق. يرجى المحاولة مرة أخرى.")
      setTruths([])
    } finally {
      setLoading(false)
    }
  }

  // Load initial truths
  useEffect(() => {
    fetchTruths(selectedCategory)
  }, [selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setTruths([])
    setError(null)
  }

  const handleRefresh = () => {
    fetchTruths(selectedCategory)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>حقائق امازيغية متنوعة</span>
        </div>
      </nav>

      {/* Filter - Always visible */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض اخر حقائق حول:</label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار قسم لعرضه" />
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
            onClick={handleRefresh} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'جاري التحميل...' : 'اعرض'}
          </Button>
        </div>
      </div>

      <CreatePostModal />
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            className="mt-2"
            variant="outline"
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Truths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {loading ? (
          <LoadingSkeleton />
        ) : truths.length > 0 ? (
          <>
            {truths.map((truth) => (
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
            ))}
            
            {/* Results summary */}
            <div className="col-span-full text-center py-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm">
                  عرض {truths.length} حقيقة
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg mb-2">لا توجد حقائق في هذا القسم</p>
              <p className="text-gray-500 text-sm">جرب تغيير الفئة أو البحث عن محتوى آخر</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}