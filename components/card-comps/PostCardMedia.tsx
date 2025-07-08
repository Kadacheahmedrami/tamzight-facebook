import { useState, useRef } from "react"
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react"
import { MediaItem } from './types'

interface PostCardMediaProps {
  mediaItems: MediaItem[]
  title: string
}

export function PostCardMedia({ mediaItems, title }: PostCardMediaProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!mediaItems || mediaItems.length === 0) return null

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

  const renderMediaItem = (item: MediaItem, className: string, playIconSize: string = "h-8 w-8") => {
    return (
      <div className={`relative ${className}`}>
        {item.type === 'video' ? (
          <div className="relative">
            <img
              src={item.thumbnail || item.url}
              alt={item.alt || title}
              className={className}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
              <Play className={`${playIconSize} text-white`} />
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
            className={className}
          />
        )}
      </div>
    )
  }

  const renderMediaGrid = () => {
    const mediaCount = mediaItems.length

    if (mediaCount === 1) {
      return (
        <div className="mb-3 relative cursor-pointer" onClick={() => handleMediaClick(0)}>
          {renderMediaItem(mediaItems[0], "w-full h-40 sm:h-48 object-cover rounded-lg", "h-12 w-12")}
        </div>
      )
    }

    if (mediaCount === 2) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {mediaItems.slice(0, 2).map((item, index) => (
            <div key={item.id} className="cursor-pointer" onClick={() => handleMediaClick(index)}>
              {renderMediaItem(item, "w-full h-32 sm:h-40 object-cover rounded-lg")}
            </div>
          ))}
        </div>
      )
    }

    if (mediaCount === 3) {
      return (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="cursor-pointer" onClick={() => handleMediaClick(0)}>
            {renderMediaItem(mediaItems[0], "w-full h-48 sm:h-56 object-cover rounded-lg", "h-10 w-10")}
          </div>
          <div className="grid grid-rows-2 gap-2">
            {mediaItems.slice(1, 3).map((item, index) => (
              <div key={item.id} className="cursor-pointer" onClick={() => handleMediaClick(index + 1)}>
                {renderMediaItem(item, "w-full h-24 sm:h-28 object-cover rounded-lg", "h-6 w-6")}
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
          <div key={item.id} className="cursor-pointer" onClick={() => handleMediaClick(index)}>
            {renderMediaItem(item, "w-full h-32 sm:h-40 object-cover rounded-lg")}
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
    <>
      {renderMediaGrid()}

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setShowMediaModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Navigation Buttons */}
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

            {/* Media Content */}
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

            {/* Media Counter */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {currentMediaIndex + 1} / {mediaItems.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}