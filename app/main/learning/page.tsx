"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Heart, MessageCircle, Share2, Book, X } from "lucide-react"

interface LearningPost {
  id: string
  title: string
  tifinagh: string
  arabic: string
  author: string
  authorId: string
  timestamp: string
  category: string
  subCategory: string
  pronunciations: {
    [key: string]: string
  }
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
  image: string
}

const samplePosts: LearningPost[] = [
  {
    id: "1",
    title: "تعلم الأمازيغية: الجملة الأولى",
    tifinagh: "ⵏⴽⴽⵉ ⵛⵛⵉⵖ",
    arabic: "أنا أكلت",
    author: "أستاذ الأمازيغية",
    authorId: "teacher1",
    timestamp: "منذ 3 ساعات",
    category: "تعليم",
    subCategory: "أمازيغية",
    pronunciations: {
      "قبائلية": "نكي شيغ",
      "شاوية": "نكي شيغ",
      "طارقية": "نكي شيغ",
      "سوسية": "نكي شيغ"
    },
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
    image: "/placeholder.jpg"
  },
  {
    id: "2",
    title: "كلمة اليوم: الأمازيغية",
    tifinagh: "ⵜⴰⵎⴰⵣⵉⵖⵜ",
    arabic: "الأمازيغية",
    author: "مدرس اللغة",
    authorId: "teacher2",
    timestamp: "منذ 5 ساعات",
    category: "تعليم",
    subCategory: "مفردات",
    pronunciations: {
      "قبائلية": "تامازيغت",
      "شاوية": "تامازيغت",
      "طارقية": "تامازيغت",
      "سوسية": "تامازيغت"
    },
    stats: { views: 380, likes: 2100, comments: 203, shares: 25 },
    image: "/placeholder.jpg"
  }
]

const dialects = ["قبائلية", "شاوية", "طارقية", "سوسية", "غدامسية", "يفرنية", "جبالية", "شلحية", "زيانية", "هوارية", "تطوانية", "ريفية"]

const reactions = [
  { name: 'like', emoji: '👍', color: 'text-blue-600', label: 'Like' },
  { name: 'love', emoji: '❤️', color: 'text-red-500', label: 'Love' },
  { name: 'laugh', emoji: '😂', color: 'text-yellow-500', label: 'Haha' },
  { name: 'wow', emoji: '😮', color: 'text-orange-500', label: 'Wow' },
  { name: 'sad', emoji: '😢', color: 'text-blue-400', label: 'Sad' },
  { name: 'angry', emoji: '😠', color: 'text-red-600', label: 'Angry' }
]

function TamazightPostCard({ post }: { post: LearningPost }) {
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null)
  const [showReactions, setShowReactions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showFullLearning, setShowFullLearning] = useState(false)
  const [newPronunciation, setNewPronunciation] = useState("")
  const [selectedDialect, setSelectedDialect] = useState("")
  const [localPronunciations, setLocalPronunciations] = useState(post.pronunciations)
  
  const reactionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
        setShowReactions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleReactionSelect = (reaction: string) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null)
    } else {
      setSelectedReaction(reaction)
    }
    setShowReactions(false)
  }

  const handleAddPronunciation = () => {
    if (newPronunciation && selectedDialect) {
      setLocalPronunciations(prev => ({
        ...prev,
        [selectedDialect]: newPronunciation
      }))
      setNewPronunciation("")
      setSelectedDialect("")
    }
  }

  const handlePostClick = () => {
    console.log(`Navigate to post ${post.id}`)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log(`Navigate to profile ${post.authorId}`)
  }

  const selectedReactionData = reactions.find(r => r.name === selectedReaction)

  return (
    <div className="bg-white rounded-lg p-4 border shadow-sm mb-4 relative cursor-pointer hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">{post.category}</span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full w-fit">{post.subCategory}</span>
        </div>
        <span className="text-gray-500 text-xs sm:text-sm">{post.timestamp}</span>
      </div>

      {/* Author */}
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
            {post.author}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div onClick={handlePostClick}>
        <h2 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 leading-tight hover:text-blue-600 transition-colors">
          {post.title}
        </h2>

        {/* Image */}
        <div className="mb-3">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-40 sm:h-48 object-cover rounded-lg"
          />
        </div>

        {/* Learning Content */}
        <div className="mb-4">
          {showFullLearning ? (
            <div className="space-y-4">
              {/* Main Learning Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Book className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">الدرس</span>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{post.tifinagh}</div>
                  <div className="text-gray-700 font-medium">{post.arabic}</div>
                </div>
              </div>

              {/* Pronunciations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-gray-700">النطق باللهجات</h3>
                <div className="space-y-2">
                  {Object.entries(localPronunciations).map(([dialect, pronunciation]) => (
                    <div key={dialect} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">{dialect}:</span>
                      <span className="text-sm text-blue-700">{pronunciation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Pronunciation */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-gray-700">أضف النطق بلهجتك</h3>
                <div className="flex gap-2 flex-wrap">
                  <Select value={selectedDialect} onValueChange={setSelectedDialect}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="اللهجة" />
                    </SelectTrigger>
                    <SelectContent>
                      {dialects.map((dialect) => (
                        <SelectItem key={dialect} value={dialect}>
                          {dialect}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="text"
                    value={newPronunciation}
                    onChange={(e) => setNewPronunciation(e.target.value)}
                    placeholder="النطق"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleAddPronunciation}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    إضافة
                  </Button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullLearning(false)
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                عرض أقل
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 rounded-lg p-4 mb-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{post.tifinagh}</div>
                  <div className="text-gray-700 font-medium">{post.arabic}</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullLearning(true)
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                عرض الدرس الكامل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-red-500 p-1 sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="w-4 h-4 mr-1" />
            <span className="text-xs sm:text-sm">{post.stats.likes}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-blue-500 p-1 sm:p-2" 
            onClick={(e) => {
              e.stopPropagation()
              setShowComments(!showComments)
            }}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span className="text-xs sm:text-sm">{post.stats.comments}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-500 hover:text-green-500 p-1 sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Share2 className="w-4 h-4 mr-1" />
            <span className="text-xs sm:text-sm">{post.stats.shares}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {post.stats.views}
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
                  <span className="text-sm">👆</span>
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
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
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
                        <p className="font-medium text-sm">متعلم الأمازيغية {i + 1}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          شكراً لك على هذا الدرس المفيد! تعلمت النطق بلهجة جديدة اليوم.
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

export default function TamazightLearningPage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      {samplePosts.map((post) => (
        <TamazightPostCard key={post.id} post={post} />
      ))}
    </div>
  )
}