import { NextResponse } from 'next/server';
import { mockDepartments } from '../../db';
import { Department } from '@/lib/types';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const index = mockDepartments.findIndex(d => d.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    const updatedDept: Department = { ...mockDepartments[index], ...body };
    mockDepartments[index] = updatedDept;
    
    return NextResponse.json(updatedDept);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = mockDepartments.findIndex(d => d.id === id);
  
  if (index === -1) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }

  // Rule: DELETE must return a warning/error if the department has dependencies.
  const hasChildren = mockDepartments.some(d => d.parent_department_id === id);
  if (hasChildren) {
    return NextResponse.json(
      { error: 'Cannot delete department with child departments' }, 
      { status: 400 }
    );
  }

  mockDepartments.splice(index, 1);
  return new NextResponse(null, { status: 204 });
}
