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

// DELETE /api/main/truth/[id] - Only author can delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const truth = await prisma.truth.findUnique({ where: { id: params.id } });
    if (!truth) {
      return NextResponse.json({ error: 'Truth not found' }, { status: 404 });
    }
    if (truth.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can delete this truth.' }, { status: 403 });
    }
    await prisma.truth.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}

// PATCH /api/main/truth/[id] - Only author can edit
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const truth = await prisma.truth.findUnique({ where: { id: params.id } });
    if (!truth) {
      return NextResponse.json({ error: 'Truth not found' }, { status: 404 });
    }
    if (truth.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the author can edit this truth.' }, { status: 403 });
    }
    const data = await req.json();
    // Only allow updating certain fields
    const allowedFields = [
      'title', 'content', 'category', 'subcategory', 'image'
    ];
    const updateData: any = {};
    for (const key of allowedFields) {
      if (key in data) updateData[key] = data[key];
    }
    const updatedTruth = await prisma.truth.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json({ success: true, truth: updatedTruth });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
} 