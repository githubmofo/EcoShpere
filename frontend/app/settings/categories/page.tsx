'use client';

import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory } from '@/lib/api-client';
import { Category } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', type: 'CSR_ACTIVITY', status: 'ACTIVE'
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCats = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCats();
  }, []);

  const handleEdit = (category: Category) => {
    setFormData(category);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setFormData({ name: '', type: 'CSR_ACTIVITY', status: 'ACTIVE' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEditing && formData.id) {
        await updateCategory(formData.id, formData);
      } else {
        await createCategory(formData);
      }
      setShowModal(false);
      await fetchCats();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save category');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Categories Management</h2>
        <button 
          onClick={handleCreateNew}
          className="bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90 transition-colors"
        >
          New Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground animate-pulse">Loading categories...</div>
      ) : (
        <div className="overflow-x-auto glass-card rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card/40">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{cat.type === 'CSR_ACTIVITY' ? 'CSR Activity' : 'Challenge'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cat.status === 'ACTIVE' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(cat)} className="text-primary hover:text-primary/80 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">No categories found.</td>
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
            <h3 className="text-xl font-semibold leading-6 text-foreground mb-4">{isEditing ? 'Edit Category' : 'Create New Category'}</h3>
            {error && <div className="mb-4 text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</div>}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'CSR_ACTIVITY'|'CHALLENGE'})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border">
                  <option value="CSR_ACTIVITY">CSR Activity</option>
                  <option value="CHALLENGE">Challenge</option>
                </select>
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
