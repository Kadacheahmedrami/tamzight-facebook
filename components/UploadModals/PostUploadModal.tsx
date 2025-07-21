// components/modals/PostUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { PostFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface PostUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: PostFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: ''
}

export const PostUploadModal: React.FC<PostUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<PostFormData>(initialFormData)
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
      await submitContent('posts', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof PostFormData, value: string) => {
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
            إنشاء منشور جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📝</span>
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
            placeholder="اكتب عنوان المنشور هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="اكتب محتوى المنشور هنا *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={5}
          />

          <InputField
            placeholder="رابط الصورة (اختياري)"
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
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري النشر...' : 'انشر المنشور الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}