"use client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface CommentsModalProps {
  postId: string
  apiEndpoint: string // e.g., "posts", "images", "videos", "books", etc.
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  onClose: () => void
  onStatsUpdate: (newStats: any) => void
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    image?: string
    avatar?: string
  }
}

export default function CommentsModal({
  postId,
  apiEndpoint,
  session,
  stats,
  onClose,
  onStatsUpdate
}: CommentsModalProps) {
  // Data states
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentStats, setCurrentStats] = useState(stats)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)

  // Sync with props when they change
  useEffect(() => {
    setCurrentStats(stats)
  }, [stats])

  // Enhanced API helper with better error handling
  const callApi = async (method: string, body?: any) => {
    try {
      const response = await fetch(`/api/main/${apiEndpoint}/${postId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Enhanced comments loading
  const loadComments = async () => {
    try {
      setIsCommentsLoading(true)
      const data = await callApi('GET')
      
      // Handle different response structures based on endpoint
      let commentsData = []
      if (apiEndpoint === 'posts') {
        commentsData = data.post?.comments || []
      } else if (apiEndpoint === 'images') {
        commentsData = data.image?.comments || []
      } else if (apiEndpoint === 'videos') {
        commentsData = data.video?.comments || []
      } else if (apiEndpoint === 'books') {
        commentsData = data.book?.comments || []
      } else if (apiEndpoint === 'ideas') {
        commentsData = data.idea?.comments || []
      } else if (apiEndpoint === 'questions') {
        commentsData = data.question?.comments || []
      } else if (apiEndpoint === 'truth') {
        commentsData = data.truth?.comments || []
      } else if (apiEndpoint === 'ads') {
        commentsData = data.ad?.comments || []
      } else if (apiEndpoint === 'shop') {
        commentsData = data.product?.comments || []
      } else {
        // Fallback - try common property names
        commentsData = data.comments || data.data?.comments || []
      }
      
      setComments(commentsData)
    } catch (error) {
      console.error('Error loading comments:', error)
      alert('فشل في تحميل التعليقات')
    } finally {
      setIsCommentsLoading(false)
    }
  }

  // Enhanced comment submission
  const handleAddComment = async () => {
    const trimmedComment = newComment.trim()
    if (!trimmedComment || isLoading || !session?.user?.id) return
    
    const optimisticComment: Comment = {
      id: 'temp-' + Date.now(),
      content: trimmedComment,
      createdAt: new Date().toISOString(),
      user: {
        id: session.user.id!,
        firstName: session.user.name?.split(' ')[0] || 'مستخدم',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || ''
      }
    }
    
    try {
      setIsLoading(true)
      
      // Optimistic update
      setComments(prev => [optimisticComment, ...prev])
      const newStats = { ...currentStats, comments: currentStats.comments + 1 }
      setCurrentStats(newStats)
      onStatsUpdate(newStats)
      setNewComment('')
      
      const result = await callApi('POST', { action: 'comment', content: trimmedComment })
      
      // Replace optimistic comment with real one
      if (result.comment) {
        setComments(prev => prev.map(c => 
          c.id === optimisticComment.id ? result.comment : c
        ))
      }
      
    } catch (error) {
      // Revert optimistic update on error
      setComments(prev => prev.filter(c => c.id !== optimisticComment.id))
      const revertedStats = { ...currentStats, comments: Math.max(0, currentStats.comments - 1) }
      setCurrentStats(revertedStats)
      onStatsUpdate(revertedStats)
      setNewComment(trimmedComment) // Restore the comment text
      alert('حدث خطأ في إضافة التعليق')
    } finally {
      setIsLoading(false)
    }
  }

  // Load comments when modal opens
  useEffect(() => {
    if (comments.length === 0) {
      loadComments()
    }
  }, [])

  // Handle key press for comment submission
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleAddComment()
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) {
        return 'الآن'
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
      } else {
        const days = Math.floor(diffInSeconds / 86400)
        return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`
      }
    } catch (error) {
      return new Date(timestamp).toLocaleDateString('ar')
    }
  }

  // Get content type name in Arabic
  const getContentTypeName = () => {
    switch (apiEndpoint) {
      case 'posts': return 'المنشور'
      case 'images': return 'الصورة'
      case 'videos': return 'الفيديو'
      case 'books': return 'الكتاب'
      case 'ideas': return 'الفكرة'
      case 'questions': return 'السؤال'
      case 'truth': return 'الحقيقة'
      case 'ads': return 'الإعلان'
      case 'shop': return 'المنتج'
      default: return 'المحتوى'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            التعليقات ({currentStats.comments})
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Add Comment */}
          {session?.user?.id && (
            <div className="flex gap-3 mb-4 pb-4 border-b">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                <i className="fa fa-user text-gray-400 text-sm"></i>
              </div>
              <div className="flex-1">
                <textarea
                  placeholder={`اكتب تعليقاً على ${getContentTypeName()}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  rows={3}
                  disabled={isLoading}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">
                    {newComment.length}/1000 • اضغط Ctrl+Enter للنشر
                  </span>
                  <Button 
                    size="sm" 
                    onClick={handleAddComment}
                    disabled={isLoading || !newComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-sm px-4"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                        جاري النشر...
                      </>
                    ) : (
                      'نشر'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!session?.user?.id && (
            <div className="text-center py-4 mb-4 bg-gray-50 rounded-lg border">
              <i className="fa fa-user-circle text-2xl text-gray-400 mb-2 block"></i>
              <p className="text-sm text-gray-600">يجب تسجيل الدخول لإضافة تعليق</p>
            </div>
          )}

          {/* Comments List */}
          {isCommentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">جاري تحميل التعليقات...</p>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={`flex gap-3 ${
                    comment.id.startsWith('temp-') ? 'opacity-70' : ''
                  } animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    {comment.user.image || comment.user.avatar ? (
                      <img 
                        src={comment.user.image || comment.user.avatar} 
                        alt={`${comment.user.firstName} ${comment.user.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <i className="fa fa-user text-gray-400 text-sm"></i>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {comment.user.firstName} {comment.user.lastName}
                        {comment.id.startsWith('temp-') && (
                          <span className="text-xs text-blue-500 ml-2">(جاري النشر...)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.createdAt)}
                      </span>
                      <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        رد
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fa fa-comment-o text-3xl mb-3 block text-gray-300"></i>
              <p className="text-base font-medium mb-1">لا توجد تعليقات بعد</p>
              <p className="text-sm">كن أول من يعلق على {getContentTypeName()}</p>
            </div>
          )}

          {/* Load More Comments (if needed) */}
          {comments.length > 0 && comments.length % 20 === 0 && (
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadComments}
                disabled={isCommentsLoading}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                {isCommentsLoading ? 'جاري التحميل...' : 'تحميل المزيد من التعليقات'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>اضغط ESC للإغلاق</span>
            <span>{comments.length} من {currentStats.comments} تعليق</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}