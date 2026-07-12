'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/components/layout/SettingsProvider';
import { updateEsgConfig } from '@/lib/api-client';
import { EsgConfig, DepartmentScore } from '@/lib/types';
import { computeOverallEsgScore } from '@/lib/scoring';

// Mock data strictly for the live preview feature
const mockDeptScores: DepartmentScore[] = [
  { departmentId: '1', environmentalScore: 80, socialScore: 70, governanceScore: 90, totalScore: 0 },
  { departmentId: '2', environmentalScore: 60, socialScore: 85, governanceScore: 75, totalScore: 0 },
  { departmentId: '3', environmentalScore: 90, socialScore: 60, governanceScore: 80, totalScore: 0 },
];

export default function EsgConfigPage() {
  const { esgConfig, refreshConfig } = useSettings();
  
  const [formData, setFormData] = useState<EsgConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (esgConfig && !formData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(esgConfig);
    }
  }, [esgConfig, formData]);

  if (!formData) {
    return <div className="text-gray-500">Loading ESG configuration...</div>;
  }

  const currentTotal = formData.envWeight + formData.socialWeight + formData.governanceWeight;
  const isTotalValid = currentTotal === 100;

  // Calculate live preview
  const livePreviewScore = computeOverallEsgScore(mockDeptScores, {
    environmental: formData.envWeight,
    social: formData.socialWeight,
    governance: formData.governanceWeight,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isTotalValid) {
      setError('Weights must equal exactly 100 before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await updateEsgConfig(formData);
      await refreshConfig();
      setSuccess('Configuration saved successfully.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">ESG Configuration</h2>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Pillar Weights</h3>
              <p className="text-sm text-gray-500 mb-4">Set the percentage weight for each ESG pillar. The sum must exactly equal 100.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Environmental (%)</label>
                  <input type="number" min="0" max="100" value={formData.envWeight} onChange={e => setFormData({...formData, envWeight: parseInt(e.target.value) || 0})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Social (%)</label>
                  <input type="number" min="0" max="100" value={formData.socialWeight} onChange={e => setFormData({...formData, socialWeight: parseInt(e.target.value) || 0})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Governance (%)</label>
                  <input type="number" min="0" max="100" value={formData.governanceWeight} onChange={e => setFormData({...formData, governanceWeight: parseInt(e.target.value) || 0})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                </div>
              </div>
              <div className={`text-sm font-bold ${isTotalValid ? 'text-green-600' : 'text-red-600'}`}>
                Total: {currentTotal}% {currentTotal > 100 && '(Exceeds 100%)'} {currentTotal < 100 && '(Under 100%)'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-8">Global Toggles</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.autoEmissionCalculation} onChange={e => setFormData({...formData, autoEmissionCalculation: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">Auto Emission Calculation</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">Calculate carbon transactions automatically from ERP data without manual entry.</p>

                <label className="flex items-center space-x-3 mt-4">
                  <input type="checkbox" checked={formData.evidenceRequirement} onChange={e => setFormData({...formData, evidenceRequirement: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">Evidence Requirement for CSR</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">Require employees to upload proof files before approving CSR activities.</p>

                <label className="flex items-center space-x-3 mt-4">
                  <input type="checkbox" checked={formData.badgeAutoAward} onChange={e => setFormData({...formData, badgeAutoAward: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">Badge Auto-Award</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">Automatically assign badges to employees when XP criteria are met.</p>
              </div>
            </div>

            <div className="pt-5 border-t">
              <button disabled={!isTotalValid || isSaving} type="submit" className={`px-4 py-2 text-white font-medium rounded shadow ${isTotalValid && !isSaving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
          <p className="text-sm text-gray-500 mb-6">This shows the mocked impact of your current weight distribution on the overall organizational score.</p>
          
          <div className="bg-white p-6 rounded border shadow-sm text-center">
            <span className="block text-sm font-medium text-gray-500 mb-1">Overall ESG Score</span>
            <span className="block text-5xl font-bold text-gray-900">{livePreviewScore.toFixed(1)}</span>
            <span className="block text-xs text-gray-400 mt-2">/ 100</span>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            * Uses a fixed set of mock department scores to demonstrate the weighting effect.
          </div>
        </div>
      </div>
    </div>
  );
}
