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

// GET /api/main/words/[id]/pronunciations - Get all pronunciations for a word
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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

    // Get all pronunciations for this word
    const pronunciations = await prisma.wordPronunciation.findMany({
      where: { wordId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data to match your component's expected format
    const transformedPronunciations = pronunciations.map(pron => ({
      id: pron.id,
      accent: pron.accent,
      pronunciation: pron.pronunciation,
      tifinagh: '', // Add tifinagh field if you want to extend the model later
      createdAt: pron.createdAt.toISOString(),
      user: {
        id: pron.user.id,
        name: `${pron.user.firstName} ${pron.user.lastName}`,
        avatar: pron.user.avatar
      },
      isVerified: false // Add verification logic if needed
    }));

    // Group by accent for the component
    const byAccent = transformedPronunciations.reduce((acc, pron) => {
      if (!acc[pron.accent]) {
        acc[pron.accent] = [];
      }
      acc[pron.accent].push(pron);
      return acc;
    }, {} as Record<string, typeof transformedPronunciations>);

    return NextResponse.json({
      total: transformedPronunciations.length,
      byAccent,
      recent: transformedPronunciations.slice(0, 10) // Get recent 10
    });

  } catch (error) {
    console.error('Error fetching pronunciations:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب النطقات' },
      { status: 500 }
    );
  }
}

// POST /api/main/words/[id]/pronunciations - Add a new pronunciation
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول لإضافة النطق' },
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

    const body = await req.json();
    const { accent, pronunciation, tifinagh } = body;

    // Validate required fields
    if (!accent || !pronunciation) {
      return NextResponse.json(
        { error: 'اللهجة والنطق مطلوبان' },
        { status: 400 }
      );
    }

    // Validate accent (optional - you can add more validation)
    const validAccents = ["قبائلي", "شاوي", "مزابي", "ترقي", "شنوي", "قورايي", "تاشلحيت"];
    if (!validAccents.includes(accent)) {
      return NextResponse.json(
        { error: 'اللهجة المحددة غير صحيحة' },
        { status: 400 }
      );
    }

    // Check if user already added pronunciation for this accent
    const existingPronunciation = await prisma.wordPronunciation.findFirst({
      where: {
        wordId: id,
        userId: currentUser.id,
        accent: accent
      }
    });

    if (existingPronunciation) {
      return NextResponse.json(
        { error: 'لقد أضفت نطقاً لهذه اللهجة مسبقاً' },
        { status: 400 }
      );
    }

    // Create new pronunciation
    const newPronunciation = await prisma.wordPronunciation.create({
      data: {
        wordId: id,
        userId: currentUser.id,
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
      id: newPronunciation.id,
      accent: newPronunciation.accent,
      pronunciation: newPronunciation.pronunciation,
      tifinagh: tifinagh || '', // Store tifinagh if provided (you might want to add this to your model)
      createdAt: newPronunciation.createdAt.toISOString(),
      user: {
        id: newPronunciation.user.id,
        name: `${newPronunciation.user.firstName} ${newPronunciation.user.lastName}`,
        avatar: newPronunciation.user.avatar
      },
      isVerified: false
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error adding pronunciation:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إضافة النطق' },
      { status: 500 }
    );
  }
}