"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, User, Loader2, Edit, Trash2, Play, Clock, Eye, Monitor, Globe } from "lucide-react"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { ReactionsData } from "@/components/Cards/ReactionsDisplay"

interface Author {
  id: string
  email: string
  image?: string
}

interface VideoCounts {
  comments: number
  likes: number
  shares: number
  views: number
}

interface Video {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  image?: string
  duration?: string | null  // Changed from string | undefined to string | null
  quality?: string | null   // Changed from string | undefined to string | null
  language?: string | null  // Changed from string | undefined to string | null
  authorId: string
  author: Author
  createdAt: string
  updatedAt: string
  views: number
  _count: VideoCounts
  reactions?: ReactionsData
  userHasLiked?: boolean
  userReaction?: string | null
}

interface VideoDetailClientProps {
  session: Session
  videoId: string
}

export default function VideoDetailClient({ session, videoId }: VideoDetailClientProps) {
  const router = useRouter()
  
  // Data states
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editQuality, setEditQuality] = useState("")
  const [editLanguage, setEditLanguage] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  
  // UI states
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [isDeletingVideo, setIsDeletingVideo] = useState(false)
  
  // Current data states
  const [currentStats, setCurrentStats] = useState<VideoCounts>({ comments: 0, likes: 0, shares: 0, views: 0 })
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(null)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>({ total: 0, summary: [], details: {} })

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/main/videos/${videoId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('الفيديو غير موجود')
            return
          }
          throw new Error('فشل في جلب بيانات الفيديو')
        }
        
        const data = await response.json()
        const fetchedVideo = data.video
        setVideo(fetchedVideo)
        setCurrentStats({
          comments: fetchedVideo._count.comments || 0,
          likes: fetchedVideo._count.likes || 0,
          shares: fetchedVideo._count.shares || 0,
          views: fetchedVideo.views || 0
        })
        setCurrentUserHasLiked(fetchedVideo.userHasLiked || false)
        setCurrentUserReaction(fetchedVideo.userReaction || null)
        setCurrentReactions(fetchedVideo.reactions || { total: 0, summary: [], details: {} })
      } catch (error) {
        console.error('Error fetching video:', error)
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [videoId])

  // Helper functions
  const isAuthor = session?.user?.email === video?.author?.email
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
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}م`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}ك`
    return views.toString()
  }

  // Event handlers
  const handleEdit = () => {
    if (!video) return
    setEditTitle(video.title)
    setEditContent(video.content)
    setEditDuration(video.duration || "")
    setEditQuality(video.quality || "")
    setEditLanguage(video.language || "")
    setIsEditing(true)
  }

  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()
    
    if (!trimmedTitle || !trimmedContent || isUpdating) return
    
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: trimmedTitle, 
          content: trimmedContent,
          duration: editDuration.trim() || null,
          quality: editQuality || null,
          language: editLanguage || null
        })
      })
      
      if (!response.ok) throw new Error('فشل في التحديث')
      
      setVideo(prev => prev ? { 
        ...prev, 
        title: trimmedTitle, 
        content: trimmedContent,
        duration: editDuration.trim() || null,
        quality: editQuality || null,
        language: editLanguage || null
      } : null)
      setIsEditing(false)
    } catch (error) {
      setError('حدث خطأ في التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الفيديو؟') || isDeletingVideo) return
    
    try {
      setIsDeletingVideo(true)
      const response = await fetch(`/api/main/videos/${videoId}`, { method: 'DELETE' })
      
      if (!response.ok) throw new Error('فشل في حذف الفيديو')
      
      router.push('/main/videos')
    } catch (error) {
      setError('حدث خطأ في الحذف')
      setIsDeletingVideo(false)
    }
  }

  const handleProfileClick = () => {
    if (video) router.push(`/main/member/${video.authorId}`)
  }

  // Callback functions for child components
  const handleStatsUpdate = (newStats: VideoCounts) => setCurrentStats(newStats)
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
              <span className="text-gray-600">جاري تحميل الفيديو...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Button onClick={() => router.back()} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error || 'الفيديو غير موجود'}
          </h2>
          <p className="text-gray-600 mb-4">قد يكون الفيديو محذوفاً أو غير متاح</p>
          <Button onClick={() => router.push('/main/videos')} variant="outline">
            العودة إلى الفيديوات
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

      {/* Video Card */}
      <div className="bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition-shadow">
        
        {/* Header with Categories and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{video.category}</Badge>
            {video.subcategory && <Badge variant="outline">{video.subcategory}</Badge>}
            {video.duration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {video.duration}
              </Badge>
            )}
            {video.quality && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Monitor className="h-3 w-3" />
                {video.quality}
              </Badge>
            )}
            {video.language && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {video.language}
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(currentStats.views)} مشاهدة
            </Badge>
          </div>
          
          {/* Actions for Author */}
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isDeletingVideo}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeletingVideo}
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
              {getAuthorDisplayName(video.author)}
            </h3>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>{formatTimestamp(video.createdAt)}</span>
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
              placeholder="عنوان الفيديو"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
              rows={6}
              placeholder="وصف الفيديو"
              disabled={isUpdating}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="المدة (مثال: 5:30)"
                disabled={isUpdating}
              />
              <select
                value={editQuality}
                onChange={(e) => setEditQuality(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="">اختر الجودة</option>
                <option value="HD">HD</option>
                <option value="Full HD">Full HD</option>
                <option value="4K">4K</option>
                <option value="8K">8K</option>
              </select>
              <select
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isUpdating}
              >
                <option value="">اختر اللغة</option>
                <option value="العربية">العربية</option>
                <option value="الإنجليزية">الإنجليزية</option>
                <option value="الفرنسية">الفرنسية</option>
                <option value="الإسبانية">الإسبانية</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(video.title)
                  setEditContent(video.content)
                  setEditDuration(video.duration || "")
                  setEditQuality(video.quality || "")
                  setEditLanguage(video.language || "")
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
              {video.title}
            </h1>
            
            {/* Video Thumbnail/Player */}
            {video.image && (
              <div className="mb-4 rounded-lg overflow-hidden relative group">
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="w-full max-h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-800 ml-1" />
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
              {video.content}
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
            postId={video.id}
            apiEndpoint="videos"
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
        {!isEditing && video.updatedAt !== video.createdAt && (
          <div className="text-xs text-gray-500 mt-2 text-left">
            آخر تحديث: {formatTimestamp(video.updatedAt)}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={video.id}
          apiEndpoint="videos"
          session={session as any}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </div>
  )
}