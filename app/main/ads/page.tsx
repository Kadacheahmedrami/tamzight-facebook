"use client"

import { useEffect, useState } from "react"

import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Eye, Heart, MessageCircle, Share2, Calendar, MapPin, DollarSign } from "lucide-react"
import {
  Menu,
  Edit,
  Sun,
  Book,
  Video,
  ImageIcon,
  HelpCircle,
  Megaphone,
  Store,
  Lightbulb,
  Archive,
  Users,
  Settings,
  User,
  Home,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface AdData {
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
  targetAmount?: string
  currentAmount?: string
  deadline?: string
  position?: string
  location?: string
  salary?: string
  eventDate?: string
  ticketPrice?: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<AdData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchAds = async (category = "all") => {
    setLoading(true)
    try {
      const url = category === "all" ? "/api/main/ads" : `/api/main/ads?category=${category}`
      const response = await fetch(url)
      const data = await response.json()
      setAds(data)
    } catch (error) {
      console.error("Error fetching ads:", error)
      // Fallback sample data
      const sampleAds = [
        {
          id: 1,
          title: "مساعدة لبناء مدرسة امازيغية",
          content: "نحتاج مساعدتكم في بناء مدرسة لتعليم الأطفال الأمازيغ لغتهم الأم",
          author: "جمعية التراث الأمازيغي",
          timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
          category: "اعلانات لأعمال خيرية",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 1250, likes: 892, comments: 154, shares: 45 },
          targetAmount: "500000",
          currentAmount: "120000",
          deadline: "31-12-2023",
        },
        {
          id: 2,
          title: "وظيفة مدرس للغة الأمازيغية",
          content: "مطلوب مدرس للغة الأمازيغية للعمل في مدرسة ثانوية بالمغرب",
          author: "وزارة التربية والتعليم",
          timestamp: "نشر بتاريخ 28-03-2023 الساعة 10:20 صباحا",
          category: "اعلانات وظائف",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 680, likes: 234, comments: 67, shares: 23 },
          position: "مدرس لغة أمازيغية",
          location: "الرباط، المغرب",
          salary: "8000-12000 درهم شهريا",
        },
        {
          id: 3,
          title: "مهرجان الثقافة الأمازيغية السنوي",
          content: "ندعوكم لحضور المهرجان السنوي للثقافة الأمازيغية بمشاركة فنانين من كل شمال أفريقيا",
          author: "المجلس الأعلى للثقافة الأمازيغية",
          timestamp: "نشر بتاريخ 25-03-2023 الساعة 03:45 مساء",
          category: "اعلانات لمناسبات",
          image: "/placeholder.svg?height=300&width=600",
          stats: { views: 2100, likes: 1456, comments: 289, shares: 156 },
          eventDate: "15-05-2023",
          location: "المسرح الملكي، الرباط",
          ticketPrice: "50 درهم",
        },
      ]
      setAds(sampleAds)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchAds(category)
  }

  const navigationItems = [
    { href: "/", icon: Home, label: "الصفحة الرئيسية", description: "العودة للصفحة الرئيسية" },
    { href: "/truth", icon: Sun, label: "حقائق ثابتة حول الامازيغ", description: "حقائق تاريخية وثقافية" },
    {
      href: "/posts",
      icon: Edit,
      label: "منشورات حول الامة الامازيغ",
      description: "منشورات ومقالات متنوعة",
    },
    { href: "/books", icon: Book, label: "كُتب امازيغية متنوعة", description: "مكتبة الكتب الامازيغية" },
    { href: "/videos", icon: Video, label: "فيديوهات امازيغية متنوعة", description: "مقاطع فيديو تعليمية وثقافية" },
    { href: "/images", icon: ImageIcon, label: "صور امازيغية متنوعة", description: "معرض الصور التراثية" },
    { href: "/questions", icon: HelpCircle, label: "اسئلة أمازيغية", description: "أسئلة للإجابة والتصويت" },
    { href: "/ads", icon: Megaphone, label: "اعلانات امازيغية", description: "إعلانات ترويجية متنوعة", active: true },
    { href: "/shop", icon: Store, label: "تسوق صناعات امازيغية", description: "منتجات تقليدية أصيلة" },
    { href: "/ideas", icon: Lightbulb, label: "اقتراحات لتطوير المنصة", description: "أفكار لتحسين التجمع" },
    { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", description: "دعم المشاريع الخيرية" },
    { href: "/friends", icon: Users, label: "اصدقاء من الامازيغ", description: "تواصل مع الأعضاء" },
    { href: "/messages", icon: MessageCircle, label: "مراسلات بين الاعضاء", description: "الرسائل الخاصة" },
    { href: "/member", icon: User, label: "ملف العضو", description: "الملف الShortcuts" },
    { href: "/settings", icon: Settings, label: "اعدادات ملفي الشخصي", description: "إعدادات الحساب" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto flex">
          <Sidebar />
          <div className="flex-1 p-4">
            <div className="max-w-4xl mx-auto">
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
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>اعلانات امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض اعلانات قسم:</label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="charity">اعلانات لأعمال خيرية</SelectItem>
                    <SelectItem value="assistance">اعلانات لمساعدات</SelectItem>
                    <SelectItem value="products">اعلانات لمنتجات</SelectItem>
                    <SelectItem value="events">اعلانات لمناسبات</SelectItem>
                    <SelectItem value="jobs">اعلانات وظائف</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => fetchAds(selectedCategory)} className="w-full sm:w-auto">
                  اعرض القسم
                </Button>
              </div>
            </div>

            {/* Ads Grid */}
            <div className="space-y-6">
              {ads.length > 0 ? (
                ads.map((ad) => (
                  <Card key={ad.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <Image
                          src={ad.image || "/placeholder.svg"}
                          alt={ad.title}
                          width={400}
                          height={250}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{ad.category}</Badge>
                            <span className="text-xs text-gray-500">{ad.timestamp}</span>
                          </div>
                          <CardTitle className="text-xl">{ad.title}</CardTitle>
                          <CardDescription>بواسطة {ad.author}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">{ad.content}</p>

                          {/* Charity/Fundraising Details */}
                          {ad.targetAmount && (
                            <div className="bg-green-50 p-3 rounded-lg mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">الهدف المالي:</span>
                                <span className="text-green-600 font-bold">{ad.targetAmount} درهم</span>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">المبلغ المجمع:</span>
                                <span className="text-blue-600 font-bold">{ad.currentAmount} درهم</span>
                              </div>
                              {ad.deadline && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  <span>آخر موعد: {ad.deadline}</span>
                                </div>
                              )}
                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (parseInt(ad.currentAmount || "0") / parseInt(ad.targetAmount || "1")) * 100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Job Details */}
                          {ad.position && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">المنصب:</span>
                                <span className="font-bold">{ad.position}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4" />
                                <span>{ad.location}</span>
                              </div>
                              {ad.salary && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{ad.salary}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Event Details */}
                          {ad.eventDate && (
                            <div className="bg-purple-50 p-3 rounded-lg mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>تاريخ الفعالية: {ad.eventDate}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                <MapPin className="h-4 w-4" />
                                <span>{ad.location}</span>
                              </div>
                              {ad.ticketPrice && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <DollarSign className="h-4 w-4" />
                                  <span>سعر التذكرة: {ad.ticketPrice}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {ad.stats.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {ad.stats.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {ad.stats.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-4 w-4" />
                                {ad.stats.shares}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                تفاصيل أكثر
                              </Button>
                              <Button size="sm">
                                {ad.targetAmount ? "تبرع الآن" : ad.position ? "تقدم للوظيفة" : "احجز مكانك"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">لا توجد اعلانات في هذا القسم</div>
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