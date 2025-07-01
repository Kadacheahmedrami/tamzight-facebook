"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
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
  MessageCircle,
  Settings,
  User,
  Home,
  ChevronRight,
  X,
} from "lucide-react"
import Link from "next/link"

export default function PostPage() {
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
    { href: "/ads", icon: Megaphone, label: "اعلانات امازيغية", description: "إعلانات ترويجية متنوعة" },
    { href: "/shop", icon: Store, label: "تسوق صناعات امازيغية", description: "منتجات تقليدية أصيلة" },
    { href: "/ideas", icon: Lightbulb, label: "اقتراحات لتطوير المنصة", description: "أفكار لتحسين التجمع" },
    { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", description: "دعم المشاريع الخيرية" },
    { href: "/friends", icon: Users, label: "اصدقاء من الامازيغ", description: "تواصل مع الأعضاء" },
    { href: "/messages", icon: MessageCircle, label: "مراسلات بين الاعضاء", description: "الرسائل الخاصة" },
    { href: "/member", icon: User, label: "ملف العضو", description: "الملف الشخصي" },
    { href: "/settings", icon: Settings, label: "اعدادات ملفي الشخصي", description: "إعدادات الحساب" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-gray-200" />
            <div>
              <h1 className="font-bold text-lg">منشور</h1>
              <p className="text-gray-200 text-sm">عرض تفاصيل المنشور والتعليقات</p>
            </div>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 overflow-y-auto max-h-screen">
              <div className="flex flex-col min-h-full">
                {/* Close Button */}
                <div className="absolute left-4 top-4 z-10">
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-11 w-11 p-0 rounded-full hover:bg-gray-100 shadow-md bg-white border"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">إغلاق</span>
                    </Button>
                  </SheetClose>
                </div>

                {/* Header */}
                <div className="flex-shrink-0 bg-gradient-to-b from-gray-600 to-white p-6 pt-16 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                      <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-12 w-auto" />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">تجمع الأمازيغ</h2>
                  <p className="text-gray-100 text-sm">منصة التواصل الأمازيغية</p>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-3">
                    {navigationItems.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:translate-x-1 group hover:bg-gray-50`}
                        >
                          <div className="p-2 rounded-lg group-hover:shadow-md bg-gradient-to-br from-gray-500 to-gray-600">
                            <item.icon className="h-5 w-5 text-white flex-shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{item.label}</h3>
                            <p className="text-sm text-gray-500 truncate">{item.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t bg-gray-50 text-center">
                  <p className="text-xs text-gray-500 mb-2">منصة تجمع الأمازيغ</p>
                  <p className="text-xs text-gray-400">الأمازيغية هويتنا</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg border p-6">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>منشور</span>
              </div>
            </nav>

            <h1 className="text-2xl font-semibold mb-4">عنوان المنشور</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <p className="font-medium">اسم العضو</p>
                <p className="text-sm text-gray-500">نشر بتاريخ 01-04-2023 الساعة 12:35 مساء</p>
              </div>
            </div>

            <img
              src="/placeholder.svg?height=400&width=800"
              alt="Post Image"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            <p className="text-gray-700 leading-relaxed mb-6">
              هذا النص هو مثال لمحتوى المنشور. يمكنك إضافة المزيد من التفاصيل هنا.
            </p>

            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-3">التعليقات</h2>
              <Input type="text" placeholder="اكتب تعليقك هنا" className="mb-3" />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium">اسم العضو</p>
                    <p className="text-sm text-gray-500">تم التعليق بتاريخ 15 / 12 / 2022</p>
                    <p className="text-gray-700">هذا مثال لتعليق على المنشور.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-medium">اسم العضو</p>
                    <p className="text-sm text-gray-500">تم التعليق بتاريخ 15 / 12 / 2022</p>
                    <p className="text-gray-700">هذا مثال لتعليق آخر على المنشور.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2" />
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
