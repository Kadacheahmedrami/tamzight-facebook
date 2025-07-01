import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto flex">
        {/* Left Content - Settings Options */}
        <div className="w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">اعدادات ملفي الشخصي</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات منشوراتي
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات مشاركاتي
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات تفاعلاتي
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات مساهماتي
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات صوري
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                اعدادات اصدقائي
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Settings Area */}
        <div className="flex-1 p-4">
          <div className="max-w-2xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>اعدادات ملفي الشخصي</span>
              </div>
            </nav>

            {/* Settings Area */}
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-semibold mb-2">تعديل الاسم</h3>
              <input type="text" placeholder="اسمك الجديد" className="w-full border rounded-md py-2 px-3 mb-4" />

              <h3 className="font-semibold mb-2">تعديل كلمة المرور</h3>
              <input
                type="password"
                placeholder="كلمة المرور القديمة"
                className="w-full border rounded-md py-2 px-3 mb-2"
              />
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                className="w-full border rounded-md py-2 px-3 mb-4"
              />

              <Button>حفظ التغييرات</Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Main Navigation */}
        <Sidebar />
      </div>
    </div>
  )
}
