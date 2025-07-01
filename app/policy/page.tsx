import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PolicyPage() {
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
                <span>سياسة الخصوصية والاستخدام والكوكيز والمساعدة</span>
              </div>
            </nav>

            <div className="bg-white rounded-lg border">
              <Accordion type="single" collapsible defaultValue="privacy" className="w-full">
                <AccordionItem value="privacy">
                  <AccordionTrigger className="px-6 py-4 text-right">سياسة الخصوصية على منصة الامازيغ</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>سياسة الخصوصية</h3>
                      <p>
                        نحن في منصة الأمازيغية هويتنا نلتزم بحماية خصوصيتك وبياناتك الشخصية. هذه السياسة توضح كيفية جمع
                        واستخدام وحماية المعلومات التي تقدمها لنا.
                      </p>
                      <h4>جمع المعلومات</h4>
                      <p>نقوم بجمع المعلومات التي تقدمها طوعياً عند التسجيل في المنصة أو استخدام خدماتنا.</p>
                      <h4>استخدام المعلومات</h4>
                      <p>نستخدم المعلومات المجمعة لتحسين خدماتنا وتوفير تجربة أفضل للمستخدمين.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="usage">
                  <AccordionTrigger className="px-6 py-4 text-right">سياسة استخدام منصة الامازيغ</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>سياسة الاستخدام</h3>
                      <h4>موانع استخدام المنصة</h4>
                      <ul>
                        <li>نشر محتوى مسيء أو غير لائق</li>
                        <li>انتهاك حقوق الآخرين</li>
                        <li>نشر معلومات كاذبة أو مضللة</li>
                        <li>استخدام المنصة لأغراض تجارية غير مصرح بها</li>
                      </ul>
                      <h4>المسموح بنشره على المنصة</h4>
                      <ul>
                        <li>المحتوى التعليمي والثقافي الأمازيغي</li>
                        <li>النقاشات البناءة حول التراث الأمازيغي</li>
                        <li>مشاركة الخبرات والمعرفة</li>
                        <li>الأعمال الفنية والإبداعية الأمازيغية</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cookies">
                  <AccordionTrigger className="px-6 py-4 text-right">ملفات تعريف الارتباط "الكوكيز"</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>ملفات تعريف الارتباط "الكوكيز"</h3>
                      <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة وتذكر تفضيلاتك.</p>
                      <h4>أنواع الكوكيز المستخدمة</h4>
                      <ul>
                        <li>كوكيز ضرورية لعمل الموقع</li>
                        <li>كوكيز تحليلية لفهم استخدام الموقع</li>
                        <li>كوكيز وظيفية لتذكر تفضيلاتك</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="help">
                  <AccordionTrigger className="px-6 py-4 text-right">
                    المساعدة من خلال اسئلة واجوبة حول منصة الامازيغ وطريقة استخدامها
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>المساعدة والأسئلة الشائعة</h3>
                      <h4>الأسئلة الشائعة</h4>
                      <ol>
                        <li>كيف أستخدم المنصة؟</li>
                        <li>كيف أحذف حسابي؟</li>
                        <li>كيف أنشر محتوى جديد؟</li>
                        <li>كيف أتواصل مع الأعضاء الآخرين؟</li>
                        <li>كيف أبلغ عن محتوى غير مناسب؟</li>
                        <li>كيف أغير إعدادات الخصوصية؟</li>
                        <li>كيف أنضم للمجموعات؟</li>
                        <li>كيف أحفظ المنشورات المفضلة؟</li>
                        <li>كيف أتابع مستخدمين آخرين؟</li>
                        <li>كيف أحصل على المساعدة التقنية؟</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
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
