// types.ts
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

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  data: any
}

export const contentTypeLabels = {
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

export const initialFormData: FormData = {
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