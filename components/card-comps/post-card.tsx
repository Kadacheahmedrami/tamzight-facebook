import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { PostCardProps, reactions } from './types'
import { getCurrentRoute, combineMediaSources, truncateContent } from './utils'
import { PostCardMedia } from './PostCardMedia'

export default function PostCard({ 
  id, 
  title, 
  content, 
  author, 
  authorId, 
  timestamp, 
  category, 
  subCategory, 
  media = [], 
  image,
  images = [],
  baseRoute = 'posts', 
  stats 
}: PostCardProps) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  
  const reactionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const mediaItems = combineMediaSources(media, image, images, title)
  const { isLong: isLongContent, truncated: truncatedContent } = truncateContent(content)
  const displayContent = showFullContent ? content : truncatedContent

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  const handleReactionSelect = (reaction: string) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null)
    } else {
      setSelectedReaction(reaction)
    }
    setShowReactions(false)
  }

  const handleReadMore = () => {
    setShowFullContent(true)
  }

  const handlePostClick = () => {
    const currentRoute = getCurrentRoute(pathname)
    router.push(`${currentRoute}/${id}`)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/main/member/${authorId}`)
  }

  const selectedReactionData = reactions.find(r => r.name === selectedReaction)

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 relative cursor-pointer hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">{category}</span>
          {subCategory && (
            <>
              <span className="text-gray-400 text-xs">•</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full w-fit">{subCategory}</span>
            </>
          )}
        </div>
        <span className="text-gray-500 text-xs sm:text-sm">{timestamp}</span>
      </div>

      {/* Author Info */}
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex-shrink-0 cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={handleProfileClick}
        ></div>
        <div>
          <h3 
            className="font-semibold text-gray-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleProfileClick}
          >
            {author}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div onClick={handlePostClick}>
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">{title}</h2>

        {/* Media Component */}
        <PostCardMedia 
          mediaItems={mediaItems}
          title={title}
        />

        {/* Text Content */}
        <p className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
          {displayContent}
          {isLongContent && !showFullContent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleReadMore()
              }}
              className="text-blue-600 hover:text-blue-800 font-medium ml-2"
            >
              اقرأ المزيد
            </button>
          )}
          {isLongContent && showFullContent && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowFullContent(false)
              }}
              className="text-blue-600 hover:text-blue-800 font-medium ml-2"
            >
              عرض أقل
            </button>
          )}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-red-500 p-1 sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa fa-heart text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-500 p-1 sm:p-2" 
            onClick={(e) => {
              e.stopPropagation()
              handleCommentClick()
            }}
          >
            <i className="fa fa-comment text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.comments}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-green-500 p-1 sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fa fa-share text-xs sm:text-sm mr-1"></i>
            <span className="text-xs sm:text-sm">{stats.shares}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <i className="fa fa-eye text-xs sm:text-sm"></i>
            {stats.views}
          </span>
          
          {/* Reactions */}
          <div className="relative" ref={reactionsRef}>
            <span 
              className={`flex items-center gap-1 cursor-pointer transition-all duration-200 px-2 py-1 rounded-full hover:bg-gray-100 ${
                selectedReaction ? selectedReactionData?.color : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowReactions(!showReactions)
              }}
            >
              {selectedReaction ? (
                <>
                  <span className="text-sm">{selectedReactionData?.emoji}</span>
                  <span>بصمة</span>
                </>
              ) : (
                <>
                  <i className="fa fa-fingerprint text-xs sm:text-sm"></i>
                  <span>بصمة</span>
                </>
              )}
            </span>
            
            {showReactions && (
              <div className="fixed inset-0 z-50 pointer-events-none">
                <div 
                  className="absolute bg-white rounded-full shadow-xl border border-gray-200 p-2 flex items-center gap-1 pointer-events-auto"
                  style={{
                    left: reactionsRef.current ? reactionsRef.current.getBoundingClientRect().left + (reactionsRef.current.offsetWidth / 2) - 120 : 0,
                    top: reactionsRef.current ? reactionsRef.current.getBoundingClientRect().top - 60 : 0
                  }}
                >
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      onClick={() => handleReactionSelect(reaction.name)}
                      title={reaction.label}
                    >
                      <span className="text-lg">{reaction.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">التعليقات</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    placeholder="اكتب تعليقاً..."
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      نشر
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-medium text-sm">المستخدم {i + 1}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          هذا تعليق تجريبي رقم {i + 1}. محتوى رائع ومفيد جداً!
                        </p>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>منذ ساعة</span>
                        <button className="hover:text-blue-600">إعجاب</button>
                        <button className="hover:text-blue-600">رد</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}