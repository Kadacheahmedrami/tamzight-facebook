// lib/controllers/contentController.ts


import { prisma } from '@/lib/prisma';

// Content type mapping for validation
const CONTENT_TYPES = {
  posts: 'Post',
  books: 'Book',
  ideas: 'Idea',
  images: 'Image',
  videos: 'Video',
  truths: 'Truth',
  questions: 'Question',
  ads: 'Ad',
  products: 'Product'
} as const;

type ContentType = keyof typeof CONTENT_TYPES;

// Define interfaces for each content type data
interface BaseContentData {
  title: string;
  content?: string;
  category: string;
  subcategory?: string;
  image?: string;
}

interface BookData extends BaseContentData {
  pages?: number;
  language?: string;
  isbn?: string;
}

interface IdeaData extends BaseContentData {
  status?: string;
  priority?: string;
}

interface ImageData extends BaseContentData {
  description: string;
  location?: string;
  resolution?: string;
  tags?: string[] | string;
}

interface VideoData extends BaseContentData {
  duration?: string;
  quality?: string;
  language?: string;
}

interface AdData extends BaseContentData {
  targetAmount?: string;
  currentAmount?: string;
  deadline?: string;
}

interface ProductData extends BaseContentData {
  price: string;
  currency: string;
  inStock?: boolean;
  sizes?: string[] | string;
  colors?: string[] | string;
}

interface QuestionData extends BaseContentData {
  type?: string;
}

type ContentData = BaseContentData | BookData | IdeaData | ImageData | VideoData | AdData | ProductData | QuestionData;

// Validation schemas for each content type
const validateContentData = (type: ContentType, data: ContentData): string[] => {
  const errors: string[] = [];
  
  // Common required fields
  if (!data.title || !data.title.trim()) errors.push('Title is required');
  if (!data.category || !data.category.trim()) errors.push('Category is required');
  
  // Type-specific validations
  switch (type) {
    case 'posts':
    case 'truths':
    case 'books':
    case 'ideas':
    case 'videos':
    case 'questions':
    case 'ads':
    case 'products':
      if (!data.content || !data.content.trim()) errors.push('Content is required');
      break;
      
    case 'images':
      const imageData = data as ImageData;
      if (!imageData.image || !imageData.image.trim()) errors.push('Image URL is required for image posts');
      if (!imageData.description || !imageData.description.trim()) errors.push('Description is required for image posts');
      break;
  }
  
  // Additional type-specific validations
  switch (type) {
    case 'books':
      const bookData = data as BookData;
      if (bookData.isbn && !/^(?:\d{10}|\d{13})$/.test(bookData.isbn.replace(/-/g, ''))) {
        errors.push('Invalid ISBN format');
      }
      break;
      
    case 'ideas':
      const ideaData = data as IdeaData;
      if (ideaData.priority && !['منخفضة', 'متوسطة', 'عالية'].includes(ideaData.priority)) {
        errors.push('Invalid priority level');
      }
      break;
      
    case 'videos':
      const videoData = data as VideoData;
      if (videoData.duration && !/^\d{2}:\d{2}:\d{2}$/.test(videoData.duration)) {
        errors.push('Duration must be in HH:MM:SS format');
      }
      break;
      
    case 'ads':
      const adData = data as AdData;
      if (adData.targetAmount && isNaN(parseFloat(adData.targetAmount))) {
        errors.push('Target amount must be a valid number');
      }
      if (adData.currentAmount && isNaN(parseFloat(adData.currentAmount))) {
        errors.push('Current amount must be a valid number');
      }
      if (adData.deadline && isNaN(new Date(adData.deadline).getTime())) {
        errors.push('Invalid deadline date');
      }
      break;
      
    case 'products':
      const productData = data as ProductData;
      if (!productData.price || !productData.price.trim()) errors.push('Price is required for products');
      if (!productData.currency || !productData.currency.trim()) errors.push('Currency is required for products');
      if (isNaN(parseFloat(productData.price))) errors.push('Price must be a valid number');
      break;
      
    case 'questions':
      const questionData = data as QuestionData;
      if (questionData.type && !['يحتاج إجابة"', 'استطلاع رأي', 'نقاش'].includes(questionData.type)) {
        errors.push('Invalid question type');
      }
      break;
  }
  
  return errors;
};

// Prepare data for database insertion
const prepareContentData = (type: ContentType, data: ContentData, userId: string): any => {
  const baseData = {
    title: data.title.trim(),
    content: data.content ? data.content.trim() : '',
    authorId: userId,
    category: data.category.trim(),
    subcategory: data.subcategory ? data.subcategory.trim() : null,
    image: data.image ? data.image.trim() : null,
  };
  
  switch (type) {
    case 'books':
      const bookData = data as BookData;
      return {
        ...baseData,
        pages: bookData.pages ? parseInt(bookData.pages.toString()) : null,
        language: bookData.language ? bookData.language.trim() : null,
        isbn: bookData.isbn ? bookData.isbn.trim() : null,
      };
      
    case 'ideas':
      const ideaData = data as IdeaData;
      return {
        ...baseData,
        status: ideaData.status ? ideaData.status.trim() : 'قيد المراجعة',
        priority: ideaData.priority ? ideaData.priority.trim() : 'متوسطة',
        votes: 0,
      };
      
    case 'images':
      const imageData = data as ImageData;
      return {
        title: imageData.title.trim(),
        description: imageData.description ? imageData.description.trim() : '',
        authorId: userId,
        category: imageData.category.trim(),
        subcategory: imageData.subcategory ? imageData.subcategory.trim() : null,
        location: imageData.location ? imageData.location.trim() : null,
        resolution: imageData.resolution ? imageData.resolution.trim() : null,
        tags: Array.isArray(imageData.tags) ? imageData.tags : 
              (imageData.tags ? imageData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []),
        image: imageData.image ? imageData.image.trim() : null,
      };
      
    case 'videos':
      const videoData = data as VideoData;
      return {
        ...baseData,
        category: 'فيديو',
        duration: videoData.duration ? videoData.duration.trim() : null,
        quality: videoData.quality ? videoData.quality.trim() : null,
        language: videoData.language ? videoData.language.trim() : null,
      };
      
    case 'ads':
      const adData = data as AdData;
      return {
        ...baseData,
        targetAmount: adData.targetAmount ? adData.targetAmount.trim() : null,
        currentAmount: adData.currentAmount ? adData.currentAmount.trim() : null,
        deadline: adData.deadline ? new Date(adData.deadline) : null,
      };
      
    case 'products':
      const productData = data as ProductData;
      return {
        ...baseData,
        price: productData.price.trim(),
        currency: productData.currency.trim(),
        inStock: productData.inStock !== undefined ? Boolean(productData.inStock) : true,
        sizes: Array.isArray(productData.sizes) ? productData.sizes : 
               (productData.sizes ? productData.sizes.split(',').map((size: string) => size.trim()).filter(Boolean) : []),
        colors: Array.isArray(productData.colors) ? productData.colors : 
                (productData.colors ? productData.colors.split(',').map((color: string) => color.trim()).filter(Boolean) : []),
      };
      
    case 'questions':
      const questionData = data as QuestionData;
      return {
        ...baseData,
        category: 'سؤال',
        type: questionData.type ? questionData.type.trim() : 'answer',
        answered: false,
      };
      
    case 'truths':
      return {
        ...baseData,
        category: 'حقيقة',
      };
      
    default:
      return baseData;
  }
};

// Content Controller Class
export class ContentController {
  
  // Validate content type
  static validateContentType(type: string): { isValid: boolean; error?: string } {
    if (!type || !CONTENT_TYPES[type as ContentType]) {
      return {
        isValid: false,
        error: `Invalid content type. Valid types: ${Object.keys(CONTENT_TYPES).join(', ')}`
      };
    }
    return { isValid: true };
  }

  // Validate content data
  static validateContent(type: ContentType, data: ContentData): { isValid: boolean; errors?: string[] } {
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Content data is required and must be an object']
      };
    }

    const validationErrors = validateContentData(type, data);
    if (validationErrors.length > 0) {
      return {
        isValid: false,
        errors: validationErrors
      };
    }

    return { isValid: true };
  }

  // Create content in database
  static async createContent(type: ContentType, data: ContentData, userId: string) {
    try {
      console.log(`🔄 Creating ${type} content for user ${userId}`);
      
      // Prepare data for database
      const contentData = prepareContentData(type, data, userId);
      console.log('📊 Prepared data:', JSON.stringify(contentData, null, 2));

      // Create content in database
      let createdContent: any;
      
      switch (type) {
        case 'posts':
          createdContent = await prisma.post.create({ data: contentData });
          break;
        case 'books':
          createdContent = await prisma.book.create({ data: contentData });
          break;
        case 'ideas':
          createdContent = await prisma.idea.create({ data: contentData });
          break;
        case 'images':
          createdContent = await prisma.image.create({ data: contentData });
          break;
        case 'videos':
          createdContent = await prisma.video.create({ data: contentData });
          break;
        case 'truths':
          createdContent = await prisma.truth.create({ data: contentData });
          break;
        case 'questions':
          createdContent = await prisma.question.create({ data: contentData });
          break;
        case 'ads':
          createdContent = await prisma.ad.create({ data: contentData });
          break;
        case 'products':
          createdContent = await prisma.product.create({ data: contentData });
          break;
        default:
          throw new Error(`Unsupported content type: ${type}`);
      }

      console.log(`✅ ${type} created successfully:`, createdContent.id);
      return createdContent;
      
    } catch (error) {
      console.error(`❌ Error creating ${type}:`, error);
      throw error;
    }
  }

  // Get content with author information
  static async getContentWithAuthor(type: ContentType, contentId: number) {
    try {
      const modelName = type === 'posts' ? 'post' : 
                        type === 'books' ? 'book' :
                        type === 'ideas' ? 'idea' :
                        type === 'images' ? 'image' :
                        type === 'videos' ? 'video' :
                        type === 'truths' ? 'truth' :
                        type === 'questions' ? 'question' :
                        type === 'ads' ? 'ad' :
                        type === 'products' ? 'product' : 'post';

      const contentWithAuthor = await (prisma as any)[modelName].findUnique({
        where: { id: contentId },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              image: true,
            },
          },
          likes: true,
          comments: true,
          shares: true,
        },
      });

      return contentWithAuthor;
    } catch (error) {
      console.error('Error fetching content with author:', error);
      throw error;
    }
  }

  // Handle Prisma errors
  static handlePrismaError(error: any): { status: number; message: string } {
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2002':
          return { status: 400, message: 'Duplicate entry detected' };
        case 'P2025':
          return { status: 404, message: 'Record not found' };
        case 'P2003':
          return { status: 400, message: 'Foreign key constraint failed' };
        default:
          console.error('Unhandled Prisma error:', error);
          return { status: 500, message: 'Database error occurred' };
      }
    }
    return { status: 500, message: 'Internal server error' };
  }
}

// Export types for use in the endpoint
export type { ContentType, ContentData, BaseContentData, BookData, IdeaData, ImageData, VideoData, AdData, ProductData, QuestionData };
export { CONTENT_TYPES };   