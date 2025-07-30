"use client"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay from "@/components/Cards/ReactionsDisplay"
import { Session } from "inspector/promises"

interface User {
  id: number
  firstName: string
  lastName: string
  avatar?: string | null
}

interface PostCardProps {
  id: string
  title: string
  content: string
  author: string
  authorId: number
  authorData: User
  timestamp: string
  type: string
  category: string
  subcategory?: string | null
  media?: Array<{ id: string; type: 'image' | 'video'; url: string; thumbnail?: string; alt?: string }>
  image?: string | null
  images?: string[]
  stats: { views: number; likes: number; comments: number; shares: number }
  session?: { user?: { id?: string } } | null
  baseRoute: string
  // Product fields
  price?: number
  currency?: string
  inStock?: boolean
  sizes?: string[]
  // User interaction fields
  userHasLiked?: boolean
  userReaction?: string | null
  reactionDetails?: { total: number; summary: Array<{ emoji: string; count: number; users: any[] }>; details: Record<string, any[]> }
  // Share/Repost fields
  sharedBy?: User
  sharedAt?: string
  originalType?: string
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, updatedData: any) => void
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

const typeToApiEndpoint = {
  post: 'posts', book: 'books', idea: 'ideas', image: 'images', video: 'videos',
  truth: 'truths', question: 'questions', ad: 'ads', product: 'products'
} as const

export default function PostCard(props: PostCardProps) {
  const {
    id, title, content, author, authorId, authorData, timestamp, type, category, subcategory,
    media, image, images, stats, session, onDelete, onUpdate, baseRoute,
    price, currency, inStock, sizes, userHasLiked = false, userReaction = null, reactionDetails,
    sharedBy, sharedAt, originalType
  } = props

  const apiEndpoint = typeToApiEndpoint[type as keyof typeof typeToApiEndpoint] || 'posts'
  const isShared = Boolean(sharedBy)
  const displayType = originalType || type
  
  // States 
  const [userLiked, setUserLiked] = useState(userHasLiked)
  const [userReact, setUserReact] = useState(userReaction)
  const [reactionData, setReactionData] = useState(reactionDetails || { total: 0, summary: [], details: {} })
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)
  const [showActions, setShowActions] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  const [currentStats, setCurrentStats] = useState(stats)
  const [videoStarted, setVideoStarted] = useState(false)

  const actionsRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  const config = categoryConfig[displayType as keyof typeof categoryConfig] || categoryConfig.post
  const isAuthor = session?.user?.id === authorId?.toString()
  const isSharedByCurrentUser = session?.user?.id === sharedBy?.id?.toString()
  const isLongContent = content.length > 200
  const displayContent = isLongContent ? content.substring(0, 200) + '...' : content

  type MediaItem = { 
    id: string; 
    type: 'image' | 'video'; 
    url: string; 
    thumbnail?: string; 
    alt?: string 
  }
  
  const displayMedia: MediaItem = 
    (media && media.length > 0 && media[0]) || 
    (image ? { id: 'img', type: 'image', url: image, alt: title } : null) || 
    (images && images.length > 0 ? { id: 'imgs', type: 'image', url: images[0], alt: title } : null) || 
    { id: 'placeholder', type: 'image', url: '/default-image.jpg', alt: 'صورة افتراضية' }

  // Click outside handler for actions menu
  useEffect(() => {
    if (!showActions) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActions])

  // Reset video state when media changes
  useEffect(() => {
    setVideoStarted(false)
  }, [displayMedia?.url])

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `خطأ HTTP: ${response.status}`)
      }

      setIsEditing(false)
      onUpdate?.(id, { title: trimmedTitle, content: trimmedContent })
    } catch (error) {
      console.error('Update error:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟') || isDeletingPost) return
    
    try {
      setIsDeletingPost(true)
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, { method: 'DELETE' })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `خطأ HTTP: ${response.status}`)
      }
      
      onDelete?.(id)
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'حدث خطأ في الحذف')
      setIsDeletingPost(false)
    }
  }

  const navigateToProfile = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation()
    router.push(`/main/member/${userId}`)
  }

  const navigateToPost = () => {
    if (!isEditing) router.push(`${baseRoute}/${id}`)
  }

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`${baseRoute}/${id}`)
  }

  // Handle video play/pause
  const handleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setVideoStarted(true)
    } else {
      videoRef.current.pause()
      setVideoStarted(false)
    }
  }

  return (
    <article className={`bg-white rounded-lg p-4 border shadow-sm mb-4 hover:shadow-md transition-all duration-200 ${
      isShared ? 'border-l-4 border-l-blue-500' : ''
    }`}>
      {/* Share Header - Shows who shared this content */}
      {isShared && sharedBy && (
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <i className="fa fa-retweet text-blue-500"></i>
            <button 
              className="flex items-center gap-2 hover:text-blue-600 transition-colors"
              onClick={(e) => navigateToProfile(e, sharedBy.id)}
            >
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                {sharedBy.avatar ? (
                  <img src={sharedBy.avatar} alt={`${sharedBy.firstName} ${sharedBy.lastName}`} className="w-full h-full object-cover" />
                ) : (
                  <i className="fa fa-user text-gray-500 text-xs"></i>
                )}
              </div>
              <span className="font-medium">
                {sharedBy.firstName} {sharedBy.lastName}
              </span>
              <span className="text-gray-500">شارك هذا</span>
            </button>
            {sharedAt && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{sharedAt}</span>
              </>
            )}
          </div>

          {/* Actions for shared content */}
          {isSharedByCurrentUser && (
            <div className="mr-auto relative" ref={actionsRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isDeletingPost}
              >
                <i className="fa fa-ellipsis-h"></i>
              </button>
              
              {showActions && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg z-20 min-w-32">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); setShowActions(false) }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
                    disabled={isDeletingPost}
                  >
                    <i className="fa fa-times text-red-500"></i>
                    {isDeletingPost ? 'جاري الإلغاء...' : 'إلغاء المشاركة'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Original Content Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex w-full flex-row">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full w-fit flex items-center gap-1 ${config.color}`}>
              <span>{config.emoji}</span>
              <span>{config.displayName}</span>
              {isShared && <span className="text-xs opacity-75">(مُشارك)</span>}
            </span>
            {category && (
              <>
                <span className="text-gray-400 text-xs">•</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full w-fit">{category}</span>
              </>
            )}
          </div>
          
          {/* Only show edit/delete actions for original author on non-shared content */}
          {isAuthor && !isShared && (
            <div className="mr-auto relative" ref={actionsRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isDeletingPost}
              >
                <i className="fa fa-ellipsis-h"></i>
              </button>
              
              {showActions && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg z-20 min-w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditing(true)
                      setEditTitle(title)
                      setEditContent(content)
                      setShowActions(false)
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-edit text-blue-500"></i>تعديل
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); setShowActions(false) }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
                    disabled={isDeletingPost}
                  >
                    <i className="fa fa-trash text-red-500"></i>
                    {isDeletingPost ? 'جاري الحذف...' : 'حذف'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Original Author */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <button 
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center overflow-hidden"
          onClick={(e) => navigateToProfile(e, authorId)}
        >
          {authorData?.avatar ? (
            <img src={authorData.avatar} alt={author} className="w-full h-full object-cover" />
          ) : (
            <i className="fa fa-user text-gray-500 text-xs"></i>
          )}
        </button>
        <div className="flex flex-col">
          <button 
            className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors text-right"
            onClick={(e) => navigateToProfile(e, authorId)}
          >
            {author}
          </button>
          <span className="text-gray-500 text-xs sm:text-sm">{timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <main className={isEditing ? '' : 'cursor-pointer'} onClick={navigateToPost}>
        {isEditing ? (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان المنشور"
              disabled={isUpdating}
              required
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={4}
              placeholder="محتوى المنشور"
              disabled={isUpdating}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(title)
                  setEditContent(content)
                }} 
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button
                type="submit" 
                size="sm"
                disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
              {title}
            </h2>

            <figure className="mb-3 rounded-lg overflow-hidden relative">
              {displayMedia.type === 'video' ? (
                <div className="relative w-full h-64">
                  <video
                    ref={videoRef}
                    src={displayMedia.url}
                    poster={displayMedia.thumbnail}
                    className="w-full h-full object-cover"
                    onClick={handleVideoPlay}
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>

                  {!videoStarted && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                      onClick={handleVideoPlay}
                    >
                      <div className="bg-white bg-opacity-80 rounded-full w-14 h-14 flex items-center justify-center hover:bg-opacity-100 transition-all">
                        <i className="fa fa-play text-2xl text-gray-800"></i>
                      </div>
                    </div>
                  )}

                  {videoStarted && (
                    <div 
                      className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white rounded-full p-1 cursor-pointer"
                      onClick={handleVideoPlay}
                    >
                      {videoRef.current?.paused ? (
                        <i className="fa fa-play w-4 h-4"></i>
                      ) : (
                        <i className="fa fa-pause w-4 h-4"></i>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <img 
                  src={displayMedia.url} 
                  alt={displayMedia.alt || title || 'صورة المنشور'} 
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              )}
            </figure>

            <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {displayContent}
              {isLongContent && (
                <button
                  onClick={handleReadMore}
                  className="text-blue-600 hover:text-blue-800 font-medium ml-2 hover:underline"
                >
                  اقرأ المزيد
                </button>
              )}
            </p>

            {/* Product Info */}
            {displayType === 'product' && price && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {price} {currency || 'دج'}
                    </span>
                    {inStock !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inStock ? 'متوفر' : 'غير متوفر'}
                      </span>
                    )}
                  </div>
                  
                  {sizes && sizes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">الأحجام:</span>
                      <div className="flex gap-1">
                        {sizes.slice(0, 3).map(size => (
                          <span key={size} className="text-xs bg-white px-1 py-0.5 rounded border">
                            {size}
                          </span>
                        ))}
                        {sizes.length > 3 && <span className="text-xs text-gray-500">+{sizes.length - 3}</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Interactions */}
      {!isEditing && (
        <footer>
          <div className="mb-3 flex justify-end">
            <ReactionsDisplay reactions={reactionData} stats={currentStats} session={session} />
          </div>

          <InteractionsBar
            postId={id}
            apiEndpoint={apiEndpoint}
            stats={currentStats}
            userHasLiked={userLiked}
            userReaction={userReact}
            session={session}
            onStatsUpdate={setCurrentStats}
            onReactionUpdate={(reaction, hasLiked) => { setUserReact(reaction); setUserLiked(hasLiked) }}
            onCommentsClick={() => setShowCommentsModal(true)}
          />
        </footer>
      )}

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={id}
          apiEndpoint={apiEndpoint}
          session={session}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={setCurrentStats}
        />
      )}
    </article>
  )
}