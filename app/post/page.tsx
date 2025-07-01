import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function PostPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Ads */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
            <Button variant="link" size="sm" className="p-0 h-auto">
              شاهد جميع الاعلانات
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg border p-6">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>منشور</span>
              </div>
            </nav>

            <h1 className="text-2xl font-semibold mb-4">عنوان المنشور</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <p className="font-medium">اسم العضو</p>
                <p className="text-sm text-gray-500">نشر بتاريخ 01-04-2023 الساعة 12:35 مساء</p>
              </div>
            </div>

            <img
              src="/placeholder.svg?height=400&width=800"
              alt="Post Image"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />

            <p className="text-gray-700 leading-relaxed mb-6">
              هذا النص هو مثال لمحتوى المنشور. يمكنك إضافة المزيد من التفاصيل هنا.
            </p>

            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-xl font-semibold mb-3">التعليقات</h2>
              <Input type="text" placeholder="اكتب تعليقك هنا" className="mb-3" />

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">اسم العضو</p>
                    <p className="text-sm text-gray-500">تم التعليق بتاريخ 15 / 12 / 2022</p>
                    <p className="text-gray-700">هذا مثال لتعليق على المنشور.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">اسم العضو</p>
                    <p className="text-sm text-gray-500">تم التعليق بتاريخ 15 / 12 / 2022</p>
                    <p className="text-gray-700">هذا مثال لتعليق آخر على المنشور.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Main Navigation */}
        <Sidebar />
      </div>
    </div>
  )
}
