// shared/types.ts
export type ContentType = 'posts' | 'books' | 'ideas' | 'images' | 'videos' | 'truths' | 'questions' | 'ads' | 'products'

export interface BaseFormData {
  title: string
  content: string
  category: string
  subcategory: string
  image: string
}

export interface BookFormData extends BaseFormData {
  pages: string
  language: string
  isbn: string
}

export interface IdeaFormData extends BaseFormData {
  status: string
  priority: string
}

export interface ImageFormData extends Omit<BaseFormData, 'content'> {
  description: string
  location: string
  resolution: string
  tags: string
}

export interface VideoFormData extends BaseFormData {
  duration: string
  quality: string
  language: string
}

export interface AdFormData extends BaseFormData {
  targetAmount: string
  currentAmount: string
  deadline: string
}

export interface ProductFormData extends BaseFormData {
  price: string
  currency: string
  inStock: boolean
  sizes: string
  colors: string
}

export interface QuestionFormData extends BaseFormData {
  type: string
}

export interface TruthFormData extends BaseFormData {}

export interface PostFormData extends BaseFormData {}

