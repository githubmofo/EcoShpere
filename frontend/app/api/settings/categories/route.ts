import { NextResponse } from 'next/server';
import { mockCategories } from '../db';
import { Category } from '@/lib/types';

export async function GET() {
  return NextResponse.json(mockCategories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newCat: Category = {
      id: crypto.randomUUID(),
      name: body.name,
      type: body.type,
      status: body.status || 'Active'
    };

    mockCategories.push(newCat);
    return NextResponse.json(newCat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
