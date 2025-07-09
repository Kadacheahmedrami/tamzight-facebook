"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import PostCard from "@/components/card-comps/post-card"
import CreatePostModal from "@/components/create-post/create-post-modal"

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

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState("all")

  const fetchQuestions = async (type = "all") => {
    setLoading(true)
    try {
      const url = type === "all" ? "/api/main/questions" : `/api/main/questions?type=${type}`
      const response = await fetch(url)
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    fetchQuestions(type)
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">جاري التحميل...</div>
      </div>
    )
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
          <Button size="sm" onClick={() => fetchQuestions(selectedType)} className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto">
            اعرض الاسئلة
          </Button>
        </div>
      </div>

      {/* Create Question */}
      <CreatePostModal />

      {/* Questions Feed */}
      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((question) => (
            <PostCard
              key={question.id}
              {...transformQuestionToPost(question)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد أسئلة</h3>
            <p className="text-gray-500">لا توجد أسئلة في هذا القسم حالياً</p>
            {selectedType !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedType("all")
                  fetchQuestions("all")
                }}
                className="mt-4"
              >
                عرض جميع الأسئلة
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}