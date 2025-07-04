"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('تم إرسال الرسالة بنجاح!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb - Hidden on mobile since we have the mobile header */}
      <nav className="mb-6 hidden lg:block">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>تواصل معنا</span>
        </div>
      </nav>

      <div className="space-y-6">
        {/* 1. أرسل لنا رسالة - Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#4531fc]">أرسل لنا رسالة</CardTitle>
            <CardDescription>نحن هنا للمساعدة. أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم الكامل</label>
                <Input 
                  name="name"
                  placeholder="اسمك الكامل" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                <Input 
                  name="email"
                  type="email" 
                  placeholder="your@email.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف (اختياري)</label>
                <Input 
                  name="phone"
                  type="tel" 
                  placeholder="+1234567890" 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">نوع الاستفسار</label>
                <select 
                  name="inquiryType"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.inquiryType}
                  onChange={handleInputChange}
                >
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
                <Input 
                  name="subject"
                  placeholder="موضوع رسالتك" 
                  value={formData.subject}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الرسالة</label>
                <Textarea 
                  name="message"
                  placeholder="اكتب رسالتك بالتفصيل هنا..." 
                  rows={6} 
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <Button 
                onClick={handleSubmit}
                className="bg-[#4531fc] hover:bg-blue-900 w-full"
              >
                إرسال الرسالة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. تواصل معنا - Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#4531fc]">تواصل معنا</CardTitle>
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

        {/* 3. الدعم السريع - Quick Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#4531fc]">الدعم السريع</CardTitle>
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

        {/* 4. أوقات الاستجابة المتوقعة - Expected Response Times */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#4531fc]">أوقات الاستجابة المتوقعة</CardTitle>
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
  )
}