"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Edit,
  Sun,
  HelpCircle,
  Book,
  ImageIcon,
  Video,
  Megaphone,
  Store,
  Lightbulb,
  Archive,
  Rss,
} from "lucide-react"

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
  }
}

export default function Sidebar() {
  const [stats, setStats] = useState<SidebarStats | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching sidebar stats:", error)
      }
    }

    fetchStats()
  }, [])

  const sidebarLinks = [
    { href: "/home", icon: Home, label: "الصفحة الرئيسية", badge: null },
    { href: "/", icon: Rss, label: "آخر المنشورات", badge: "جديد" },
    { href: "/posts", icon: Edit, label: "منشورات امازيغية", badge: stats?.sections.posts?.toString() || "0" },
    { href: "/truth", icon: Sun, label: "حقيقة امازيغية", badge: stats?.sections.truth?.toString() || "0" },
    {
      href: "/questions",
      icon: HelpCircle,
      label: "اسئلة امازيغية",
      badge: stats?.sections.questions?.toString() || "0",
    },
    { href: "/books", icon: Book, label: "كُتب امازيغية", badge: stats?.sections.books?.toString() || "0" },
    { href: "/images", icon: ImageIcon, label: "صور امازيغية", badge: stats?.sections.images?.toString() || "0" },
    { href: "/videos", icon: Video, label: "فيديوهات امازيغية", badge: stats?.sections.videos?.toString() || "0" },
    { href: "/ads", icon: Megaphone, label: "اعلانات امازيغية", badge: stats?.sections.ads?.toString() || "0" },
    { href: "/shop", icon: Store, label: "تسوق منتجات امازيغية", badge: stats?.sections.shop?.toString() || "0" },
    {
      href: "/ideas",
      icon: Lightbulb,
      label: "اقتراحات لتطوير المنصة",
      badge: stats?.sections.ideas?.toString() || "0",
    },
    { href: "/support", icon: Archive, label: "صندوق دعم الامازيغ", badge: stats?.sections.support?.toString() || "0" },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
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
                    ? "bg-blue-50 text-blue-700 border-r-4 border-blue-700" 
                    : "hover:bg-gray-50"
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      link.badge === "جديد" 
                        ? "bg-green-100 text-green-800" 
                        : isActive
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
                  href="/policy" 
                  className={`block transition-colors duration-200 ${
                    pathname === "/policy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  الشروط
                </Link>
                <Link 
                  href="/privacy" 
                  className={`block transition-colors duration-200 ${
                    pathname === "/privacy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  الخصوصية
                </Link>
                <Link 
                  href="/cookies" 
                  className={`block transition-colors duration-200 ${
                    pathname === "/cookies" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  ملفات تعريف الارتباط
                </Link>
                <Link 
                  href="/help" 
                  className={`block transition-colors duration-200 ${
                    pathname === "/help" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  المساعدة
                </Link>
                <Link 
                  href="/contact" 
                  className={`block transition-colors duration-200 ${
                    pathname === "/contact" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
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