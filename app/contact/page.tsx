import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { MobileSidebar } from "@/components/MobileSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        title="تواصل معنا" 
        description="نحن هنا للمساعدة والإجابة على استفساراتك"
      />
      
      <div className="max-w-7xl mx-auto flex">
        {/* Left Sidebar - Main Navigation - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb - Hidden on mobile since we have the mobile header */}
            <nav className="mb-6 hidden lg:block">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>تواصل معنا</span>
              </div>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>أرسل لنا رسالة</CardTitle>
                  <CardDescription>نحن هنا للمساعدة. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                      <Input placeholder="اسمك الكامل" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                      <Input type="email" placeholder="your@email.com" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">رقم الهاتف (اختياري)</label>
                      <Input type="tel" placeholder="+1234567890" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">نوع الاستفسار</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="">اختر نوع الاستفسار</option>
                        <option value="technical">مشكلة تقنية</option>
                        <option value="account">مشكلة في الحساب</option>
                        <option value="content">محتوى غير مناسب</option>
                        <option value="suggestion">اقتراح</option>
                        <option value="partnership">شراكة</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">موضوع الرسالة</label>
                      <Input placeholder="موضوع رسالتك" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الرسالة</label>
                      <Textarea placeholder="اكتب رسالتك بالتفصيل هنا..." rows={6} required />
                    </div>
                    <Button type="submit" className="w-full">
                      إرسال الرسالة
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات التواصل</CardTitle>
                    <CardDescription>يمكنك التواصل معنا من خلال الطرق التالية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">البريد الإلكتروني</p>
                        <p className="text-gray-600">info@tamazight-platform.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">الهاتف</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">العنوان</p>
                        <p className="text-gray-600">شمال أفريقيا</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">ساعات العمل</p>
                        <p className="text-gray-600">الأحد - الخميس: 9:00 - 17:00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>الدعم السريع</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      دعم تقني فوري
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Phone className="h-4 w-4 mr-2" />
                      اتصل بنا الآن
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <MapPin className="h-4 w-4 mr-2" />
                      مركز المساعدة
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>أوقات الاستجابة المتوقعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>الاستفسارات العامة:</span>
                        <span className="text-gray-600">24-48 ساعة</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المشاكل التقنية:</span>
                        <span className="text-gray-600">2-6 ساعات</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الطوارئ:</span>
                        <span className="text-gray-600">فوري</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Ads - Hidden on mobile */}
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