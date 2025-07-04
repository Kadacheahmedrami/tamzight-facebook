"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface Idea {
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

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchIdeas = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/ideas" : `/api/main/ideas?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setIdeas(data)
    } catch (error) {
      console.error("Error fetching ideas:", error)
      // Fallback sample data
      const sampleIdeas = [
        {
          id: 1,
          title: "اضافة قسم جديد للغة الامازيغية",
          content: "اقتراح باضافة قسم فرعي جديد للغة الامازيغية",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "اقتراح",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
        },
        {
          id: 2,
          title: "تطوير تصميم الموقع",
          content: "اقتراح لتحسين تصميم الموقع وجعله اكثر جاذبية",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "اقتراح",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
        },
      ]
      setIdeas(sampleIdeas)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchIdeas(category)
  }

  if (loading) {
    return (
     
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
        
    )
  }

  return (

          <div className="max-w-3xl  mx-2">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>اقتراحات لتطوير المنصة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض اقتراح في:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="features">ميزات جديدة</SelectItem>
                    <SelectItem value="design">تحسين التصميم</SelectItem>
                    <SelectItem value="content">المحتوى</SelectItem>
                    <SelectItem value="technical">تقني</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchIdeas(selectedCategory)} className="bg-[#4531fc] hover:bg-blue-800  w-full sm:w-auto">
                  اعرض
                </Button>
              </div>
            </div>

            {/* Create Idea */}
            <CreatePostModal />

            {/* Ideas Feed */}
            <div className="space-y-4">
              {ideas.length > 0 ? (
                ideas.map((idea) => <PostCard key={idea.id} {...idea} />)
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد اقتراحات في هذا القسم</div>
              )}
            </div>
          </div>
      
  )
}