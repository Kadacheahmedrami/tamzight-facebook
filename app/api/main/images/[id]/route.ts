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

// DELETE /api/main/images/[id] - Only author can delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const image = await prisma.image.findUnique({ where: { id: params.id } });
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    if (image.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this image.' }, { status: 403 });
    }
    await prisma.image.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/images/[id] - Only author can edit
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const image = await prisma.image.findUnique({ where: { id: params.id } });
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    if (image.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this image.' }, { status: 403 });
    }
    const data = await req.json();
    // Only allow updating certain fields
    const allowedFields = [
      'title', 'description', 'category', 'subcategory', 'image',
      'location', 'resolution', 'tags'
    ];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    const updatedImage = await prisma.image.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json({ success: true, image: updatedImage });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 