import { NextResponse } from 'next/server';
import { mockNotificationSettings, updateMockNotificationSettings } from '../db';

export async function GET() {
  return NextResponse.json(mockNotificationSettings);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    updateMockNotificationSettings(body);
    return NextResponse.json(mockNotificationSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
