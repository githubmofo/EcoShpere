import { NextResponse } from 'next/server';
import { mockCategories } from '../../db';
import { Category } from '@/lib/types';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const index = mockCategories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedCat: Category = { ...mockCategories[index], ...body };
    mockCategories[index] = updatedCat;
    
    return NextResponse.json(updatedCat);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
