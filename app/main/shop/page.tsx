// pages/shop/page.tsx

"use client"

import { useEffect, useState } from "react"


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
      const url = category === "all" ? "/api/main/products" : `/api/main/products?category=${category}`
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
     
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
         
    )
  }

  return (



          <div className="max-w-3xl  mx-2">
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
                <Button size="sm" onClick={() => fetchProducts(selectedCategory)} className="w-full bg-[#4531fc] hover:bg-blue-800  sm:w-auto">
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

  )
}
