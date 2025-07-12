// MainLayout.tsx
import { ReactNode } from "react"
import { Session } from "next-auth"
import Sidebar from "@/components/sidebar"
import LeftSidebar from "@/components/LeftSidebar"

interface LayoutProps {
  children: ReactNode
  showRightSidebar?: boolean
  session?: Session | null
}

export default function MainLayout({
  children,
  showRightSidebar = true,
  session
}: LayoutProps) {
  return (
    <div className="h-[calc(100vh-7vh)] bg-gray-50">
      <div className="max-w-7xl mx-auto flex h-full">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full overflow-x-hidden overflow-y-auto p-4">
          {children}
        </div>

        {/* Right Sidebar - Desktop Only */}
        {showRightSidebar && (
          <LeftSidebar session={session} />
        )}
      </div>
    </div>
  )
}