// pages/support/page.tsx

"use client"

import { useState } from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  GraduationCap,
  Building,
  Cross,
  Briefcase,
  HandHeart,
  Target,
} from "lucide-react"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<string>("definition")

  const supportCards = [
    { title: "دعم الطلاب", description: "منح دراسية وتعليمية", icon: GraduationCap, color: "from-blue-500 to-[#4531fc]", stats: "1,234 طالب مستفيد" },
    { title: "بناء المدارس", description: "مراكز تعليمية حديثة", icon: Building, color: "from-green-500 to-green-600", stats: "45 مدرسة تم بناؤها" },
    { title: "المساعدات الطبية", description: "رعاية صحية شاملة", icon: Cross, color: "from-red-500 to-red-600", stats: "890 مريض تم علاجه" },
    { title: "المشاريع الصغيرة", description: "دعم الأسر المنتجة", icon: Briefcase, color: "from-purple-500 to-[#4531fc]", stats: "567 مشروع ممول" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-7xl mx-auto flex">
   

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>صندوق دعم الامازيغ</span>
              </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#4531fc] to-blue-700 text-white rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Heart className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">صندوق دعم الأمازيغ</h1>
                  <p className="text-blue-100">يداً بيد نحو مستقبل أفضل للأمة الأمازيغية</p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {supportCards.map((card, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                        <card.icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">{card.title}</CardTitle>
                    <CardDescription className="text-sm mb-2">{card.description}</CardDescription>
                    <p className="text-xs text-gray-500">{card.stats}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Accordion */}
            <div className="bg-white rounded-lg border">
              <Accordion
                type="single"
                collapsible
                value={activeTab}
                onValueChange={(value) => value && setActiveTab(value)}
                className="w-full"
              >
                {/* Definition */}
                <AccordionItem value="definition">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-[#4531fc]" />
                      <span>تعريف بصندوق دعم الامازيغ</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">تعريف بصندوق دعم الامازيغ</h3>
                      <p className="text-gray-700 leading-relaxed">
                        صندوق دعم الأمازيغ هو مبادرة خيرية تهدف إلى توفير الدعم المالي والمعنوي للمحتاجين من الأمازيغ في مختلف المجالات. يسعى الصندوق إلى تعزيز التكافل الاجتماعي وتقديم المساعدة للأسر المحتاجة والطلاب المتفوقين والمرضى الذين يحتاجون إلى رعاية طبية، بالإضافة إلى دعم المشاريع التنموية التي تخدم المجتمع الأمازيغي.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Goals */}
                <AccordionItem value="goals">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>اهداف صندوق دعم الامازيغ</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">أهداف الصندوق</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>توفير منح دراسية للطلاب المتفوقين.</li>
                        <li>بناء وتجهيز مراكز تعليمية.</li>
                        <li>تقديم رعاية صحية مجانية للفئات المحتاجة.</li>
                        <li>دعم المشاريع الصغيرة وتمكين الأسر المنتجة.</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* How to support */}
                <AccordionItem value="how-to-support">
                  <AccordionTrigger className="px-6 py-4 text-right hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <HandHeart className="h-5 w-5 text-[#4531fc]" />
                      <span>كيف تدعم الصندوق؟</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose prose-sm max-w-none text-right bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">طرق الدعم</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>التبرع المالي عبر البطاقة البنكية أو PayPal.</li>
                        <li>الاشتراك في برامج الكفالة الشهرية.</li>
                        <li>التطوع بالوقت والجهد في الفعاليات.</li>
                        <li>نشر التوعية عبر وسائل التواصل الاجتماعي.</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Call to Action */}
            <div className="mt-6 bg-gradient-to-r from-[#4531fc] to-blue-900 text-white rounded-lg p-6 text-center shadow-lg">
              <h2 className="text-xl font-bold mb-2">كن جزءاً من التغيير</h2>
              <p className="text-purple-100 mb-4">مساهمتك الصغيرة قد تغير حياة الكثيرين</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-white text-[#4531fc] font-semibold hover:bg-white hover:text-blue-800 border border-white">
                  تبرع الآن
                </Button>
                <Button size="lg" className="bg-transparent text-white border border-white hover:bg-white hover:text-blue-800">
                  تعرف على المزيد
                </Button>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  )
}
