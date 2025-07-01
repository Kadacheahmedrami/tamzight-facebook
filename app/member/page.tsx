import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const samplePosts = [
  {
    title: "منشور جديد للعضو",
    content: "هذا منشور تجريبي للعضو",
    author: "اسم العضو",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منشور",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
]

export default function MemberPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>ملف العضو</span>
              </div>
            </nav>

            <Tabs defaultValue="posts" className="w-full">
              <TabsList>
                <TabsTrigger value="posts">منشوراته</TabsTrigger>
                <TabsTrigger value="shares">مشاركاته</TabsTrigger>
                <TabsTrigger value="interactions">تفاعلاته</TabsTrigger>
                <TabsTrigger value="contributions">مساهماته</TabsTrigger>
                <TabsTrigger value="photos">صوره</TabsTrigger>
                <TabsTrigger value="friends">اصدقاءه</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <div className="space-y-4">
                  {samplePosts.map((post, index) => (
                    <PostCard key={index} {...post} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="shares">
                <div>مشاركات العضو</div>
              </TabsContent>
              <TabsContent value="interactions">
                <div>تفاعلات العضو</div>
              </TabsContent>
              <TabsContent value="contributions">
                <div>مساهمات العضو</div>
              </TabsContent>
              <TabsContent value="photos">
                <div>صور العضو</div>
              </TabsContent>
              <TabsContent value="friends">
                <div>اصدقاء العضو</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
