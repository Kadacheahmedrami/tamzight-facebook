import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to get current user from session
async function getCurrentUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  return user;
}

// GET /api/main/words/[id]/pronunciations/[pronunciationId] - Get specific pronunciation
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, pronunciationId: string }> }) {
  try {
    const { id, pronunciationId } = await params;

    // Check if word exists
    const word = await prisma.word.findUnique({
      where: { id }
    });

    if (!word) {
      return NextResponse.json(
        { error: 'الكلمة غير موجودة' },
        { status: 404 }
      );
    }

    // Get the specific pronunciation
    const pronunciation = await prisma.wordPronunciation.findFirst({
      where: {
        id: pronunciationId,
        wordId: id
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!pronunciation) {
      return NextResponse.json(
        { error: 'النطق غير موجود' },
        { status: 404 }
      );
    }

    // Transform response to match component format
    const response = {
      id: pronunciation.id,
      accent: pronunciation.accent,
      pronunciation: pronunciation.pronunciation,
      tifinagh: '', // Add tifinagh field if you extend the model
      createdAt: pronunciation.createdAt.toISOString(),
      user: {
        id: pronunciation.user.id,
        name: `${pronunciation.user.firstName} ${pronunciation.user.lastName}`,
        avatar: pronunciation.user.avatar
      },
      isVerified: false
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching pronunciation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب النطق' },
      { status: 500 }
    );
  }
}

// PUT /api/main/words/[id]/pronunciations/[pronunciationId] - Update pronunciation
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, pronunciationId: string }> }) {
  try {
    const { id, pronunciationId } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لتعديل النطق' },
        { status: 401 }
      );
    }

    // Check if word exists
    const word = await prisma.word.findUnique({
      where: { id }
    });

    if (!word) {
      return NextResponse.json(
        { error: 'الكلمة غير موجودة' },
        { status: 404 }
      );
    }

    // Check if pronunciation exists and belongs to current user
    const existingPronunciation = await prisma.wordPronunciation.findFirst({
      where: {
        id: pronunciationId,
        wordId: id
      }
    });

    if (!existingPronunciation) {
      return NextResponse.json(
        { error: 'النطق غير موجود' },
        { status: 404 }
      );
    }

    // Check if user owns this pronunciation
    if (existingPronunciation.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'غير مسموح لك بتعديل هذا النطق' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { accent, pronunciation, tifinagh } = body;

    // Validate required fields
    if (!accent || !pronunciation) {
      return NextResponse.json(
        { error: 'اللهجة والنطق مطلوبان' },
        { status: 400 }
      );
    }

    // Validate accent
    const validAccents = ["قبائلي", "شاوي", "مزابي", "ترقي", "شنوي", "قورايي", "تاشلحيت"];
    if (!validAccents.includes(accent)) {
      return NextResponse.json(
        { error: 'اللهجة المحددة غير صحيحة' },
        { status: 400 }
      );
    }

    // Check if user already has another pronunciation for this accent (if accent changed)
    if (accent !== existingPronunciation.accent) {
      const duplicateAccent = await prisma.wordPronunciation.findFirst({
        where: {
          wordId: id,
          userId: currentUser.id,
          accent: accent,
          id: { not: pronunciationId } // Exclude current pronunciation
        }
      });

      if (duplicateAccent) {
        return NextResponse.json(
          { error: 'لديك نطق آخر لهذه اللهجة مسبقاً' },
          { status: 400 }
        );
      }
    }

    // Update pronunciation
    const updatedPronunciation = await prisma.wordPronunciation.update({
      where: { id: pronunciationId },
      data: {
        accent: accent.trim(),
        pronunciation: pronunciation.trim()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Transform response to match component format
    const response = {
      id: updatedPronunciation.id,
      accent: updatedPronunciation.accent,
      pronunciation: updatedPronunciation.pronunciation,
      tifinagh: tifinagh || '',
      createdAt: updatedPronunciation.createdAt.toISOString(),
      user: {
        id: updatedPronunciation.user.id,
        name: `${updatedPronunciation.user.firstName} ${updatedPronunciation.user.lastName}`,
        avatar: updatedPronunciation.user.avatar
      },
      isVerified: false
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating pronunciation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تعديل النطق' },
      { status: 500 }
    );
  }
}

// DELETE /api/main/words/[id]/pronunciations/[pronunciationId] - Delete pronunciation
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, pronunciationId: string }> }) {
  try {
    const { id, pronunciationId } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لحذف النطق' },
        { status: 401 }
      );
    }

    // Check if word exists
    const word = await prisma.word.findUnique({
      where: { id }
    });

    if (!word) {
      return NextResponse.json(
        { error: 'الكلمة غير موجودة' },
        { status: 404 }
      );
    }

    // Check if pronunciation exists
    const existingPronunciation = await prisma.wordPronunciation.findFirst({
      where: {
        id: pronunciationId,
        wordId: id
      }
    });

    if (!existingPronunciation) {
      return NextResponse.json(
        { error: 'النطق غير موجود' },
        { status: 404 }
      );
    }

    // Check if user owns this pronunciation or is admin/moderator
    const userRole = currentUser.role;
    const canDelete = existingPronunciation.userId === currentUser.id || 
                     userRole === 'admin' || 
                     userRole === 'moderator';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'غير مسموح لك بحذف هذا النطق' },
        { status: 403 }
      );
    }

    // Delete pronunciation
    await prisma.wordPronunciation.delete({
      where: { id: pronunciationId }
    });

    return NextResponse.json(
      { message: 'تم حذف النطق بنجاح' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting pronunciation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف النطق' },
      { status: 500 }
    );
  }
}