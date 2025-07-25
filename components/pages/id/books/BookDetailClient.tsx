"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Calendar, Loader2, Edit, Trash2, BookOpen, 
  Globe, User, Star, Download, Eye, Book
} from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author { id: string; email: string; image?: string }
interface BookCounts { comments: number; likes: number; shares: number; views: number }
interface Book {
  id: string; title: string; content: string; category: string; subcategory?: string
  image?: string; pages?: number; language?: string; isbn?: string; publishYear?: string
  fileSize?: string; rating?: number; downloads?: number; downloadUrl?: string
  authorId: string; author: Author; createdAt: string; updatedAt: string
  _count: BookCounts; reactions?: ReactionsData; userHasLiked?: boolean; userReaction?: string | null
}

interface BookDetailClientProps { session: Session; bookId: string }

export default function BookDetailClient({ session, bookId }: BookDetailClientProps) {
  const router = useRouter()
  
  // Consolidated states
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeletingBook, setIsDeletingBook] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: "", content: "", pages: "", language: "", isbn: "", publishYear: ""
  })
  
  // Current interaction states
  const [currentStats, setCurrentStats] = useState<BookCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/main/books/${bookId}`)
        if (!response.ok) throw new Error(response.status === 404 ? "الكتاب غير موجود" : "فشل في جلب بيانات الكتاب")
        
        const { book: fetchedBook } = await response.json()
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
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [bookId])

  // Helper functions
  const isAuthor = session?.user?.email === book?.author?.email
  const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })
  const getAuthorDisplayName = (author: Author) => author.email.split("@")[0]
  const isLongContent = book?.content.length && book.content.length > 300
  const displayContent = showFullContent ? book?.content : book?.content.substring(0, 300) + (isLongContent ? "..." : "")

  // Event handlers
  const handleEdit = () => {
    if (!book) return
    setEditForm({
      title: book.title,
      content: book.content,
      pages: book.pages?.toString() || "",
      language: book.language || "",
      isbn: book.isbn || "",
      publishYear: book.publishYear || ""
    })
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    if (!editForm.title.trim() || !editForm.content.trim() || isUpdating) return
    
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          content: editForm.content.trim(),
          pages: editForm.pages ? Number.parseInt(editForm.pages) : null,
          language: editForm.language || null,
          isbn: editForm.isbn || null,
          publishYear: editForm.publishYear || null,
        }),
      })
      
      if (!response.ok) throw new Error("فشل في التحديث")
      
      setBook(prev => prev ? { ...prev, ...editForm, pages: editForm.pages ? Number.parseInt(editForm.pages) : undefined } : null)
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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <Card className="bg-white shadow-md">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500 mr-4" />
              <span className="text-base sm:text-lg text-gray-600">جاري تحميل الكتاب...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <Card className="bg-white shadow-md">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="text-6xl sm:text-8xl text-gray-300 mb-4 sm:mb-6">📚</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{error || "الكتاب غير موجود"}</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">قد يكون الكتاب محذوفاً أو غير متاح</p>
            <Button onClick={() => router.push("/main/books")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3">
              العودة إلى الكتب
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
      {/* Back Button */}
      <Button onClick={() => router.back()} variant="ghost" className="hover:bg-white/80">
        <ArrowLeft className="h-4 w-4 mr-2" />
        العودة
      </Button>

      {/* Main Book Card */}
      <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
          {/* Mobile-First Layout */}
          <div className="space-y-4">
            {/* Book Image & Rating - Mobile Stack */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="relative w-32 h-48 sm:w-40 sm:h-60 mx-auto sm:mx-0 flex-shrink-0 group">
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={book.image || "/placeholder.svg?height=240&width=160&query=book cover"}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                {/* Badges - Responsive positioning */}
                <div className="absolute top-2 left-0 right-0 flex justify-between px-2">
                  {book.fileSize && (
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {book.fileSize}
                    </div>
                  )}
                  {book.rating && book.rating > 0 && (
                    <div className="bg-amber-500/90 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {book.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                
                {book.downloads && book.downloads > 0 && (
                  <div className="absolute bottom-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {book.downloads > 1000 ? `${(book.downloads / 1000).toFixed(1)}k` : book.downloads}
                  </div>
                )}
              </div>

              {/* Book Metadata */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Action Buttons - Mobile Top */}
                {isAuthor && (
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button variant="outline" size="sm" onClick={handleEdit} disabled={isDeletingBook} className="text-xs sm:text-sm">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeletingBook} 
                            className="text-red-600 hover:text-red-700 text-xs sm:text-sm">
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {isDeletingBook ? "جاري الحذف..." : "حذف"}
                    </Button>
                  </div>
                )}

                {/* Categories - Mobile Wrap */}
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm px-2 sm:px-3 py-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    {book.category}
                  </Badge>
                  {book.subcategory && (
                    <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                      {book.subcategory}
                    </Badge>
                  )}
                  {book.language && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 sm:px-3 py-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                      {book.language}
                    </Badge>
                  )}
                </div>

                {/* Title & Author */}
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({...prev, title: e.target.value}))}
                      className="w-full text-lg sm:text-2xl font-bold p-2 sm:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="عنوان الكتاب"
                      disabled={isUpdating}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isUpdating} className="text-xs sm:text-sm">
                        إلغاء
                      </Button>
                      <Button size="sm" onClick={handleUpdate} disabled={isUpdating || !editForm.title.trim()} 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm">
                        {isUpdating ? <><Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />جاري الحفظ...</> : "حفظ"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-lg sm:text-2xl font-bold leading-tight text-gray-900 text-center sm:text-right">
                      {book.title}
                    </CardTitle>
                    <div className="text-sm sm:text-base text-gray-600 text-center sm:text-right space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                      <span className="cursor-pointer hover:text-blue-600 font-medium flex items-center justify-center sm:justify-start gap-2" 
                            onClick={() => router.push(`/main/member/${book.authorId}`)}>
                        <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        بقلم: {getAuthorDisplayName(book.author)}
                      </span>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <span className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        {formatTimestamp(book.createdAt)}
                      </span>
                    </div>
                  </>
                )}

                {/* Book Details - Mobile Optimized */}
                {!isEditing && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {book.pages && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">الصفحات:</span>
                          <span className="font-bold">{book.pages}</span>
                        </div>
                      )}
                      {book.publishYear && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">سنة النشر:</span>
                          <span className="font-bold">{book.publishYear}</span>
                        </div>
                      )}
                      {book.isbn && (
                        <div className="flex justify-between items-center col-span-1 sm:col-span-2">
                          <span className="text-gray-600">ISBN:</span>
                          <span className="font-mono text-xs sm:text-sm font-bold break-all">{book.isbn}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0 space-y-4 sm:space-y-6">
          {/* Content */}
          {isEditing ? (
            <div className="space-y-3 sm:space-y-4">
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({...prev, content: e.target.value}))}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32 sm:min-h-48"
                rows={6}
                placeholder="وصف الكتاب..."
                disabled={isUpdating}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="number" value={editForm.pages} onChange={(e) => setEditForm(prev => ({...prev, pages: e.target.value}))} 
                       className="w-full p-2 sm:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                       placeholder="عدد الصفحات" disabled={isUpdating} />
                <input type="text" value={editForm.language} onChange={(e) => setEditForm(prev => ({...prev, language: e.target.value}))} 
                       className="w-full p-2 sm:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                       placeholder="اللغة" disabled={isUpdating} />
                <input type="text" value={editForm.publishYear} onChange={(e) => setEditForm(prev => ({...prev, publishYear: e.target.value}))} 
                       className="w-full p-2 sm:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                       placeholder="سنة النشر" disabled={isUpdating} />
                <input type="text" value={editForm.isbn} onChange={(e) => setEditForm(prev => ({...prev, isbn: e.target.value}))} 
                       className="w-full p-2 sm:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                       placeholder="رقم ISBN" disabled={isUpdating} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-900 flex items-center gap-2">
                <Book className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                وصف الكتاب
              </h3>
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <p className="whitespace-pre-wrap">
                  {displayContent}
                  {isLongContent && (
                    <button
                      onClick={() => setShowFullContent(!showFullContent)}
                      className="text-blue-600 hover:text-blue-800 font-medium ml-2 underline decoration-dotted text-sm"
                    >
                      {showFullContent ? "عرض أقل" : "اقرأ المزيد"}
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              {/* Action Buttons - Mobile Stack */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="outline" className="h-10 sm:h-12 border-2 hover:bg-gray-50 text-sm sm:text-base"
                        onClick={() => router.push(`/main/books/${book.id}`)}>
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  معاينة تفصيلية
                </Button>
                {book.downloadUrl && (
                  <Button className="bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-base"
                          onClick={() => window.open(book.downloadUrl, "_blank")}>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    تحميل الكتاب
                  </Button>
                )}
              </div>

              {/* Reactions & Interactions - Mobile Optimized */}
              <div className="space-y-3">
                <div className="flex justify-end">
                  <ReactionsDisplay reactions={currentReactions} session={session as any} stats={currentStats} />
                </div>
                <InteractionsBar
                  postId={book.id}
                  apiEndpoint="books"
                  stats={currentStats}
                  userHasLiked={currentUserHasLiked}
                  userReaction={currentUserReaction}
                  session={session as any}
                  onStatsUpdate={setCurrentStats}
                  onReactionUpdate={(reaction, hasLiked, newReactions) => {
                    setCurrentUserReaction(reaction)
                    setCurrentUserHasLiked(hasLiked)
                    if (newReactions) setCurrentReactions(newReactions)
                  }}
                  onCommentsClick={() => setShowCommentsModal(true)}
                />
              </div>

              {/* Updated indicator */}
              {book.updatedAt !== book.createdAt && (
                <div className="text-xs sm:text-sm text-gray-500 text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  آخر تحديث: {formatTimestamp(book.updatedAt)}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={book.id}
          apiEndpoint="books"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={setCurrentStats}
        />
      )}
    </div>
  )
}