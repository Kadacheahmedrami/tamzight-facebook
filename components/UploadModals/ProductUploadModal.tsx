// components/modals/ProductUploadModal.tsx
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InputField, TextareaField, BaseModalHeader, CategorySelectors } from "./shared/FormComponents"
import { ProductFormData } from "./shared/types"
import { categoryOptions, subcategoryOptions } from "./shared/constants"
import { submitContent } from "./shared/utils"

interface ProductUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const initialFormData: ProductFormData = {
  title: '',
  content: '',
  category: '',
  subcategory: '',
  image: '',
  price: '',
  currency: 'DZD',
  inStock: true,
  sizes: '',
  colors: ''
}

const currencyOptions = [
  { value: 'DZD', label: 'دينار جزائري (DZD)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
  { value: 'MAD', label: 'درهم مغربي (MAD)' },
  { value: 'TND', label: 'دينار تونسي (TND)' }
]

export const ProductUploadModal: React.FC<ProductUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'اسم المنتج مطلوب'
    if (!formData.content.trim()) newErrors.content = 'وصف المنتج مطلوب'
    if (!formData.category) newErrors.category = 'القسم الرئيسي مطلوب'
    if (!formData.price.trim()) newErrors.price = 'السعر مطلوب'
    if (formData.price && isNaN(Number(formData.price))) newErrors.price = 'يجب أن يكون السعر رقماً صالحاً'
    
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
      await submitContent('products', formData)
      resetForm()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
  }

  const updateField = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-green-600 text-xl text-center">
            إضافة منتج جديد
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <BaseModalHeader>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🛍️</span>
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
            placeholder="اسم المنتج *"
            value={formData.title}
            onChange={(value) => updateField('title', value)}
            error={errors.title}
            required
          />

          <TextareaField
            placeholder="وصف المنتج والتفاصيل *"
            value={formData.content}
            onChange={(value) => updateField('content', value)}
            error={errors.content}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              placeholder="السعر *"
              value={formData.price}
              onChange={(value) => updateField('price', value)}
              error={errors.price}
              required
              type="number"
            />

            <div className="space-y-1">
              <select
                value={formData.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-right"
                dir="rtl"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => updateField('inStock', e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">متوفر في المخزون</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              placeholder="الأحجام المتاحة (مثال: S, M, L, XL)"
              value={formData.sizes}
              onChange={(value) => updateField('sizes', value)}
              error={errors.sizes}
            />

            <InputField
              placeholder="الألوان المتاحة (مثال: أحمر, أزرق, أخضر)"
              value={formData.colors}
              onChange={(value) => updateField('colors', value)}
              error={errors.colors}
            />
          </div>

          <InputField
            placeholder="رابط صورة المنتج (اختياري)"
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
              {isSubmitting ? 'جاري الحفظ...' : 'أضف المنتج'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}