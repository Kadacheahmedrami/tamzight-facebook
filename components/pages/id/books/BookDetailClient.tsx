"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Loader2, Edit, Trash2, BookOpen, Globe, Hash } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface BookCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Book {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  pages?: number
  language?: string
  isbn?: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: BookCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface BookDetailClientProps {
  session: Session
  bookId: string
}

export default function BookDetailClient({ session, bookId }: BookDetailClientProps) {
  const router = useRouter()

  // Data states
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editPages, setEditPages] = useState("")
  const [editLanguage, setEditLanguage] = useState("")
  const [editIsbn, setEditIsbn] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingBook, setIsDeletingBook] = useState(false)

  // Current data states
  const [currentStats, setCurrentStats] = useState<BookCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/main/books/${bookId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("الكتاب غير موجود")
            return
          }
          throw new Error("فشل في جلب بيانات الكتاب")
        }

        const data = await response.json()
        const fetchedBook = data.book
        setBook(fetchedBook)
        setCurrentStats({
          comments: fetchedBook._count.comments || 0,
          likes: fetchedBook._count.likes || 0,
          shares: fetchedBook._count.shares || 0,
          views: fetchedBook._count.views || 0,
        })
        setCurrentUserHasLiked(fetchedBook.userHasLiked || false)
        setCurrentUserReaction(fetchedBook.userReaction || null)
        setCurrentReactions(fetchedBook.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error("Error fetching book:", error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [bookId])

  // Helper functions
  const isAuthor = session?.user?.email === book?.author?.email
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
    if (!book) return
    setEditTitle(book.title)
    setEditContent(book.content)
    setEditPages(book.pages?.toString() || "")
    setEditLanguage(book.language || "")
    setEditIsbn(book.isbn || "")
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          pages: editPages ? Number.parseInt(editPages) : null,
          language: editLanguage || null,
          isbn: editIsbn || null,
        }),
      })

      if (!response.ok) throw new Error("فشل في التحديث")

      setBook((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              content: trimmedContent,
              pages: editPages ? Number.parseInt(editPages) : undefined,
              language: editLanguage || undefined,
              isbn: editIsbn || undefined,
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
    if (!confirm("هل أنت متأكد من حذف هذا الكتاب؟") || isDeletingBook) return

    try {
      setIsDeletingBook(true)
      const response = await fetch(`/api/main/books/${bookId}`, { method: "DELETE" })

      if (!response.ok) throw new Error("فشل في حذف الكتاب")

      router.push("/main/books")
    } catch (error) {
      setError("حدث خطأ في الحذف")
      setIsDeletingBook(false)
    }
  }

  const handleProfileClick = () => {
    if (book) router.push(`/main/member/${book.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: BookCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الكتاب...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{error || "الكتاب غير موجود"}</h2>
          <p className="text-gray-600 mb-4">قد يكون الكتاب محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push("/main/books")} variant="outline">
            العودة إلى الكتب
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

      {/* Book Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{book.category}</Badge>
            {book.subcategory && <Badge variant="outline">{book.subcategory}</Badge>}
          </div>

          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleEdit} disabled={isDeletingBook}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingBook}
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
              {getAuthorDisplayName(book.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(book.createdAt)}</span>
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
              placeholder="عنوان الكتاب"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى الكتاب"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="number"
                value={editPages}
                onChange={(e) => setEditPages(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="عدد الصفحات"
                disabled={isUpdating}
              />
              <input
                type="text"
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اللغة"
                disabled={isUpdating}
              />
              <input
                type="text"
                value={editIsbn}
                onChange={(e) => setEditIsbn(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="رقم ISBN"
                disabled={isUpdating}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(book.title)
                  setEditContent(book.content)
                  setEditPages(book.pages?.toString() || "")
                  setEditLanguage(book.language || "")
                  setEditIsbn(book.isbn || "")
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
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">{book.title}</h1>

            {book.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img src={book.image || "/placeholder.svg"} alt={book.title} className="w-full max-h-96 object-cover" />
              </div>
            )}

            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{book.content}</div>

            {/* Book Info */}
            {(book.pages || book.language || book.isbn) && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  معلومات الكتاب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {book.pages && (
                    <div>
                      <span className="text-gray-600">عدد الصفحات:</span>
                      <div className="font-semibold">{book.pages}</div>
                    </div>
                  )}
                  {book.language && (
                    <div>
                      <span className="text-gray-600">اللغة:</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {book.language}
                      </div>
                    </div>
                  )}
                  {book.isbn && (
                    <div>
                      <span className="text-gray-600">رقم ISBN:</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {book.isbn}
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
            postId={book.id}
            apiEndpoint="books"
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
        {!isEditing && book.updatedAt !== book.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">آخر تحديث: {formatTimestamp(book.updatedAt)}</div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={book.id}
          apiEndpoint="books"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}
