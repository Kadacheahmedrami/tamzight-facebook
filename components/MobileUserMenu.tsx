"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface StatsResponse {
  totalPosts: number
  todayPosts: number
  trendingPosts: number
  totalUsers: number
  activeUsers: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalShares: number
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
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true)
        setStatsError(null)
        
        const response = await fetch("/api/main/stats")
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Check if response has error property
        if (data.error) {
          throw new Error(data.error)
        }
        
        setStats(data)
      } catch (error) {
        console.error("Error fetching sidebar stats:", error)
        setStatsError(error instanceof Error ? error.message : "Unknown error")
        
        // Set default stats if fetch fails
        setStats({
          totalPosts: 0,
          todayPosts: 0,
          trendingPosts: 0,
          totalUsers: 0,
          activeUsers: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          sections: {
            posts: 0,
            truth: 0,
            questions: 0,
            books: 0,
            videos: 0,
            images: 0,
            ads: 0,
            shop: 0,
            ideas: 0,
            support: 0
          }
        })
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchStats()
  }, [])

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      
      // Call custom logout function if provided
      if (onLogout) {
        await onLogout()
      }
      
      // Use NextAuth signOut
      await signOut({
        callbackUrl: "/", // Redirect to home page after logout
        redirect: true
      })
      
      setMobileMenuOpen(false)
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const formatStatsBadge = (count: number | undefined): string => {
    if (isLoadingStats) return "..."
    if (count === undefined || count === null) return "0"
    
    // Format large numbers
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    
    return count.toString()
  }

  const sidebarLinks = [
    { href: "/main", icon: "fa-home", label: "أحدث المنشورات", badge: null },
    { 
      href: "/main/posts", 
      icon: "fa-edit", 
      label: "منشورات امازيغية", 
      badge: formatStatsBadge(stats?.sections?.posts)
    },
    { 
      href: "/main/truth", 
      icon: "fa-sun", 
      label: "حقيقة امازيغية", 
      badge: formatStatsBadge(stats?.sections?.truth)
    },
    {
      href: "/main/questions",
      icon: "fa-question-circle",
      label: "اسئلة امازيغية",
      badge: formatStatsBadge(stats?.sections?.questions)
    },
    { 
      href: "/main/books", 
      icon: "fa-book", 
      label: "كُتب امازيغية", 
      badge: formatStatsBadge(stats?.sections?.books)
    },
    { 
      href: "/main/images", 
      icon: "fa-images", 
      label: "صور امازيغية", 
      badge: formatStatsBadge(stats?.sections?.images)
    },
    { 
      href: "/main/videos", 
      icon: "fa-tv", 
      label: "فيديوهات امازيغية", 
      badge: formatStatsBadge(stats?.sections?.videos)
    },
    { 
      href: "/main/ads", 
      icon: "fa-bullhorn", 
      label: "اعلانات امازيغية", 
      badge: formatStatsBadge(stats?.sections?.ads)
    },
    { 
      href: "/main/shop", 
      icon: "fa-store", 
      label: "تسوق منتجات امازيغية", 
      badge: formatStatsBadge(stats?.sections?.shop)
    },
    {
      href: "/main/ideas",
      icon: "fa-lightbulb",
      label: "اقتراحات لتطوير المنصة",
      badge: formatStatsBadge(stats?.sections?.ideas)
    },
    { 
      href: "/main/support", 
      icon: "fa-archive", 
      label: "صندوق دعم الامازيغ", 
      badge: formatStatsBadge(stats?.sections?.support)
    },
  ]

  const isActiveLink = (href: string) => {
    if (href === "/main" && pathname === "/main") return true
    if (href !== "/main" && pathname.startsWith(href)) return true
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
                  : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <i className={`fa ${link.icon} h-5 w-5 ${
              isActive ? "text-blue-700" : "text-gray-500"
            }`}></i>
            <span className="flex-1 text-sm font-medium">{link.label}</span>
            {link.badge && (
              <span
                className={`text-xs px-2 py-1 rounded-full min-w-[2rem] text-center ${
                  link.badge === "جديد" 
                    ? "bg-green-100 text-green-800" 
                    : isActive
                      ? "bg-blue-200 text-blue-900"
                      : "bg-gray-100 text-gray-700"
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

  const ImportantLinks = ({ isMobile = false }) => (
    <div className="space-y-2">
      {/* First row - الشروط and الخصوصية */}
      <div className="flex gap-2">
        <Link 
          href="/main/policy"
          onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
          className={`flex items-center gap-1 flex-1 justify-center py-2 px-3 rounded-lg transition-colors text-sm ${
            pathname === "/main/policy" 
              ? "text-blue-600 bg-blue-50 font-medium" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <i className="fa fa-file-contract text-sm"></i>
          الشروط
        </Link>
        <Link 
          href="/main/privacy"
          onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
          className={`flex items-center gap-1 flex-1 justify-center py-2 px-3 rounded-lg transition-colors text-sm ${
            pathname === "/main/privacy" 
              ? "text-blue-600 bg-blue-50 font-medium" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <i className="fa fa-shield-alt text-sm"></i>
          الخصوصية
        </Link>
      </div>

      {/* Second row - ملفات تعريف الارتباط alone */}
      <Link 
        href="/main/cookies"
        onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors text-sm ${
          pathname === "/main/cookies" 
            ? "text-blue-600 bg-blue-50 font-medium" 
            : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
        }`}
      >
        <i className="fa fa-cookie-bite text-sm"></i>
        ملفات تعريف الارتباط
      </Link>

      {/* Third row - المساعدة and تواصل معنا */}
      <div className="flex gap-2">
        <Link 
          href="/main/help"
          onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
          className={`flex items-center gap-1 flex-1 justify-center py-2 px-3 rounded-lg transition-colors text-sm ${
            pathname === "/main/help" 
              ? "text-blue-600 bg-blue-50 font-medium" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <i className="fa fa-question-circle text-sm"></i>
          المساعدة
        </Link>
        <Link 
          href="/main/contact"
          onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
          className={`flex items-center gap-1 flex-1 justify-center py-2 px-3 rounded-lg transition-colors text-sm ${
            pathname === "/main/contact" 
              ? "text-blue-600 bg-blue-50 font-medium" 
              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          }`}
        >
          <i className="fa fa-envelope text-sm"></i>
          تواصل معنا
        </Link>
      </div>
    </div>
  )

  const LanguageSelector = () => (
    <div className="text-xs text-gray-600">
      <div className="flex items-center justify-center gap-2">
        <button className="hover:text-blue-600 transition-colors duration-200 font-medium">
          ⴰⵎⴰⵣⵉⵖ
        </button>
        <span className="text-gray-400">•</span>
        <button className="hover:text-blue-600 transition-colors duration-200 font-medium">
          عربي
        </button>
        <span className="text-gray-400">•</span>
        <button className="hover:text-blue-600 transition-colors duration-200 font-medium">
          English
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <i className="fa fa-bars h-6 w-6"></i>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex flex-col overflow-y-auto h-full">
              {/* User Profile Section (if user exists) */}
              {user && (
                <div className="p-4 flex items-center justify-between border-b bg-[#4531fc] text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fa fa-user-circle text-2xl"></i>
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-blue-100">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-8 w-8 p-0 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Close menu"
                  >
                    <i className="fa fa-times h-4 w-4"></i>
                  </button> 
                </div>
              )}

              {/* Stats Error Display (Mobile) */}
              {statsError && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <i className="fa fa-exclamation-triangle text-sm"></i>
                    <span className="text-sm">خطأ في تحميل الإحصائيات</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">{statsError}</p>
                </div>
              )}

              {/* Main Navigation Links */}
              <div className="flex-1 p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">التصفح</h3>
                <div className="space-y-1">
                  <NavigationLinks isMobile={true} />
                </div>

                {/* Important Links */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">روابط مهمة</h4>
                  <ImportantLinks isMobile={true} />
                </div>

                {/* Language options - Mobile */}
                <div className="mt-6 pt-6 border-t">
                  <LanguageSelector />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  <p>حقوق التصميم والنشر محفوظة 2026 ©</p>
                  <p className="mt-1">لتجمُع الأمازيغية هويتُنا</p>
                </div>
              </div>
              
              {/* Logout Button (if user exists) */}
              {user && (
                <div className="p-4 border-t">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg transition-colors ${
                      isLoggingOut 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:bg-red-50"
                    }`}
                  >
                    <i className="fa fa-sign-out-alt h-4 w-4"></i>
                    {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل خروج"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-l border-gray-200 h-screen sticky top-16 overflow-y-auto">
        <div className="p-4">
          {/* Stats Error Display (Desktop) */}
          {statsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <i className="fa fa-exclamation-triangle text-sm"></i>
                <span className="text-sm">خطأ في تحميل الإحصائيات</span>
              </div>
              <p className="text-xs text-red-600 mt-1">{statsError}</p>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="space-y-2">
            <NavigationLinks />
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="space-y-4">
              <div className="text-sm">
                <h4 className="font-semibold mb-2">روابط مهمة</h4>
                <ImportantLinks />
              </div>

              {/* Language options - Desktop */}
              <div className="pt-4 border-t border-gray-200">
                <LanguageSelector />
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