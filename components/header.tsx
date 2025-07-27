"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import UserActions from "./UserActions"
import MobileUserMenu from "./MobileUserMenu"
import SearchComponent from "./SearchComponent"

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
}

interface Notification {
  id: string
  type: string
  message: string
  timestamp: string
  read: boolean
  avatar: string | null
}

interface Message {
  id: string
  senderId: string
  sender: string
  message: string
  timestamp: string
  read: boolean
  avatar: string | null
}

interface User {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface ClientHeaderProps {
  user: User | null
  stats?: Stats
  notifications: Notification[]
  messages: Message[]
  unreadNotifications: number
  unreadMessages: number
}

export default function ClientHeader({ 
  user, 
  stats, 
  notifications, 
  messages, 
  unreadNotifications, 
  unreadMessages 
}: ClientHeaderProps) {
  const pathname = usePathname()
  
  // Check if user is authenticated
  const isAuthenticated = user && user.id
  // Check if we're on the landing page
  const isLandingPage = pathname === "/"

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Section - Authentication Status */}
            <div className="flex items-center gap-4">
              {isLandingPage && isAuthenticated ? (
                // Landing page + authenticated - show welcome + button only
                <div className="flex  items-center gap-4">
                  <div className=" sm:flex items-center gap-2 text-sm text-gray-600">
                   
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <Link href="/main">
                    <Button variant="outline" size="sm" className="text-base px-2 h-8 bg-[#4531fc] text-white border-[#4531fc] hover:bg-blue-600">
                      دخول
                    </Button>
                  </Link>
                </div>
              ) : (
                // All other cases - show UserActions with props
                <UserActions 
                  user={user}
                  notifications={notifications}
                  messages={messages}
                  unreadNotifications={unreadNotifications}
                  unreadMessages={unreadMessages}
                />
              )}
            </div>

            {/* Center Section - Search Bar or Marquee Text */}
            <div className="hidden md:flex flex-row justify-center items-center lg:w-[700px]">
              {!isLandingPage ? (
                // Search Bar for non-landing pages
                <SearchComponent isAuthenticated={!!isAuthenticated} />
              ) : (
                // Marquee Text for landing page
                <div className="flex-1 mx-4 max-w-xl">
                  <div className="overflow-hidden whitespace-nowrap py-1 text-3xl  rounded-lg  ">
                    <div className="inline-block animate-marquee-ltr">
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ الخلود *** امازيغ لن نزول *** ازول ولن نزول *** وتحيا الامازيغ الاحرار الشُرفاء أينما يكونون
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ احرار *** خُلقنا احرار *** ونعيش احرار *** ونموت احرار
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        امازيغ باقون *** وبحضارتُنا مُستمرون *** وبثقافتُنا مُتمسكون *** وبعادتُنا مُعتزون *** وبتقاليدُنا نعيشون *** وبأمازيغيتُنا نفتخرون
                      </span>
                      <span className="text-green-600 font-bold text-base px-6">
                        الامازيغية هويتُنا *** الامازيغية ثقافتُنا *** الامازيغية حضارتُنا *** الامازيغية وحدتُنا *** الامازيغية قوتُنا *** الامازيغية دمُنا
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo and Site Name - Right */}
            <div className="flex items-center gap-2">
              <Link href={isAuthenticated ? "/main" : "/"} className="flex items-center gap-2">
                <h1 className="text-[#4531fc] text-lg font-medium md:text-3xl md:font-extrabold">
                  TAMAZIGHT
                </h1>
                <img 
                  src="/logo/logo3.png"
                  alt="Tamazight Logo" 
                  className="h-8 sm:h-10 w-auto" 
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar - Below Header - Hide on Landing Page */}
      {!isLandingPage && (
        <div className="lg:hidden bg-white w-full border-b border-gray-200 shadow-sm">
          <div className="px-4 py-4">
            <div className="relative w-full flex flex-row items-center gap-2">
              {/* Mobile Menu */}
              <div className="lg:hidden">
                <MobileUserMenu user={user} stats={stats} unreadMessages={unreadMessages} />
              </div>
              
              {/* Mobile Search Component */}
              <SearchComponent isAuthenticated={!!isAuthenticated} isMobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Marquee for Landing Page */}
      {isLandingPage && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 py-2">
            <div className="overflow-hidden whitespace-nowrap py-1  rounded-lg ">
              <div className="inline-block animate-marquee-ltr">
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ الخلود *** امازيغ لن نزول *** ازول ولن نزول *** وتحيا الامازيغ الاحرار الشُرفاء أينما يكونون
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ احرار *** خُلقنا احرار *** ونعيش احرار *** ونموت احرار
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  امازيغ باقون *** وبحضارتُنا مُستمرون *** وبثقافتُنا مُتمسكون *** وبعادتُنا مُعتزون *** وبتقاليدُنا نعيشون *** وبأمازيغيتُنا نفتخرون
                </span>
                <span className="text-green-600 font-medium text-base px-4">
                  الامازيغية هويتُنا *** الامازيغية ثقافتُنا *** الامازيغية حضارتُنا *** الامازيغية وحدتُنا *** الامازيغية قوتُنا *** الامازيغية دمُنا
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-marquee-ltr {
          animation: marquee-ltr 25s linear infinite;
        }
        
        .animate-marquee-ltr:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  )
}