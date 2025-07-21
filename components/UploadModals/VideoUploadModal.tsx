// components/modals/VideoUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { VideoFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: VideoFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  duration: '',
  quality: '',
  language: ''
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<VideoFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب'
    if (!formData.content.trim()) newErrors.content = 'رابط الفيديو مطلوب'
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
      await submitContent('videos', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error uploading video:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof VideoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-red-600 text-xl text-center">
            رفع فيديو جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">🎥</span>
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
            placeholder="اكتب عنوان الفيديو هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="رابط الفيديو (YouTube, Vimeo, etc.) *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              placeholder="المدة (مثل: 5:30)"
              value={formData.duration}
              onChange={(value) => updateField('duration', value)}
              error={errors.duration}
            />
            <InputField
              placeholder="الجودة (مثل: HD, 4K)"
              value={formData.quality}
              onChange={(value) => updateField('quality', value)}
              error={errors.quality}
            />
            <InputField
              placeholder="اللغة"
              value={formData.language}
              onChange={(value) => updateField('language', value)}
              error={errors.language}
            />
          </div>

          <InputField
            placeholder="رابط صورة مصغرة (اختياري)"
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
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري الرفع...' : 'ارفع الفيديو الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}