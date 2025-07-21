// components/modals/ImageUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { ImageFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: ImageFormData = {
  title: '',
  category: '',
  subcategory: '',
  image: '',
  description: '',
  location: '',
  resolution: '',
  tags: ''
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ImageFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب'
    if (!formData.image.trim()) newErrors.image = 'رابط الصورة مطلوب'
    if (!formData.description.trim()) newErrors.description = 'وصف الصورة مطلوب'
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
      await submitContent('images', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof ImageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-600 text-xl text-center">
            رفع صورة جديدة
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">🖼️</span>
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
            placeholder="اكتب عنوان الصورة هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <InputField
            placeholder="رابط الصورة *"
            value={formData.image}
            onChange={(value) => updateField('image', value)}
            error={errors.image}
            required
          />

          <TextareaField
            placeholder="وصف الصورة *"
            value={formData.description}
            onChange={(value) => updateField('description', value)}
            error={errors.description}
            required
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              placeholder="الموقع"
              value={formData.location}
              onChange={(value) => updateField('location', value)}
              error={errors.location}
            />
            <InputField
              placeholder="الدقة (مثل: 1920x1080)"
              value={formData.resolution}
              onChange={(value) => updateField('resolution', value)}
              error={errors.resolution}
            />
          </div>

          <InputField
            placeholder="العلامات (مفصولة بفواصل)"
            value={formData.tags}
            onChange={(value) => updateField('tags', value)}
            error={errors.tags}
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
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري الرفع...' : 'ارفع الصورة الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}