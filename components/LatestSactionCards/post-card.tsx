"use client"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { PostCardProps } from "@/components/LatestSactionCards/types"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface PostReaction {
  id: string | number
  emoji: string
  userId: string | number
  user: { firstName: string; lastName: string }
}

interface SimplePostCardProps extends PostCardProps {
  userHasLiked?: boolean
  userReaction?: string | null
  reactions?: ReactionsData
  postReactions?: PostReaction[]
  session?: { user?: { id?: string; email?: string; name?: string } } | null
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, updatedData: any) => void
  apiEndpoint: string
  detailsRoute: string
}

const categoryConfig = {
  post: { displayName: 'منشور', color: 'bg-blue-100 text-blue-800', emoji: '📝' },
  image: { displayName: 'صورة', color: 'bg-green-100 text-green-800', emoji: '🖼️' },
  video: { displayName: 'فيديو', color: 'bg-red-100 text-red-800', emoji: '🎥' },
  question: { displayName: 'سؤال', color: 'bg-purple-100 text-purple-800', emoji: '❓' },
  idea: { displayName: 'فكرة', color: 'bg-yellow-100 text-yellow-800', emoji: '💡' },
  book: { displayName: 'كتاب', color: 'bg-indigo-100 text-indigo-800', emoji: '📚' },
  ad: { displayName: 'إعلان', color: 'bg-orange-100 text-orange-800', emoji: '📢' },
  product: { displayName: 'منتج', color: 'bg-pink-100 text-pink-800', emoji: '🛍️' },
  truth: { displayName: 'حقيقة', color: 'bg-teal-100 text-teal-800', emoji: '✨' }
} as const

export default function PostCard(props: SimplePostCardProps) {
  const {
    id, title, content, author, authorId, timestamp, type, category, subCategory,
    image, images, stats, userHasLiked = false, userReaction = null,
    reactions, postReactions = [], session, onDelete, onUpdate,
    apiEndpoint, detailsRoute
  } = props

  const [state, setState] = useState({
    showFullContent: false,
    isEditing: false,
    editTitle: title,
    editContent: content,
    showActions: false,
    showCommentsModal: false,
    showReactionsList: false,
    isUpdating: false,
    isDeletingPost: false,
    stats,
    userReaction,
    userHasLiked,
    reactions: reactions || { total: 0, summary: [], details: {} }
  })

  const actionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Memoized values
  const config = useMemo(() => {
    const key = (type || category || 'post') as keyof typeof categoryConfig
    return categoryConfig[key] || categoryConfig.post
  }, [type, category])

  const isAuthor = useMemo(() => 
    session?.user?.id === authorId?.toString(), [session?.user?.id, authorId])
  
  const isLongContent = useMemo(() => content.length > 200, [content.length])
  
  const displayContent = useMemo(() => 
    state.showFullContent ? content : content.substring(0, 200) + (isLongContent ? '...' : ''),
    [content, state.showFullContent, isLongContent])

  const displayImage = useMemo(() => 
    image || (images && images.length > 0 ? images[0] : null), [image, images])

  const groupedReactions = useMemo(() => {
    if (!postReactions?.length) return {}
    return postReactions.reduce((acc, r) => {
      if (!r?.emoji) return acc
      const key = r.emoji
      if (!acc[key]) acc[key] = { emoji: r.emoji, count: 0, users: [] }
      acc[key].count++
      if (r.user?.firstName && r.user?.lastName) {
        acc[key].users.push({ firstName: r.user.firstName, lastName: r.user.lastName })
      }
      return acc
    }, {} as Record<string, { emoji: string; count: number; users: Array<{ firstName: string; lastName: string }> }>)
  }, [postReactions])

  const { topReactions, totalReactionsCount } = useMemo(() => ({
    topReactions: Object.values(groupedReactions).sort((a, b) => b.count - a.count).slice(0, 3),
    totalReactionsCount: postReactions?.length || 0
  }), [groupedReactions, postReactions])

  // Optimized state updater
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Sync props with state
  useEffect(() => {
    updateState({
      userReaction, userHasLiked, stats,
      reactions: reactions || { total: 0, summary: [], details: {} }
    })
  }, [userReaction, userHasLiked, stats, reactions, updateState])

  // Handle clicks outside actions menu
  useEffect(() => {
    if (!state.showActions) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        updateState({ showActions: false })
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [state.showActions, updateState])

  // API handlers
  const handleUpdate = useCallback(async () => {
    const trimmedTitle = state.editTitle.trim()
    const trimmedContent = state.editContent.trim()
    if (!trimmedTitle || !trimmedContent || state.isUpdating) return

    try {
      updateState({ isUpdating: true })
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `خطأ HTTP: ${response.status}`)
      }

      updateState({ isEditing: false })
      onUpdate?.(id, { title: trimmedTitle, content: trimmedContent })
    } catch (error) {
      console.error('Update error:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في التحديث')
    } finally {
      updateState({ isUpdating: false })
    }
  }, [state.editTitle, state.editContent, state.isUpdating, updateState, apiEndpoint, id, onUpdate])

  const handleDelete = useCallback(async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟') || state.isDeletingPost) return
    
    try {
      updateState({ isDeletingPost: true })
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, { method: 'DELETE' })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `خطأ HTTP: ${response.status}`)
      }
      
      onDelete?.(id)
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في الحذف')
      updateState({ isDeletingPost: false })
    }
  }, [state.isDeletingPost, updateState, apiEndpoint, id, onDelete])

  // Event handlers
  const handlers = {
    postClick: () => router.push(`${detailsRoute}/${id}`),
    profileClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      router.push(`/main/member/${authorId}`)
    },
    toggleContent: (e: React.MouseEvent) => {
      e.stopPropagation()
      updateState({ showFullContent: !state.showFullContent })
    },
    toggleActions: (e: React.MouseEvent) => {
      e.stopPropagation()
      updateState({ showActions: !state.showActions })
    },
    startEditing: (e: React.MouseEvent) => {
      e.stopPropagation()
      updateState({ isEditing: true, editTitle: title, editContent: content, showActions: false })
    },
    cancelEditing: () => updateState({ isEditing: false, editTitle: title, editContent: content }),
    deleteClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      handleDelete()
      updateState({ showActions: false })
    },
    statsUpdate: (newStats: typeof stats) => updateState({ stats: newStats }),
    reactionUpdate: (reaction: string | null, hasLiked: boolean) => 
      updateState({ userReaction: reaction, userHasLiked: hasLiked })
  }

  return (
    <article className="bg-white rounded-lg p-4 border shadow-sm mb-4 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full w-fit flex items-center gap-1 ${config.color}`}>
            <span>{config.emoji}</span>
            <span>{config.displayName}</span>
          </span>
          {subCategory && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full w-fit">
                {subCategory}
              </span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs sm:text-sm">{timestamp}</span>
          
          {isAuthor && (
            <div className="relative" ref={actionsRef}>
              <button
                onClick={handlers.toggleActions}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={state.isDeletingPost}
                aria-label="خيارات المنشور"
              >
                <i className="fa fa-ellipsis-h"></i>
              </button>
              
              {state.showActions && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg z-20 min-w-32">
                  <button
                    onClick={handlers.startEditing}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-edit text-blue-500"></i>تعديل
                  </button>
                  <button
                    onClick={handlers.deleteClick}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
                    disabled={state.isDeletingPost}
                  >
                    <i className="fa fa-trash text-red-500"></i>
                    {state.isDeletingPost ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Author Info */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <button 
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center"
          onClick={handlers.profileClick}
          aria-label={`الملف الشخصي لـ ${author}`}
        >
          <i className="fa fa-user text-gray-500 text-xs"></i>
        </button>
        <button 
          className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors text-right"
          onClick={handlers.profileClick}
        >
          {author}
        </button>
      </div>

      {/* Content */}
      <main className={state.isEditing ? '' : 'cursor-pointer'} 
            onClick={!state.isEditing ? handlers.postClick : undefined}>
        {state.isEditing ? (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <input
              type="text"
              value={state.editTitle}
              onChange={(e) => updateState({ editTitle: e.target.value })}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان المنشور"
              disabled={state.isUpdating}
              required
            />
            <textarea
              value={state.editContent}
              onChange={(e) => updateState({ editContent: e.target.value })}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={4}
              placeholder="محتوى المنشور"
              disabled={state.isUpdating}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" size="sm" onClick={handlers.cancelEditing} disabled={state.isUpdating}>
                إلغاء
              </Button>
              <Button
                type="submit" size="sm"
                disabled={state.isUpdating || !state.editTitle.trim() || !state.editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {state.isUpdating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
              {title}
            </h2>

            {displayImage && (
              <figure className="mb-3 rounded-lg overflow-hidden">
                <img 
                  src={displayImage} 
                  alt={title || 'صورة المنشور'} 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </figure>
            )}

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {displayContent}
              {isLongContent && (
                <button
                  onClick={handlers.toggleContent}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-2 hover:underline"
                >
                  {state.showFullContent ? 'عرض أقل' : 'اقرأ المزيد'}
                </button>
              )}
            </p>
          </>
        )}
      </main>

      {/* Reactions Display */}
      {!state.isEditing && totalReactionsCount > 0 && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {topReactions.map((r, i) => (
              <span 
                key={`${r.emoji}-${i}`}
                className="text-sm bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shadow-sm"
                style={{ zIndex: 10 - i }}
                title={`${r.count} ${r.emoji}`}
              >
                {r.emoji}
              </span>
            ))}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              updateState({ showReactionsList: !state.showReactionsList })
            }}
            className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover:underline"
          >
            {totalReactionsCount} {totalReactionsCount === 1 ? 'تفاعل' : 'تفاعلات'}
          </button>
        </div>
      )}

      {/* Interactions */}
      {!state.isEditing && (
        <footer>
          <div className="mb-3 flex justify-end">
            <ReactionsDisplay reactions={state.reactions} session={session} />
          </div>

          <InteractionsBar
            postId={id}
            apiEndpoint={apiEndpoint}
            stats={state.stats}
            userHasLiked={state.userHasLiked}
            userReaction={state.userReaction}
            session={session}
            onStatsUpdate={handlers.statsUpdate}
            onReactionUpdate={handlers.reactionUpdate}
            onCommentsClick={() => updateState({ showCommentsModal: true })}
          />
        </footer>
      )}

      {/* Comments Modal */}
      {state.showCommentsModal && (
        <CommentsModal
          postId={id}
          apiEndpoint={apiEndpoint}
          session={session}
          stats={state.stats}
          onClose={() => updateState({ showCommentsModal: false })}
          onStatsUpdate={(newStats) => updateState({ stats: newStats })}
        />
      )}

      {/* Reactions List Modal */}
      {state.showReactionsList && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => updateState({ showReactionsList: false })}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-md max-h-[60vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">التفاعلات</h3>
              <button
                onClick={() => updateState({ showReactionsList: false })}
                className="text-gray-500 hover:text-gray-700 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="إغلاق"
              >
                ×
              </button>
            </header>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              {Object.keys(groupedReactions).length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد تفاعلات</p>
              ) : (
                Object.values(groupedReactions).map((r, i) => (
                  <div key={`${r.emoji}-${i}`} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{r.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {r.count} {r.count === 1 ? 'شخص' : 'أشخاص'}
                      </span>
                    </div>
                    {r.users.length > 0 && (
                      <div className="space-y-2 ml-8">
                        {r.users.map((user, ui) => (
                          <div key={ui} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                              <i className="fa fa-user text-gray-400 text-xs"></i>
                            </div>
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}