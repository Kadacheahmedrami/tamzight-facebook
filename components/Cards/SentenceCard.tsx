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

// Types matching your SentencePageClient data shapes
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
  isVerified?: boolean
}

interface Stats {
  views: number
  likes: number
  comments: number
  shares: number
  pronunciations?: number
}

interface ReactionSummary {
  emoji: string
  count: number
  users: Array<{
    userId: string
    userName: string
    userAvatar: string | undefined // Changed from string | null to string | undefined
    createdAt: string // Keep as string for internal data
  }>
}

interface Reactions {
  total: number
  summary: ReactionSummary[]
  details: Record<string, ReactionSummary[]>
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
  } // Changed from | null to just optional
}

interface SentenceCardProps {
  // Main sentence data
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
  reactions: Reactions
  pronunciations: PronunciationsData
  
  // Session and handlers
  session?: Session | null
  onDelete?: (sentenceId: string) => void
  onUpdate?: (sentenceId: string, updatedData: any) => void
  
  // API configuration
  apiEndpoint?: string
  detailsRoute?: string
}

export default function SentenceCard({
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
  apiEndpoint = "sentences",
  detailsRoute = "/main/sentences",
}: SentenceCardProps) {
  const router = useRouter()

  // Local state for pronunciations management
  const [localPronunciations, setLocalPronunciations] = useState<Pronunciation[]>(pronunciations?.recent || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditingId, setIsEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    accent: "",
    pronunciation: "",
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
  const [currentReactions, setCurrentReactions] = useState<Reactions>(reactions)

  const actionsRef = useRef<HTMLDivElement>(null)

  const accentOptions = ["قبائلي", "شاوي", "مزابي", "ترقي", "شنوي", "قورايي", "تاشلحيت"]

  // Helper function to convert data types for child components
  const normalizeReactions = (reactions: Reactions): any => {
    return {
      ...reactions,
      summary: reactions.summary.map(summary => ({
        ...summary,
        users: summary.users.map(user => ({
          ...user,
          userAvatar: user.userAvatar === null ? undefined : user.userAvatar,
          createdAt: new Date(user.createdAt) // Convert string to Date
        }))
      })),
      details: Object.fromEntries(
        Object.entries(reactions.details).map(([key, summaries]) => [
          key,
          summaries.map(summary => ({
            ...summary,
            users: summary.users.map(user => ({
              ...user,
              userAvatar: user.userAvatar === null ? undefined : user.userAvatar,
              createdAt: new Date(user.createdAt) // Convert string to Date
            }))
          }))
        ])
      )
    }
  }

  // Normalize reactions for child components
  const normalizedReactions = normalizeReactions(currentReactions)

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

    if (!accent || !pronunciation || isSubmitting) return

    try {
      setIsSubmitting(true)

      const dataToSend = {
        accent,
        pronunciation,
      }

      if (isEditingId) {
        await handleUpdatePronunciation(isEditingId, dataToSend)
        setIsEditingId(null)
      } else {
        await handleAddPronunciation(dataToSend)
        setShowAddForm(false)
      }

      setFormData({ accent: "", pronunciation: "" })
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
  const isLongContent = content.length > 300
  const displayContent = showFullContent ? content : content.substring(0, 300) + (isLongContent ? "..." : "")

  // Get category display info for sentences
  const getCategoryInfo = () => {
    switch (category) {
      case "greetings":
        return { label: "تحيات", color: "bg-green-100 text-green-800" }
      case "daily":
        return { label: "يومية", color: "bg-blue-100 text-blue-800" }
      case "family":
        return { label: "عائلة", color: "bg-purple-100 text-purple-800" }
      case "work":
        return { label: "عمل", color: "bg-orange-100 text-orange-800" }
      case "education":
        return { label: "تعليم", color: "bg-indigo-100 text-indigo-800" }
      case "emotions":
        return { label: "مشاعر", color: "bg-pink-100 text-pink-800" }
      case "questions":
        return { label: "أسئلة", color: "bg-yellow-100 text-yellow-800" }
      case "directions":
        return { label: "اتجاهات", color: "bg-teal-100 text-teal-800" }
      case "weather":
        return { label: "طقس", color: "bg-cyan-100 text-cyan-800" }
      case "food":
        return { label: "طعام", color: "bg-red-100 text-red-800" }
      default:
        return { label: "عام", color: "bg-gray-100 text-gray-800" }
    }
  }

  // Callbacks for stats and reaction updates
  const handleStatsUpdate = (newStats: Stats) => {
    setCurrentStats(newStats)
    onUpdate?.(id, { stats: newStats })
  }

  const handleReactionUpdate = (reaction: string | null, hasLiked: boolean, newReactions?: Reactions) => {
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
                      if (confirm("هل أنت متأكد من حذف هذه الجملة؟")) {
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
            alt={`صورة توضيحية للجملة ${title}`}
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
            هذه الجملة تُستخدم في المحادثات اليومية عند الأمازيغ وتعني بالعربي ( {content} ) وهي جملة شائعة ومفيدة للتعلم
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
                setFormData({ accent: "", pronunciation: "" })
              }}
            >
              أضف نطق جديد للجملة
            </Button>
          </div>
        )}

        {/* Add/Edit Pronunciation Form */}
        {showAddForm && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
            <h3 className="font-semibold mb-3 text-gray-800">
              {isEditingId ? "تعديل النطق" : "إضافة نطق جديد للجملة"}
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

              <textarea
                value={formData.pronunciation}
                onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="كيف تُنطق هذه الجملة في لهجتك"
                rows={3}
                disabled={isSubmitting}
                required
              />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false)
                    setIsEditingId(null)
                    setFormData({ accent: "", pronunciation: "" })
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
          <h3 className="font-semibold mb-3 text-gray-800">النطقات المتوفرة للجملة</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-700">اللهجة</th>
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
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        <div className="max-w-xs break-words">
                          {pron.pronunciation}
                          {pron.isVerified && <span className="text-green-600 text-xs ml-1">✓</span>}
                        </div>
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
                    <td colSpan={4} className="border border-gray-300 px-6 py-4 text-center text-gray-400">
                      لا توجد نطقات مضافة بعد. كن أول من يضيف نطق لهذة الجملة!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reactions Display and Action Buttons */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <ReactionsDisplay reactions={normalizedReactions} session={session} stats={currentStats} />
          
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
            session={session}
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
          session={session}
          stats={currentStats}
          onClose={() => setShowCommentsModal(false)}
          onStatsUpdate={handleStatsUpdate}
        />
      )}
    </Card>
  )
}