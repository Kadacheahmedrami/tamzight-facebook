"use client"
import { useState, useRef, useEffect } from "react"
import { reactions } from "@/components/LatestSactionCards/types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library, IconPrefix, IconName } from "@fortawesome/fontawesome-svg-core"
import { fas } from "@fortawesome/free-solid-svg-icons"
import { far } from "@fortawesome/free-regular-svg-icons"

library.add(fas, far)

export interface ReactionUser {
  userId: string
  userName: string
  userAvatar?: string
  createdAt: Date
}

export interface ReactionSummary {
  emoji: string
  count: number
  users: ReactionUser[]
}

export interface ReactionsData {
  total: number
  summary: ReactionSummary[]
  details: Record<string, ReactionUser[]>
}

interface ReactionsDisplayProps {
  reactions: ReactionsData
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
  className?: string
  showTotal?: boolean
  maxEmojisToShow?: number
}

interface ReactionsPopupProps {
  reactions: ReactionsData
  onClose: () => void
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
}

// Helper function to get FontAwesome icon for emoji
const getIconForEmoji = (emoji: string) => {
  const reaction = reactions.find(r => r.emoji === emoji)
  return reaction ? [reaction.iconClass[0], reaction.iconClass[1]] as [IconPrefix, IconName] : null
}

const getReactionData = (emoji: string) => {
  return reactions.find(r => r.emoji === emoji)
}

function ReactionsPopup({ reactions: reactionsData, onClose, session }: ReactionsPopupProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getActiveUsers = (): ReactionUser[] => {
    if (activeTab === 'all') {
      const allUsers: ReactionUser[] = []
      if (reactionsData.summary && Array.isArray(reactionsData.summary)) {
        reactionsData.summary.forEach(reaction => {
          if (reaction.users && Array.isArray(reaction.users)) {
            allUsers.push(...reaction.users)
          }
        })
      }
      return allUsers
    }
    return reactionsData.details?.[activeTab] || []
  }

  const activeUsers = getActiveUsers()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (!reactionsData || reactionsData.total === 0) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={popupRef} className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">التفاعلات ({reactionsData.total})</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
            <FontAwesomeIcon icon={['fas', 'times']} className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            الجميع ({reactionsData.total})
          </button>
          {reactionsData.summary && Array.isArray(reactionsData.summary) && reactionsData.summary.map((reaction) => {
            const iconData = getIconForEmoji(reaction.emoji)
            const reactionData = getReactionData(reaction.emoji)
            
            return (
              <button
                key={reaction.emoji}
                onClick={() => setActiveTab(reaction.emoji)}
                className={`flex items-center gap-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === reaction.emoji ? 'border-b-2 border-blue-500 text-blue-600 bg-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {iconData ? (
                  <FontAwesomeIcon icon={iconData} className={`text-lg ${reactionData?.colorClass || ''}`} />
                ) : (
                  <span className="text-lg">{reaction.emoji}</span>
                )}
                <span>({reaction.count})</span>
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeUsers.length > 0 ? (
            <div className="space-y-3">
              {activeUsers.map((user, index) => (
                <div key={`${user.userId}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    {user.userAvatar ? (
                      <img src={user.userAvatar} alt={user.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-600 text-sm font-medium">
                        {user.userName?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {user.userName}
                        {user.userId === session?.user?.id && (
                          <span className="text-blue-600 text-xs mr-1">(أنت)</span>
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                  </div>

                  {activeTab === 'all' && (
                    <div className="flex-shrink-0">
                      {reactionsData.summary && Array.isArray(reactionsData.summary) && reactionsData.summary.map(reaction => {
                        const userInReaction = reaction.users?.find(u => u.userId === user.userId)
                        if (userInReaction) {
                          const iconData = getIconForEmoji(reaction.emoji)
                          const reactionData = getReactionData(reaction.emoji)
                          
                          return iconData ? (
                            <FontAwesomeIcon
                              key={reaction.emoji}
                              icon={iconData} 
                              className={`text-lg ${reactionData?.colorClass || ''}`}
                            />
                          ) : (
                            <span key={reaction.emoji} className="text-lg">{reaction.emoji}</span>
                          )
                        }
                        return null
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={['fas', 'smile']} className="text-gray-400 text-4xl mb-2" />
              <p className="text-gray-500">لا توجد تفاعلات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReactionsDisplay({ 
  reactions: reactionsData, 
  session, 
  className = "",
  showTotal = true,
  maxEmojisToShow = 3
}: ReactionsDisplayProps) {
  const [showReactionsPopup, setShowReactionsPopup] = useState(false)

  const getReactionsPreview = () => {
    // Add null/undefined checks
    if (!reactionsData || reactionsData.total === 0 || !reactionsData.summary || !Array.isArray(reactionsData.summary)) {
      return null
    }
    
    if (reactionsData.summary.length === 1) {
      const reaction = reactionsData.summary[0]
      const iconData = getIconForEmoji(reaction.emoji)
      const reactionData = getReactionData(reaction.emoji)
      
      return (
        <span className="flex items-center gap-1">
          {iconData ? (
            <FontAwesomeIcon icon={iconData} className={reactionData?.colorClass || ''} />
          ) : (
            <span>{reaction.emoji}</span>
          )}
          <span>{reaction.count}</span>
        </span>
      )
    } else if (reactionsData.summary.length <= maxEmojisToShow) {
      return (
        <span className="flex items-center gap-2">
          {reactionsData.summary.map((r, index) => {
            const iconData = getIconForEmoji(r.emoji)
            const reactionData = getReactionData(r.emoji)
            
            return (
              <span key={r.emoji} className="flex items-center gap-1">
                {iconData ? (
                  <FontAwesomeIcon icon={iconData} className={reactionData?.colorClass || ''} />
                ) : (
                  <span>{r.emoji}</span>
                )}
                <span>{r.count}</span>
                {index < reactionsData.summary.length - 1 && <span className="text-gray-400">•</span>}
              </span>
            )
          })}
        </span>
      )
    } else {
      return (
        <span className="flex items-center gap-1">
          {reactionsData.summary.slice(0, 2).map(r => {
            const iconData = getIconForEmoji(r.emoji)
            const reactionData = getReactionData(r.emoji)
            
            return iconData ? (
              <FontAwesomeIcon key={r.emoji} icon={iconData} className={reactionData?.colorClass || ''} />
            ) : (
              <span key={r.emoji}>{r.emoji}</span>
            )
          })}
          <span>+{reactionsData.total}</span>
        </span>
      )
    }
  }

  const reactionsPreview = getReactionsPreview()
  if (!reactionsPreview) return null

  return (
    <>
      <div className={`flex items-center ${className}`}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowReactionsPopup(true)
          }}
          className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 hover:bg-gray-50 px-2 py-1 rounded-md"
        >
          {reactionsPreview}
          {showTotal && (
            <>
              <span className="text-gray-400">•</span>
              <span>{reactionsData.total} تفاعل</span>
            </>
          )}
        </button>
      </div>

      {showReactionsPopup && (
        <ReactionsPopup
          reactions={reactionsData}
          onClose={() => setShowReactionsPopup(false)}
          session={session}
        />
      )}
    </>
  )
}