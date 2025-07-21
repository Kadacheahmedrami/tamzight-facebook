// components/modals/BookUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { BookFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface BookUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: BookFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  pages: '',
  language: '',
  isbn: ''
}

export const BookUploadModal: React.FC<BookUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<BookFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب'
    if (!formData.content.trim()) newErrors.content = 'المحتوى مطلوب'
    if (!formData.category) newErrors.category = 'القسم الرئيسي مطلوب'
    
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
      await submitContent('books', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating book:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof BookFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-600 text-xl text-center">
            إنشاء كتاب جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">📚</span>
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
            placeholder="اكتب عنوان الكتاب هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="اكتب وصف أو محتوى الكتاب هنا *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              placeholder="عدد الصفحات"
              type="number"
              value={formData.pages}
              onChange={(value) => updateField('pages', value)}
              error={errors.pages}
            />
            <InputField
              placeholder="اللغة"
              value={formData.language}
              onChange={(value) => updateField('language', value)}
              error={errors.language}
            />
          </div>

          <InputField
            placeholder="ISBN (اختياري)"
            value={formData.isbn}
            onChange={(value) => updateField('isbn', value)}
            error={errors.isbn}
          />

          <InputField
            placeholder="رابط صورة الغلاف (اختياري)"
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
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري النشر...' : 'انشر الكتاب الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}