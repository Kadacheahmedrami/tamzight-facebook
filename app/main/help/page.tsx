import Sidebar from "@/components/sidebar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function HelpPage() {
  return (

          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>المساعدة والدعم</span>
              </div>
            </nav>

            <div className="space-y-6">
              {/* FAQ Section */}
              <Card>
                <CardHeader>
                  <CardTitle>الأسئلة الشائعة</CardTitle>
                  <CardDescription>إجابات على الأسئلة الأكثر شيوعاً حول استخدام المنصة</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>كيف أقوم بإنشاء حساب جديد؟</AccordionTrigger>
                      <AccordionContent>
                        يمكنك إنشاء حساب جديد بالنقر على زر "التسجيل" في أعلى الصفحة، ثم ملء النموذج بالمعلومات المطلوبة
                        مثل الاسم والبريد الإلكتروني وكلمة المرور.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>كيف أقوم بنشر منشور جديد؟</AccordionTrigger>
                      <AccordionContent>
                        بعد تسجيل الدخول، انقر على مربع "إنشاء منشور جديد" في الصفحة الرئيسية، اكتب محتوى منشورك، اختر
                        القسم المناسب، ثم انقر على "نشر".
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>كيف أقوم بإضافة أصدقاء؟</AccordionTrigger>
                      <AccordionContent>
                        يمكنك البحث عن المستخدمين من خلال شريط البحث، أو زيارة صفحة "الأصدقاء" لرؤية اقتراحات الصداقة
                        وإرسال طلبات صداقة.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                      <AccordionTrigger>كيف أغير كلمة المرور؟</AccordionTrigger>
                      <AccordionContent>
                        اذهب إلى صفحة "الإعدادات" من القائمة الجانبية، ثم اختر "تعديل كلمة المرور"، أدخل كلمة المرور
                        القديمة والجديدة، ثم احفظ التغييرات.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5">
                      <AccordionTrigger>كيف أبلغ عن محتوى غير مناسب؟</AccordionTrigger>
                      <AccordionContent>
                        يمكنك النقر على زر "الإبلاغ" الموجود في كل منشور أو تعليق، أو التواصل معنا مباشرة عبر نموذج
                        الاتصال أدناه.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-6">
                      <AccordionTrigger>كيف أحذف حسابي؟</AccordionTrigger>
                      <AccordionContent>
                        لحذف حسابك، اذهب إلى الإعدادات واختر "حذف الحساب". تأكد من أنك تريد حذف الحساب نهائياً لأن هذا
                        الإجراء لا يمكن التراجع عنه.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-7">
                      <AccordionTrigger>كيف أغير إعدادات الخصوصية؟</AccordionTrigger>
                      <AccordionContent>
                        في صفحة الإعدادات، يمكنك التحكم في من يمكنه رؤية منشوراتك، إرسال رسائل لك، وإعدادات أخرى متعلقة
                        بالخصوصية.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-8">
                      <AccordionTrigger>كيف أرفع صور أو ملفات؟</AccordionTrigger>
                      <AccordionContent>
                        عند إنشاء منشور جديد، انقر على أيقونة "إضافة صورة" أو "إضافة ملف" لرفع المحتوى من جهازك. تأكد من
                        أن الملفات تتوافق مع سياسة المنصة.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>تواصل معنا</CardTitle>
                  <CardDescription>لم تجد إجابة لسؤالك؟ تواصل معنا مباشرة</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">الاسم</label>
                        <Input placeholder="اسمك الكامل" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">موضوع الرسالة</label>
                      <Input placeholder="موضوع استفسارك" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الرسالة</label>
                      <Textarea placeholder="اكتب رسالتك هنا..." rows={5} />
                    </div>
                    <Button type="submit" className="bg-[#4531fc] hover:bg-blue-800  w-full">
                      إرسال الرسالة
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Help */}
              <Card>
                <CardHeader>
                  <CardTitle>مساعدة سريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">دليل المبتدئين</h3>
                      <p className="text-sm text-gray-600 mb-3">تعلم كيفية استخدام المنصة خطوة بخطوة</p>
                      <Button variant="outline" size="sm">
                        اقرأ الدليل
                      </Button>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">قواعد المجتمع</h3>
                      <p className="text-sm text-gray-600 mb-3">تعرف على قواعد وآداب استخدام المنصة</p>
                      <Button variant="outline" size="sm">
                        اقرأ القواعد
                      </Button>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">تقرير مشكلة</h3>
                      <p className="text-sm text-gray-600 mb-3">أبلغ عن مشكلة تقنية أو خطأ في الموقع</p>
                      <Button variant="outline" size="sm">
                        أبلغ عن مشكلة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
  

    
  )
}
