"use client"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { reactions, PostCardProps } from "@/components/card-comps/types"

interface SimplePostCardProps extends PostCardProps {
  reactions?: Array<{
    id: string
    emoji: string
    userId: string
    user: { firstName: string; lastName: string }
  }>
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, updatedData: any) => void
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

export default function SimplePostCard({ 
  id, title, content, author, authorId, timestamp, category, subCategory, image, stats, reactions: postReactions = [],
  session, onDelete, onUpdate
}: SimplePostCardProps) {
  // Content display states
  const [showFullContent, setShowFullContent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  
  // UI states
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  // Data states
  const [currentStats, setCurrentStats] = useState(stats)
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  
  const reactionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Find user's existing reaction on mount
  useEffect(() => {
    if (session?.user?.id) {
        const userId = (session.user as { id?: string })?.id;
        const existingReaction = postReactions.find(r => r.userId === userId);
        if (existingReaction) {
        setUserReaction(existingReaction.emoji)
      }
    }   
  }, [postReactions, session?.user?.id])

  // Close reactions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false)
      }
    }
    
    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReactions])

  // Simple API helper
  const callApi = async (method: string, body?: any) => {
    const response = await fetch(`/api/main/posts/${id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    
    if (!response.ok) {
      throw new Error('Request failed')
    }
    
    return response.json()
  }

  // Handle reactions
  const handleReaction = async (emoji?: string) => {
    if (isLoading || !session?.user?.id) return
    
    try {
      setIsLoading(true)
      await callApi('POST', { action: 'like', emoji })
      
      // Update local state
      setUserReaction(emoji || null)
      
      // Update like count
      if (emoji && !userReaction) {
        setCurrentStats(prev => ({ ...prev, likes: prev.likes + 1 }))
      } else if (!emoji && userReaction) {
        setCurrentStats(prev => ({ ...prev, likes: prev.likes - 1 }))
      }
      
    } catch (error) {
      alert('حدث خطأ في التفاعل')
    } finally {
      setIsLoading(false)
      setShowReactions(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    if (isLoading || !session?.user?.id) return
    
    try {
      setIsLoading(true)
      await callApi('POST', { action: 'share' })
      setCurrentStats(prev => ({ ...prev, shares: prev.shares + 1 }))
    } catch (error) {
      alert('حدث خطأ في المشاركة')
    } finally {
      setIsLoading(false)
    }
  }

  // Load comments
  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await callApi('GET')
      setComments(data.post?.comments || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle comment submission
  const handleAddComment = async () => {
    if (!newComment.trim() || isLoading || !session?.user?.id) return
    
    try {
      setIsLoading(true)
      const result = await callApi('POST', { action: 'comment', content: newComment.trim() })
      
      if (result.comment) {
        setComments(prev => [result.comment, ...prev])
        setCurrentStats(prev => ({ ...prev, comments: prev.comments + 1 }))
        setNewComment('')
      }
    } catch (error) {
      alert('حدث خطأ في إضافة التعليق')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle post update
  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim() || isLoading) return
    
    try {
      setIsLoading(true)
      await callApi('PATCH', { title: editTitle, content: editContent })
      setIsEditing(false)
      onUpdate?.(id, { title: editTitle, content: editContent })
    } catch (error) {
      alert('حدث خطأ في التحديث')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle post deletion
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟') || isLoading) return
    
    try {
      setIsLoading(true)
      await callApi('DELETE')
      onDelete?.(id)
    } catch (error) {
      alert('حدث خطأ في الحذف')
    } finally {
      setIsLoading(false)
    }
  }

  // Event handlers
  const handlePostClick = () => router.push(`/main/posts/${id}`)
  const handleProfileClick = () => router.push(`/main/member/${authorId}`)
  
  const handleCommentsToggle = () => {
    setShowComments(!showComments)
    if (!showComments && comments.length === 0) {
      loadComments()
    }
  }

  const isAuthor = session?.user?.id === authorId
  const isLongContent = content.length > 200
  const displayContent = showFullContent ? content : content.substring(0, 200) + (isLongContent ? '...' : '')

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-semibold text-sm">منشور</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{category}</span>
          {subCategory && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{subCategory}</span>
            </>
          )}
        </div>
        
        {/* Actions Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <i className="fa fa-ellipsis-h"></i>
            </button>
            
            {showActions && (
              <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-32">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                    setEditTitle(title)
                    setEditContent(content)
                    setShowActions(false)
                  }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <i className="fa fa-edit text-blue-500"></i>
                  تعديل
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                    setShowActions(false)
                  }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  disabled={isLoading}
                >
                  <i className="fa fa-trash text-red-500"></i>
                  حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Author Info */}
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            handleProfileClick()
          }}
        />
        <div>
          <h3 
            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleProfileClick()
            }}
          >
            {author}
          </h3>
          <span className="text-gray-500 text-xs">{timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <div className={isEditing ? '' : 'cursor-pointer'} onClick={!isEditing ? handlePostClick : undefined}>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان المنشور"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={4}
              placeholder="محتوى المنشور"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isLoading || !editTitle.trim() || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
              {title}
            </h2>

            {image && (
              <img src={image} alt={title} className="w-full h-64 object-cover rounded-lg mb-3" />
            )}

            <p className="text-gray-700 mb-4 leading-relaxed">
              {displayContent}
              {isLongContent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFullContent(!showFullContent)
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-2"
                >
                  {showFullContent ? 'عرض أقل' : 'اقرأ المزيد'}
                </button>
              )}
            </p>
          </>
        )}
      </div>

      {/* Actions Bar */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-2 ${userReaction ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
              onClick={(e) => {
                e.stopPropagation()
                handleReaction()
              }}
              disabled={isLoading}
            >
              <i className={`fa ${userReaction ? 'fa-heart' : 'fa-heart-o'} text-sm mr-1`}></i>
              <span className="text-sm">{currentStats.likes}</span>
            </Button>

            {/* Comments Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-blue-500 p-2" 
              onClick={(e) => {
                e.stopPropagation()
                handleCommentsToggle()
              }}
              disabled={isLoading}
            >
              <i className="fa fa-comment text-sm mr-1"></i>
              <span className="text-sm">{currentStats.comments}</span>
            </Button>

            {/* Share Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-green-500 p-2"
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              disabled={isLoading}
            >
              <i className="fa fa-share text-sm mr-1"></i>
              <span className="text-sm">{currentStats.shares}</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <i className="fa fa-eye text-sm"></i>
              {currentStats.views}
            </span>
            
            {/* Reactions Button */}
            <div className="relative" ref={reactionsRef}>
              <span 
                className={`flex items-center gap-1 cursor-pointer transition-all px-2 py-1 rounded-full hover:bg-gray-100 ${
                  userReaction ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReactions(!showReactions)
                }}
              >
                {userReaction ? (
                  <>
                    <span className="text-sm">{userReaction}</span>
                    <span>بصمة</span>
                  </>
                ) : (
                  <>
                    <i className="fa fa-fingerprint text-sm"></i>
                    <span>بصمة</span>
                  </>
                )}
              </span>
              
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-xl border p-2 flex items-center gap-1 z-50">
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReaction(reaction.emoji)
                      }}
                      disabled={isLoading}
                    >
                      <span className="text-lg">{reaction.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">التعليقات</h3>
              <button 
                onClick={() => setShowComments(false)} 
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Add Comment */}
              {session?.user?.id && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <textarea
                      placeholder="اكتب تعليقاً..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <div className="flex justify-end mt-2">
                      <Button 
                        size="sm" 
                        onClick={handleAddComment}
                        disabled={isLoading || !newComment.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? 'جاري النشر...' : 'نشر'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <p className="font-medium text-sm">
                            {comment.user.firstName} {comment.user.lastName}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString('ar')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد تعليقات بعد
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}