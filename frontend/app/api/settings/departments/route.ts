import { NextResponse } from 'next/server';
import { mockDepartments } from '../db';
import { Department } from '@/lib/types';

export async function GET() {
  return NextResponse.json(mockDepartments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.code || !body.head_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newDept: Department = {
      id: crypto.randomUUID(),
      name: body.name,
      code: body.code,
      head_user_id: body.head_user_id,
      parent_department_id: body.parent_department_id || null,
      employee_count: body.employee_count || 0,
      status: body.status || 'Active'
    };

    mockDepartments.push(newDept);
    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
