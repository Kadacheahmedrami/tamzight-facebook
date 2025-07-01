"use client"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Heart,
  HandHeart,
  Target,
  DollarSign,
  GraduationCap,
  Building,
  Cross,
  Briefcase,
} from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("definition")

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
    { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", description: "دعم المشاريع الخيرية", active: true },
    { href: "/friends", icon: Users, label: "اصدقاء من الامازيغ", description: "تواصل مع الأعضاء" },
    { href: "/messages", icon: MessageCircle, label: "مراسلات بين الاعضاء", description: "الرسائل الخاصة" },
    { href: "/member", icon: User, label: "ملف العضو", description: "الملف الشخصي" },
    { href: "/settings", icon: Settings, label: "اعدادات ملفي الشخصي", description: "إعدادات الحساب" },
  ]

  const supportCards = [
    {
      title: "دعم الطلاب",
      description: "منح دراسية وتعليمية",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-600",
      stats: "1,234 طالب مستفيد",
    },
    {
      title: "بناء المدارس",
      description: "مراكز تعليمية حديثة",
      icon: Building,
      color: "from-green-500 to-green-600",
      stats: "45 مدرسة تم بناؤها",
    },
    {
      title: "المساعدات الطبية",
      description: "رعاية صحية شاملة",
      icon: Cross,
      color: "from-red-500 to-red-600",
      stats: "890 مريض تم علاجه",
    },
    {
      title: "المشاريع الصغيرة",
      description: "دعم الأسر المنتجة",
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      stats: "567 مشروع ممول",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Archive className="h-6 w-6 text-blue-200" />
            <div>
              <h1 className="font-bold text-lg">صندوق دعم الامازيغ</h1>
              <p className="text-blue-200 text-sm">دعم المشاريع الخيرية</p>
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
                              ? "bg-gradient-to-br from-blue-500 to-teal-500 shadow-md"
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
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>صندوق دعم الامازيغ</span>
              </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">صندوق دعم الأمازيغ</h1>
                  <p className="text-blue-100">يداً بيد نحو مستقبل أفضل للأمة الأمازيغية</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {supportCards.map((card, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">{card.title}</CardTitle>
                    <CardDescription className="text-sm mb-2">{card.description}</CardDescription>
                    <p className="text-xs text-gray-500">{card.stats}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Accordion */}
            <div className="bg-white rounded-lg border">
              <Accordion type="single" collapsible defaultValue="definition" className="w-full">
                <AccordionItem value="definition">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span>تعريف بصندوق دعم الامازيغ</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">تعريف بصندوق دعم الامازيغ</h3>
                      <p className="text-gray-700 leading-relaxed">
                        صندوق دعم الأمازيغ هو مبادرة خيرية تهدف إلى توفير الدعم المالي والمعنوي للمحتاجين من الأمازيغ في مختلف
                        المجالات. يسعى الصندوق إلى تعزيز التكافل الاجتماعي وتقديم المساعدة للأسر المحتاجة والطلاب المتفوقين
                        والمرضى الذين يحتاجون إلى رعاية طبية، بالإضافة إلى دعم المشاريع التنموية التي تخدم المجتمع الأمازيغي.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="goals">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>اهداف صندوق دعم الامازيغ</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">اهداف صندوق دعم الامازيغ</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">توفير الدعم المالي للطلاب الأمازيغ</h4>
                            <p className="text-sm text-gray-600">منح دراسية ومساعدات تعليمية للطلاب المتفوقين</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <Building className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">المساهمة في بناء المدارس والمراكز التعليمية</h4>
                            <p className="text-sm text-gray-600">إنشاء مرافق تعليمية حديثة لخدمة المجتمع</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <Cross className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">تقديم المساعدات الطبية للمرضى</h4>
                            <p className="text-sm text-gray-600">دعم العلاج والرعاية الصحية للمحتاجين</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <Briefcase className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">دعم المشاريع الصغيرة للأسر المحتاجة</h4>
                            <p className="text-sm text-gray-600">تمويل مشاريع صغيرة لتحسين الأوضاع المعيشية</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-support">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <HandHeart className="h-5 w-5 text-purple-600" />
                      <span>كيف تدعم الصندوق؟</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">كيف تدعم الصندوق؟</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">التبرع المباشر</h4>
                            <p className="text-sm text-gray-600">تبرع عبر حساباتنا البنكية المعتمدة</p>
                            <Button size="sm" className="mt-2">تبرع الآن</Button>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">المشاركة في الفعاليات</h4>
                            <p className="text-sm text-gray-600">انضم إلى الأنشطة والفعاليات الخيرية</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                          <Megaphone className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-gray-900">نشر الوعي</h4>
                            <p className="text-sm text-gray-600">ساعد في التعريف بأهداف الصندوق وأنشطته</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg p-6 text-center shadow-lg">
              <h2 className="text-xl font-bold mb-2">كن جزءاً من التغيير</h2>
              <p className="text-purple-100 mb-4">مساهمتك الصغيرة قد تغير حياة الكثيرين</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 font-semibold hover:bg-white hover:text-purple-800 border border-white"
                >
                  تبرع الآن
                </Button>
                <Button
                  size="lg"
                  className="bg-transparent text-white border border-white hover:bg-white hover:text-purple-800"
                >
                  تعرف على المزيد
                </Button>
              </div>
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

          {/* Support Stats */}
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-3 text-center">إحصائيات الدعم</h3>
            <div className="space-y-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2,736</div>
                <div className="text-sm text-gray-600">إجمالي المستفيدين</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">847</div>
                <div className="text-sm text-gray-600">مشروع مُنجز</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1.2M</div>
                <div className="text-sm text-gray-600">إجمالي التبرعات</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}