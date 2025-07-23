"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"
import { ImageIcon, MapPin, Monitor, Tag } from "lucide-react"

interface ImageCardProps {
  id: string
  title: string
  description?: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  image: string
  location?: string
  resolution?: string
  tags?: string[]
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

export default function ImageCard({
  id,
  title,
  description,
  author,
  authorId,
  timestamp,
  category,
  subCategory,
  image,
  location,
  resolution,
  tags = [],
  stats,
  userHasLiked = false,
  userReaction = null,
  reactions,
  session,
  onDelete,
  onUpdate,
  apiEndpoint,
  detailsRoute,
}: ImageCardProps) {
  // Content display states
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description || "")

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
    const trimmedDescription = editDescription.trim()

    if (!trimmedTitle || isUpdating) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/main/${apiEndpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, description: trimmedDescription }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setIsEditing(false)
      onUpdate?.(id, { title: trimmedTitle, description: trimmedDescription })
    } catch (error) {
      alert("حدث خطأ في التحديث")
    } finally {
      setIsUpdating(false)
    }
  }

  // Enhanced post deletion
  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟") || isDeletingPost) return

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
  const isLongDescription = (description || "").length > 150
  const displayDescription = showFullDescription
    ? description
    : (description || "").substring(0, 150) + (isLongDescription ? "..." : "")

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
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            صورة
          </span>
          {subCategory && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{subCategory}</span>
            </>
          )}
          {resolution && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                {resolution}
              </span>
            </>
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
                    setEditDescription(description || "")
                    setShowActions(false)
                  }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  disabled={isDeletingPost}
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
                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
                  disabled={isDeletingPost}
                >
                  <i className="fa fa-trash text-red-500"></i>
                  {isDeletingPost ? "جاري الحذف..." : "حذف"}
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
            {author}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{timestamp}</span>
            {location && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{location}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={isEditing ? "" : "cursor-pointer"} onClick={!isEditing ? handlePostClick : undefined}>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان الصورة"
              disabled={isUpdating}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={3}
              placeholder="وصف الصورة"
              disabled={isUpdating}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false)
                  setEditTitle(title)
                  setEditDescription(description || "")
                }}
                disabled={isUpdating}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating || !editTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
              {title}
            </h2>
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={image || "/placeholder.svg"}
                alt={title}
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            {description && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {displayDescription}
                {isLongDescription && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullDescription(!showFullDescription)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors"
                  >
                    {showFullDescription ? "عرض أقل" : "اقرأ المزيد"}
                  </button>
                )}
              </p>
            )}
          </>
        )}
      </div>

      {/* Tags */}
      {!isEditing && tags.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Tag className="w-4 h-4 text-gray-500" />
          {tags.slice(0, 5).map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
              #{tag}
            </span>
          ))}
          {tags.length > 5 && <span className="text-gray-500 text-xs">+{tags.length - 5} المزيد</span>}
        </div>
      )}

      {/* Reactions Preview */}
      {!isEditing && (
        <div className="mb-3 flex justify-end">
          <ReactionsDisplay reactions={currentReactions} session={session} stats={currentStats} />
        </div>
      )}

      {/* Interactions Bar */}
      {!isEditing && (
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
      )}

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
    </div>
  )
}
