// app/api/main/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentController } from './contentController';
import type { ContentType, ContentData } from './contentController';

// Extended session type to include user id
interface ExtendedSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Upload request received');
    
    // 1. Authentication Check
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    if (!session || !session.user || !session.user.id) {
      console.log('❌ Authentication failed');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', session.user.id);

    // 2. Parse Request Body
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body received:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON format',
          code: 'INVALID_JSON'
        },
        { status: 400 }
      );
    }

    const { type, data }: { type: ContentType; data: ContentData } = body;

    // 3. Validate Content Type
    const typeValidation = ContentController.validateContentType(type);
    if (!typeValidation.isValid) {
      console.log('❌ Invalid content type:', type);
      return NextResponse.json(
        { 
          success: false,
          error: typeValidation.error,
          code: 'INVALID_CONTENT_TYPE',
          received: type
        },
        { status: 400 }
      );
    }

    console.log('✅ Content type valid:', type);

    // 4. Validate Content Data
    const contentValidation = ContentController.validateContent(type, data);
    if (!contentValidation.isValid) {
      console.log('❌ Content validation failed:', contentValidation.errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Content validation failed',
          code: 'VALIDATION_FAILED',
          details: contentValidation.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ Content validation passed');

    // 5. Create Content
    let createdContent;
    try {
      createdContent = await ContentController.createContent(type, data, session.user.id);
      console.log('✅ Content created successfully:', createdContent.id);
    } catch (createError) {
      console.error('❌ Content creation failed:', createError);
      
      // Handle Prisma errors
      const errorResponse = ContentController.handlePrismaError(createError);
      return NextResponse.json(
        { 
          success: false,
          error: errorResponse.message,
          code: 'DATABASE_ERROR'
        },
        { status: errorResponse.status }
      );
    }

    // 6. Fetch Content with Author Information
    let contentWithAuthor;
    try {
      contentWithAuthor = await ContentController.getContentWithAuthor(type, createdContent.id);
      console.log('✅ Content fetched with author info');
    } catch (fetchError) {
      console.error('⚠️ Failed to fetch content with author, returning basic content:', fetchError);
      // If fetching with author fails, return the basic created content
      contentWithAuthor = createdContent;
    }

    // 7. Success Response
    return NextResponse.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: contentWithAuthor,
      metadata: {
        contentType: type,
        contentId: createdContent.id,
        authorId: session.user.id,
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('💥 Unexpected error in upload endpoint:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

