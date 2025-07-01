"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  ImageIcon,
  Sun,
  Edit,
  Book,
  Video,
  HelpCircle,
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

interface ImageData {
  id: number
  title: string
  description: string
  category: string
  image: string
  author: string
  timestamp: string
  location: string
  resolution: string
  tags: string[]
}

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/images")
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error("Error fetching images:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const navigationItems = [
    { href: "/", icon: Home, label: "الصفحة الرئيسية", description: "العودة للصفحة الرئيسية" },
    { href: "/truth", icon: Sun, label: "حقائق ثابتة حول الامازيغ", description: "حقائق تاريخية وثقافية" },
    { href: "/posts", icon: Edit, label: "منشورات حول الامة الامازيغ", description: "منشورات ومقالات متنوعة" },
    { href: "/books", icon: Book, label: "كُتب امازيغية متنوعة", description: "مكتبة الكتب الامازيغية" },
    { href: "/videos", icon: Video, label: "فيديوهات امازيغية متنوعة", description: "مقاطع فيديو تعليمية وثقافية" },
    {
      href: "/images",
      icon: ImageIcon,
      label: "صور امازيغية متنوعة",
      description: "معرض الصور التراثية",
      active: true,
    },
    { href: "/questions", icon: HelpCircle, label: "اسئلة أمازيغية", description: "أسئلة للإجابة والتصويت" },
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
            <ImageIcon className="h-6 w-6 text-blue-200" />
            <div>
              <h1 className="font-bold text-lg">صور امازيغية متنوعة</h1>
              <p className="text-blue-200 text-sm">معرض الصور التراثية</p>
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
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>صور امازيغية متنوعة</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm font-medium whitespace-nowrap">اعرض صور قسم:</label>
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heritage">صور تراثية</SelectItem>
                    <SelectItem value="clothing">ملابس تقليدية</SelectItem>
                    <SelectItem value="nature">مناظر طبيعية</SelectItem>
                    <SelectItem value="art">فنون وحرف</SelectItem>
                    <SelectItem value="food">طعام امازيغي</SelectItem>
                    <SelectItem value="architecture">عمارة امازيغية</SelectItem>
                    <SelectItem value="all">الجميع</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full sm:w-auto">
                  اعرض القسم
                </Button>
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((imageItem) => (
                <div
                  key={imageItem.id}
                  className="bg-white rounded-lg border overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={imageItem.image || "/placeholder.svg"}
                      alt={imageItem.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">{imageItem.category}</Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {imageItem.resolution}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{imageItem.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{imageItem.description}</p>

                    <div className="space-y-1 text-xs text-gray-500 mb-3">
                      <div className="flex justify-between">
                        <span>المصور:</span>
                        <span>{imageItem.author}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الموقع:</span>
                        <span>{imageItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التاريخ:</span>
                        <span>{imageItem.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {imageItem.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      عرض بالحجم الكامل
                    </Button>
                  </div>
                </div>
              ))}
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
