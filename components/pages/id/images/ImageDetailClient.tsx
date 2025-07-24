"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, ImageIcon, MapPin, Monitor, Tag } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface ImageCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface ImagePost {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  image: string
  location?: string
  resolution?: string
  tags: string[]
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: ImageCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface ImageDetailClientProps {
  session: Session
  imageId: string
}

export default function ImageDetailClient({ session, imageId }: ImageDetailClientProps) {
  const router = useRouter()

  // Data states
  const [imagePost, setImagePost] = useState<ImagePost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editResolution, setEditResolution] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<ImageCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch image data
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/images/${imageId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("الصورة غير موجودة")
            return
          }
          throw new Error("فشل في جلب بيانات الصورة")
        }

        const data = await response.json()
        const fetchedImage = data.image
        setImagePost(fetchedImage)
        setCurrentStats({
          comments: fetchedImage._count.comments || 0,
          likes: fetchedImage._count.likes || 0,
          shares: fetchedImage._count.shares || 0,
          views: fetchedImage._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedImage.userHasLiked || false)
        setCurrentUserReaction(fetchedImage.userReaction || null)
        setCurrentReactions(fetchedImage.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching image:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [imageId])

  // Helper functions
  const isAuthor = session?.user?.email === imagePost?.author?.email
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
    if (!imagePost) return
    setEditTitle(imagePost.title)
    setEditDescription(imagePost.description || "")
    setEditLocation(imagePost.location || "")
    setEditResolution(imagePost.resolution || "")
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()

    if (!trimmedTitle || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          description: editDescription || null,
          location: editLocation || null,
          resolution: editResolution || null,
        }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setImagePost((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              description: editDescription || undefined,
              location: editLocation || undefined,
              resolution: editResolution || undefined,
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
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟") || isDeletingImage) return

    try {
      setIsDeletingImage(true)
      const response = await fetch(`/api/main/images/${imageId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف الصورة")

      router.push("/main/images")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingImage(false)
    }
  }

  const handleProfileClick = () => {
    if (imagePost) router.push(`/main/member/${imagePost.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: ImageCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الصورة...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !imagePost) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🖼️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "الصورة غير موجودة"}</h2>
          <p className="text-gray-600 mb-4">قد تكون الصورة محذوفة أو غير متاحة</p>
          <Button onClick={() => router.push("/main/images")} variant="outline">
            العودة إلى الصور
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

      {/* Image Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{imagePost.category}</Badge>
            {imagePost.subcategory && <Badge variant="outline">{imagePost.subcategory}</Badge>}
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingImage}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingImage}
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
              {getAuthorDisplayName(imagePost.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(imagePost.createdAt)}</span>
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
              placeholder="عنوان الصورة"
              disabled={isUpdating}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={4}
              placeholder="وصف الصورة"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="الموقع"
                disabled={isUpdating}
              />
              <input
                type="text"
                value={editResolution}
                onChange={(e) => setEditResolution(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="الدقة"
                disabled={isUpdating}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(imagePost.title)
                  setEditDescription(imagePost.description || "")
                  setEditLocation(imagePost.location || "")
                  setEditResolution(imagePost.resolution || "")
                }}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating || !editTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{imagePost.title}</h1>

            {imagePost.description && <div className="text-gray-700 mb-4 leading-relaxed">{imagePost.description}</div>}

            {/* Main Image */}
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={imagePost.image || "/placeholder.svg"}
                alt={imagePost.title}
                className="w-full max-h-[600px] object-contain bg-gray-50"
              />
            </div>

            {/* Image Info */}
            {(imagePost.location || imagePost.resolution || imagePost.tags.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  معلومات الصورة
                </h3>
                <div className="space-y-3">
                  {imagePost.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">الموقع:</span>
                      <span className="font-semibold">{imagePost.location}</span>
                    </div>
                  )}
                  {imagePost.resolution && (
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">الدقة:</span>
                      <span className="font-semibold">{imagePost.resolution}</span>
                    </div>
                  )}
                  {imagePost.tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">العلامات:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {imagePost.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
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
            postId={imagePost.id}
            apiEndpoint="images"
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
        {!isEditing && imagePost.updatedAt !== imagePost.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(imagePost.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={imagePost.id}
          apiEndpoint="images"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
