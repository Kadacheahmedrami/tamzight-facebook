
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (

          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>سياسة الخصوصية</span>
              </div>
            </nav>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">سياسة الخصوصية</CardTitle>
                <CardDescription>نحن في منصة الأمازيغية هويتنا نلتزم بحماية خصوصيتك وبياناتك الشخصية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">جمع المعلومات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    نقوم بجمع المعلومات التي تقدمها طوعياً عند التسجيل في المنصة أو استخدام خدماتنا. هذه المعلومات تشمل:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>الاسم والبريد الإلكتروني</li>
                    <li>معلومات الملف الشخصي</li>
                    <li>المحتوى الذي تنشره</li>
                    <li>بيانات الاستخدام والتفاعل</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">استخدام المعلومات</h3>
                  <p className="text-gray-700 leading-relaxed">نستخدم المعلومات المجمعة للأغراض التالية:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>تقديم وتحسين خدماتنا</li>
                    <li>التواصل معك بشأن حسابك</li>
                    <li>ضمان أمان المنصة</li>
                    <li>تخصيص تجربتك</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">حماية البيانات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الكشف أو
                    التدمير.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">مشاركة المعلومات</h3>
                  <p className="text-gray-700 leading-relaxed">
                    لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>بموافقتك الصريحة</li>
                    <li>للامتثال للقوانين</li>
                    <li>لحماية حقوقنا وحقوق المستخدمين</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">حقوقك</h3>
                  <p className="text-gray-700 leading-relaxed">لديك الحق في:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    <li>الوصول إلى معلوماتك الشخصية</li>
                    <li>تصحيح المعلومات غير الدقيقة</li>
                    <li>حذف حسابك ومعلوماتك</li>
                    <li>تقييد معالجة بياناتك</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">التواصل معنا</h3>
                  <p className="text-gray-700 leading-relaxed">
                    إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني أو من خلال
                    صفحة التواصل.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
      
  )
}
