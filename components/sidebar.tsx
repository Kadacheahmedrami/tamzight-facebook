"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

interface Stats {
  posts: number
  truth: number
  questions: number
  books: number
  images: number
  videos: number
  ads: number
  shop: number
  ideas: number
  support: number
  sentences?: number
  words?: number
}

interface SidebarProps {
  stats: Stats
}

export default function Sidebar({ stats }: SidebarProps) {
  const pathname = usePathname()

  const sidebarLinks = [
    { href: "/main", icon: "fa-home", label: " أحدث المنشورات", badge: null },
    { href: "/main/posts", icon: "fa-edit", label: "منشورات امازيغية", badge: stats.posts.toString() },
    { href: "/main/sentences", icon: "fa-paragraph", label: "الجمل الامازيغية", badge: (stats.sentences || 0).toString() },
    { href: "/main/words", icon: "fa-font", label: "الكلمات الامازيغية", badge: (stats.words || 0).toString() },
    { href: "/main/truths", icon: "fa-sun", label: "حقيقة امازيغية", badge: stats.truth.toString() },
    { href: "/main/questions", icon: "fa-question-circle", label: "اسئلة امازيغية", badge: stats.questions.toString() },
    { href: "/main/books", icon: "fa-book", label: "كُتب امازيغية", badge: stats.books.toString() },
    { href: "/main/images", icon: "fa-images", label: "صور امازيغية", badge: stats.images.toString() },
    { href: "/main/videos", icon: "fa-tv", label: "فيديوهات امازيغية", badge: stats.videos.toString() },
    { href: "/main/ads", icon: "fa-bullhorn", label: "اعلانات امازيغية", badge: stats.ads.toString() },
    { href: "/main/products", icon: "fa-store", label: "تسوق منتجات امازيغية", badge: stats.shop.toString() },
    { href: "/main/ideas", icon: "fa-lightbulb", label: "اقتراحات لتطوير المنصة", badge: stats.ideas.toString() },
    { href: "/main/support", icon: "fa-archive", label: "صندوق دعم الامازيغ", badge: stats.support.toString() },

  ]

  const isActiveLink = (href: string) => {
    if (href === "/") return false
    if (href === "/main" && pathname === "/main") return true
    if (href !== "/main" && pathname.startsWith(href)) return true
    return false
  }

  return (
    <aside className="w-72 bg-white border-l pb-4 border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = isActiveLink(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link transition-colors duration-200 flex items-center gap-3 p-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-[#4531fc] border-l-4 border-[#4531fc]"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <i className={`fa ${link.icon} h-5 w-5 ${isActive ? "text-[#4531fc]" : "text-gray-500"}`}></i>
                <span className="flex-1">{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"
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
                {/* First row: الشروط and الخصوصية */}
                <div className="flex gap-2">
                  <Link
                    href="/main/policy"
                    className={`flex items-center gap-1 flex-1 transition-colors duration-200 ${
                      pathname === "/main/policy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    <i className="fa fa-file-contract text-sm"></i>
                    الشروط
                  </Link>
                  <Link
                    href="/main/privacy"
                    className={`flex items-center gap-1 flex-1 transition-colors duration-200 ${
                      pathname === "/main/privacy" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    <i className="fa fa-shield-alt text-sm"></i>
                    الخصوصية
                  </Link>
                </div>

                {/* Second row: ملفات تعريف الارتباط alone */}
                <Link
                  href="/main/cookies"
                  className={`flex items-center gap-2 transition-colors duration-200 ${
                    pathname === "/main/cookies" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                  }`}
                >
                  <i className="fa fa-cookie-bite text-sm"></i>
                  ملفات تعريف الارتباط
                </Link>

                {/* Third row: المساعدة and تواصل معنا */}
                <div className="flex gap-2">
                  <Link
                    href="/main/help"
                    className={`flex items-center gap-1 flex-1 transition-colors duration-200 ${
                      pathname === "/main/help" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    <i className="fa fa-question-circle text-sm"></i>
                    المساعدة
                  </Link>
                  <Link
                    href="/main/contact"
                    className={`flex items-center gap-1 flex-1 transition-colors duration-200 ${
                      pathname === "/main/contact" ? "text-blue-600 font-medium" : "hover:text-blue-600"
                    }`}
                  >
                    <i className="fa fa-envelope text-sm"></i>
                    تواصل معنا
                  </Link>
                </div>
              </div>
            </div>

            {/* Language options */}
            <div className="text-xs text-gray-600 pt-4 border-t border-gray-200">
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