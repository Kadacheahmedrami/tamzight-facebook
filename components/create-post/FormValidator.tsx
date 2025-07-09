import type { ContentType, FormData } from './types'

interface ValidationError {
  field: string
  message: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  data: any
}

export class FormValidator {
  private static validateCommonFields(formData: FormData): ValidationError[] {
    const errors: ValidationError[] = []

    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'العنوان مطلوب' })
    }

    if (!formData.category) {
      errors.push({ field: 'category', message: 'القسم الرئيسي مطلوب' })
    }

    return errors
  }

  private static validateContentTypeFields(contentType: ContentType, formData: FormData): ValidationError[] {
    const errors: ValidationError[] = []

    switch (contentType) {
      case 'posts':
      case 'truths':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        break

      case 'books':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        if (formData.pages && isNaN(Number(formData.pages))) {
          errors.push({ field: 'pages', message: 'عدد الصفحات يجب أن يكون رقماً' })
        }
        break

      case 'ideas':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        break

      case 'images':
        if (!formData.image.trim()) {
          errors.push({ field: 'image', message: 'رابط الصورة مطلوب' })
        }
        if (!formData.description.trim()) {
          errors.push({ field: 'description', message: 'وصف الصورة مطلوب' })
        }
        // Validate URL format
        if (formData.image && !this.isValidUrl(formData.image)) {
          errors.push({ field: 'image', message: 'رابط الصورة غير صحيح' })
        }
        break

      case 'videos':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        // Validate duration format (HH:MM:SS)
        if (formData.duration && !this.isValidDuration(formData.duration)) {
          errors.push({ field: 'duration', message: 'تنسيق المدة غير صحيح (HH:MM:SS)' })
        }
        break

      case 'questions':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        break

      case 'ads':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        if (formData.targetAmount && isNaN(Number(formData.targetAmount))) {
          errors.push({ field: 'targetAmount', message: 'المبلغ المطلوب يجب أن يكون رقماً' })
        }
        if (formData.currentAmount && isNaN(Number(formData.currentAmount))) {
          errors.push({ field: 'currentAmount', message: 'المبلغ الحالي يجب أن يكون رقماً' })
        }
        if (formData.deadline && !this.isValidDate(formData.deadline)) {
          errors.push({ field: 'deadline', message: 'تاريخ الانتهاء غير صحيح' })
        }
        break

      case 'products':
        if (!formData.content.trim()) {
          errors.push({ field: 'content', message: 'المحتوى مطلوب' })
        }
        if (!formData.price.trim()) {
          errors.push({ field: 'price', message: 'السعر مطلوب' })
        }
        if (formData.price && isNaN(Number(formData.price))) {
          errors.push({ field: 'price', message: 'السعر يجب أن يكون رقماً' })
        }
        if (Number(formData.price) <= 0) {
          errors.push({ field: 'price', message: 'السعر يجب أن يكون أكبر من صفر' })
        }
        break
    }

    return errors
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private static isValidDuration(duration: string): boolean {
    const durationRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/
    return durationRegex.test(duration)
  }

  private static isValidDate(date: string): boolean {
    const dateObj = new Date(date)
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
  }

  private static assembleRequestData(contentType: ContentType, formData: FormData): any {
    const baseData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      subcategory: formData.subcategory || null,
      image: formData.image || null,
    }

    switch (contentType) {
      case 'books':
        return {
          ...baseData,
          pages: formData.pages ? Number(formData.pages) : null,
          language: formData.language || null,
          isbn: formData.isbn || null,
        }

      case 'ideas':
        return {
          ...baseData,
          status: formData.status || 'قيد المراجعة',
          priority: formData.priority || 'متوسطة',
        }

      case 'images':
        return {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          subcategory: formData.subcategory || null,
          image: formData.image,
          location: formData.location || null,
          resolution: formData.resolution || null,
          tags: Array.isArray(formData.tags) ? formData.tags : 
                (formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []),
        }

      case 'videos':
        return {
          ...baseData,
          duration: formData.duration || null,
          quality: formData.quality || null,
          language: formData.language || null,
        }

      case 'ads':
        return {
          ...baseData,
          targetAmount: formData.targetAmount ? Number(formData.targetAmount) : null,
          currentAmount: formData.currentAmount ? Number(formData.currentAmount) : null,
          deadline: formData.deadline || null,
        }

      case 'products':
        return {
          ...baseData,
          price: Number(formData.price),
          currency: formData.currency,
          inStock: formData.inStock,
          sizes: Array.isArray(formData.sizes) ? formData.sizes :
                 (formData.sizes ? formData.sizes.split(',').map(size => size.trim()).filter(Boolean) : []),
          colors: Array.isArray(formData.colors) ? formData.colors :
                  (formData.colors ? formData.colors.split(',').map(color => color.trim()).filter(Boolean) : []),
        }

      case 'questions':
        return {
          ...baseData,
          type: formData.type || 'يحتاج إجابة',
        }

      default:
        return baseData
    }
  }

  public static validateAndAssemble(contentType: ContentType, formData: FormData): ValidationResult {
    const errors: ValidationError[] = []

    // Validate common fields
    errors.push(...this.validateCommonFields(formData))

    // Validate content type specific fields
    errors.push(...this.validateContentTypeFields(contentType, formData))

    const isValid = errors.length === 0

    return {
      isValid,
      errors,
      data: isValid ? this.assembleRequestData(contentType, formData) : null
    }
  }
}