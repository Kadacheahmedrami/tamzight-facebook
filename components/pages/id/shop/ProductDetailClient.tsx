"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, Package, Palette } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface ProductCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Product {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  price: string
  currency: string
  inStock: boolean
  sizes: string[]
  colors: string[]
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: ProductCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface ProductDetailClientProps {
  session: Session
  productId: string
}

export default function ProductDetailClient({ session, productId }: ProductDetailClientProps) {
  const router = useRouter()

  // Data states
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCurrency, setEditCurrency] = useState("")
  const [editInStock, setEditInStock] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<ProductCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/products/${productId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("المنتج غير موجود")
            return
          }
          throw new Error("فشل في جلب بيانات المنتج")
        }

        const data = await response.json()
        const fetchedProduct = data.product
        setProduct(fetchedProduct)
        setCurrentStats({
          comments: fetchedProduct._count.comments || 0,
          likes: fetchedProduct._count.likes || 0,
          shares: fetchedProduct._count.shares || 0,
          views: fetchedProduct._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedProduct.userHasLiked || false)
        setCurrentUserReaction(fetchedProduct.userReaction || null)
        setCurrentReactions(fetchedProduct.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching product:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  // Helper functions
  const isAuthor = session?.user?.email === product?.author?.email
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  const getAuthorDisplayName = (author: Author) => author.email.split("@")[0]

  // Event handlers
  const handleEdit = () => {
    if (!product) return
    setEditTitle(product.title)
    setEditContent(product.content)
    setEditPrice(product.price)
    setEditCurrency(product.currency)
    setEditInStock(product.inStock)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          price: editPrice,
          currency: editCurrency,
          inStock: editInStock,
        }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              content: trimmedContent,
              price: editPrice,
              currency: editCurrency,
              inStock: editInStock,
            }
          : null,
      )
      setIsEditing(false)
    } catch (error) {
      setError("حدث خطأ في التحديث")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟") || isDeletingProduct) return

    try {
      setIsDeletingProduct(true)
      const response = await fetch(`/api/main/products/${productId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف المنتج")

      router.push("/main/shop")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingProduct(false)
    }
  }

  const handleProfileClick = () => {
    if (product) router.push(`/main/member/${product.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: ProductCounts) => setCurrentStats(newStats)
  const handleReactionUpdate = (reaction: string | null, hasLiked: boolean, newReactions?: ReactionsData) => {
    setCurrentUserReaction(reaction)
    setCurrentUserHasLiked(hasLiked)
    if (newReactions) setCurrentReactions(newReactions)
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500 mr-3" />
              <span className="text-gray-600">جاري تحميل المنتج...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🛍️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "المنتج غير موجود"}</h2>
          <p className="text-gray-600 mb-4">قد يكون المنتج محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push("/main/shop")} variant="outline">
            العودة إلى المتجر
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      <Button onClick={() => router.back()} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        العودة
      </Button>

      {/* Product Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.subcategory && <Badge variant="outline">{product.subcategory}</Badge>}
            <Badge variant={product.inStock ? "default" : "destructive"}>
              {product.inStock ? "متوفر" : "غير متوفر"}
            </Badge>
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingProduct}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingProduct}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={handleProfileClick}
          />
          <div>
            <h3
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleProfileClick}
            >
              {getAuthorDisplayName(product.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(product.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اسم المنتج"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="وصف المنتج"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="السعر"
                disabled={isUpdating}
              />
              <input
                type="text"
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="العملة"
                disabled={isUpdating}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editInStock}
                  onChange={(e) => setEditInStock(e.target.checked)}
                  className="rounded"
                  disabled={isUpdating}
                />
                <label className="text-sm">متوفر</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(product.title)
                  setEditContent(product.content)
                  setEditPrice(product.price)
                  setEditCurrency(product.currency)
                  setEditInStock(product.inStock)
                }}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{product.title}</h1>

            {/* Price */}
            <div className="text-2xl font-bold text-green-600 mb-3">
              {product.price} {product.currency}
            </div>

            {product.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{product.content}</div>

            {/* Product Info */}
            {(product.sizes.length > 0 || product.colors.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  تفاصيل المنتج
                </h3>
                <div className="space-y-3">
                  {product.sizes.length > 0 && (
                    <div>
                      <span className="text-gray-600 text-sm">المقاسات المتوفرة:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.sizes.map((size, index) => (
                          <Badge key={index} variant="outline">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.colors.length > 0 && (
                    <div>
                      <span className="text-gray-600 text-sm">الألوان المتوفرة:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {product.colors.map((color, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Palette className="h-3 w-3" />
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Reactions Display */}
        {!isEditing && (
          <div className="mb-3 flex justify-end">
            <ReactionsDisplay stats={currentStats} reactions={currentReactions} session={session as any} />
          </div>
        )}

        {/* Interactions Bar */}
        {!isEditing && (
          <InteractionsBar
            postId={product.id}
            apiEndpoint="products"
            stats={currentStats}
            userHasLiked={currentUserHasLiked}
            userReaction={currentUserReaction}
            session={session as any}
            onStatsUpdate={handleStatsUpdate}
            onReactionUpdate={handleReactionUpdate}
            onCommentsClick={() => setShowCommentsModal(true)}
          />
        )}

        {/* Updated indicator */}
        {!isEditing && product.updatedAt !== product.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(product.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={product.id}
          apiEndpoint="products"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
