"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Loader2, Edit, Trash2 } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface PostCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  _count: PostCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}



interface PostDetailClientProps {
  session: Session 
  postId: string
}

export default function PostDetailClient({ session, postId }: PostDetailClientProps) {
  const router = useRouter()
  
  // Data states
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  
  // Current data states
  const [currentStats, setCurrentStats] = useState<PostCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/main/posts/${postId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('المنشور غير موجود')
            return
          }
          throw new Error('فشل في جلب بيانات المنشور')
        }
        
        const data = await response.json()
        const fetchedPost = data.post
        setPost(fetchedPost)
        setCurrentStats({
          comments: fetchedPost._count.comments || 0,
          likes: fetchedPost._count.likes || 0,
          shares: fetchedPost._count.shares || 0,
          views: fetchedPost._count.views || 0
        })
        setCurrentUserHasLiked(fetchedPost.userHasLiked || false)
        setCurrentUserReaction(fetchedPost.userReaction || null)
        setCurrentReactions(fetchedPost.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error('Error fetching post:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  // Helper functions
  const isAuthor = session?.user?.email === post?.author?.email
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
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    
    if (!trimmedTitle || !trimmedContent || isUpdating) return
    
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent })
      })
      
      if (!response.ok) throw new Error('فشل في التحديث')
      
      setPost(prev => prev ? { ...prev, title: trimmedTitle, content: trimmedContent } : null)
      setIsEditing(false)
    } catch (error) {
      setError('حدث خطأ في التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟') || isDeletingPost) return
    
    try {
      setIsDeletingPost(true)
      const response = await fetch(`/api/main/posts/${postId}`, { method: 'DELETE' })
      
      if (!response.ok) throw new Error('فشل في حذف المنشور')
      
      router.push('/main/posts')
    } catch (error) {
      setError('حدث خطأ في الحذف')
      setIsDeletingPost(false)
    }
  }

  const handleProfileClick = () => {
    if (post) router.push(`/main/member/${post.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: PostCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل المنشور...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'المنشور غير موجود'}
          </h2>
          <p className="text-gray-600 mb-4">قد يكون المنشور محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push('/main/posts')} variant="outline">
            العودة إلى المنشورات
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

      {/* Post Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            {post.subcategory && <Badge variant="outline">{post.subcategory}</Badge>}
          </div>
          
          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isDeletingPost}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingPost}
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
              {getAuthorDisplayName(post.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(post.createdAt)}</span>
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
              placeholder="عنوان المنشور"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="محتوى المنشور"
              disabled={isUpdating}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(post.title)
                  setEditContent(post.content)
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
              {post.title}
            </h1>
            
            {post.image && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}
            
            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
              {post.content}
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
            postId={post.id}
            apiEndpoint="posts"
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
        {!isEditing && post.updatedAt !== post.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">
            آخر تحديث: {formatTimestamp(post.updatedAt)}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={post.id}
          apiEndpoint="posts"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}