import { ReactNode } from "react"
import Sidebar from "@/components/sidebar"
import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LayoutProps {
  children: ReactNode
  showRightSidebar?: boolean
  trendingTopics?: TrendingTopic[]
}

interface TrendingTopic {
  id: number
  hashtag: string
  count: number
  color: string
}

export default function MainLayout({ 
  children, 
  showRightSidebar = true, 
  trendingTopics = [] 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {children}
        </div>

        {/* Right Sidebar - Desktop Only */}
        {showRightSidebar && (
          <div className="hidden lg:block w-64 p-4">
            <div className="bg-white rounded-lg p-4 border mb-4">
              <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
              <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
              <Button variant="link" size="sm" className="text-[#4531fc] p-0 h-auto">
                شاهد جميع الاعلانات
              </Button>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                المواضيع الشائعة
              </h3>
              <div className="space-y-2">
                {trendingTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`p-2 bg-${topic.color}-50 rounded text-sm flex justify-between items-center`}
                  >
                    <span>{topic.hashtag}</span>
                    <span className="text-xs text-gray-500">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}