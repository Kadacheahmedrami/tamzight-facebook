"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, TrendingUp } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface IdeaCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Idea {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  status: string
  priority: string
  votes: number
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: IdeaCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface IdeaDetailClientProps {
  session: Session
  ideaId: string
}

export default function IdeaDetailClient({ session, ideaId }: IdeaDetailClientProps) {
  const router = useRouter()

  // Data states
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editStatus, setEditStatus] = useState("")
  const [editPriority, setEditPriority] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingIdea, setIsDeletingIdea] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<IdeaCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch idea data
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/ideas/${ideaId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("الفكرة غير موجودة")
            return
          }
          throw new Error("فشل في جلب بيانات الفكرة")
        }

        const data = await response.json()
        const fetchedIdea = data.idea
        setIdea(fetchedIdea)
        setCurrentStats({
          comments: fetchedIdea._count.comments || 0,
          likes: fetchedIdea._count.likes || 0,
          shares: fetchedIdea._count.shares || 0,
          views: fetchedIdea._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedIdea.userHasLiked || false)
        setCurrentUserReaction(fetchedIdea.userReaction || null)
        setCurrentReactions(fetchedIdea.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching idea:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchIdea()
  }, [ideaId])

  // Helper functions
  const isAuthor = session?.user?.email === idea?.author?.email
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "قيد المراجعة":
        return "bg-yellow-100 text-yellow-800"
      case "مقبولة":
        return "bg-green-100 text-green-800"
      case "مرفوضة":
        return "bg-red-100 text-red-800"
      case "قيد التنفيذ":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عالية":
        return "bg-red-100 text-red-800"
      case "متوسطة":
        return "bg-yellow-100 text-yellow-800"
      case "منخفضة":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Event handlers
  const handleEdit = () => {
    if (!idea) return
    setEditTitle(idea.title)
    setEditContent(idea.content)
    setEditStatus(idea.status)
    setEditPriority(idea.priority)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/ideas/${ideaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          status: editStatus,
          priority: editPriority,
        }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setIdea((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              content: trimmedContent,
              status: editStatus,
              priority: editPriority,
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
    if (!confirm("هل أنت متأكد من حذف هذه الفكرة؟") || isDeletingIdea) return

    try {
      setIsDeletingIdea(true)
      const response = await fetch(`/api/main/ideas/${ideaId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف الفكرة")

      router.push("/main/ideas")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingIdea(false)
    }
  }

  const handleProfileClick = () => {
    if (idea) router.push(`/main/member/${idea.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: IdeaCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الفكرة...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !idea) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">💡</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "الفكرة غير موجودة"}</h2>
          <p className="text-gray-600 mb-4">قد تكون الفكرة محذوفة أو غير متاحة</p>
          <Button onClick={() => router.push("/main/ideas")} variant="outline">
            العودة إلى الأفكار
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

      {/* Idea Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{idea.category}</Badge>
            {idea.subcategory && <Badge variant="outline">{idea.subcategory}</Badge>}
            <Badge className={getStatusColor(idea.status)}>{idea.status}</Badge>
            <Badge className={getPriorityColor(idea.priority)}>{idea.priority}</Badge>
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingIdea}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingIdea}
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
              {getAuthorDisplayName(idea.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(idea.createdAt)}</span>
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
              placeholder="عنوان الفكرة"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى الفكرة"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="مقبولة">مقبولة</option>
                <option value="مرفوضة">مرفوضة</option>
                <option value="قيد التنفيذ">قيد التنفيذ</option>
              </select>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="منخفضة">منخفضة</option>
                <option value="متوسطة">متوسطة</option>
                <option value="عالية">عالية</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(idea.title)
                  setEditContent(idea.content)
                  setEditStatus(idea.status)
                  setEditPriority(idea.priority)
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
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{idea.title}</h1>

            {idea.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={idea.image || "/placeholder.svg"} alt={idea.title} className="w-full max-h-96 object-cover" />
              </div>
            )}

            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{idea.content}</div>

            {/* Idea Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                إحصائيات الفكرة
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-600">الأصوات:</span>
                  <span className="font-semibold text-blue-600">{idea.votes}</span>
                </div>
              </div>
            </div>
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
            postId={idea.id}
            apiEndpoint="ideas"
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
        {!isEditing && idea.updatedAt !== idea.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(idea.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={idea.id}
          apiEndpoint="ideas"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
