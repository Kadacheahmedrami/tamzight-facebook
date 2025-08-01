"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Image from "next/image"

import InteractionsBar from "@/components/Cards/InteractionsBar"
import CommentsModal from "@/components/Cards/CommentsModal"
import ReactionsDisplay from "@/components/Cards/ReactionsDisplay"

// Types matching your WordsPageClient data shapes
interface Pronunciation {
  id: string
  accent: string
  pronunciation: string
  createdAt: string // ISO string from API
  user: {
    id: string
    name: string
    avatar?: string | null
  }
  tifinagh?: string
  isVerified?: boolean
}

interface Stats {
  views: number
  likes: number
  comments: number
  shares: number
  pronunciations?: number
}

// Original types from API (using string for createdAt)
interface ApiReactionUser {
  userId: string
  userName: string
  userAvatar: string | null
  createdAt: string
}

interface ApiReactionSummary {
  emoji: string
  count: number
  users: ApiReactionUser[]
}

interface ApiReactions {
  total: number
  summary: ApiReactionSummary[]
  details: Record<string, ApiReactionSummary[]>
}

// Normalized types for ReactionsDisplay (using Date for createdAt and undefined for userAvatar)
interface NormalizedReactionUser {
  userId: string
  userName: string
  userAvatar: string | undefined
  createdAt: Date
}

interface NormalizedReactionSummary {
  emoji: string
  count: number
  users: NormalizedReactionUser[]
}

// Interface that matches what ReactionsDisplay expects
interface ReactionsData {
  total: number
  summary: NormalizedReactionSummary[]
  details: Record<string, NormalizedReactionUser[]>
}

interface PronunciationsByAccent {
  [accent: string]: Pronunciation[]
}

interface PronunciationsData {
  total: number
  byAccent: PronunciationsByAccent
  recent: Pronunciation[]
}

interface Session {
  user?: {
    id?: string
    email?: string
    name?: string
  } | undefined // Changed from null to undefined
}

interface WordCardProps {
  // Main word data - matching WordsPageClient props
  id: string
  title: string
  content: string
  author: string
  authorId: string
  authorAvatar: string | null
  timestamp: string
  category: string
  subcategory: string
  image: string
  
  // Stats and interactions
  stats: Stats
  userHasLiked: boolean
  userReaction: string | null
  reactions: ApiReactions // Use ApiReactions type
  pronunciations: PronunciationsData
  
  // Session and handlers
  session?: Session | null
  onDelete?: (wordId: string) => void
  onUpdate?: (wordId: string, updatedData: any) => void
  
  // API configuration
  apiEndpoint?: string
  detailsRoute?: string
}

export default function WordCard({
  id,
  title,
  content,
  author,
  authorId,
  authorAvatar,
  timestamp,
  category,
  subcategory,
  image,
  stats,
  userHasLiked,
  userReaction,
  reactions,
  pronunciations,
  session,
  onDelete,
  onUpdate,
  apiEndpoint = "words",
  detailsRoute = "/main/words",
}: WordCardProps) {
  const router = useRouter()

  // Local state for pronunciations management
  const [localPronunciations, setLocalPronunciations] = useState<Pronunciation[]>(pronunciations?.recent || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditingId, setIsEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    accent: "",
    pronunciation: "",
    tifinagh: "",
  })

  const [showActions, setShowActions] = useState(false)
  const [showActionsId, setShowActionsId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)

  // Image error handling state
  const [imageError, setImageError] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  // Local state for stats and reactions
  const [currentStats, setCurrentStats] = useState<Stats>(stats)
  const [currentUserReaction, setCurrentUserReaction] = useState<string | null>(userReaction)
  const [currentUserHasLiked, setCurrentUserHasLiked] = useState(userHasLiked)
  const [currentReactions, setCurrentReactions] = useState<ApiReactions>(reactions)

  const actionsRef = useRef<HTMLDivElement>(null)

  const accentOptions = ["قبائلي", "شاوي", "مزابي", "ترقي", "شنوي", "قورايي", "تاشلحيت"]

  // Helper function to convert null to undefined for compatibility
  const normalizeUserAvatar = (avatar: string | null): string | undefined => {
    return avatar === null ? undefined : avatar
  }

  // Helper function to normalize session for ReactionsDisplay
  const normalizeSession = (session: Session | null | undefined): Session | undefined => {
    if (!session) return undefined
    if (session.user === null) {
      return { user: undefined }
    }
    return session as Session
  }

  // Helper function to normalize reactions for ReactionsDisplay
// Helper function to normalize reactions for ReactionsDisplay
const normalizeReactions = (reactions: ApiReactions): ReactionsData => {
    return {
      total: reactions.total,
      summary: reactions.summary.map(summary => ({
        ...summary,
        users: summary.users.map(user => ({
          ...user,
          userAvatar: normalizeUserAvatar(user.userAvatar),
          createdAt: new Date(user.createdAt)
        }))
      })),
      // Flatten details to match ReactionsDisplay expected structure with proper error handling
      details: Object.keys(reactions.details || {}).reduce((acc, key) => {
        // Check if reactions.details[key] exists and is an array
        const emojiReactions = reactions.details[key]
        if (!emojiReactions || !Array.isArray(emojiReactions)) {
          acc[key] = []
          return acc
        }
        
        // Extract all users from all summaries for this emoji and flatten
        const allUsers = emojiReactions.reduce((users, summary) => {
          // Check if summary exists and has users array
          if (!summary || !summary.users || !Array.isArray(summary.users)) {
            return users
          }
          
          const normalizedUsers = summary.users.map(user => ({
            ...user,
            userAvatar: normalizeUserAvatar(user.userAvatar),
            createdAt: new Date(user.createdAt)
          }))
          return [...users, ...normalizedUsers]
        }, [] as NormalizedReactionUser[])
        
        acc[key] = allUsers
        return acc
      }, {} as Record<string, NormalizedReactionUser[]>)
    }
  }

  // Close actions dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (actionsRef.current && !actionsRef.current.contains(target)) {
        setShowActions(false)
        setShowActionsId(null)
      }
    }

    if (showActions || showActionsId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showActions, showActionsId])

  // Sync external props updates to local state
  useEffect(() => {
    setCurrentStats(stats)
    setCurrentUserReaction(userReaction)
    setCurrentUserHasLiked(userHasLiked)
    setCurrentReactions(reactions)
    setLocalPronunciations(pronunciations?.recent || [])
  }, [stats, userReaction, userHasLiked, reactions, pronunciations])

  // Reset image errors when props change
  useEffect(() => {
    setImageError(false)
    setAvatarError(false)
  }, [image, authorAvatar])

  // Handle add pronunciation
  const handleAddPronunciation = async (pronunciationData: Omit<Pronunciation, "id" | "createdAt" | "user">) => {
    try {
      const response = await fetch(`/api/main/${apiEndpoint}/${id}/pronunciations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pronunciationData),
      })

      if (!response.ok) {
        throw new Error("Failed to add pronunciation")
      }

      const newPronunciation = await response.json()
      setLocalPronunciations(prev => [newPronunciation, ...prev])
      
      // Update parent component
      const updatedPronunciations = {
        ...pronunciations,
        total: (pronunciations?.total || 0) + 1,
        recent: [newPronunciation, ...localPronunciations],
      }
      onUpdate?.(id, { pronunciations: updatedPronunciations })
      
    } catch (error) {
      console.error("Error adding pronunciation:", error)
      throw error
    }
  }

  // Handle update pronunciation
  const handleUpdatePronunciation = async (pronunciationId: string, data: Partial<Omit<Pronunciation, "id" | "createdAt" | "user">>) => {
    try {
      const response = await fetch(`/api/main/${apiEndpoint}/${id}/pronunciations/${pronunciationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update pronunciation")
      }

      const updatedPronunciation = await response.json()
      setLocalPronunciations(prev => 
        prev.map(p => p.id === pronunciationId ? updatedPronunciation : p)
      )
      
      // Update parent component
      const updatedPronunciations = {
        ...pronunciations,
        recent: localPronunciations.map(p => p.id === pronunciationId ? updatedPronunciation : p),
      }
      onUpdate?.(id, { pronunciations: updatedPronunciations })
      
    } catch (error) {
      console.error("Error updating pronunciation:", error)
      throw error
    }
  }

  // Handle delete pronunciation
  const handleDeletePronunciation = async (pronunciationId: string) => {
    try {
      const response = await fetch(`/api/main/${apiEndpoint}/${id}/pronunciations/${pronunciationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete pronunciation")
      }

      setLocalPronunciations(prev => prev.filter(p => p.id !== pronunciationId))
      
      // Update parent component
      const updatedPronunciations = {
        ...pronunciations,
        total: Math.max((pronunciations?.total || 0) - 1, 0),
        recent: localPronunciations.filter(p => p.id !== pronunciationId),
      }
      onUpdate?.(id, { pronunciations: updatedPronunciations })
      
    } catch (error) {
      console.error("Error deleting pronunciation:", error)
      throw error
    }
  }

  // Handle form submission for add/edit
  const handleSubmit = async () => {
    const accent = formData.accent.trim()
    const pronunciation = formData.pronunciation.trim()
    const tifinagh = formData.tifinagh.trim()

    if (!accent || !pronunciation || isSubmitting) return

    try {
      setIsSubmitting(true)

      const dataToSend = {
        accent,
        pronunciation,
        tifinagh,
      }

      if (isEditingId) {
        await handleUpdatePronunciation(isEditingId, dataToSend)
        setIsEditingId(null)
      } else {
        await handleAddPronunciation(dataToSend)
        setShowAddForm(false)
      }

      setFormData({ accent: "", pronunciation: "", tifinagh: "" })
    } catch {
      alert("حدث خطأ في الحفظ")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deletion of a pronunciation line
  const handleDelete = async (pronunciationId: string) => {
    if (isDeletingId || !confirm("هل أنت متأكد من حذف هذا النطق؟")) return
    try {
      setIsDeletingId(pronunciationId)
      await handleDeletePronunciation(pronunciationId)
      setShowActionsId(null)
    } catch {
      alert("حدث خطأ في الحذف")
    } finally {
      setIsDeletingId(null)
    }
  }

  // Initiate edit mode for a pronunciation line
  const handleEdit = (pron: Pronunciation) => {
    if (pron.user.id === session?.user?.id) {
      setIsEditingId(pron.id)
      setFormData({
        accent: pron.accent,
        pronunciation: pron.pronunciation,
        tifinagh: pron.tifinagh ?? "",
      })
      setShowAddForm(true)
      setShowActionsId(null)
    }
  }

  // Check if the user owns the item (for showing edit/delete)
  const isCurrentUser = (userId: string) => session?.user?.id === userId
  const isAuthor = session?.user?.id === authorId

  // Event handlers
  const handlePostClick = () => router.push(`${detailsRoute}/${id}`)
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/main/member/${authorId}`)
  }

  // Helper functions
  const isLongContent = content.length > 200
  const displayContent = showFullContent ? content : content.substring(0, 200) + (isLongContent ? "..." : "")

  // Get category display info
  const getCategoryInfo = () => {
    switch (category) {
      case "nouns":
        return { label: "أسماء", color: "bg-green-100 text-green-800" }
      case "verbs":
        return { label: "أفعال", color: "bg-blue-100 text-blue-800" }
      case "adjectives":
        return { label: "صفات", color: "bg-purple-100 text-purple-800" }
      case "expressions":
        return { label: "تعابير", color: "bg-orange-100 text-orange-800" }
      case "phrases":
        return { label: "عبارات", color: "bg-indigo-100 text-indigo-800" }
      case "proverbs":
        return { label: "أمثال", color: "bg-red-100 text-red-800" }
      default:
        return { label: "عام", color: "bg-gray-100 text-gray-800" }
    }
  }

  // Callbacks for stats and reaction updates
  const handleStatsUpdate = (newStats: Stats) => {
    setCurrentStats(newStats)
    onUpdate?.(id, { stats: newStats })
  }

  const handleReactionUpdate = (reaction: string | null, hasLiked: boolean, newReactions?: ApiReactions) => {
    setCurrentUserReaction(reaction)
    setCurrentUserHasLiked(hasLiked)
    if (newReactions) {
      setCurrentReactions(newReactions)
      onUpdate?.(id, { 
        userReaction: reaction,
        userHasLiked: hasLiked,
        reactions: newReactions 
      })
    }
  }

  // Image error handlers
  const handleImageError = () => {
    setImageError(true)
  }

  const handleAvatarError = () => {
    setAvatarError(true)
  }

  // Helper function to check if image should be unoptimized
  const shouldUnoptimize = (imageUrl: string) => {
    return imageUrl.includes('tamzight.vercel.app') || 
           imageUrl.includes('localhost') || 
           !imageUrl.startsWith('http')
  }

  const categoryInfo = getCategoryInfo()

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 bg-white">
      {/* Header with badges and actions */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge className={`${categoryInfo.color} text-xs`}>
              {categoryInfo.label}
            </Badge>
            {subcategory && (
              <>
                <span className="text-gray-400 text-xs">•</span>
                <Badge variant="outline" className="text-xs">
                  {subcategory}
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
              >
                <i className="fa fa-ellipsis-h"></i>
              </button>

              {showActions && (
                <div className="absolute left-0 top-8 bg-white border rounded-lg shadow-lg z-20 min-w-32">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`${detailsRoute}/${id}/edit`)
                      setShowActions(false)
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <i className="fa fa-edit text-blue-500"></i>
                    تعديل
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("هل أنت متأكد من حذف هذه الكلمة؟")) {
                        onDelete?.(id)
                      }
                      setShowActions(false)
                    }}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 transition-colors"
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
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors flex items-center justify-center"
            onClick={handleProfileClick}
          >
            {authorAvatar && !avatarError ? (
              <Image 
                src={authorAvatar} 
                alt={`صورة ${author}`} 
                width={40} 
                height={40} 
                className="w-full h-full rounded-full object-cover"
                onError={handleAvatarError}
                unoptimized={shouldUnoptimize(authorAvatar)}
              />
            ) : (
              <span className="text-gray-500 text-sm font-semibold">
                {author.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
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

      {/* Image Section */}
      {image && 
       image !== "/placeholder.svg?height=300&width=600" && 
       !imageError && (
        <div className="relative">
          <Image
            src={image}
            alt={`صورة توضيحية لكلمة ${title}`}
            width={600}
            height={300}
            className="w-full h-64 object-cover cursor-pointer"
            onClick={handlePostClick}
            onError={handleImageError}
            unoptimized={shouldUnoptimize(image)}
          />
        </div>
      )}

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Title and Content */}
        <div className="mb-4">
          <h2
            className="text-xl font-bold mb-2 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
            onClick={handlePostClick}
          >
            {title}
          </h2>
          <p className="text-gray-700 leading-relaxed cursor-pointer" onClick={handlePostClick}>
            المعنى: {displayContent}
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
          <p className="text-xs text-gray-500 mt-2">
            هذه الكلمة بحروف التيفيناغ تعني بالعربي ( {content} ) وهي كلمة معروفة ومستخدمة عند جميع الأمازيغ في العالم
          </p>
        </div>

        {/* Add Pronunciation Button */}
        {session?.user && (
          <div className="mb-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowAddForm(true)
                setIsEditingId(null)
                setFormData({ accent: "", pronunciation: "", tifinagh: "" })
              }}
            >
              أضف نطق جديد
            </Button>
          </div>
        )}

        {/* Add/Edit Pronunciation Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
            <h3 className="font-semibold mb-3 text-gray-800">
              {isEditingId ? "تعديل النطق" : "إضافة نطق جديد"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="space-y-3"
            >
              <select
                value={formData.accent}
                onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isSubmitting}
                required
              >
                <option value="">اختر اللهجة</option>
                {accentOptions.map((accent) => (
                  <option key={accent} value={accent}>
                    {accent}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={formData.pronunciation}
                onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="النطق بالعربي"
                disabled={isSubmitting}
                required
              />

              <input
                type="text"
                value={formData.tifinagh}
                onChange={(e) => setFormData({ ...formData, tifinagh: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="بحروف التيفيناغ (اختياري)"
                dir="ltr"
                disabled={isSubmitting}
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setIsEditingId(null)
                    setFormData({ accent: "", pronunciation: "", tifinagh: "" })
                  }}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !formData.accent.trim() || !formData.pronunciation.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting
                    ? isEditingId
                      ? "جاري حفظ التعديل..."
                      : "جاري الإضافة..."
                    : isEditingId
                    ? "حفظ التعديل"
                    : "إضافة"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Pronunciations Table - Compact Version */}
        <div className="mb-4">
          <h3 className="font-semibold mb-3 text-gray-800">النطقات المتوفرة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">اللهجة</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">التيفيناغ</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">النطق</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">المستخدم</th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {localPronunciations.length > 0 ? (
                  localPronunciations.map((pron) => (
                    <tr key={pron.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {pron.accent}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-purple-700 font-bold" dir="ltr">
                        {pron.tifinagh || "ⵜⴰⵎⴰⵣⵉⵖⵜ"}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {pron.pronunciation}
                        {pron.isVerified && <span className="text-green-600 text-xs ml-1">✓</span>}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-xs text-gray-500">
                        <div>{pron.user.name || "مستخدم مجهول"}</div>
                        <div>{new Date(pron.createdAt).toLocaleDateString("ar-SA")}</div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        {isCurrentUser(pron.user.id) && (
                          <div className="relative" ref={actionsRef}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowActionsId(showActionsId === pron.id ? null : pron.id)
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                              disabled={isDeletingId === pron.id}
                            >
                              <i className="fa fa-ellipsis-h text-xs" />
                            </button>
                            {showActionsId === pron.id && (
                              <div className="absolute left-0 top-6 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[8rem]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEdit(pron)
                                  }}
                                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-blue-600 font-medium transition-colors"
                                >
                                  <i className="fa fa-edit" />
                                  تعديل
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(pron.id)
                                  }}
                                  disabled={isDeletingId === pron.id}
                                  className="w-full text-right px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600 font-medium transition-colors"
                                >
                                  <i className="fa fa-trash" />
                                  {isDeletingId === pron.id ? "حذف..." : "حذف"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-6 py-4 text-center text-gray-400">
                      لا توجد نطقات مضافة بعد. كن أول من يضيف نطق لهذة الكلمة!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reactions Display and Action Buttons */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <ReactionsDisplay 
            reactions={normalizeReactions(currentReactions)} 
            session={normalizeSession(session)} 
            stats={currentStats} 
          />
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePostClick}>
              تفاصيل أكثر
            </Button>
          </div>
        </div>

        {/* Interactions Bar */}
        <div className="mt-2">
          <InteractionsBar
            postId={id}
            apiEndpoint={apiEndpoint}
            stats={currentStats}
            userHasLiked={currentUserHasLiked}
            userReaction={currentUserReaction}
            onStatsUpdate={handleStatsUpdate}
            onReactionUpdate={handleReactionUpdate}
            onCommentsClick={() => setShowCommentsModal(true)}
          />
        </div>
      </CardContent>

      {/* Comments Modal */}
      {showCommentsModal && (
        <CommentsModal
          postId={id}
          apiEndpoint={apiEndpoint}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </Card>
  )
}