import { NextResponse } from 'next/server';
import { mockEsgConfig, updateMockEsgConfig } from '../db';

export async function GET() {
  return NextResponse.json(mockEsgConfig);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    updateMockEsgConfig(body);
    return NextResponse.json(mockEsgConfig);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
