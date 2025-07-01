"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rss, TrendingUp, Clock, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface Post {
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

interface Stats {
  totalPosts: number
  todayPosts: number
  trendingPosts: number
}

interface TrendingTopic {
  id: number
  hashtag: string
  count: number
  color: string
}

export default function LatestPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, todayPosts: 0, trendingPosts: 0 })
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchPosts = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/posts" : `/api/posts?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()
      setStats({
        totalPosts: data.totalPosts,
        todayPosts: data.todayPosts,
        trendingPosts: data.trendingPosts,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchTrendingTopics = async () => {
    try {
      const response = await fetch("/api/trending")
      const data = await response.json()
      setTrendingTopics(data)
    } catch (error) {
      console.error("Error fetching trending topics:", error)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchStats()
    fetchTrendingTopics()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchPosts(category)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto flex">
          <Sidebar />
          <div className="flex-1 p-2 sm:p-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">جاري التحميل...</div>
            </div>
          </div>
          <div className="hidden lg:block w-64 p-4">
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
      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4">
          <div className="max-w-2xl mx-auto">
            {/* Mobile Navigation Button */}
            <div className="lg:hidden mb-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Menu className="h-4 w-4 ml-2" />
                    قائمة الأقسام
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-80 p-0 bg-gradient-to-b from-blue-50 to-white overflow-y-auto max-h-screen"
                >
                  {/* Custom Close Button - Left Side */}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute left-4 top-4 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 border border-gray-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">إغلاق القائمة</span>
                  </button>

                  <div className="flex flex-col min-h-full">
                    <div className="flex-shrink-0 p-6 pt-16">
                      {/* Header Section */}
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.09-.21 2.09-.64 3-1.22.91.58 1.91 1.01 3 1.22 5.16-1 9-5.45 9-11V7l-10-5z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">أقسام المنصة</h3>
                        <p className="text-sm text-gray-600">اختر القسم الذي تريد تصفحه</p>
                      </div>
                    </div>

                    {/* Scrollable Navigation Menu */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                      <nav className="space-y-1">
                        <a
                          href="/home"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-blue-600 block">
                                الصفحة الرئيسية
                              </span>
                              <p className="text-xs text-gray-500 truncate">آخر المنشورات والأخبار</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/posts"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-green-600 block">
                                منشورات امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">مقالات ومنشورات متنوعة</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/truth"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-purple-600 block">
                                حقيقة امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">حقائق وتاريخ الأمازيغ</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/questions"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-yellow-600 block">
                                اسئلة امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">أسئلة وأجوبة متنوعة</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/books"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-red-600 block">
                                كُتب امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">مكتبة الكتب الأمازيغية</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/videos"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-indigo-600 block">
                                فيديوهات امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">مقاطع فيديو متنوعة</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/images"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-pink-600 block">
                                صور امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">معرض الصور الأمازيغية</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/ads"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.50-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-orange-600 block">
                                اعلانات امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">إعلانات ومشاركات</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>

                        <a
                          href="/shop"
                          className="mobile-nav-item-enhanced group block"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 transition-all duration-200 group-hover:translate-x-1">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors flex-shrink-0">
                              <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-800 group-hover:text-teal-600 block">
                                تسوق منتجات امازيغية
                              </span>
                              <p className="text-xs text-gray-500 truncate">متجر المنتجات الأمازيغية</p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>
                      </nav>

                      {/* Footer Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">منصة تامازيغت</p>
                          <div className="flex justify-center gap-4">
                            <button className="text-xs text-blue-600 hover:text-blue-800">المساعدة</button>
                            <button className="text-xs text-blue-600 hover:text-blue-800">الإعدادات</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Rss className="h-6 w-6 sm:h-8 sm:w-8" />
                <h1 className="text-xl sm:text-2xl font-bold">آخر المنشورات</h1>
              </div>
              <p className="text-blue-100 text-sm sm:text-base">
                تابع أحدث المنشورات والمحتوى الأمازيغي من جميع الأقسام
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">المنشورات الشائعة</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.trendingPosts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">منشورات اليوم</p>
                    <p className="text-lg sm:text-xl font-bold text-green-600">{stats.todayPosts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 border border-yellow-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                    <Rss className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">إجمالي المنشورات</p>
                    <p className="text-lg sm:text-xl font-bold text-yellow-600">{stats.totalPosts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg p-3 sm:p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <label className="text-sm font-medium">اعرض اخر منشورات حول:</label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="اختار قسم لعرضه" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الجميع</SelectItem>
                      <SelectItem value="nation">الأمة الأمازيغية</SelectItem>
                      <SelectItem value="language">اللغة الأمازيغية</SelectItem>
                      <SelectItem value="personalities">شخصيات امازيغية</SelectItem>
                      <SelectItem value="civilization">الحضارة الأمازيغية</SelectItem>
                      <SelectItem value="art">الفن الأمازيغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => fetchPosts(selectedCategory)} className="w-full sm:w-auto">
                    اعرض
                  </Button>
                </div>
              </div>
            </div>

            {/* Create Post */}
            <CreatePostModal />

            {/* Posts Feed */}
            <div className="space-y-3 sm:space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} {...post} />)
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد منشورات في هذا القسم</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border mb-4">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>

          {/* Trending Topics */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              المواضيع الشائعة
            </h3>
            <div className="space-y-2">
              {trendingTopics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-2 bg-${topic.color}-50 rounded text-sm flex justify-between items-center`}
                >
                  <span>{topic.hashtag}</span>
                  <span className="text-xs text-gray-500">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
