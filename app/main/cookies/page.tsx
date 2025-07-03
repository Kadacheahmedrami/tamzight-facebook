import Sidebar from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto flex">
        {/* Right Sidebar - Main Navigation */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>سياسة ملفات تعريف الارتباط</span>
              </div>
            </nav>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">سياسة ملفات تعريف الارتباط "الكوكيز"</CardTitle>
                <CardDescription>
                  معلومات حول كيفية استخدامنا لملفات تعريف الارتباط على منصة الأمازيغية هويتنا
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">ما هي ملفات تعريف الارتباط؟</h3>
                  <p className="text-gray-700 leading-relaxed">
                    ملفات تعريف الارتباط (الكوكيز) هي ملفات نصية صغيرة يتم حفظها على جهازك عند زيارة موقعنا. تساعدنا هذه
                    الملفات في تحسين تجربتك وتذكر تفضيلاتك.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">أنواع الكوكيز المستخدمة</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-blue-700">كوكيز ضرورية</h4>
                      <p className="text-gray-600 text-sm">ضرورية لعمل الموقع بشكل صحيح، مثل تسجيل الدخول والأمان</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium text-green-700">كوكيز وظيفية</h4>
                      <p className="text-gray-600 text-sm">تذكر تفضيلاتك مثل اللغة والإعدادات الشخصية</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-medium text-yellow-700">كوكيز تحليلية</h4>
                      <p className="text-gray-600 text-sm">تساعدنا في فهم كيفية استخدام الموقع لتحسين الخدمات</p>
                    </div>
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-medium text-purple-700">كوكيز تسويقية</h4>
                      <p className="text-gray-600 text-sm">تستخدم لعرض إعلانات مناسبة لاهتماماتك</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">إدارة الكوكيز</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    يمكنك التحكم في الكوكيز من خلال إعدادات المتصفح الخاص بك. يمكنك:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>قبول أو رفض جميع الكوكيز</li>
                    <li>حذف الكوكيز الموجودة</li>
                    <li>تعيين المتصفح لتحذيرك عند إرسال كوكيز</li>
                    <li>تعطيل الكوكيز تماماً</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">تأثير تعطيل الكوكيز</h3>
                  <p className="text-gray-700 leading-relaxed">تعطيل الكوكيز قد يؤثر على وظائف الموقع، مثل:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>صعوبة في تسجيل الدخول</li>
                    <li>فقدان التفضيلات الشخصية</li>
                    <li>عدم عمل بعض الميزات بشكل صحيح</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">إعدادات الكوكيز</h3>
                  <p className="text-gray-700 mb-4">يمكنك تخصيص إعدادات الكوكيز حسب تفضيلاتك:</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full   bg-transparent">
                      قبول جميع الكوكيز
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      قبول الكوكيز الضرورية فقط
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      تخصيص الإعدادات
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">تحديث السياسة</h3>
                  <p className="text-gray-700 leading-relaxed">
                    قد نقوم بتحديث سياسة الكوكيز من وقت لآخر. سيتم إشعارك بأي تغييرات مهمة عبر الموقع أو البريد
                    الإلكتروني.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Left Sidebar - Ads */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="font-semibold mb-2">ساحة اعلانات</h3>
            <div className="h-32 bg-gray-100 rounded-lg mb-2"></div>
          </div>
        </div>
      </div>
    </div>
  )
}