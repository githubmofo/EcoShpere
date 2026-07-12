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
    return <div className="text-gray-500">Loading overview...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Departments Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Departments</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{departments.length}</p>
        </div>

        {/* Total Categories Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{categories.length}</p>
        </div>

        {/* Weight Distribution Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current ESG Weight Distribution</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Environmental</span>
              <span className="text-xl font-bold text-green-600">{esgConfig.envWeight}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Social</span>
              <span className="text-xl font-bold text-blue-600">{esgConfig.socialWeight}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Governance</span>
              <span className="text-xl font-bold text-purple-600">{esgConfig.governanceWeight}%</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Key Configurations Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Auto Emission Status */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Auto Emission Calc</h3>
            <p className="text-xs text-gray-400 mt-1">Automatic carbon transactions</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${esgConfig.autoEmissionCalculation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {esgConfig.autoEmissionCalculation ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Evidence Required Status */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Evidence Required</h3>
            <p className="text-xs text-gray-400 mt-1">Proof files for CSR activities</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${esgConfig.evidenceRequirement ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {esgConfig.evidenceRequirement ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {/* Badge Auto-Award Status */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Badge Auto-Award</h3>
            <p className="text-xs text-gray-400 mt-1">Auto-assign based on XP</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${esgConfig.badgeAutoAward ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {esgConfig.badgeAutoAward ? 'Enabled' : 'Disabled'}
          </span>
        </div>

      </div>
    </div>
  );
}
