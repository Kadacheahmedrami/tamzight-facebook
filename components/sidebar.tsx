"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
// Using Font Awesome icons instead of Lucide React

interface SidebarStats {
  sections: {
    posts: number
    truth: number
    questions: number
    books: number
    videos: number
    images: number
    ads: number
    shop: number
    ideas: number
    support: number
    friends: number
    messages: number
  }
}

export default function Sidebar() {
  const [stats, setStats] = useState<SidebarStats | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/main/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching sidebar stats:", error)
      }
    }

    fetchStats()
  }, [])

  const sidebarLinks = [
    { href: "/main", icon: "fa-home", label: "الصفحة الرئيسية", badge: null },
    { href: "/main/posts", icon: "fa-edit", label: "منشورات امازيغية", badge: stats?.sections.posts?.toString() || "05" },
    { href: "/main/truth", icon: "fa-sun", label: "حقيقة امازيغية", badge: stats?.sections.truth?.toString() || "05" },
    {
      href: "/main/questions",
      icon: "fa-question-circle",
      label: "اسئلة امازيغية",
      badge: stats?.sections.questions?.toString() || "05",
    },
    { href: "/main/books", icon: "fa-book", label: "كُتب امازيغية", badge: stats?.sections.books?.toString() || "05" },
    { href: "/main/images", icon: "fa-images", label: "صور امازيغية", badge: stats?.sections.images?.toString() || "05" },
    { href: "/main/videos", icon: "fa-tv", label: "فيديوهات امازيغية", badge: stats?.sections.videos?.toString() || "05" },
    { href: "/main/ads", icon: "fa-bullhorn", label: "اعلانات امازيغية", badge: stats?.sections.ads?.toString() || "05" },
    { href: "/main/shop", icon: "fa-store", label: "تسوق منتجات امازيغية", badge: stats?.sections.shop?.toString() || "05" },
    {
      href: "/main/ideas",
      icon: "fa-lightbulb",
      label: "اقتراحات لتطوير المنصة",
      badge: stats?.sections.ideas?.toString() || "05",
    },
    { href: "/main/support", icon: "fa-archive", label: "صندوق دعم الامازيغ", badge: stats?.sections.support?.toString() || "05" },
  ]

  const isActiveLink = (href: string) => {
    if(href === "/" ) return false
    if (href === "/main" && pathname === "/main") return true
    if (href !== "/main" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <aside className="hidden lg:block w-64 bg-white border-l border-gray-200 h-screen sticky top-16 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = isActiveLink(link.href)
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`sidebar-link transition-colors duration-200 ${
                  isActive 
                    ? "bg-blue-50 text-[#4531fc] border-r-4 border-[#4531fc]" 
                    : "hover:bg-gray-50"
                }`}
              >
                <i className={`fa ${link.icon} h-5 w-5 ${isActive ? "text-[#4531fc]" : "text-gray-500"}`}></i>
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive
                        ? "bg-blue-200 text-blue-900"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="space-y-4">
            <div className="text-sm">
              <h4 className="font-semibold mb-2">روابط مهمة</h4>
              <div className="space-y-2 text-gray-600">
                <Link 
                  href="/main/policy" 
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/policy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-file-contract text-sm"></i>
                  الشروط
                </Link>
                <Link 
                  href="/main/privacy" 
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/privacy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-shield-alt text-sm"></i>
                  الخصوصية
                </Link>
                <Link 
                  href="/main/cookies" 
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/cookies" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-cookie-bite text-sm"></i>
                  ملفات تعريف الارتباط
                </Link>
                <Link 
                  href="/main/help" 
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/help" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-question-circle text-sm"></i>
                  المساعدة
                </Link>
                <Link 
                  href="/main/contact" 
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/contact" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-envelope text-sm"></i>
                  تواصل معنا
                </Link>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>حقوق التصميم والنشر محفوظة 2026 ©</p>
              <p className="mt-1">لتجمُع الأمازيغية هويتُنا</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}