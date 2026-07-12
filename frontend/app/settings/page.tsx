'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/components/layout/SettingsProvider';
import { getDepartments, getCategories } from '@/lib/api-client';
import { Department, Category } from '@/lib/types';

export default function SettingsOverviewPage() {
  const { esgConfig } = useSettings();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deps, cats] = await Promise.all([getDepartments(), getCategories()]);
        setDepartments(deps);
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching data for overview:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !esgConfig) {
    return <div className="text-muted-foreground animate-pulse">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Departments Card */}
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Departments</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{departments.length}</p>
        </div>

        {/* Total Categories Card */}
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Categories</h3>
          <p className="mt-2 text-3xl font-bold text-foreground">{categories.length}</p>
        </div>

        {/* Weight Distribution Card */}
        <div className="glass-card p-6 rounded-lg col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current ESG Weight Distribution</h3>
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Environmental</span>
              <span className="text-xl font-bold text-[var(--module-env)]">{esgConfig.envWeight}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Social</span>
              <span className="text-xl font-bold text-[var(--module-soc)]">{esgConfig.socialWeight}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Governance</span>
              <span className="text-xl font-bold text-[var(--module-gov)]">{esgConfig.governanceWeight}%</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4 text-foreground">Key Configurations Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Auto Emission Status */}
        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Auto Emission Calc</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">Automatic carbon transactions</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${esgConfig.autoEmissionEnabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
            {esgConfig.autoEmissionEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Evidence Required Status */}
        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Evidence Required</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">Proof files for CSR activities</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${esgConfig.evidenceRequiredEnabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
            {esgConfig.evidenceRequiredEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Badge Auto-Award Status */}
        <div className="glass-card p-6 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Badge Auto-Award</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">Auto-assign based on XP</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${esgConfig.badgeAutoAwardEnabled ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted text-muted-foreground border border-border'}`}>
            {esgConfig.badgeAutoAwardEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

      </div>
    </div>
  );
}
