"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormValidator } from './FormValidator'

export type ContentType = 'posts' | 'books' | 'ideas' | 'images' | 'videos' | 'truths' | 'questions' | 'ads' | 'products'

export interface FormData {
  title: string
  content: string
  category: string
  subcategory: string
  image: string
  // Book specific
  pages: string
  language: string
  isbn: string
  // Idea specific
  status: string
  priority: string
  // Image specific
  description: string
  location: string
  resolution: string
  tags: string
  // Video specific
  duration: string
  quality: string
  // Ad specific
  targetAmount: string
  currentAmount: string
  deadline: string
  // Product specific
  price: string
  currency: string
  inStock: boolean
  sizes: string
  colors: string
  // Question specific
  type: string
}

const initialFormData: FormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  pages: '',
  language: '',
  isbn: '',
  status: '',
  priority: '',
  description: '',
  location: '',
  resolution: '',
  tags: '',
  duration: '',
  quality: '',
  targetAmount: '',
  currentAmount: '',
  deadline: '',
  price: '',
  currency: 'دينار ليبي',
  inStock: true,
  sizes: '',
  colors: '',
  type: ''
}

const contentTypeLabels = {
  posts: 'منشور',
  books: 'كتاب',
  ideas: 'فكرة',
  images: 'صورة',
  videos: 'فيديو',
  truths: 'حقيقة',
  questions: 'سؤال',
  ads: 'إعلان',
  products: 'منتج'
}

export default function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [contentType, setContentType] = useState<ContentType>('posts')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setContentType('posts')
    setValidationErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setValidationErrors({})

    // Validate and assemble data
    const validationResult = FormValidator.validateAndAssemble(contentType, formData)

    if (!validationResult.isValid) {
      // Convert validation errors to display format
      const errorMap: {[key: string]: string} = {}
      validationResult.errors.forEach(error => {
        errorMap[error.field] = error.message
      })
      setValidationErrors(errorMap)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/main/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: contentType,
          data: validationResult.data
        })
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Content created successfully:', result)
        setIsOpen(false)
        resetForm()
        // You can add success notification here
      } else {
        console.error('Error creating content:', result)
        // Handle validation errors from server
        if (result.details) {
          console.error('Server validation errors:', result.details)
          // You can set server validation errors here if needed
        }
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderError = (field: string) => {
    if (validationErrors[field]) {
      return <p className="text-red-500 text-xs mt-1">{validationErrors[field]}</p>
    }
    return null
  }

  const renderSpecificFields = () => {
    switch (contentType) {
      case 'books':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="عدد الصفحات"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('pages')}
              </div>
              <div>
                <Input
                  placeholder="اللغة"
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('language')}
              </div>
            </div>
            <div>
              <Input
                placeholder="ISBN (اختياري)"
                value={formData.isbn}
                onChange={(e) => handleInputChange('isbn', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('isbn')}
            </div>
          </>
        )

      case 'ideas':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="حالة الفكرة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  <SelectItem value="مقبولة">مقبولة</SelectItem>
                  <SelectItem value="مرفوضة">مرفوضة</SelectItem>
                  <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                </SelectContent>
              </Select>
              {renderError('status')}
            </div>
            <div>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                  <SelectItem value="متوسطة">متوسطة</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                </SelectContent>
              </Select>
              {renderError('priority')}
            </div>
          </div>
        )

      case 'images':
        return (
          <>
            <div>
              <Input
                placeholder="رابط الصورة *"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="form-input-mobile"
                required
              />
              {renderError('image')}
            </div>
            <div>
              <Textarea
                placeholder="وصف الصورة *"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="form-input-mobile resize-none"
                required
              />
              {renderError('description')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="الموقع"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('location')}
              </div>
              <div>
                <Input
                  placeholder="الدقة (مثل: 1920x1080)"
                  value={formData.resolution}
                  onChange={(e) => handleInputChange('resolution', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('resolution')}
              </div>
            </div>
            <div>
              <Input
                placeholder="العلامات (مفصولة بفواصل)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('tags')}
            </div>
          </>
        )

      case 'videos':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                placeholder="المدة (HH:MM:SS)"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('duration')}
            </div>
            <div>
              <Input
                placeholder="الجودة"
                value={formData.quality}
                onChange={(e) => handleInputChange('quality', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('quality')}
            </div>
            <div>
              <Input
                placeholder="اللغة"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('language')}
            </div>
          </div>
        )

      case 'ads':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="المبلغ المطلوب"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('targetAmount')}
              </div>
              <div>
                <Input
                  placeholder="المبلغ الحالي"
                  type="number"
                  value={formData.currentAmount}
                  onChange={(e) => handleInputChange('currentAmount', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('currentAmount')}
              </div>
            </div>
            <div>
              <Input
                placeholder="تاريخ الانتهاء"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('deadline')}
            </div>
          </>
        )

      case 'products':
        return (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="السعر *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="form-input-mobile"
                  required
                />
                {renderError('price')}
              </div>
              <div>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="العملة *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دينار ليبي">دينار ليبي</SelectItem>
                    <SelectItem value="دولار">دولار</SelectItem>
                    <SelectItem value="يورو">يورو</SelectItem>
                  </SelectContent>
                </Select>
                {renderError('currency')}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="الأحجام (مفصولة بفواصل)"
                  value={formData.sizes}
                  onChange={(e) => handleInputChange('sizes', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('sizes')}
              </div>
              <div>
                <Input
                  placeholder="الألوان (مفصولة بفواصل)"
                  value={formData.colors}
                  onChange={(e) => handleInputChange('colors', e.target.value)}
                  className="form-input-mobile"
                />
                {renderError('colors')}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(value) => handleInputChange('inStock', value)}
              />
              <Label htmlFor="inStock">متوفر في المخزون</Label>
            </div>
          </>
        )

      case 'questions':
        return (
          <div>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="نوع السؤال" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="يحتاج إجابة">يحتاج إجابة</SelectItem>
                <SelectItem value="استطلاع رأي">استطلاع رأي</SelectItem>
                <SelectItem value="نقاش">نقاش</SelectItem>
              </SelectContent>
            </Select>
            {renderError('type')}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="post-card mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
            <Input
              placeholder="إنشاء محتوى جديد ونشره في هذا القسم"
              className="flex-1 cursor-pointer text-sm sm:text-base"
              readOnly
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#4531fc] mx-auto text-lg sm:text-xl">
            إنشاء {contentTypeLabels[contentType]} جديد
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
            <div>
              <p className="font-medium text-sm sm:text-base">سيبتموس الليبي</p>
              <p className="text-xs sm:text-sm text-gray-500">من ليبيا</p>
            </div>
          </div>

          {/* Content Type Selection */}
          <Tabs value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 h-auto">
              <TabsTrigger value="posts" className="text-xs sm:text-sm">منشور</TabsTrigger>
              <TabsTrigger value="books" className="text-xs sm:text-sm">كتاب</TabsTrigger>
              <TabsTrigger value="ideas" className="text-xs sm:text-sm">فكرة</TabsTrigger>
              <TabsTrigger value="images" className="text-xs sm:text-sm">صورة</TabsTrigger>
              <TabsTrigger value="videos" className="text-xs sm:text-sm">فيديو</TabsTrigger>
              <TabsTrigger value="truths" className="text-xs sm:text-sm">حقيقة</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs sm:text-sm">سؤال</TabsTrigger>
              <TabsTrigger value="ads" className="text-xs sm:text-sm">إعلان</TabsTrigger>
              <TabsTrigger value="products" className="text-xs sm:text-sm">منتج</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختار قسم رئيسي *" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الأمة الأمازيغية">الأمة الأمازيغية</SelectItem>
                  <SelectItem value="اللغة الأمازيغية">اللغة الأمازيغية</SelectItem>
                  <SelectItem value="شخصيات امازيغية">شخصيات امازيغية</SelectItem>
                  <SelectItem value="الحضارة الأمازيغية">الحضارة الأمازيغية</SelectItem>
                  <SelectItem value="الفن الأمازيغي">الفن الأمازيغي</SelectItem>
                  <SelectItem value="اللباس الأمازيغي">اللباس الأمازيغي</SelectItem>
                  <SelectItem value="الاكل الأمازيغي">الاكل الأمازيغي</SelectItem>
                  <SelectItem value="الحرف الامازيغية">الحرف الامازيغية</SelectItem>
                </SelectContent>
              </Select>
              {renderError('category')}
            </div>

            <div>
              <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختار قسم فرعي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تعريف">تعريف</SelectItem>
                  <SelectItem value="تاريخ">تاريخ</SelectItem>
                  <SelectItem value="أصل">أصل</SelectItem>
                  <SelectItem value="ثقافة">ثقافة</SelectItem>
                </SelectContent>
              </Select>
              {renderError('subcategory')}
            </div>
          </div>

          {/* Common Fields */}
          <div>
            <Input
              placeholder="اكتب العنوان هنا *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="form-input-mobile"
              required
            />
            {renderError('title')}
          </div>

          {contentType !== 'images' && (
            <div>
              <Textarea
                placeholder="أكتب المحتوى هنا *"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
                className="form-input-mobile resize-none"
                required={contentType !== 'images'}
              />
              {renderError('content')}
            </div>
          )}

          {/* Image URL for non-image content */}
          {contentType !== 'images' && (
            <div>
              <Input
                placeholder="رابط الصورة (اختياري)"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                className="form-input-mobile"
              />
              {renderError('image')}
            </div>
          )}

          {/* Content Type Specific Fields */}
          {renderSpecificFields()}

          {/* Media Upload Options */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">أضف للمحتوى:</span>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <i className="fa fa-image text-xs sm:text-sm mr-1"></i>
                صورة
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <i className="fa fa-file-upload text-xs sm:text-sm mr-1"></i>
                ملف
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-xs sm:text-sm bg-transparent">
                <i className="fa fa-video text-xs sm:text-sm mr-1"></i>
                فيديو
              </Button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="touch-target bg-transparent"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              className="bg-[#4531fc] hover:bg-blue-800 touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري النشر...' : `انشر ${contentTypeLabels[contentType]} الآن`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}