'use client';

import { useEffect, useState } from 'react';
import { getDepartments, createDepartment, deleteDepartment } from '@/lib/api-client';
import { Department } from '@/lib/types';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '', code: '', headUserId: '', parentDepartmentId: '', employeeCount: 0, status: 'ACTIVE'
  });
  const [error, setError] = useState<string | null>(null);

  const fetchDeps = async () => {
    setIsLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDeps();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await deleteDepartment(id);
      await fetchDeps();
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to delete');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Circular dependency prevention logic (basic)
      // Though for creation it cannot be its own parent since it doesn't exist yet.
      // But if we add edit, we must check id !== parentDepartmentId
      await createDepartment({
        ...formData,
        parentDepartmentId: formData.parentDepartmentId === '' ? null : formData.parentDepartmentId,
        employeeCount: Number(formData.employeeCount)
      });
      setShowModal(false);
      setFormData({ name: '', code: '', headUserId: '', parentDepartmentId: '', employeeCount: 0, status: 'ACTIVE' });
      await fetchDeps();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create department');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Departments Management</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90 transition-colors"
        >
          New Department
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Loading departments...</div>
      ) : (
        <div className="overflow-x-auto glass-card rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Head (User ID)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/40">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{dept.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{dept.headUserId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {departments.find(d => d.id === dept.parentDepartmentId)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{dept.employeeCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${dept.status === 'ACTIVE' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {dept.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(dept.id)} className="text-destructive hover:text-destructive/80 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-muted-foreground">No departments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="relative glass-card w-full max-w-lg rounded-xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-xl font-semibold leading-6 text-foreground mb-4">Create New Department</h3>
            {error && <div className="mb-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</div>}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Code</label>
                <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Head User ID</label>
                <input type="text" required value={formData.headUserId || ''} onChange={e => setFormData({...formData, headUserId: e.target.value})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Parent Department</label>
                <select value={formData.parentDepartmentId || ''} onChange={e => setFormData({...formData, parentDepartmentId: e.target.value})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border">
                  <option value="">None</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Employee Count</label>
                <input type="number" min="0" required value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value)})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'ACTIVE'|'INACTIVE'})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md border border-transparent bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-sm">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
