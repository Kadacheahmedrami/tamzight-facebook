"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, Target } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface AdCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Ad {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  targetAmount?: string
  currentAmount?: string
  deadline?: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: AdCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface AdDetailClientProps {
  session: Session
  adId: string
}

export default function AdDetailClient({ session, adId }: AdDetailClientProps) {
  const router = useRouter()

  // Data states
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editTargetAmount, setEditTargetAmount] = useState("")
  const [editCurrentAmount, setEditCurrentAmount] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingAd, setIsDeletingAd] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<AdCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch ad data
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/ads/${adId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("الإعلان غير موجود")
            return
          }
          throw new Error("فشل في جلب بيانات الإعلان")
        }

        const data = await response.json()
        const fetchedAd = data.ad
        setAd(fetchedAd)
        setCurrentStats({
          comments: fetchedAd._count.comments || 0,
          likes: fetchedAd._count.likes || 0,
          shares: fetchedAd._count.shares || 0,
          views: fetchedAd._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedAd.userHasLiked || false)
        setCurrentUserReaction(fetchedAd.userReaction || null)
        setCurrentReactions(fetchedAd.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching ad:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [adId])

  // Helper functions
  const isAuthor = session?.user?.email === ad?.author?.email
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
    if (!ad) return
    setEditTitle(ad.title)
    setEditContent(ad.content)
    setEditTargetAmount(ad.targetAmount || "")
    setEditCurrentAmount(ad.currentAmount || "")
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/ads/${adId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          targetAmount: editTargetAmount,
          currentAmount: editCurrentAmount,
        }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setAd((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              content: trimmedContent,
              targetAmount: editTargetAmount,
              currentAmount: editCurrentAmount,
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
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟") || isDeletingAd) return

    try {
      setIsDeletingAd(true)
      const response = await fetch(`/api/main/ads/${adId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف الإعلان")

      router.push("/main/ads")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingAd(false)
    }
  }

  const handleProfileClick = () => {
    if (ad) router.push(`/main/member/${ad.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: AdCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الإعلان...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !ad) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "الإعلان غير موجود"}</h2>
          <p className="text-gray-600 mb-4">قد يكون الإعلان محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push("/main/ads")} variant="outline">
            العودة إلى الإعلانات
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

      {/* Ad Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ad.category}</Badge>
            {ad.subcategory && <Badge variant="outline">{ad.subcategory}</Badge>}
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingAd}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingAd}
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
              {getAuthorDisplayName(ad.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(ad.createdAt)}</span>
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
              placeholder="عنوان الإعلان"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى الإعلان"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={editTargetAmount}
                onChange={(e) => setEditTargetAmount(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="المبلغ المطلوب"
                disabled={isUpdating}
              />
              <input
                type="text"
                value={editCurrentAmount}
                onChange={(e) => setEditCurrentAmount(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="المبلغ الحالي"
                disabled={isUpdating}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(ad.title)
                  setEditContent(ad.content)
                  setEditTargetAmount(ad.targetAmount || "")
                  setEditCurrentAmount(ad.currentAmount || "")
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
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{ad.title}</h1>

            {ad.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={ad.image || "/placeholder.svg"} alt={ad.title} className="w-full max-h-96 object-cover" />
              </div>
            )}

            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{ad.content}</div>

            {/* Campaign Info */}
            {(ad.targetAmount || ad.currentAmount || ad.deadline) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  معلومات الحملة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {ad.targetAmount && (
                    <div>
                      <span className="text-gray-600">المبلغ المطلوب:</span>
                      <div className="font-semibold">{ad.targetAmount}</div>
                    </div>
                  )}
                  {ad.currentAmount && (
                    <div>
                      <span className="text-gray-600">المبلغ الحالي:</span>
                      <div className="font-semibold text-green-600">{ad.currentAmount}</div>
                    </div>
                  )}
                  {ad.deadline && (
                    <div>
                      <span className="text-gray-600">الموعد النهائي:</span>
                      <div className="font-semibold">{formatTimestamp(ad.deadline)}</div>
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
            postId={ad.id}
            apiEndpoint="ads"
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
        {!isEditing && ad.updatedAt !== ad.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(ad.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={ad.id}
          apiEndpoint="ads"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
