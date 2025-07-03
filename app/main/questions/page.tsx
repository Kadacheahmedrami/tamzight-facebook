"use client"

import { useEffect, useState } from "react"

import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
    
        <div className="max-w-7xl mx-auto flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
          <div className="w-64 p-4">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
              <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
    



      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
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
                <Button size="sm" onClick={() => fetchQuestions(selectedType)} className="bg-[#4531fc] hover:bg-blue-800  w-full sm:w-auto">
                  اعرض الاسئلة
                </Button>
              </div>
            </div>

            {/* Create Question */}
            <CreatePostModal />

            {/* Questions Feed */}
            <div className="space-y-4">
              {questions.length > 0 ? (
                questions.map((question) => <PostCard key={question.id} {...question} />)
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد أسئلة في هذا القسم</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}