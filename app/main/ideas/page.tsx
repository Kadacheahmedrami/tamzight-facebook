"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb } from "lucide-react"
import PostCard from "@/components/LatestSactionCards/post-card"
import CreatePostModal from "@/components/CreateModals/create-post-modal"

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
      const sampleIdeas: Idea[] = [
        {
          id: 1,
          title: "اضافة قسم جديد للغة الامازيغية",
          content: "اقتراح باضافة قسم فرعي جديد للغة الامازيغية",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "features",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
        },
        {
          id: 2,
          title: "تطوير تصميم الموقع",
          content: "اقتراح لتحسين تصميم الموقع وجعله اكثر جاذبية",
          author: "سيبتموس سيفوروس",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "design",
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

  // Transform idea data for PostCard
  const transformIdeaToPost = (idea: Idea) => ({
    id: idea.id.toString(),
    title: idea.title,
    content: idea.content,
    author: idea.author,
    authorId: idea.id.toString(), // You might want to use a proper author ID
    timestamp: idea.timestamp,
    category: "اقتراح", // Main category is now "اقتراح" (Suggestion in Arabic)
    subCategory: getCategoryArabic(idea.category), // Original category moved to subcategory
    media: idea.image ? [{
      id: idea.id.toString(),
      type: 'image' as const,
      url: idea.image,
      alt: idea.title
    }] : undefined,
    baseRoute: 'ideas',
    stats: idea.stats
  })

  const getCategoryArabic = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "features": "ميزات جديدة",
      "design": "تحسين التصميم",
      "content": "المحتوى",
      "technical": "تقني"
    }
    return categoryMap[category] || category
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb - Always visible */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>اقتراحات لتطوير المنصة</span>
        </div>
      </nav>

      {/* Filter - Always visible */}
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
          <Button 
            size="sm" 
            onClick={() => fetchIdeas(selectedCategory)} 
            className="bg-[#4531fc] hover:bg-blue-800 w-full sm:w-auto"
          >
            اعرض الاقتراحات
          </Button>
        </div>
      </div>

      {/* Create Idea - Always visible */}
      <CreatePostModal />

      {/* Ideas Feed */}
      <div className="space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : ideas.length > 0 ? (
          ideas.map((idea) => (
            <PostCard
              key={idea.id}
              {...transformIdeaToPost(idea)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اقتراحات</h3>
            <p className="text-gray-500">لا توجد اقتراحات في هذا القسم حالياً</p>
            {selectedCategory !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory("all")
                  fetchIdeas("all")
                }}
                className="mt-4"
              >
                عرض جميع الاقتراحات
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}