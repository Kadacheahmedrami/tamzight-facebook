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
  // Color mapping for trending topics
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-50 text-blue-800',
      'green': 'bg-green-50 text-green-800',
      'red': 'bg-red-50 text-red-800',
      'yellow': 'bg-yellow-50 text-yellow-800',
      'purple': 'bg-purple-50 text-purple-800',
      'pink': 'bg-pink-50 text-pink-800',
      'indigo': 'bg-indigo-50 text-indigo-800',
      'gray': 'bg-gray-50 text-gray-800',
    }
    return colorMap[color] || 'bg-gray-50 text-gray-800'
  }

  return (
    <div className="h-[calc(100vh-7vh)]    bg-gray-50 ">
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
          <div className="hidden lg:block w-80 h-full overflow-y-auto p-4">
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
                    className={`p-2 rounded text-sm flex justify-between items-center hover:opacity-80 transition-opacity cursor-pointer ${getColorClasses(topic.color)}`}
                  >
                    <span>{topic.hashtag}</span>
                    <span className="text-xs opacity-70">{topic.count}</span>
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