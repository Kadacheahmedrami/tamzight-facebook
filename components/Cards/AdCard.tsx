"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay, { type ReactionsData } from "@/components/Cards/ReactionsDisplay"
import { Megaphone, Target, Calendar, DollarSign, MapPin } from "lucide-react"
import Image from "next/image"

interface AdCardProps {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  image?: string
  targetAmount?: string | number
  currentAmount?: string | number
  deadline?: string
  position?: string
  location?: string
  salary?: string
  eventDate?: string
  ticketPrice?: string
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

export default function AdCard({
  id,
  title,
  content,
  author,
  authorId,
  timestamp,
  category,
  subCategory,
  image,
  targetAmount,
  currentAmount,
  deadline,
  position,
  location,
  salary,
  eventDate,
  ticketPrice,
  stats,
  userHasLiked = false,
  userReaction = null,
  reactions,
  session,
  onDelete,
  onUpdate,
  apiEndpoint,
  detailsRoute,
}: AdCardProps) {
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
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟") || isDeletingPost) return

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

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!targetAmount || !currentAmount) return 0

    // Handle both string and number types
    const target =
      typeof targetAmount === "string"
        ? Number.parseFloat(targetAmount.replace(/[^\d.]/g, ""))
        : Number.parseFloat(targetAmount.toString())

    const current =
      typeof currentAmount === "string"
        ? Number.parseFloat(currentAmount.replace(/[^\d.]/g, ""))
        : Number.parseFloat(currentAmount.toString())

    if (isNaN(target) || isNaN(current) || target === 0) return 0

    return Math.min((current / target) * 100, 100)
  }

  // Get category display info
  const getCategoryInfo = () => {
    switch (category) {
      case "charity":
        return { label: "خيرية", color: "bg-green-100 text-green-800" }
      case "business":
        return { label: "تجارية", color: "bg-blue-100 text-blue-800" }
      case "services":
        return { label: "خدمات", color: "bg-purple-100 text-purple-800" }
      case "events":
        return { label: "فعاليات", color: "bg-orange-100 text-orange-800" }
      case "jobs":
        return { label: "وظائف", color: "bg-indigo-100 text-indigo-800" }
      case "real-estate":
        return { label: "عقارات", color: "bg-red-100 text-red-800" }
      default:
        return { label: "عام", color: "bg-gray-100 text-gray-800" }
    }
  }

  // Get action button text and style
  const getActionButton = () => {
    if (targetAmount) return { text: "تبرع الآن", variant: "default" as const }
    if (position) return { text: "تقدم للوظيفة", variant: "default" as const }
    if (eventDate) return { text: "احجز مكانك", variant: "default" as const }
    return { text: "تفاصيل أكثر", variant: "outline" as const }
  }

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

  const categoryInfo = getCategoryInfo()
  const actionButton = getActionButton()

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      {/* Header with badges and actions */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${categoryInfo.color} text-xs flex items-center gap-1`}>
              <Megaphone className="w-3 h-3" />
              {categoryInfo.label}
            </Badge>
            {subCategory && (
              <>
                <span className="text-gray-400 text-xs">•</span>
                <Badge variant="outline" className="text-xs">
                  {subCategory}
                </Badge>
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
                      setEditContent(content)
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
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors"
            onClick={handleProfileClick}
          />
          <div className="flex-1">
            <h3
              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleProfileClick}
            >
              {author}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section - Top */}
      {image && (
        <div className="relative">
          <Image
            src={image || "/placeholder.svg?height=300&width=600&query=advertisement"}
            alt={title}
            width={600}
            height={300}
            className="w-full h-64 object-cover cursor-pointer"
            onClick={handlePostClick}
          />
        </div>
      )}

      {/* Content Section */}
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="عنوان الإعلان"
              disabled={isUpdating}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              rows={4}
              placeholder="محتوى الإعلان"
              disabled={isUpdating}
            />
            <div className="flex gap-2 justify-end">
              <Button
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
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating || !editTitle.trim() || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Title and Content */}
            <div className="mb-4">
              <h2
                className="text-xl font-bold mb-2 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                onClick={handlePostClick}
              >
                {title}
              </h2>
              <p className="text-gray-700 leading-relaxed cursor-pointer" onClick={handlePostClick}>
                {displayContent}
                {isLongContent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFullContent(!showFullContent)
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium ml-2 transition-colors"
                  >
                    {showFullContent ? "عرض أقل" : "اقرأ المزيد"}
                  </button>
                )}
              </p>
            </div>

            {/* Charity/Fundraising Details */}
            {targetAmount && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    الهدف المالي
                  </span>
                  <span className="text-green-600 font-bold text-lg">{targetAmount} درهم</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    المبلغ المجمع
                  </span>
                  <span className="text-blue-600 font-bold text-lg">{currentAmount} درهم</span>
                </div>
                {deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>آخر موعد: {new Date(deadline).toLocaleDateString("ar-SA")}</span>
                  </div>
                )}
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-green-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-green-700 text-center font-medium">
                    {Math.round(getProgressPercentage())}% مكتمل
                  </div>
                </div>
              </div>
            )}

            {/* Job Details */}
            {position && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">المنصب:</span>
                    <span className="font-bold text-blue-900">{position}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {salary && (
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <DollarSign className="h-4 w-4" />
                      <span>{salary}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Details */}
            {eventDate && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Calendar className="h-4 w-4" />
                    <span>تاريخ الفعالية: {new Date(eventDate).toLocaleDateString("ar-SA")}</span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <MapPin className="h-4 w-4" />
                      <span>{location}</span>
                    </div>
                  )}
                  {ticketPrice && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <DollarSign className="h-4 w-4" />
                      <span>سعر التذكرة: {ticketPrice}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reactions Display and Action Buttons - Same Row */}
            <div className="flex items-center justify-between py-3 border-t border-gray-100">
              <ReactionsDisplay reactions={currentReactions} session={session} stats={currentStats} />
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handlePostClick}>
                  تفاصيل أكثر
                </Button>
                <Button size="sm" className="bg-[#4531fc] hover:bg-blue-800" onClick={handlePostClick}>
                  {actionButton.text}
                </Button>
              </div>
            </div>

            {/* Interactions Bar */}
            <div className="  ">
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