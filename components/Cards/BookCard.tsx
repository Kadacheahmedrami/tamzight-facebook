"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"
import { BookOpen, Globe, Star, Download, Eye, Book } from "lucide-react"

interface BookCardProps {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  image?: string
  pages?: number
  language?: string
  isbn?: string
  publishYear?: string
  fileSize?: string
  rating?: number
  downloads?: number
  downloadUrl?: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  userHasLiked?: boolean
  userReaction?: string | null
  reactions?: ReactionsData
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
  onDelete?: (postId: string) => void
  onUpdate?: (postId: string, updatedData: any) => void
  apiEndpoint: string
  detailsRoute: string
}

export default function BookCard({
  id,
  title,
  content,
  author,
  authorId,
  timestamp,
  category,
  subCategory,
  image,
  pages,
  language,
  isbn,
  publishYear,
  fileSize,
  rating = 0,
  downloads = 0,
  downloadUrl,
  stats,
  userHasLiked = false,
  userReaction = null,
  reactions,
  session,
  onDelete,
  onUpdate,
  apiEndpoint,
  detailsRoute,
}: BookCardProps) {
  // Content display states
  const [showFullContent, setShowFullContent] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content)

  // UI states
  const [showActions, setShowActions] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)

  // Data states
  const [currentStats, setCurrentStats] = useState(stats)
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(userReaction)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(userHasLiked)
  const [currentReactions, setCurrentReactions] = useState<ReactionsData>(
    reactions || {
      total: 0,
      summary: [],
      details: {},
    },
  )

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  const actionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Sync with props when they change
  useEffect(() => {
    setCurrentUserReaction(userReaction)
    setCurrentUserHasLiked(userHasLiked)
    setCurrentStats(stats)
    setCurrentReactions(reactions || { total: 0, summary: [], details: {} })
  }, [userReaction, userHasLiked, stats, reactions])

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (actionsRef.current && !actionsRef.current.contains(target)) {
        setShowActions(false)
      }
    }

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showActions])

  // Enhanced post update
  const handleUpdate = async () => {
    const trimmedTitle = editTitle.trim()
    const trimmedContent = editContent.trim()

    if (!trimmedTitle || !trimmedContent || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, content: trimmedContent }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setIsEditing(false)
      onUpdate?.(id, { title: trimmedTitle, content: trimmedContent })
    } catch (error) {
      alert("حدث خطأ في التحديث")
    } finally {
      setIsUpdating(false)
    }
  }

  // Enhanced post deletion
  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الكتاب؟") || isDeletingPost) return

    try {
      setIsDeletingPost(true)
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      onDelete?.(id)
    } catch (error) {
      alert("حدث خطأ في الحذف")
      setIsDeletingPost(false)
    }
  }

  // Event handlers
  const handlePostClick = () => router.push(`${detailsRoute}/${id}`)
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/main/member/${authorId}`)
  }

  // Helper functions
  const isAuthor = session?.user?.id === authorId
  const isLongContent = content.length > 200
  const displayContent = showFullContent ? content : content.substring(0, 200) + (isLongContent ? "..." : "")

  // Callback functions for child components
  const handleStatsUpdate = (newStats: typeof stats) => {
    setCurrentStats(newStats)
  }

  const handleReactionUpdate = (reaction: string | null, hasLiked: boolean, newReactions?: ReactionsData) => {
    setCurrentUserReaction(reaction)
    setCurrentUserHasLiked(hasLiked)
    if (newReactions) {
      setCurrentReactions(newReactions)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md hover:shadow-2xl">
      <CardHeader className="pb-3">
        {/* Top Row: Image + Metadata */}
        <div className="flex gap-4">
          {/* Book Image */}
          <div className="relative w-32 h-48 flex-shrink-0 group">
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
              <img
                src={image || "/placeholder.svg?height=128&width=96&query=book cover"}
                alt={title}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={handlePostClick}
              />
            </div>
            
            {/* File Size Badge */}
            {fileSize && (
              <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                {fileSize}
              </div>
            )}
            
            {/* Rating Badge */}
            {rating > 0 && (
              <div className="absolute top-1 right-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 fill-current" />
                {rating.toFixed(1)}
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-all duration-300 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 rounded-lg backdrop-blur-[1px]">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Book className="h-4 w-4 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {/* Downloads indicator */}
            {downloads > 0 && (
              <div className="absolute bottom-1 left-1 bg-green-500/90 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg flex items-center gap-0.5">
                <Download className="h-2.5 w-2.5" />
                {downloads > 1000 ? `${(downloads / 1000).toFixed(1)}k` : downloads}
              </div>
            )}
          </div>

          {/* Book Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 flex items-center gap-1.5 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5" />
                  كتاب
                </Badge>
                {subCategory && (
                  <Badge variant="outline" className="text-xs font-medium px-3 py-1 border-gray-300 text-gray-700 shadow-sm">
                    {subCategory}
                  </Badge>
                )}
                {language && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 flex items-center gap-1.5 shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                    {language}
                  </Badge>
                )}
              </div>

              {/* Actions Menu */}
              {isAuthor && (
                <div className="relative" ref={actionsRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActions(!showActions)
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200 backdrop-blur-sm"
                    disabled={isDeletingPost}
                  >
                    <i className="fa fa-ellipsis-h text-sm"></i>
                  </button>

                  {showActions && (
                    <div className="absolute left-0 top-10 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl z-20 min-w-36 overflow-hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                          setEditTitle(title)
                          setEditContent(content)
                          setShowActions(false)
                        }}
                        className="w-full text-right px-4 py-3 text-sm hover:bg-blue-50/80 flex items-center gap-3 transition-all duration-200"
                        disabled={isDeletingPost}
                      >
                        <i className="fa fa-edit text-blue-500 text-sm"></i>
                        <span className="font-medium">تعديل</span>
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete()
                          setShowActions(false)
                        }}
                        className="w-full text-right px-4 py-3 text-sm hover:bg-red-50/80 flex items-center gap-3 text-red-600 transition-all duration-200"
                        disabled={isDeletingPost}
                      >
                        <i className="fa fa-trash text-red-500 text-sm"></i>
                        <span className="font-medium">{isDeletingPost ? "جاري الحذف..." : "حذف"}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg font-bold p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="عنوان الكتاب"
                  disabled={isUpdating}
                />
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setEditTitle(title)
                      setEditContent(content)
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 border-2 hover:bg-gray-50"
                  >
                    إلغاء
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isUpdating ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardTitle
                  className="text-lg font-bold leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 mb-2"
                  onClick={handlePostClick}
                >
                  {title}
                </CardTitle>
                <CardDescription className="text-sm flex items-center gap-2 text-gray-600 mb-3">
                  <span className="cursor-pointer hover:text-blue-600 transition-colors duration-200 font-medium" onClick={handleProfileClick}>
                    بقلم: {author}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{timestamp}</span>
                </CardDescription>

                {/* Book Details in Row Layout */}
                <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {language && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">اللغة:</span>
                        <span className="font-semibold text-gray-800">{language}</span>
                      </div>
                    )}
                    {pages && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">الصفحات:</span>
                        <span className="font-semibold text-gray-800">{pages}</span>
                      </div>
                    )}
                    {publishYear && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">السنة:</span>
                        <span className="font-semibold text-gray-800">{publishYear}</span>
                      </div>
                    )}
                    {isbn && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">ISBN:</span>
                        <span className="font-mono text-xs font-semibold text-gray-800">{isbn}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Full Width Content/Description */}
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
            rows={4}
            placeholder="وصف الكتاب"
            disabled={isUpdating}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed cursor-pointer" onClick={handlePostClick}>
              {displayContent}
              {isLongContent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFullContent(!showFullContent)
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium mr-2 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                >
                  {showFullContent ? "عرض أقل" : "اقرأ المزيد"}
                </button>
              )}
            </p>
          </div>
        )}

        {!isEditing && (
          <>
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-10 border-2 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                onClick={handlePostClick}
              >
                <Eye className="h-4 w-4 mr-2" />
                معاينة
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-1 h-10 shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                onClick={() => downloadUrl && window.open(downloadUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                تحميل
              </Button>
            </div>

            {/* Reactions Display */}
            <div className="flex justify-end">
              <ReactionsDisplay reactions={currentReactions} session={session} stats={currentStats} />
            </div>

            {/* Interactions Bar */}
            <div className="">
              <InteractionsBar
                postId={id}
                apiEndpoint={apiEndpoint}
                stats={currentStats}
                userHasLiked={currentUserHasLiked}
                userReaction={currentUserReaction}
                session={session}
                onStatsUpdate={handleStatsUpdate}
                onReactionUpdate={handleReactionUpdate}
                onCommentsClick={() => setShowCommentsModal(true)}
              />
            </div>
          </>
        )}
      </CardContent>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={id}
          apiEndpoint={apiEndpoint}
          session={session}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </Card>
  )
}