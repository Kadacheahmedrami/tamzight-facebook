"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import PostCard from "@/components/LatestSactionCards/post-card"
import CreatePostModal from "@/components/CreateModals/create-post-modal"

interface Question {
  id: number
  title: string
  content: string
  author: string
  timestamp: string
  category: string
  image: string
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 border animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-3"></div>
        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    ))}
  </div>
)

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = async (type = "all", pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true)
      setError(null)
    } else {
      setLoadingMore(true)
    }
    
    try {
      const url = type === "all" 
        ? `/api/main/questions?page=${pageNum}&limit=10`
        : `/api/main/questions?type=${type}&page=${pageNum}&limit=10`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Handle different response structures
      let questionsData: Question[] = []
      let totalPagesData = 1
      
      if (Array.isArray(data)) {
        // If response is directly an array (original format)
        questionsData = data || []
        // For direct array response, simulate pagination
        const itemsPerPage = 10
        const startIndex = (pageNum - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        questionsData = data.slice(startIndex, endIndex)
        totalPagesData = Math.ceil(data.length / itemsPerPage)
      } else if (data && data.questions && Array.isArray(data.questions)) {
        // If response has pagination structure
        questionsData = data.questions || []
        totalPagesData = data.totalPages || 1
      } else if (data && Array.isArray(data.data)) {
        // Alternative structure with data property
        questionsData = data.data || []
        totalPagesData = data.totalPages || 1
      } else {
        // Fallback: empty array
        questionsData = []
        totalPagesData = 1
      }
      
      // Ensure questionsData is always an array
      if (!Array.isArray(questionsData)) {
        questionsData = []
      }
      
      if (append) {
        setQuestions(prev => {
          const prevQuestions = Array.isArray(prev) ? prev : []
          return [...prevQuestions, ...questionsData]
        })
      } else {
        setQuestions(questionsData)
      }
      
      // Update pagination info
      setTotalPages(totalPagesData)
      setHasMore(pageNum < totalPagesData)
      
    } catch (error) {
      console.error("Error fetching questions:", error)
      setError("حدث خطأ أثناء تحميل الأسئلة")
      // Set empty array on error
      if (!append) {
        setQuestions([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(() => {
    if (loading || loadingMore || !hasMore) return

    const scrollPosition = window.innerHeight + document.documentElement.scrollTop
    const threshold = document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom

    if (scrollPosition >= threshold) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchQuestions(selectedType, nextPage, true)
    }
  }, [loading, loadingMore, hasMore, page, selectedType])

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchQuestions(type, 1, false)
  }

  const handleRefresh = () => {
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchQuestions(selectedType, 1, false)
  }

  // Transform question data for PostCard
  const transformQuestionToPost = (question: Question) => ({
    id: question.id.toString(),
    title: question.title,
    content: question.content,
    author: question.author,
    authorId: question.id.toString(), // You might want to use a proper author ID
    timestamp: question.timestamp,
    category: "سؤال", // Main category is now "سؤال" (Question in Arabic)
    subCategory: getCategoryArabic(question.category), // Original category moved to subcategory
    media: question.image ? [{
      id: question.id.toString(),
      type: 'image' as const,
      url: question.image,
      alt: question.title
    }] : undefined,
    baseRoute: 'questions',
    stats: question.stats
  })

  const getCategoryArabic = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "answer": "للاجابة عليه",
      "vote": "للتصويت عليه"
    }
    return categoryMap[category] || category
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>اسئلة أمازيغية للاجابة والتصويت عليها</span>
        </div>
      </nav>

      {/* Filter */}
      <div className="bg-white rounded-lg p-4 mb-4 border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">اعرض السؤال:</label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="اختار سؤال" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الجميع</SelectItem>
              <SelectItem value="answer">للاجابة عليه</SelectItem>
              <SelectItem value="vote">للتصويت عليه</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            onClick={handleRefresh} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
            disabled={loading}
          >
            اعرض الاسئلة
          </Button>
        </div>
      </div>

      {/* Create Question */}
      <CreatePostModal />

      {/* Questions Feed */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-2"
              size="sm"
            >
              إعادة المحاولة
            </Button>
          </div>
        )}
        
        {loading && (!questions || questions.length === 0) ? (
          <LoadingSkeleton />
        ) : Array.isArray(questions) && questions.length > 0 ? (
          <>
            {questions.map((question) => (
              <PostCard
                key={question.id}
                {...transformQuestionToPost(question)}
              />
            ))}
            
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="py-4">
                <LoadingSkeleton />
              </div>
            )}
            
            {/* End of results indicator */}
            {!hasMore && questions.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-full h-px bg-gray-200 mb-4"></div>
                <p>لا توجد أسئلة أخرى</p>
              </div>
            )}
          </>
        ) : !loading && !error ? (
          <div className="text-center py-8">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أسئلة</h3>
            <p className="text-gray-500">لا توجد أسئلة في هذا القسم حالياً</p>
            {selectedType !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedType("all")
                  setPage(1)
                  setHasMore(true)
                  setError(null)
                  fetchQuestions("all", 1, false)
                }}
                className="mt-4"
              >
                عرض جميع الأسئلة
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}