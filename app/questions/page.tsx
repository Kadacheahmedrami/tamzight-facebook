"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  HelpCircle,
  Sun,
  Edit,
  Book,
  Video,
  ImageIcon,
  Megaphone,
  Store,
  Lightbulb,
  Archive,
  Users,
  MessageCircle,
  Settings,
  User,
  Home,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

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
      const url = type === "all" ? "/api/questions" : `/api/questions?type=${type}`
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

  const navigationItems = [
    { href: "/", icon: Home, label: "الصفحة الرئيسية", description: "العودة للصفحة الرئيسية" },
    { href: "/truth", icon: Sun, label: "حقائق ثابتة حول الامازيغ", description: "حقائق تاريخية وثقافية" },
    { href: "/posts", icon: Edit, label: "منشورات حول الامة الامازيغ", description: "منشورات ومقالات متنوعة" },
    { href: "/books", icon: Book, label: "كُتب امازيغية متنوعة", description: "مكتبة الكتب الامازيغية" },
    { href: "/videos", icon: Video, label: "فيديوهات امازيغية متنوعة", description: "مقاطع فيديو تعليمية وثقافية" },
    { href: "/images", icon: ImageIcon, label: "صور امازيغية متنوعة", description: "معرض الصور التراثية" },
    {
      href: "/questions",
      icon: HelpCircle,
      label: "اسئلة أمازيغية",
      description: "أسئلة للإجابة والتصويت",
      active: true,
    },
    { href: "/ads", icon: Megaphone, label: "اعلانات امازيغية", description: "إعلانات ترويجية متنوعة" },
    { href: "/shop", icon: Store, label: "تسوق صناعات امازيغية", description: "منتجات تقليدية أصيلة" },
    { href: "/ideas", icon: Lightbulb, label: "اقتراحات لتطوير المنصة", description: "أفكار لتحسين التجمع" },
    { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", description: "دعم المشاريع الخيرية" },
    { href: "/friends", icon: Users, label: "اصدقاء من الامازيغ", description: "تواصل مع الأعضاء" },
    { href: "/messages", icon: MessageCircle, label: "مراسلات بين الاعضاء", description: "الرسائل الخاصة" },
    { href: "/member", icon: User, label: "ملف العضو", description: "الملف الشخصي" },
    { href: "/settings", icon: Settings, label: "اعدادات ملفي الشخصي", description: "إعدادات الحساب" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-blue-200" />
            <div>
              <h1 className="font-bold text-lg">اسئلة أمازيغية</h1>
              <p className="text-blue-200 text-sm">أسئلة للإجابة والتصويت</p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-blue-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 overflow-y-auto max-h-screen">
              <div className="flex flex-col min-h-full">
                {/* Custom close button on the left */}
                <div className="absolute left-4 top-4 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 w-11 p-0 rounded-full hover:bg-gray-100 shadow-md bg-white border"
                  >
                    <span className="text-lg">×</span>
                    <span className="sr-only">إغلاق</span>
                  </Button>
                </div>

                {/* Header Section - Fixed */}
                <div className="flex-shrink-0 bg-gradient-to-b from-blue-600 to-white p-6 pt-16 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                      <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-12 w-auto" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">تجمع الأمازيغ</h2>
                  <p className="text-blue-100 text-sm">منصة التواصل الأمازيغية</p>
                </div>

                {/* Navigation Menu - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-3">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:translate-x-1 group ${
                          item.active ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-blue-50"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg group-hover:shadow-md transition-shadow ${
                            item.active
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md"
                              : "bg-gradient-to-br from-blue-500 to-blue-600"
                          }`}
                        >
                          <item.icon className="h-5 w-5 text-white flex-shrink-0" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-gray-900 truncate ${item.active ? "text-blue-900" : ""}`}>
                            {item.label}
                          </h3>
                          <p className={`text-sm text-gray-500 truncate ${item.active ? "text-blue-600" : ""}`}>
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 transition-colors ${
                            item.active ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"
                          }`}
                        />
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Footer - Fixed */}
                <div className="flex-shrink-0 p-4 border-t bg-gray-50">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">منصة تجمع الأمازيغ</p>
                    <p className="text-xs text-gray-400">الأمازيغية هويتنا</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

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
                <Button size="sm" onClick={() => fetchQuestions(selectedType)} className="w-full sm:w-auto">
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
