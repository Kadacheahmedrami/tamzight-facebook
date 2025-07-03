"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  CircleUserRoundIcon,
  MessageCircle,
  Users,
  X,
  LogOut,
  Menu,
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

interface UnifiedNavigationProps {
  user?: any
  unreadMessages?: number
  onLogout?: () => Promise<void>
}

export default function UnifiedNavigation({ user, unreadMessages = 0, onLogout }: UnifiedNavigationProps) {
  const [stats, setStats] = useState<SidebarStats | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout()
    }
    setMobileMenuOpen(false)
  }

  const sidebarLinks = [
    { href: "/main/home", icon: Home, label: "الصفحة الرئيسية", badge: null },
    { href: "/main/", icon: Rss, label: "آخر المنشورات", badge: "جديد" },
    { href: "/main/posts", icon: Edit, label: "منشورات امازيغية", badge: stats?.sections.posts?.toString() || "0" },
    { href: "/main/truth", icon: Sun, label: "حقيقة امازيغية", badge: stats?.sections.truth?.toString() || "0" },
    {
      href: "/main/questions",
      icon: HelpCircle,
      label: "اسئلة امازيغية",
      badge: stats?.sections.questions?.toString() || "0",
    },
    { href: "/main/books", icon: Book, label: "كُتب امازيغية", badge: stats?.sections.books?.toString() || "0" },
    { href: "/main/images", icon: ImageIcon, label: "صور امازيغية", badge: stats?.sections.images?.toString() || "0" },
    { href: "/main/videos", icon: Video, label: "فيديوهات امازيغية", badge: stats?.sections.videos?.toString() || "0" },
    { href: "/main/ads", icon: Megaphone, label: "اعلانات امازيغية", badge: stats?.sections.ads?.toString() || "0" },
    { href: "/main/shop", icon: Store, label: "تسوق منتجات امازيغية", badge: stats?.sections.shop?.toString() || "0" },
    {
      href: "/main/ideas",
      icon: Lightbulb,
      label: "اقتراحات لتطوير المنصة",
      badge: stats?.sections.ideas?.toString() || "0",
    },
    { href: "/main/support", icon: Archive, label: "صندوق دعم الامازيغ", badge: stats?.sections.support?.toString() || "0" },
  ]

  const userLinks = [
    { href: "/main/member", icon: CircleUserRoundIcon, label: "ملفي الشخصي" },
    { 
      href: "/main/messages", 
      icon: MessageCircle, 
      label: "الرسائل",
      badge: unreadMessages > 0 ? unreadMessages.toString() : null
    },
    { href: "/main/friends", icon: Users, label: "الأصدقاء" },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/" && pathname === "/") return true
    if (href !== "/" && pathname.startsWith(href)) return true
    return false
  }

  const NavigationLinks = ({ isMobile = false }) => (
    <>
      {sidebarLinks.map((link) => {
        const isActive = isActiveLink(link.href)
        return (
          <Link 
            key={link.href} 
            href={link.href}
            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive 
                ? isMobile 
                  ? "bg-blue-50 text-blue-700"
                  : "bg-blue-50 text-blue-700 border-r-4 border-blue-700" 
                : isMobile
                  ? "text-gray-700 hover:bg-gray-50"
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
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">القائمة</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User Profile Section (if user exists) */}
              {user && (
                <div className="p-4 border-b bg-blue-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <CircleUserRoundIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-blue-100">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Navigation Links (if user exists) */}
              {user && (
                <div className="p-4 border-b">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">حسابي</h3>
                  <div className="space-y-1">
                    {userLinks.map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="text-blue-600 hover:bg-blue-50 rounded-lg p-3 flex items-center gap-3 transition-all"
                      >
                        <link.icon className="h-5 w-5" />
                        <span className="flex-1">{link.label}</span>
                        {link.badge && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Navigation Links */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-3">التصفح</h3>
                <div className="space-y-1">
                  <NavigationLinks isMobile={true} />
                </div>

                {/* Important Links */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">روابط مهمة</h4>
                  <div className="space-y-2">
                    {[
                      { href: "/main/policy", label: "الشروط" },
                      { href: "/main/privacy", label: "الخصوصية" },
                      { href: "/main/cookies", label: "ملفات تعريف الارتباط" },
                      { href: "/main/help", label: "المساعدة" },
                      { href: "/main/contact", label: "تواصل معنا" },
                    ].map((link) => (
                      <Link 
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-lg transition-colors ${
                          pathname === link.href 
                            ? "text-blue-600 bg-blue-50 font-medium" 
                            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout Button (if user exists) */}
              {user && (
                <div className="p-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل خروج
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  <p>حقوق التصميم والنشر محفوظة 2026 ©</p>
                  <p className="mt-1">لتجمُع الأمازيغية هويتُنا</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-l border-gray-200 h-screen sticky top-16 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-2">
            <NavigationLinks />
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="space-y-4">
              <div className="text-sm">
                <h4 className="font-semibold mb-2">روابط مهمة</h4>
                <div className="space-y-2 text-gray-600">
                  <Link 
                    href="/main/policy" 
                    className={`block transition-colors duration-200 ${
                      pathname === "/policy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    الشروط
                  </Link>
                  <Link 
                    href="/main/privacy" 
                    className={`block transition-colors duration-200 ${
                      pathname === "/privacy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    الخصوصية
                  </Link>
                  <Link 
                    href="/main/cookies" 
                    className={`block transition-colors duration-200 ${
                      pathname === "/cookies" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    ملفات تعريف الارتباط
                  </Link>
                  <Link 
                    href="/main/help" 
                    className={`block transition-colors duration-200 ${
                      pathname === "/help" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    المساعدة
                  </Link>
                  <Link 
                    href="/main/contact" 
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
    </>
  )
}