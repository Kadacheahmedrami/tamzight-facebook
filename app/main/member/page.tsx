"use client"
import { useState } from "react"
import PostCard from "@/components/card-comps/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const samplePosts = [
  {
    title: "منشور جديد للعضو",
    content: "هذا منشور تجريبي للعضو",
    author: "اسم العضو",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منشور",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    title: "منشور آخر للعضو",
    content: "هذا منشور تجريبي آخر للعضو مع نص أطول قليلاً لاختبار التصميم المتجاوب على الشاشات المختلفة",
    author: "اسم العضو",
    timestamp: "نشر بتاريخ 30-03-2023 الساعة 10:20 صباحاً",
    category: "منشور",
    stats: { views: 180, likes: 892, comments: 67, shares: 5 },
  },
]

export default function MemberPage() {


  return (
 
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4 lg:mb-6 pt-16 lg:pt-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>ملف العضو</span>
              </div>
            </nav>

            {/* Member Profile Header - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="text-center sm:text-right flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">اسم العضو</h1>
                  <p className="text-gray-600 text-sm sm:text-base mb-3">عضو منذ يناير 2023</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                    <span className="text-gray-600">المنشورات: <strong>25</strong></span>
                    <span className="text-gray-600">الأصدقاء: <strong>143</strong></span>
                    <span className="text-gray-600">المتابعون: <strong>320</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <div className="flex space-x-1 min-w-max">
                  <TabsTrigger value="posts" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">منشوراته</TabsTrigger>
                  <TabsTrigger value="shares" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">مشاركاته</TabsTrigger>
                  <TabsTrigger value="interactions" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">تفاعلاته</TabsTrigger>
                  <TabsTrigger value="contributions" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">مساهماته</TabsTrigger>
                  <TabsTrigger value="photos" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">صوره</TabsTrigger>
                  <TabsTrigger value="friends" className="whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4">اصدقاءه</TabsTrigger>
                </div>
              </TabsList>
              
              <TabsContent value="posts" className="mt-4 lg:mt-6">
                <div className="space-y-4 lg:space-y-6">
                  {samplePosts.map((post, index) => (
                    <PostCard key={index} {...post} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="shares" className="mt-4 lg:mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">مشاركات العضو</h3>
                  <p className="text-gray-600">لا توجد مشاركات حتى الآن</p>
                </div>
              </TabsContent>
              
              <TabsContent value="interactions" className="mt-4 lg:mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">تفاعلات العضو</h3>
                  <p className="text-gray-600">لا توجد تفاعلات حديثة</p>
                </div>
              </TabsContent>
              
              <TabsContent value="contributions" className="mt-4 lg:mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">مساهمات العضو</h3>
                  <p className="text-gray-600">لا توجد مساهمات حتى الآن</p>
                </div>
              </TabsContent>
              
              <TabsContent value="photos" className="mt-4 lg:mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">صور العضو</h3>
                  <p className="text-gray-600">لا توجد صور حتى الآن</p>
                </div>
              </TabsContent>
              
              <TabsContent value="friends" className="mt-4 lg:mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">اصدقاء العضو</h3>
                  <p className="text-gray-600">قائمة الأصدقاء خاصة</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
     
  )
}