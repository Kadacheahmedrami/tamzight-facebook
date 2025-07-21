// components/modals/AdUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { AdFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface AdUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: AdFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  targetAmount: '',
  currentAmount: '',
  deadline: ''
}

export const AdUploadModal: React.FC<AdUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<AdFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'العنوان مطلوب'
    if (!formData.content.trim()) newErrors.content = 'وصف الإعلان مطلوب'
    if (!formData.category) newErrors.category = 'القسم الرئيسي مطلوب'
    if (!formData.targetAmount.trim()) newErrors.targetAmount = 'المبلغ المطلوب مطلوب'
    
    // Validate that target amount is a positive number
    if (formData.targetAmount && isNaN(Number(formData.targetAmount))) {
      newErrors.targetAmount = 'يجب أن يكون المبلغ رقماً صحيحاً'
    } else if (formData.targetAmount && Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'يجب أن يكون المبلغ أكبر من صفر'
    }
    
    // Validate current amount if provided
    if (formData.currentAmount && isNaN(Number(formData.currentAmount))) {
      newErrors.currentAmount = 'يجب أن يكون المبلغ رقماً صحيحاً'
    } else if (formData.currentAmount && Number(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'يجب أن يكون المبلغ أكبر من أو يساوي صفر'
    }
    
    // Validate deadline if provided
    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'يجب أن يكون آخر موعد في المستقبل'
    }
    
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
      await submitContent('ads', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating ad:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof AdFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Calculate progress percentage
  const progressPercentage = formData.targetAmount && formData.currentAmount 
    ? Math.min(100, (Number(formData.currentAmount) / Number(formData.targetAmount)) * 100)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pink-600 text-xl text-center">
            إنشاء إعلان جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 text-sm">📢</span>
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
            placeholder="اكتب عنوان الإعلان هنا *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="اكتب وصف الإعلان والغرض منه *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={4}
          />

// Replace the problematic InputField components in AdUploadModal.tsx

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <InputField
    placeholder="المبلغ المطلوب *"
    type="number"
    // Remove min="1" line
    value={formData.targetAmount}
    onChange={(value) => updateField('targetAmount', value)}
    error={errors.targetAmount}
    required
  />
  <InputField
    placeholder="المبلغ المتوفر حالياً"
    type="number"
    // Remove min="0" line
    value={formData.currentAmount}
    onChange={(value) => updateField('currentAmount', value)}
    error={errors.currentAmount}
  />
</div>

{/* Progress bar preview - no changes needed */}

<InputField
  placeholder="آخر موعد للتبرع"
  type="date"
  // Remove min={new Date().toISOString().split('T')[0]} line
  value={formData.deadline}
  onChange={(value) => updateField('deadline', value)}
  error={errors.deadline}
/>

          <InputField
            placeholder="رابط صورة الإعلان (اختياري)"
            type="url"
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
              className="bg-pink-600 hover:bg-pink-700"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'جاري النشر...' : 'انشر الإعلان الآن'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}