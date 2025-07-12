"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingBag } from "lucide-react"
import PostCard from "@/components/card-comps/post-card"
import CreatePostModal from "@/components/create-post/create-post-modal"

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

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-3"></div>
        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchProducts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/shop" : `/api/main/shop?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback sample data
      const sampleProducts: Product[] = [
       
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

  // Transform product data for PostCard
  const transformProductToPost = (product: Product) => ({
    id: product.id.toString(),
    title: product.title,
    content: product.content,
    author: product.author,
    authorId: product.id.toString(), // You might want to use a proper author ID
    timestamp: product.timestamp,
    category: "منتج", // Main category is now "منتج" (Product in Arabic)
    subCategory: getCategoryArabic(product.category), // Original category moved to subcategory
    media: product.image ? [{
      id: product.id.toString(),
      type: 'image' as const,
      url: product.image,
      alt: product.title
    }] : undefined,
    baseRoute: 'shop',
    stats: product.stats
  })

  const getCategoryArabic = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "clothing": "ملابس",
      "shoes": "احذية",
      "accessories": "اكسسورات",
      "furniture": "مفروشات"
    }
    return categoryMap[category] || category
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb - Always visible */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>تسوق صناعات امازيغية</span>
        </div>
      </nav>

      {/* Filter - Always visible */}
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
          <Button 
            size="sm" 
            onClick={() => fetchProducts(selectedCategory)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            اعرض المنتجات
          </Button>
        </div>
      </div>

      {/* Create Product - Always visible */}
      <CreatePostModal />

      {/* Products Feed */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : products.length > 0 ? (
          products.map((product) => (
            <PostCard
              key={product.id}
              {...transformProductToPost(product)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">لا توجد منتجات في هذا القسم حالياً</p>
            {selectedCategory !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all")
                  fetchProducts("all")
                }}
                className="mt-4"
              >
                عرض جميع المنتجات
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}