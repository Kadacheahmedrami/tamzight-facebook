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

// GET /api/main/shares/[id] - Get a specific share
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const share = await prisma.share.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
        post: true,
        book: true,
        idea: true,
        image: true,
        video: true,
        truth: true,
        question: true,
        ad: true,
        product: true,
        sentence: true,
        word: true
      }
    });

    if (!share || share.userId !== user.id) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    return NextResponse.json(share);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/main/shares/[id] - Create a new share for content
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // This would be the content ID
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contentType } = await req.json();
    
    // Map content type to field name
    const contentField = `${contentType}Id`;
    
    const share = await prisma.share.create({
      data: {
        userId: user.id,
        [contentField]: id
      }
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/main/shares/[id] - Update a share (if needed)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingShare = await prisma.share.findUnique({ where: { id } });
    
    if (!existingShare || existingShare.userId !== user.id) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    const updates = await req.json();
    
    const share = await prisma.share.update({
      where: { id },
      data: updates
    });

    return NextResponse.json(share);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/main/shares/[id] - Delete a share
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingShare = await prisma.share.findUnique({ where: { id } });
    
    if (!existingShare || existingShare.userId !== user.id) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    await prisma.share.delete({ where: { id } });

    return NextResponse.json({ message: 'Share deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}