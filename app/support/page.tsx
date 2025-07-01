import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
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
                <span>صندوق دعم الامازيغ</span>
              </div>
            </nav>

            <div className="bg-white rounded-lg border">
              <Accordion type="single" collapsible defaultValue="definition" className="w-full">
                <AccordionItem value="definition">
                  <AccordionTrigger className="px-6 py-4 text-right">تعريف بصندوق دعم الامازيغ</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>تعريف بصندوق دعم الامازيغ</h3>
                      <p>
                        صندوق دعم الأمازيغ هو مبادرة تهدف إلى توفير الدعم المالي والمعنوي للمحتاجين من الأمازيغ في مختلف
                        المجالات.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="goals">
                  <AccordionTrigger className="px-6 py-4 text-right">اهداف صندوق دعم الامازيغ</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>اهداف صندوق دعم الامازيغ</h3>
                      <ol>
                        <li>توفير الدعم المالي للطلاب الأمازيغ</li>
                        <li>المساهمة في بناء المدارس والمراكز التعليمية</li>
                        <li>تقديم المساعدات الطبية للمرضى</li>
                        <li>دعم المشاريع الصغيرة للأسر المحتاجة</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="how-to-support">
                  <AccordionTrigger className="px-6 py-4 text-right">كيف تدعم الصندوق؟</AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-right">
                      <h3>كيف تدعم الصندوق؟</h3>
                      <ol>
                        <li>التبرع المباشر عبر حساباتنا البنكية</li>
                        <li>المشاركة في الفعاليات والأنشطة التي ينظمها الصندوق</li>
                        <li>نشر الوعي بأهداف الصندوق وأنشطته</li>
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
