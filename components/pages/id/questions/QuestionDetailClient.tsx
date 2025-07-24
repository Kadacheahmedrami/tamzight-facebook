"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Loader2, Edit, Trash2, CheckCircle, HelpCircle } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface QuestionCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Question {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  type: string
  answered: boolean
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: QuestionCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface QuestionDetailClientProps {
  session: Session
  questionId: string
}

export default function QuestionDetailClient({ session, questionId }: QuestionDetailClientProps) {
  const router = useRouter()
  
  // Data states
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editType, setEditType] = useState("")
  const [editAnswered, setEditAnswered] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false)
  
  // Current data states
  const [currentStats, setCurrentStats] = useState<QuestionCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch question data
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/main/questions/${questionId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('السؤال غير موجود')
            return
          }
          throw new Error('فشل في جلب بيانات السؤال')
        }
        
        const data = await response.json()
        const fetchedQuestion = data.question
        setQuestion(fetchedQuestion)
        setCurrentStats({
          comments: fetchedQuestion._count.comments || 0,
          likes: fetchedQuestion._count.likes || 0,
          shares: fetchedQuestion._count.shares || 0,
          views: fetchedQuestion._count.views || 0
        })
        setCurrentUserHasLiked(fetchedQuestion.userHasLiked || false)
        setCurrentUserReaction(fetchedQuestion.userReaction || null)
        setCurrentReactions(fetchedQuestion.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error('Error fetching question:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestion()
  }, [questionId])

  // Helper functions
  const isAuthor = session?.user?.email === question?.author?.email
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const getAuthorDisplayName = (author: Author) => author.email.split('@')[0]

  // Event handlers
  const handleEdit = () => {
    if (!question) return
    setEditTitle(question.title)
    setEditContent(question.content)
    setEditType(question.type)
    setEditAnswered(question.answered)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    
    if (!trimmedTitle || !trimmedContent || isUpdating) return
    
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/questions/${questionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: trimmedTitle, 
          content: trimmedContent,
          type: editType,
          answered: editAnswered
        })
      })
      
      if (!response.ok) throw new Error('فشل في التحديث')
      
      setQuestion(prev => prev ? { 
        ...prev, 
        title: trimmedTitle, 
        content: trimmedContent,
        type: editType,
        answered: editAnswered
      } : null)
      setIsEditing(false)
    } catch (error) {
      setError('حدث خطأ في التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟') || isDeletingQuestion) return
    
    try {
      setIsDeletingQuestion(true)
      const response = await fetch(`/api/main/questions/${questionId}`, { method: 'DELETE' })
      
      if (!response.ok) throw new Error('فشل في حذف السؤال')
      
      router.push('/main/questions')
    } catch (error) {
      setError('حدث خطأ في الحذف')
      setIsDeletingQuestion(false)
    }
  }

  const handleProfileClick = () => {
    if (question) router.push(`/main/member/${question.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: QuestionCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل السؤال...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'السؤال غير موجود'}
          </h2>
          <p className="text-gray-600 mb-4">قد يكون السؤال محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push('/main/questions')} variant="outline">
            العودة إلى الأسئلة
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

      {/* Question Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{question.category}</Badge>
            {question.subcategory && <Badge variant="outline">{question.subcategory}</Badge>}
            <Badge variant={question.answered ? "default" : "destructive"} className="flex items-center gap-1">
              {question.answered ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  مُجاب
                </>
              ) : (
                <>
                  <HelpCircle className="h-3 w-3" />
                  غير مُجاب
                </>
              )}
            </Badge>
            <Badge variant="outline">{question.type}</Badge>
          </div>
          
          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isDeletingQuestion}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingQuestion}
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
              {getAuthorDisplayName(question.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(question.createdAt)}</span>
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
              placeholder="عنوان السؤال"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى السؤال"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="general">عام</option>
                <option value="technical">تقني</option>
                <option value="academic">أكاديمي</option>
                <option value="personal">شخصي</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="answered"
                  checked={editAnswered}
                  onChange={(e) => setEditAnswered(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isUpdating}
                />
                <label htmlFor="answered" className="text-sm text-gray-700">
                  تم الإجابة على السؤال
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(question.title)
                  setEditContent(question.content)
                  setEditType(question.type)
                  setEditAnswered(question.answered)
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
                {isUpdating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-3 text-gray-900 leading-tight">
              {question.title}
            </h1>
            
            {question.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={question.image} 
                  alt={question.title} 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
              {question.content}
            </div>
          </>
        )}

        {/* Reactions Display */}
        {!isEditing && (
          <div className="mb-3 flex justify-end">
            <ReactionsDisplay
              stats={currentStats}
              reactions={currentReactions}
              session={session as any}
            />
          </div>
        )}

        {/* Interactions Bar */}
        {!isEditing && (
          <InteractionsBar
            postId={question.id}
            apiEndpoint="questions"
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
        {!isEditing && question.updatedAt !== question.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">
            آخر تحديث: {formatTimestamp(question.updatedAt)}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={question.id}
          apiEndpoint="questions"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}