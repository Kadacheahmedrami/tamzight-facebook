"use client"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { reactions } from "@/components/LatestSactionCards/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library, IconPrefix, IconName, IconProp } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"

// Add all icons to library
library.add(fas, far);

interface InteractionsBarProps {
  postId: string
  apiEndpoint: string // e.g., "posts", "images", "videos"
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  userHasLiked: boolean
  userReaction: string | null
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
  onStatsUpdate: (newStats: any) => void
  onReactionUpdate: (reaction: string | null, hasLiked: boolean) => void
  onCommentsClick: () => void
}

interface ReactionData {
  emoji: string
  count: number
  users: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

export default function InteractionsBar({
  postId,
  apiEndpoint,
  stats,
  userHasLiked,
  userReaction,
  session,
  onStatsUpdate,
  onReactionUpdate,
  onCommentsClick
}: InteractionsBarProps) {
  // UI states
  const [showReactions, setShowReactions] = useState(false)
  const [showReactionsModal, setShowReactionsModal] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  
  // Data states
  const [reactionsData, setReactionsData] = useState<ReactionData[]>([])
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isReactionsLoading, setIsReactionsLoading] = useState(false)
  
  const reactionsRef = useRef<HTMLDivElement>(null)
  const shareRef = useRef<HTMLDivElement>(null)

  // Debug logging
  useEffect(() => {
    console.log('Props updated - userHasLiked:', userHasLiked, 'userReaction:', userReaction)
  }, [userHasLiked, userReaction])

  // Helper to get Font Awesome icon for a reaction
  const getReactionIcon = (emoji: string, className: string = "") => {
    const reaction = reactions.find(r => r.emoji === emoji);
    if (reaction && reaction.iconClass) {
      // Force type assertion to IconProp
      const iconProp = reaction.iconClass as IconProp;
      
      return (
        <FontAwesomeIcon 
          icon={iconProp} 
          className={`${reaction.colorClass} ${className}`}
        />
      );
    }
    // Fallback to emoji if no reaction found
    return <span className={className}>{emoji}</span>;
  };

  // Get reaction by emoji helper
  const getReactionByEmoji = (emoji: string) => {
    return reactions.find(r => r.emoji === emoji);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      if (reactionsRef.current && !reactionsRef.current.contains(target)) {
        setShowReactions(false)
      }
      
      if (shareRef.current && !shareRef.current.contains(target)) {
        setShowSharePopup(false)
      }
    }
    
    if (showReactions || showSharePopup) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showReactions, showSharePopup])

  // Enhanced API helper with better error handling
  const callApi = async (method: string, body?: any) => {
    try {
      const response = await fetch(`/api/main/${apiEndpoint}/${postId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Share API helper - uses dedicated shares endpoint
  const callShareApi = async (method: string, body?: any) => {
    try {
      const response = await fetch(`/api/main/shares/${postId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Share API Error:', error)
      throw error
    }
  }

  // Load reactions data
  const loadReactions = async () => {
    try {
      setIsReactionsLoading(true)
      const data = await callApi('GET')
      setReactionsData(data.post?.reactions || [])
    } catch (error) {
      console.error('Error loading reactions:', error)
      alert('فشل في تحميل التفاعلات')
    } finally {
      setIsReactionsLoading(false)
    }
  }

  // Simplified and fixed reaction handler
  const handleReaction = async (emoji?: string) => {
    if (isLoading || !session?.user?.id) return
    
    console.log('Before reaction - userHasLiked:', userHasLiked, 'userReaction:', userReaction, 'emoji:', emoji)
    
    try {
      setIsLoading(true)
      
      let newStats = { ...stats }
      let newReaction = null
      let newHasLiked = false
      let apiEmoji = null
      
      // If no emoji provided, it's a simple like/unlike toggle
      if (!emoji) {
        if (userHasLiked || userReaction) {
          // Remove reaction
          newReaction = null
          newHasLiked = false
          newStats.likes = Math.max(0, newStats.likes - 1)
          apiEmoji = null
        } else {
          // Add simple like - use heart emoji as default
          newReaction = '❤️'
          newHasLiked = true
          newStats.likes = newStats.likes + 1
          apiEmoji = '❤️'
        }
      } else {
        // Specific emoji reaction
        if (emoji === userReaction) {
          // Remove current reaction (clicking same emoji)
          newReaction = null
          newHasLiked = false
          newStats.likes = Math.max(0, newStats.likes - 1)
          apiEmoji = null
        } else {
          // Set new reaction
          newReaction = emoji
          newHasLiked = true
          apiEmoji = emoji
          // Only increment if user didn't have any reaction before
          if (!userHasLiked && !userReaction) {
            newStats.likes = newStats.likes + 1
          }
        }
      }
      
      console.log('Calling onReactionUpdate with:', newReaction, newHasLiked)
      
      // Update parent component immediately (optimistic update)
      onReactionUpdate(newReaction, newHasLiked)
      onStatsUpdate(newStats)
      
      console.log('After calling callbacks - about to make API call with emoji:', apiEmoji)
      
      // Make API call
      await callApi('POST', { action: 'like', emoji: apiEmoji })
      
    } catch (error) {
      console.log('Error occurred, reverting state:', error)
      // Revert optimistic update on error
      onReactionUpdate(userReaction, userHasLiked)
      onStatsUpdate(stats)
      alert('حدث خطأ في التفاعل. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
      setShowReactions(false)
    }
  }

  // Share on page handler - now uses dedicated shares API
  const handleShareOnPage = async () => {
    if (isLoading || !session?.user?.id) return
    
    try {
      setIsLoading(true)
      
      // Optimistic update
      const newStats = { ...stats, shares: stats.shares + 1 }
      onStatsUpdate(newStats)
      
      // Use shares API with content type
      await callShareApi('POST', { 
        contentType: apiEndpoint.slice(0, -1) // Remove 's' from endpoint (posts -> post)
      })
      
    } catch (error) {
      console.error('Share error:', error)
      // Revert optimistic update on error
      const revertedStats = { ...stats, shares: Math.max(0, stats.shares) }
      onStatsUpdate(revertedStats)
      alert('حدث خطأ في المشاركة')
    } finally {
      setIsLoading(false)
      setShowSharePopup(false)
    }
  }

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      const currentUrl = window.location.origin
      const postLink = `${currentUrl}/${apiEndpoint}/${postId}`
      
      await navigator.clipboard.writeText(postLink)
      
      // You can add a toast notification here if you want
      alert('تم نسخ الرابط بنجاح')
      
    } catch (error) {
      console.error('Error copying link:', error)
      alert('حدث خطأ في نسخ الرابط')
    } finally {
      setShowSharePopup(false)
    }
  }

  const handleReactionsModalToggle = () => {
    setShowReactionsModal(!showReactionsModal)
    if (!showReactionsModal && reactionsData.length === 0) {
      loadReactions()
    }
  }

  // Get top reactions for display
  const topReactions = reactionsData
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const totalReactionsCount = reactionsData.reduce((sum, r) => sum + r.count, 0)

  return (
    <>
      {/* Reactions Summary Bar */}
      {totalReactionsCount > 0 && (
        <div 
          className="flex items-center justify-between py-2 mb-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            handleReactionsModalToggle()
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              {topReactions.map((reaction, index) => (
                <div 
                  key={reaction.emoji}
                  className="w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center text-sm shadow-sm"
                  style={{ zIndex: topReactions.length - index }}
                >
                  {getReactionIcon(reaction.emoji)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {totalReactionsCount} {totalReactionsCount === 1 ? 'تفاعل' : 'تفاعلات'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {stats.comments > 0 && (
              <span>{stats.comments} تعليق</span>
            )}
            {stats.shares > 0 && (
              <span>{stats.shares} مشاركة</span>
            )}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`p-2 transition-all ${
              userHasLiked || userReaction 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-500 hover:text-red-500'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleReaction()
            }}
            disabled={isLoading}
          >
            <FontAwesomeIcon 
              icon={userHasLiked || userReaction ? fas.faHeart : far.faHeart}
              className={`text-sm mr-1 transition-colors ${
                userHasLiked || userReaction ? 'text-red-500' : ''
              }`} 
            />
            <span className="md:block hidden text-sm">إعجاب</span>
          </Button>

          {/* Comments Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-500 p-2 transition-colors" 
            onClick={(e) => {
              e.stopPropagation()
              onCommentsClick()
            }}
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={far.faComment} className="text-sm mr-1" />
            <span className="md:block hidden text-sm">تعليق</span>
          </Button>

          {/* Share Button */}
          <div className="relative" ref={shareRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-green-500 p-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowSharePopup(!showSharePopup)
              }}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={fas.faShare} className="text-sm mr-1" />
              <span className="md:block hidden text-sm">مشاركة</span>
            </Button>

            {/* Share Popup */}
            {showSharePopup && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border py-2 z-50 min-w-48">
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShareOnPage()
                  }}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={fas.faShare} className="text-green-500" />
                  مشاركة في صفحتك
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyLink()
                  }}
                >
                  <FontAwesomeIcon icon={fas.faLink} className="text-blue-500" />
                  نسخ الرابط
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FontAwesomeIcon icon={far.faEye} className="text-sm" />
            {stats.views}
          </span>
          
          {/* Reactions Button */}
          <div className="relative" ref={reactionsRef}>
            <span 
              className={`flex items-center gap-1 cursor-pointer transition-all px-2 py-1 rounded-full hover:bg-gray-100 ${
                userReaction ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(!showReactions)
              }}
            >
              {userReaction ? (
                <>
                  {getReactionIcon(userReaction, "text-sm")}
                  <span className="md:block hidden">بصمة</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={fas.faFingerprint} className="text-sm" />
                  <span className="md:block hidden">بصمة</span>
                </>
              )}
            </span>
            
            {showReactions && (
              <div className="absolute bottom-full -left-5 mb-2 bg-white rounded-full shadow-xl border px-3 py-2 flex items-center gap-1 z-50 min-w-min">
                {reactions.map((reaction) => (
                  <button
                    key={reaction.name}
                    className="h-6 w-6 md:w-10 md:h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReaction(reaction.emoji)
                    }}
                    disabled={isLoading}
                    title={reaction.label}
                  >
                    <FontAwesomeIcon 
                      icon={reaction.iconClass as IconProp} 
                      className={`text-lg md:text-xl ${reaction.colorClass}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reactions Modal */}
      {showReactionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[70vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-lg">التفاعلات ({totalReactionsCount})</h3>
              <button 
                onClick={() => setShowReactionsModal(false)} 
                className="text-gray-500 hover:text-gray-700 text-xl hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {isReactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">جاري تحميل التفاعلات...</p>
                </div>
              ) : reactionsData.length > 0 ? (
                <div className="space-y-4">
                  {reactionsData.map((reactionGroup) => {
                    const reactionConfig = getReactionByEmoji(reactionGroup.emoji);
                    return (
                      <div key={reactionGroup.emoji} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          {getReactionIcon(reactionGroup.emoji, "text-2xl")}
                          <span className="font-medium text-gray-800">
                            {reactionGroup.count} {reactionGroup.count === 1 ? 'شخص' : 'أشخاص'}
                          </span>
                          {reactionConfig && (
                            <span className="text-sm text-gray-600">({reactionConfig.label})</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {reactionGroup.users.slice(0, 5).map((user, index) => (
                            <div key={user.id} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-700">{user.name}</span>
                            </div>
                          ))}
                          {reactionGroup.users.length > 5 && (
                            <div className="text-xs text-gray-500 mt-1">
                              و {reactionGroup.users.length - 5} آخرين...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FontAwesomeIcon icon={far.faHeart} className="text-3xl mb-2 block" />
                  <p>لا توجد تفاعلات بعد</p>
                  <p className="text-xs mt-1">كن أول من يتفاعل مع هذا المنشور</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}