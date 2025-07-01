"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sun,
  Edit,
  Book,
  Video,
  Megaphone,
  Store,
  Lightbulb,
  Archive,
  User,
  MessageCircle,
  Bell,
  Users,
  ArrowUp,
  Globe,
  Handshake,
  Building,
  Target,
  Send,
  Mail,
  Download,
} from "lucide-react"
import Link from "next/link"

const animatedSlogans = [
  "الأمازيغية هويتُنا",
  "الأمازيغية حضارتُنا",
  "الأمازيغية ثقافتُنا",
  "الأمازيغية وحدتُنا",
  "الأمازيغية قوتُنا",
  "الأمازيغية تجمعنا",
  "امازيغ باقون",
  "وبحضارتُنا مُستمرون",
  "وبثقافتُنا مُتمسكون",
  "وبعادتُنا مُعتزون",
  "وبتقاليدُنا نعيشون",
  "وبأمازيغيتُنا نفتخرون",
  "ازول ولن نزول",
  "امازيغ الخلود",
  "امازيغ لن نزول",
  "امازيغ احرار",
  "خُلقنا احرار",
  "ونعيش احرار",
  "ونموت احرار",
  "وتحيا الامازيغ الاحرار الشُرفاء أينما يكونون",
]

export default function HomePage() {
  const [currentSlogan, setCurrentSlogan] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % animatedSlogans.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const sections = [
    {
      icon: Sun,
      title: "حقائق ثابتة حول الامازيغ",
      description:
        "يُمكنك في هذا القسم الاطلاع على الكثير من الحقائق المُهمة حول حقيقة الامة الأمازيغية الافريقية من جميع النواحي، ويُمكنك أيضاً المُشاركة بنفسك في نشر مثل هذه الحقائق التاريخية في الماضي والحاضر حول الامة الأمازيغية الافريقية.",
      link: "/truth",
      color: "from-yellow-500 to-orange-500",
      iconColor: "text-yellow-600",
    },
    {
      icon: Edit,
      title: "منشورات حول الامة الامازيغ",
      description:
        "يتم في هذا القسم نشر منشورات خاصة حول الامة الامازيغية الافريقية من ناحية اصلُهم ولغتهُم وتاريخهُم وحضارتهُم وفنونهُم وادبهُم وعلمهُم ودينهُم وشخصيتهُم واحداثهُم التاريخية، ولباسهُم واكلهُم وزواجهُم التقليدي.",
      link: "/posts",
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600",
    },
    {
      icon: Book,
      title: "كُتب امازيغية متنوعة",
      description:
        "يحتوى هذا القسم على الكثير من الكُتب الامازيغية وبأكثر من لغة، وهي كُتب لتعليم اللغة الامازيغية، وكُتب تاريخية وثقافية عن الامة الامازيغية واصلها، وكُتب امازيغية أُخرة متنوعة.",
      link: "/books",
      color: "from-green-500 to-emerald-500",
      iconColor: "text-green-600",
    },
    {
      icon: Video,
      title: "فيديوهات امازيغية متنوعة",
      description:
        "يعرض هذا القسم الامازيغي فيديوهات تتعلق بكل شيء حول الحياة والمعيشة اليومية للامة الامازيغية الافريقية، مثل فيديوهات عن الحضارة الامازيغية او العادات والتقاليد الامازيغية.",
      link: "/videos",
      color: "from-red-500 to-pink-500",
      iconColor: "text-red-600",
    },
    {
      icon: Megaphone,
      title: "اعلانات امازيغية ترويجية",
      description:
        "يحتوى هذا القسم على اعلانات امازيغية يومية بجميع انواعها المهمة، مثل اعلانات للمساهمة في بناء مدرسة او بناء مركز صحي او حفر بئر ماء او زراعة ارض بالأشجار.",
      link: "/ads",
      color: "from-purple-500 to-violet-500",
      iconColor: "text-purple-600",
    },
    {
      icon: Store,
      title: "تسوق صناعات امازيغية",
      description:
        "هذا القسم خاص بتسويق الصناعات الامازيغية التقليدية فقط، مثل صناعة الملابس والاقمشة والسجاد والمفروشات والاحدية والاواني الفخرية والمعدنية والخشبية.",
      link: "/shop",
      color: "from-indigo-500 to-blue-500",
      iconColor: "text-indigo-600",
    },
    {
      icon: Lightbulb,
      title: "اقتراح لتطوير تجمع الامازيغ",
      description:
        "يُمكنك في هذا القسم تقديم أي اقتراح او فكرة جميلة لمشرفي هذه المنصة الالكترونية للتواصل الاجتماعي الخاصة بالأمة الامازيغية الافريقية، من اجل تطويرها الى الافضل.",
      link: "/ideas",
      color: "from-amber-500 to-yellow-500",
      iconColor: "text-amber-600",
    },
    {
      icon: Archive,
      title: "صندوق دعم الامازيغ",
      description:
        "هذا الصندوق الخاص بدعم الامازيغ بصفة خاصة وعامة، وهو صندوق يُساعد في بناء مدارس تعليمة او مراكز صحية او ابار مائية او مُساعدة كبار السن والمرضى صحياً من ابناء وبنات الشعب الامازيغي الافريقي.",
      link: "/support",
      color: "from-teal-500 to-green-500",
      iconColor: "text-teal-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <Header />

      {/* Hero Section with Kabyle Colors */}
      <div className="bg-gradient-to-r from-blue-600 via-green-600 to-yellow-500 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 via-green-800/20 to-yellow-600/20"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 backdrop-blur-sm rounded-full">
                <img src="/logo-tamazight.png" alt="Tamazight Logo" className="h-20 w-auto" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg">أزول - سلام</h1>
            <h2 className="text-xl md:text-2xl mb-8 text-yellow-100">تعريف بمنصة تجمع الامازيغ</h2>
            <div className="max-w-4xl mx-auto text-lg leading-relaxed">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <p className="mb-6">
                  تجمُع الأمازيغ ... هي منصة تواصل اجتماعي تعرف بالهوية الأمازيغية تاريخياً، وحضارياً، وثقافياً، وعلمياً،
                  وفنياً مُتنوعاً في الماضي والحاضر ... مع التعريف بالقبائل والعائلات الأمازيغية وأُصولهُم ... وأماكن تواجدها
                  في شمال أفريقيا والعالم.
                </p>
                <p className="text-red-300 font-semibold text-xl">امازيغ باقون ولن نزول إن شاء الله</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Features with Kabyle Colors */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2 text-blue-800">
              <User className="h-6 w-6" />
              خريطة منصة تجمع الامازيغ
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-400">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-800">ملف شخصي على التجمع</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center border-green-200 hover:shadow-lg transition-all duration-300 hover:border-green-400">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-2">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-green-800">مراسلات بين الاعضاء</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center border-yellow-200 hover:shadow-lg transition-all duration-300 hover:border-yellow-400">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-yellow-800">اشعارات اقسام التجمع</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center border-red-200 hover:shadow-lg transition-all duration-300 hover:border-red-400">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-lg text-red-800">اصدقاء من الامازيغ</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Platform Sections with Kabyle Colors */}
      <div className="py-16 bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-3 rounded-full bg-gradient-to-br ${section.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <section.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-800">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed mb-4">
                    {section.description}
                  </CardDescription>
                  <Link href={section.link}>
                    <Button
                      className={`w-full bg-gradient-to-r ${section.color} hover:opacity-90 transition-opacity border-0 text-white shadow-lg`}
                    >
                      استكشف القسم
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 p-6 bg-gradient-to-r from-blue-100 via-green-100 to-yellow-100 rounded-lg border border-blue-200">
            <p className="text-lg text-gray-800">
              سجل دخولك للتجمع مجاناً، وأستفيد من محتوياته الامازيغية المتنوعة، وادعو اهلك واصدقائك الامازيغ للانضمام
              لهذا التجمع للتواصل الاجتماعي الامازيغي{" "}
              <Link
                href="/register"
                className="text-blue-700 hover:text-blue-600 font-semibold underline decoration-2 decoration-blue-400"
              >
                اضغط هنا
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer with Kabyle Colors */}
      <footer className="bg-gradient-to-r from-blue-900 via-green-900 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Animated Slogans */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-yellow-300">شعار تجمع الامازيغ</h4>
              <div className="h-16 flex items-center">
                <p className="text-lg font-semibold text-yellow-200 animate-pulse">{animatedSlogans[currentSlogan]}</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-green-300">للتواصل معنا</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Send className="h-5 w-5 text-blue-400" />
                  <span>تواصل معنا على تلغرام</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5 text-green-400" />
                  <span>تواصل معنا عبر البريد الالكتروني</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  <span>لتقديم اقتراح لتطوير التجمع</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Archive className="h-5 w-5 text-red-400" />
                  <span>دعم منصة تجمع الامازيغ</span>
                </div>
              </div>
            </div>

            {/* Apps */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-blue-300">تحميل تطبيقاتنا</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Download className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">تطبيق تعلم اللغة الامازيغية</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Download className="h-5 w-5 text-green-400" />
                  <span className="text-sm">تطبيق قاموس كلمات اللغة الامازيغية</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Download className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm">تطبيق اطلس الأُمة الامازيغية</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Download className="h-5 w-5 text-red-400" />
                  <span className="text-sm">تطبيق الامازيغ</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div>
              <h4 className="text-xl font-bold mb-6 text-red-300">حول التجمع</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span>اهداف تجمع الامازيغ</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Handshake className="h-5 w-5 text-green-400" />
                  <span>كُن شريكُ التجمع في مدينتك</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Users className="h-5 w-5 text-yellow-400" />
                  <span>أنضم لفريق تجمع الامازيغ</span>
                </div>
                <div className="flex items-center gap-3 hover:text-yellow-300 transition-colors cursor-pointer">
                  <Building className="h-5 w-5 text-red-400" />
                  <span>مركز الامازيغ لتوحيد اللغة الامازيغية</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <Globe className="h-5 w-5 text-yellow-400" />
                <div className="flex gap-4 text-sm">
                  <Link href="#" className="hover:text-yellow-300 transition-colors">
                    ⴰⵎⵣⵉⵖ
                  </Link>
                  <Link href="#" className="hover:text-green-300 transition-colors">
                    Tamaziɣt
                  </Link>
                  <Link href="#" className="hover:text-blue-300 transition-colors">
                    عربي
                  </Link>
                  <Link href="#" className="hover:text-red-300 transition-colors">
                    English
                  </Link>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <Link href="/privacy" className="hover:text-blue-300 transition-colors">
                  سياسة الخصوصية
                </Link>
                <Link href="/policy" className="hover:text-green-300 transition-colors">
                  سياسة الاستخدام
                </Link>
                <Link href="/help" className="hover:text-yellow-300 transition-colors">
                  المساعدة
                </Link>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-gray-300">
              <p>
                حقوق الملكية الفكرية للتصميم والنشر &copy;{" "}
                <span className="text-yellow-300 font-semibold">محفوظة لتجمع الامازيغ 2025 - 2026</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button with Kabyle Colors */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg z-50 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 border-0"
          title="العودة للأعلى"
        >
          <ArrowUp className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  )
}
