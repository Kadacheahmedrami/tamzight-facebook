import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import PostCard from "@/components/post-card"
import CreatePostModal from "@/components/create-post-modal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sampleProducts = [
  {
    title: "فستان امازيغي تقليدي",
    content: "فستان امازيغي تقليدي مصنوع يدويا",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منتج",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 250, likes: 1605, comments: 154, shares: 10 },
  },
  {
    title: "سجاد امازيغي",
    content: "سجاد امازيغي مصنوع من الصوف الطبيعي",
    author: "سيبتموس سيفوروس",
    timestamp: "نشر بتاريخ 01-04-2023 الساعة 12:35 مساء",
    category: "منتج",
    image: "/placeholder.svg?height=300&width=600",
    stats: { views: 320, likes: 1200, comments: 89, shares: 15 },
  },
]

export default function ShopPage() {
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
                <span>تسوق منتجات امازيغية</span>
              </div>
            </nav>

            {/* Filter */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">اعرض مُنتج امازيغي في:</label>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختار قسم لعرضه" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothing">ملابس</SelectItem>
                    <SelectItem value="shoes">احذية</SelectItem>
                    <SelectItem value="accessories">اكسسورات</SelectItem>
                    <SelectItem value="furniture">مفروشات</SelectItem>
                    <SelectItem value="all">الجميع</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">اعرض</Button>
              </div>
            </div>

            {/* Create Product */}
            <CreatePostModal />

            {/* Products Feed */}
            <div className="space-y-4">
              {sampleProducts.map((product, index) => (
                <PostCard key={index} {...product} />
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
