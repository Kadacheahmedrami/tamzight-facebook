// pages/shop/page.tsx

"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
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
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchProducts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/products" : `/api/products?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback sample data
      const sampleProducts: Product[] = [
        {
          id: 1,
          title: "فستان امازيغي تقليدي",
          content: "فستان امازيغي تقليدي مصنوع يدويا",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "clothing",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
        },
        {
          id: 2,
          title: "سجاد امازيغي",
          content: "سجاد امازيغي مصنوع من الصوف الطبيعي",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "furniture",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
        },
      ]
      setProducts(sampleProducts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchProducts(category)
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Mobile Sidebar */}
      <MobileSidebar title="تسوق صناعات امازيغية" description="منتجات تقليدية أصيلة" />

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>تسوق صناعات امازيغية</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض مُنتج امازيغي في:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="clothing">ملابس</SelectItem>
                    <SelectItem value="shoes">احذية</SelectItem>
                    <SelectItem value="accessories">اكسسورات</SelectItem>
                    <SelectItem value="furniture">مفروشات</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchProducts(selectedCategory)} className="w-full sm:w-auto">
                  اعرض
                </Button>
              </div>
            </div>

            {/* Create Product */}
            <CreatePostModal />

            {/* Products Feed */}
            <div className="space-y-4">
              {products.length > 0 ? (
                products.map((product) => <PostCard key={product.id} {...product} />)
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد منتجات في هذا القسم</div>
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
