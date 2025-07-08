import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react"

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string // For videos
  alt?: string
  duration?: string // For videos
  resolution?: string
}

interface PostCardProps {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory?: string
  media?: MediaItem[] // Support multiple media items
  image?: string // Single image for regular posts
  images?: string[] // Multiple images for regular posts
  baseRoute?: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

const reactions = [
  { name: 'like', emoji: '👍', color: 'text-blue-600', label: 'Like' },
  { name: 'love', emoji: '❤️', color: 'text-red-500', label: 'Love' },
  { name: 'laugh', emoji: '😂', color: 'text-yellow-500', label: 'Haha' },
  { name: 'wow', emoji: '😮', color: 'text-orange-500', label: 'Wow' },
  { name: 'sad', emoji: '😢', color: 'text-blue-400', label: 'Sad' },
  { name: 'angry', emoji: '😠', color: 'text-red-600', label: 'Angry' }
]

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
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const reactionsRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Combine all media sources into a unified array
  const allMedia = (): MediaItem[] => {
    let combinedMedia: MediaItem[] = [...media]
    
    // Add single image if provided
    if (image) {
      combinedMedia.push({
        id: `img-${Date.now()}`,
        type: 'image',
        url: image,
        alt: title
      })
    }
    
    // Add multiple images if provided
    if (images.length > 0) {
      const imageMedia = images.map((img, index) => ({
        id: `img-${index}-${Date.now()}`,
        type: 'image' as const,
        url: img,
        alt: `${title} - Image ${index + 1}`
      }))
      combinedMedia.push(...imageMedia)
    }
    
    return combinedMedia
  }

  const mediaItems = allMedia()

  const getCurrentRoute = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1]
    const isIdSegment = /^[a-zA-Z0-9-_]+$/.test(lastSegment) && pathSegments.length > 2
    
    if (isIdSegment) {
      return '/' + pathSegments.slice(0, -1).join('/')
    }
    return pathname
  }

  const isLongContent = content.length > 200
  const displayContent = showFullContent ? content : (isLongContent ? content.substring(0, 200) + "..." : content)

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
    const currentRoute = getCurrentRoute()
    router.push(`${currentRoute}/${id}`)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/main/member/${authorId}`)
  }

  const handleMediaClick = (index: number) => {
    setCurrentMediaIndex(index)
    setShowMediaModal(true)
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const selectedReactionData = reactions.find(r => r.name === selectedReaction)

  const renderMediaGrid = () => {
    if (!mediaItems || mediaItems.length === 0) return null

    const mediaCount = mediaItems.length

    if (mediaCount === 1) {
      const item = mediaItems[0]
      return (
        <div className="mb-3 relative cursor-pointer" onClick={() => handleMediaClick(0)}>
          {item.type === 'video' ? (
            <div className="relative">
              <img
                src={item.thumbnail || item.url}
                alt={item.alt || title}
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                <Play className="h-12 w-12 text-white" />
              </div>
              {item.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {item.duration}
                </div>
              )}
            </div>
          ) : (
            <img
              src={item.url}
              alt={item.alt || title}
              className="w-full h-40 sm:h-48 object-cover rounded-lg"
            />
          )}
        </div>
      )
    }

    if (mediaCount === 2) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {mediaItems.slice(0, 2).map((item, index) => (
            <div key={item.id} className="relative cursor-pointer" onClick={() => handleMediaClick(index)}>
              {item.type === 'video' ? (
                <div className="relative">
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.alt || title}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.alt || title}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )
    }

    if (mediaCount === 3) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="relative cursor-pointer" onClick={() => handleMediaClick(0)}>
            {mediaItems[0].type === 'video' ? (
              <div className="relative">
                <img
                  src={mediaItems[0].thumbnail || mediaItems[0].url}
                  alt={mediaItems[0].alt || title}
                  className="w-full h-48 sm:h-56 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                  <Play className="h-10 w-10 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={mediaItems[0].url}
                alt={mediaItems[0].alt || title}
                className="w-full h-48 sm:h-56 object-cover rounded-lg"
              />
            )}
          </div>
          <div className="grid grid-rows-2 gap-2">
            {mediaItems.slice(1, 3).map((item, index) => (
              <div key={item.id} className="relative cursor-pointer" onClick={() => handleMediaClick(index + 1)}>
                {item.type === 'video' ? (
                  <div className="relative">
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.alt || title}
                      className="w-full h-24 sm:h-28 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.alt || title}
                    className="w-full h-24 sm:h-28 object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    // 4 or more media items
    return (
      <div className="mb-3 grid grid-cols-2 gap-2">
        {mediaItems.slice(0, 3).map((item, index) => (
          <div key={item.id} className="relative cursor-pointer" onClick={() => handleMediaClick(index)}>
            {item.type === 'video' ? (
              <div className="relative">
                <img
                  src={item.thumbnail || item.url}
                  alt={item.alt || title}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.alt || title}
                className="w-full h-32 sm:h-40 object-cover rounded-lg"
              />
            )}
          </div>
        ))}
        <div 
          className="relative cursor-pointer bg-gray-100 rounded-lg flex items-center justify-center h-32 sm:h-40"
          onClick={() => handleMediaClick(3)}
        >
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-600">+{mediaCount - 3}</span>
            <p className="text-sm text-gray-500 mt-1">المزيد</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 relative cursor-pointer hover:shadow-md transition-shadow">
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

      <div onClick={handlePostClick}>
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">{title}</h2>

        {renderMediaGrid()}

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

      {/* Media Modal */}
      {showMediaModal && mediaItems.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="h-12 w-12" />
                </button>
                <button
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}

            <div className="max-w-4xl max-h-full p-4">
              {mediaItems[currentMediaIndex].type === 'video' ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={mediaItems[currentMediaIndex].url}
                    className="max-w-full max-h-full"
                    controls
                    autoPlay
                  />
                </div>
              ) : (
                <img
                  src={mediaItems[currentMediaIndex].url}
                  alt={mediaItems[currentMediaIndex].alt || title}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        </div>
      )}

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