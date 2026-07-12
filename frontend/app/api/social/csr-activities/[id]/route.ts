import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  
  // In a real app, update DB. For now mock success.
  return NextResponse.json({ id, ...body });
}
