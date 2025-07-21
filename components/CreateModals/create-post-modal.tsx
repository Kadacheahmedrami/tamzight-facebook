"use client"

import React, { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ContentType = 'posts' | 'books' | 'ideas' | 'images' | 'videos' | 'truths' | 'questions' | 'ads' | 'products'

interface FormData {
  title: string
  content: string
  category: string
  subcategory: string
  image: string
  pages: string
  language: string
  isbn: string
  status: string
  priority: string
  description: string
  location: string
  resolution: string
  tags: string
  duration: string
  quality: string
  targetAmount: string
  currentAmount: string
  deadline: string
  price: string
  currency: string
  inStock: boolean
  sizes: string
  colors: string
  type: string
}

interface InputFieldProps {
  field: keyof FormData
  value: string
  handleInputChange: (field: keyof FormData, value: string | boolean) => void
  error: string | null
  placeholder?: string
  type?: string
  required?: boolean
}

interface TextareaFieldProps {
  field: keyof FormData
  value: string
  handleInputChange: (field: keyof FormData, value: string | boolean) => void
  error: string | null
  placeholder?: string
  required?: boolean
  rows?: number
}

interface SelectFieldProps {
  options: string[]
  placeholder: string
  field: keyof FormData
  value: string
  handleInputChange: (field: keyof FormData, value: string | boolean) => void
  error: string | null
}

interface ContentFieldsProps {
  contentType: ContentType
  formData: FormData
  handleInputChange: (field: keyof FormData, value: string | boolean) => void
  renderError: (field: string) => string | null
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

const contentTypeLabels: Record<ContentType, string> = {
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

const categoryOptions = [
  "الأمة الأمازيغية", "اللغة الأمازيغية", "شخصيات امازيغية",
  "الحضارة الأمازيغية", "الفن الأمازيغي", "اللباس الأمازيغي",
  "الاكل الأمازيغي", "الحرف الامازيغية"
]

const subcategoryOptions = ["تعريف", "تاريخ", "أصل", "ثقافة"]

// Simple validation function
const validateForm = (contentType: ContentType, formData: FormData) => {
  const errors: Record<string, string> = {}
  
  if (!formData.title.trim()) errors.title = 'العنوان مطلوب'
  if (!formData.category) errors.category = 'القسم الرئيسي مطلوب'
  
  if (contentType !== 'images' && !formData.content.trim()) {
    errors.content = 'المحتوى مطلوب'
  }
  
  if (contentType === 'images') {
    if (!formData.image.trim()) errors.image = 'رابط الصورة مطلوب'
    if (!formData.description.trim()) errors.description = 'وصف الصورة مطلوب'
  }
  
  if (contentType === 'products' && !formData.price.trim()) {
    errors.price = 'السعر مطلوب'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

const InputField: React.FC<InputFieldProps> = ({ field, value, handleInputChange, error, ...props }) => (
  <div>
    <Input
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value)}
      className="text-sm"
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

const TextareaField: React.FC<TextareaFieldProps> = ({ field, value, handleInputChange, error, ...props }) => (
  <div>
    <Textarea
      value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(field, e.target.value)}
      className="text-sm resize-none"
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

const SelectField: React.FC<SelectFieldProps> = ({ options, placeholder, field, value, handleInputChange, error }) => (
  <div>
    <Select value={value} onValueChange={(value: string) => handleInputChange(field, value)}>
      <SelectTrigger className="text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: string) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
)

const ContentFields: React.FC<ContentFieldsProps> = ({ contentType, formData, handleInputChange, renderError }) => {
  switch (contentType) {
    case 'books':
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="عدد الصفحات"
              type="number"
              field="pages"
              value={formData.pages}
              handleInputChange={handleInputChange}
              error={renderError('pages')}
            />
            <InputField
              placeholder="اللغة"
              field="language"
              value={formData.language}
              handleInputChange={handleInputChange}
              error={renderError('language')}
            />
          </div>
          <InputField
            placeholder="ISBN (اختياري)"
            field="isbn"
            value={formData.isbn}
            handleInputChange={handleInputChange}
            error={renderError('isbn')}
          />
        </>
      )
    
    case 'ideas':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SelectField
            options={["قيد المراجعة", "مقبولة", "مرفوضة", "قيد التنفيذ"]}
            placeholder="حالة الفكرة"
            field="status"
            value={formData.status}
            handleInputChange={handleInputChange}
            error={renderError('status')}
          />
          <SelectField
            options={["منخفضة", "متوسطة", "عالية"]}
            placeholder="الأولوية"
            field="priority"
            value={formData.priority}
            handleInputChange={handleInputChange}
            error={renderError('priority')}
          />
        </div>
      )
    
    case 'images':
      return (
        <>
          <InputField
            placeholder="رابط الصورة *"
            field="image"
            value={formData.image}
            handleInputChange={handleInputChange}
            required
            error={renderError('image')}
          />
          <TextareaField
            placeholder="وصف الصورة *"
            field="description"
            value={formData.description}
            handleInputChange={handleInputChange}
            required
            error={renderError('description')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="الموقع"
              field="location"
              value={formData.location}
              handleInputChange={handleInputChange}
              error={renderError('location')}
            />
            <InputField
              placeholder="الدقة (مثل: 1920x1080)"
              field="resolution"
              value={formData.resolution}
              handleInputChange={handleInputChange}
              error={renderError('resolution')}
            />
          </div>
          <InputField
            placeholder="العلامات (مفصولة بفواصل)"
            field="tags"
            value={formData.tags}
            handleInputChange={handleInputChange}
            error={renderError('tags')}
          />
        </>
      )
    
    case 'videos':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InputField
            placeholder="المدة (HH:MM:SS)"
            field="duration"
            value={formData.duration}
            handleInputChange={handleInputChange}
            error={renderError('duration')}
          />
          <InputField
            placeholder="الجودة"
            field="quality"
            value={formData.quality}
            handleInputChange={handleInputChange}
            error={renderError('quality')}
          />
          <InputField
            placeholder="اللغة"
            field="language"
            value={formData.language}
            handleInputChange={handleInputChange}
            error={renderError('language')}
          />
        </div>
      )
    
    case 'ads':
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="المبلغ المطلوب"
              type="number"
              field="targetAmount"
              value={formData.targetAmount}
              handleInputChange={handleInputChange}
              error={renderError('targetAmount')}
            />
            <InputField
              placeholder="المبلغ الحالي"
              type="number"
              field="currentAmount"
              value={formData.currentAmount}
              handleInputChange={handleInputChange}
              error={renderError('currentAmount')}
            />
          </div>
          <InputField
            placeholder="تاريخ الانتهاء"
            type="date"
            field="deadline"
            value={formData.deadline}
            handleInputChange={handleInputChange}
            error={renderError('deadline')}
          />
        </>
      )
    
    case 'products':
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="السعر *"
              type="number"
              field="price"
              value={formData.price}
              handleInputChange={handleInputChange}
              required
              error={renderError('price')}
            />
            <SelectField
              options={["دينار ليبي", "دولار", "يورو"]}
              placeholder="العملة *"
              field="currency"
              value={formData.currency}
              handleInputChange={handleInputChange}
              error={renderError('currency')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              placeholder="الأحجام (مفصولة بفواصل)"
              field="sizes"
              value={formData.sizes}
              handleInputChange={handleInputChange}
              error={renderError('sizes')}
            />
            <InputField
              placeholder="الألوان (مفصولة بفواصل)"
              field="colors"
              value={formData.colors}
              handleInputChange={handleInputChange}
              error={renderError('colors')}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(value: boolean) => handleInputChange('inStock', value)}
            />
            <Label htmlFor="inStock">متوفر في المخزون</Label>
          </div>
        </>
      )
    
    case 'questions':
      return (
        <SelectField
          options={["يحتاج إجابة", "استطلاع رأي", "نقاش"]}
          placeholder="نوع السؤال"
          field="type"
          value={formData.type}
          handleInputChange={handleInputChange}
          error={renderError('type')}
        />
      )
    
    default:
      return null
  }
}

export default function CreatePostModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [contentType, setContentType] = useState<ContentType>('posts')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [validationErrors])

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setContentType('posts')
    setValidationErrors({})
  }, [])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const validation = validateForm(contentType, formData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/main/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: contentType, data: formData })
      })

      if (response.ok) {
        setIsOpen(false)
        resetForm()
      } else {
        console.error('Error creating content:', await response.json())
      }
    } catch (error) {
      console.error('Network error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderError = (field: string) => validationErrors[field] || null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="border rounded-lg p-4 mb-4 cursor-pointer hover:bg-gray-50 transition-colors">
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
          <DialogTitle className="text-blue-600 mx-auto text-lg sm:text-xl">
            إنشاء {contentTypeLabels[contentType]} جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full"></div>
            <div>
              <p className="font-medium text-sm sm:text-base">سيبتموس الليبي</p>
              <p className="text-xs sm:text-sm text-gray-500">من ليبيا</p>
            </div>
          </div>

          <Tabs value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1 h-auto">
              {Object.entries(contentTypeLabels).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectField
              options={categoryOptions}
              placeholder="اختار قسم رئيسي *"
              field="category"
              value={formData.category}
              handleInputChange={handleInputChange}
              error={renderError('category')}
            />
            <SelectField
              options={subcategoryOptions}
              placeholder="اختار قسم فرعي"
              field="subcategory"
              value={formData.subcategory}
              handleInputChange={handleInputChange}
              error={renderError('subcategory')}
            />
          </div>

          <InputField
            placeholder="اكتب العنوان هنا *"
            field="title"
            value={formData.title}
            handleInputChange={handleInputChange}
            required
            error={renderError('title')}
          />

          {contentType !== 'images' && (
            <TextareaField
              placeholder="أكتب المحتوى هنا *"
              field="content"
              value={formData.content}
              handleInputChange={handleInputChange}
              required={contentType !== 'images'}
              rows={4}
              error={renderError('content')}
            />
          )}

          {contentType !== 'images' && (
            <InputField
              placeholder="رابط الصورة (اختياري)"
              field="image"
              value={formData.image}
              handleInputChange={handleInputChange}
              error={renderError('image')}
            />
          )}

          <ContentFields 
            contentType={contentType}
            formData={formData}
            handleInputChange={handleInputChange}
            renderError={renderError}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-transparent"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري النشر...' : `انشر ${contentTypeLabels[contentType]} الآن`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}