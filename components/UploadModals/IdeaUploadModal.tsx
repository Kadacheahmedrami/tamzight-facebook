// components/modals/IdeaUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IdeaFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface IdeaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: IdeaFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  status: '',
  priority: ''
}

const statusOptions = ["جديدة", "قيد التطوير", "مكتملة", "مؤجلة", "ملغية"]
const priorityOptions = ["منخفضة", "متوسطة", "عالية", "عاجلة"]

export const IdeaUploadModal: React.FC<IdeaUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<IdeaFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب'
    if (!formData.content.trim()) newErrors.content = 'المحتوى مطلوب'
    if (!formData.category) newErrors.category = 'القسم الرئيسي مطلوب'
    if (!formData.status) newErrors.status = 'الحالة مطلوبة'
    if (!formData.priority) newErrors.priority = 'الأولوية مطلوبة'
    
    return newErrors
  }

  const handleSubmit = async () => {
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await submitContent('ideas', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating idea:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof IdeaFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-yellow-600 text-xl text-center">
            إضافة فكرة جديدة
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">💡</span>
            </div>
          </BaseModalHeader>

          <CategorySelectors
            category={formData.category}
            subcategory={formData.subcategory}
            onCategoryChange={(value) => updateField('category', value)}
            onSubcategoryChange={(value) => updateField('subcategory', value)}
            categoryError={errors.category}
            categoryOptions={categoryOptions}
            subcategoryOptions={subcategoryOptions}
          />

          <InputField
            placeholder="اكتب عنوان الفكرة هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="اكتب تفاصيل الفكرة هنا *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700">الحالة *</label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger className={`h-12 ${errors.status ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-700">الأولوية *</label>
              <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                <SelectTrigger className={`h-12 ${errors.priority ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
            </div>
          </div>

          <InputField
            placeholder="رابط صورة توضيحية (اختياري)"
            value={formData.image}
            onChange={(value) => updateField('image', value)}
            error={errors.image}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button 
              type="button"
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'احفظ الفكرة الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}