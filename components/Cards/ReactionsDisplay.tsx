import { useState, useRef, useEffect } from "react"

// Add interfaces for reactions data
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

// Reactions Popup Component
interface ReactionsPopupProps {
  reactions: ReactionsData
  onClose: () => void
  session?: {
    user?: { id?: string; email?: string; name?: string }
  } | null
}

function ReactionsPopup({ reactions, onClose, session }: ReactionsPopupProps) {
  const [activeTab, setActiveTab] = useState<string>('all')
  const popupRef = useRef<HTMLDivElement>(null)

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Get users for active tab
  const getActiveUsers = (): ReactionUser[] => {
    if (activeTab === 'all') {
      // Combine all users from all reactions
      const allUsers: ReactionUser[] = []
      reactions.summary.forEach(reaction => {
        allUsers.push(...reaction.users)
      })
      return allUsers
    } else {
      return reactions.details[activeTab] || []
    }
  }

  const activeUsers = getActiveUsers()

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (reactions.total === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">التفاعلات ({reactions.total})</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            الجميع ({reactions.total})
          </button>
          {reactions.summary.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => setActiveTab(reaction.emoji)}
              className={`flex items-center gap-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === reaction.emoji
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="text-lg">{reaction.emoji}</span>
              <span>({reaction.count})</span>
            </button>
          ))}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeUsers.length > 0 ? (
            <div className="space-y-3">
              {activeUsers.map((user, index) => (
                <div key={`${user.userId}-${index}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    {user.userAvatar ? (
                      <img 
                        src={user.userAvatar} 
                        alt={user.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 text-sm font-medium">
                        {user.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {user.userName}
                        {user.userId === session?.user?.id && (
                          <span className="text-blue-600 text-xs mr-1">(أنت)</span>
                        )}
                      </p>
                      {activeTab !== 'all' && (
                        <span className="text-lg">{activeTab}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                  {/* Show reaction emoji for "all" tab */}
                  {activeTab === 'all' && (
                    <div className="flex-shrink-0">
                      {reactions.summary.map(reaction => {
                        const userInReaction = reaction.users.find(u => u.userId === user.userId)
                        if (userInReaction) {
                          return (
                            <span key={reaction.emoji} className="text-lg">
                              {reaction.emoji}
                            </span>
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
              <div className="text-gray-400 text-4xl mb-2">😊</div>
              <p className="text-gray-500">لا توجد تفاعلات بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Reactions Display Component
export default function ReactionsDisplay({ 
  reactions, 
  session, 
  className = "",
  showTotal = true,
  maxEmojisToShow = 3
}: ReactionsDisplayProps) {
  const [showReactionsPopup, setShowReactionsPopup] = useState(false)

  // Generate reactions preview text
  const getReactionsPreview = () => {
    if (reactions.total === 0) return null
    
    if (reactions.summary.length === 1) {
      const reaction = reactions.summary[0]
      return `${reaction.emoji} ${reaction.count}`
    } else if (reactions.summary.length <= maxEmojisToShow) {
      return reactions.summary
        .map(r => `${r.emoji} ${r.count}`)
        .join(' • ')
    } else {
      return `${reactions.summary.slice(0, 2).map(r => r.emoji).join('')} +${reactions.total}`
    }
  }

  const reactionsPreview = getReactionsPreview()

  // Don't render if no reactions
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
          <span>{reactionsPreview}</span>
          {showTotal && (
            <>
              <span>•</span>
              <span>{reactions.total} تفاعل</span>
            </>
          )}
        </button>
      </div>

      {/* Reactions Popup */}
      {showReactionsPopup && (
        <ReactionsPopup
          reactions={reactions}
          onClose={() => setShowReactionsPopup(false)}
          session={session}
        />
      )}
    </>
  )
}