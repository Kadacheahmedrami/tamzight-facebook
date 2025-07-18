import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { reactions, PostCardProps } from "@/components/card-comps/types"

interface SimplePostCardProps extends PostCardProps {
  reactions?: Array<{
    id: string
    emoji: string
    userId: string
    user: {
      firstName: string
      lastName: string
    }
  }>
  session?: {
    user?: {
      id?: string
      email?: string
      name?: string
    }
  } | null
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, updatedData: any) => void
}

export default function SimplePostCard({ 
  id, title, content, author, authorId, timestamp, category, subCategory, image, stats, reactions: postReactions = [],
  session, onDelete, onUpdate
}: SimplePostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [showReactionsList, setShowReactionsList] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [postData, setPostData] = useState({ title, content, author, authorId, timestamp, category, subCategory, image, stats })
  
  const reactionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const arabicLabels = ['إعجاب', 'حب', 'ضحك', 'مدهش', 'حزين', 'غضب']

  const groupedReactions = postReactions.reduce((acc, reaction) => {
    const emoji = reaction.emoji
    if (!acc[emoji]) {
      acc[emoji] = { emoji, count: 0, users: [] }
    }
    acc[emoji].count++
    acc[emoji].users.push(reaction.user)
    return acc
  }, {} as Record<string, { emoji: string, count: number, users: Array<{ firstName: string, lastName: string }> }>)

  const topReactions = Object.values(groupedReactions).sort((a, b) => b.count - a.count).slice(0, 3)
  const totalReactionsCount = postReactions.length
  const selectedReactionData = reactions.find(r => r.name === selectedReaction)
  const isLongContent = postData.content.length > 200
  const displayContent = showFullContent ? postData.content : postData.content.substring(0, 200) + (isLongContent ? '...' : '')
  const isAuthor = session?.user?.id && authorId === session.user.id

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch latest post data
  const refreshPostData = async () => {
    try {
      const response = await fetch(`/api/main/posts/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPostData({
          title: data.post.title,
          content: data.post.content,
          author: data.post.author.email, // Adjust based on your user model
          authorId: data.post.authorId,
          timestamp: new Date(data.post.createdAt).toLocaleString('ar'),
          category: data.post.category,
          subCategory: data.post.subcategory,
          image: data.post.image,
          stats: {
            likes: data.post._count.likes,
            comments: data.post._count.comments,
            shares: stats.shares, // This might need to be added to your API
            views: stats.views // This might need to be added to your API
          }
        })
      }
    } catch (error) {
      console.error('Error refreshing post data:', error)
    }
  }

  // Delete post
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/main/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete?.(id)
        // Optionally redirect or show success message
      } else {
        const errorData = await response.json()
        alert(`خطأ في الحذف: ${errorData.error}`)
      }
    } catch (error) {
      alert('حدث خطأ أثناء محاولة حذف المنشور')
      console.error('Delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Update post
  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/main/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPostData(prev => ({
          ...prev,
          title: editTitle,
          content: editContent,
        }))
        setIsEditing(false)
        onUpdate?.(id, { title: editTitle, content: editContent })
      } else {
        const errorData = await response.json()
        alert(`خطأ في التحديث: ${errorData.error}`)
      }
    } catch (error) {
      alert('حدث خطأ أثناء محاولة تحديث المنشور')
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePostClick = () => router.push(`/main/posts/${id}`)
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/main/member/${authorId}`)
  }

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditTitle(postData.title)
    setEditContent(postData.content)
    setShowActions(false)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditTitle(postData.title)
    setEditContent(postData.content)
  }

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 cursor-pointer hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-semibold text-sm">منشور</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{postData.category}</span>
          {postData.subCategory && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{postData.subCategory}</span>
            </>
          )}
        </div>
        
        {/* Actions Menu for Author */}
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
                  onClick={startEditing}
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
                  disabled={isDeleting}
                >
                  <i className="fa fa-trash text-red-500"></i>
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
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
          onClick={handleProfileClick}
        />
        <div>
          <h3 
            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleProfileClick}
          >
            {postData.author}
          </h3>
          <span className="text-gray-500 text-xs">{postData.timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <div onClick={!isEditing ? handlePostClick : undefined}>
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
                onClick={cancelEditing}
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
                {isUpdating ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
              {postData.title}
            </h2>

            {postData.image && (
              <img src={postData.image} alt={postData.title} className="w-full h-64 object-cover rounded-lg mb-3" />
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

      {/* Reactions Display */}
      {totalReactionsCount > 0 && !isEditing && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {topReactions.map((reaction, index) => (
              <span 
                key={reaction.emoji}
                className="text-sm bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowReactionsList(!showReactionsList)
            }}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            {totalReactionsCount} {totalReactionsCount === 1 ? 'تفاعل' : 'تفاعلات'}
          </button>
        </div>
      )}

      {/* Actions Bar */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500 p-2" onClick={(e) => e.stopPropagation()}>
              <i className="fa fa-heart text-sm mr-1"></i>
              <span className="text-sm">{postData.stats.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 p-2" onClick={(e) => {
              e.stopPropagation()
              setShowComments(!showComments)
            }}>
              <i className="fa fa-comment text-sm mr-1"></i>
              <span className="text-sm">{postData.stats.comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 p-2" onClick={(e) => e.stopPropagation()}>
              <i className="fa fa-share text-sm mr-1"></i>
              <span className="text-sm">{postData.stats.shares}</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <i className="fa fa-eye text-sm"></i>
              {postData.stats.views}
            </span>
            
            <div className="relative" ref={reactionsRef}>
              <span 
                className={`flex items-center gap-1 cursor-pointer transition-all px-2 py-1 rounded-full hover:bg-gray-100 ${
                  selectedReaction ? selectedReactionData?.color : 'text-gray-500 hover:text-blue-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowReactions(!showReactions)
                }}
              >
                {selectedReaction ? (
                  <>
                    <span className="text-sm">{selectedReactionData?.emoji}</span>
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
                <div className="fixed inset-0 z-50 pointer-events-none">
                  <div 
                    className="absolute bg-white rounded-full shadow-xl border p-2 flex items-center gap-1 pointer-events-auto"
                    style={{
                      left: reactionsRef.current ? 
                        Math.max(8, Math.min(
                          reactionsRef.current.getBoundingClientRect().left + (reactionsRef.current.offsetWidth / 2) - 120,
                          window.innerWidth - 248
                        )) : 0,
                      top: reactionsRef.current ? reactionsRef.current.getBoundingClientRect().top - 60 : 0
                    }}
                  >
                    {reactions.map((reaction, index) => (
                      <button
                        key={reaction.name}
                        className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-110"
                        onClick={() => {
                          setSelectedReaction(selectedReaction === reaction.name ? null : reaction.name)
                          setShowReactions(false)
                        }}
                        title={arabicLabels[index]}
                      >
                        <span className="text-lg">{reaction.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reactions List Modal */}
      {showReactionsList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[60vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">التفاعلات</h3>
              <button onClick={() => setShowReactionsList(false)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {Object.values(groupedReactions).map((reaction) => (
                <div key={reaction.emoji} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{reaction.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {reaction.count} {reaction.count === 1 ? 'شخص' : 'أشخاص'}
                    </span>
                  </div>
                  <div className="space-y-2 ml-8">
                    {reaction.users.map((user, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{user.firstName} {user.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              <button onClick={() => setShowComments(false)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    placeholder="اكتب تعليقاً..."
                    className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">نشر</Button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-medium text-sm">المستخدم {i + 1}</p>
                        <p className="text-sm text-gray-700 mt-1">هذا تعليق تجريبي رقم {i + 1}. محتوى رائع ومفيد جداً!</p>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>منذ ساعة</span>
                        <button className="hover:text-blue-600">إعجاب</button>
                        <button className="hover:text-blue-600">رد</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}