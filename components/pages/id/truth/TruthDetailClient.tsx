"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, Shield } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface TruthCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Truth {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: TruthCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface TruthDetailClientProps {
  session: Session
  truthId: string
}

export default function TruthDetailClient({ session, truthId }: TruthDetailClientProps) {
  const router = useRouter()

  // Data states
  const [truth, setTruth] = useState<Truth | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingTruth, setIsDeletingTruth] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<TruthCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch truth data
  useEffect(() => {
    const fetchTruth = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/truths/${truthId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("الحقيقة غير موجودة")
            return
          }
          throw new Error("فشل في جلب بيانات الحقيقة")
        }

        const data = await response.json()
        const fetchedTruth = data.truth
        setTruth(fetchedTruth)
        setCurrentStats({
          comments: fetchedTruth._count.comments || 0,
          likes: fetchedTruth._count.likes || 0,
          shares: fetchedTruth._count.shares || 0,
          views: fetchedTruth._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedTruth.userHasLiked || false)
        setCurrentUserReaction(fetchedTruth.userReaction || null)
        setCurrentReactions(fetchedTruth.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching truth:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchTruth()
  }, [truthId])

  // Helper functions
  const isAuthor = session?.user?.email === truth?.author?.email
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
    if (!truth) return
    setEditTitle(truth.title)
    setEditContent(truth.content)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/truths/${truthId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setTruth((prev) => (prev ? { ...prev, title: trimmedTitle, content: trimmedContent } : null))
      setIsEditing(false)
    } catch (error) {
      setError("حدث خطأ في التحديث")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الحقيقة؟") || isDeletingTruth) return

    try {
      setIsDeletingTruth(true)
      const response = await fetch(`/api/main/truths/${truthId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف الحقيقة")

      router.push("/main/truth")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingTruth(false)
    }
  }

  const handleProfileClick = () => {
    if (truth) router.push(`/main/member/${truth.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: TruthCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الحقيقة...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !truth) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🛡️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "الحقيقة غير موجودة"}</h2>
          <p className="text-gray-600 mb-4">قد تكون الحقيقة محذوفة أو غير متاحة</p>
          <Button onClick={() => router.push("/main/truth")} variant="outline">
            العودة إلى الحقائق
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

      {/* Truth Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <Shield className="h-3 w-3 mr-1" />
              {truth.category}
            </Badge>
            {truth.subcategory && <Badge variant="outline">{truth.subcategory}</Badge>}
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingTruth}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingTruth}
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
              {getAuthorDisplayName(truth.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(truth.createdAt)}</span>
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
              placeholder="عنوان الحقيقة"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى الحقيقة"
              disabled={isUpdating}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(truth.title)
                  setEditContent(truth.content)
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
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{truth.title}</h1>

            {truth.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={truth.image || "/placeholder.svg"}
                  alt={truth.title}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{truth.content}</div>
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
            postId={truth.id}
            apiEndpoint="truths"
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
        {!isEditing && truth.updatedAt !== truth.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(truth.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={truth.id}
          apiEndpoint="truths"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
