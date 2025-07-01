import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"

const sampleIdeas = [
  {
    title: "اضافة قسم جديد للغة الامازيغية",
    content: "اقتراح باضافة قسم فرعي جديد للغة الامازيغية",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "اقتراح",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    title: "تطوير تصميم الموقع",
    content: "اقتراح لتحسين تصميم الموقع وجعله اكثر جاذبية",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "اقتراح",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
  },
]

export default function IdeasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>اقتراحات لتطوير المنص��</span>
              </div>
            </nav>

            {/* Create Idea */}
            <CreatePostModal />

            {/* Ideas Feed */}
            <div className="space-y-4">
              {sampleIdeas.map((idea, index) => (
                <PostCard key={index} {...idea} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
