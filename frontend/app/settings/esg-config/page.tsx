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
        <div className="glass-card p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-foreground">ESG Configuration</h2>
          
          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-primary/10 text-primary border border-primary/20 rounded text-sm">{success}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">Pillar Weights</h3>
              <p className="text-sm text-muted-foreground mb-4">Set the percentage weight for each ESG pillar. The sum must exactly equal 100.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Environmental (%)</label>
                  <input type="number" min="0" max="100" value={formData.envWeight} onChange={e => setFormData({...formData, envWeight: parseInt(e.target.value) || 0})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Social (%)</label>
                  <input type="number" min="0" max="100" value={formData.socialWeight} onChange={e => setFormData({...formData, socialWeight: parseInt(e.target.value) || 0})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Governance (%)</label>
                  <input type="number" min="0" max="100" value={formData.governanceWeight} onChange={e => setFormData({...formData, governanceWeight: parseInt(e.target.value) || 0})} className="block w-full rounded-md border-border bg-background/50 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2.5 border" />
                </div>
              </div>
              <div className={`text-sm font-bold ${isTotalValid ? 'text-primary' : 'text-destructive'}`}>
                Total: {currentTotal}% {currentTotal > 100 && '(Exceeds 100%)'} {currentTotal < 100 && '(Under 100%)'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4 mt-8">Global Toggles</h3>
              <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-foreground">Auto Emission Calculation</h4>
                <p className="text-sm text-muted-foreground">Automatically calculate emissions from department utilities</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, autoEmissionEnabled: !formData.autoEmissionEnabled})}
                className={`${formData.autoEmissionEnabled ? 'bg-primary' : 'bg-muted'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
              >
                <span className={`${formData.autoEmissionEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-foreground">Evidence Required for CSR</h4>
                <p className="text-sm text-muted-foreground">Require users to upload proof before approving activities</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, evidenceRequiredEnabled: !formData.evidenceRequiredEnabled})}
                className={`${formData.evidenceRequiredEnabled ? 'bg-primary' : 'bg-muted'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
              >
                <span className={`${formData.evidenceRequiredEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-foreground">Auto-Award Badges</h4>
                <p className="text-sm text-muted-foreground">Automatically award badges when XP thresholds are met</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, badgeAutoAwardEnabled: !formData.badgeAutoAwardEnabled})}
                className={`${formData.badgeAutoAwardEnabled ? 'bg-primary' : 'bg-muted'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
              >
                <span className={`${formData.badgeAutoAwardEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
              </div>
            </div>

            <div className="pt-5 border-t border-border">
              <button disabled={!isTotalValid || isSaving} type="submit" className={`px-4 py-2 text-primary-foreground font-medium rounded shadow transition-colors ${isTotalValid && !isSaving ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="glass-card p-6 rounded-lg sticky top-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Live Preview</h3>
          <p className="text-sm text-muted-foreground mb-6">This shows the mocked impact of your current weight distribution on the overall organizational score.</p>
          
          <div className="bg-background/40 p-6 rounded-xl border border-border shadow-inner text-center">
            <span className="block text-sm font-medium text-muted-foreground mb-1 uppercase tracking-widest">Overall Score</span>
            <span className="block text-5xl font-black text-foreground">{livePreviewScore.toFixed(1)}</span>
            <span className="block text-xs text-muted-foreground mt-2">OUT OF 100</span>
          </div>

          <div className="mt-6 text-xs text-muted-foreground/70 text-center">
            * Uses a fixed set of mock department scores to demonstrate the weighting effect.
          </div>
        </div>
      </div>
    </div>
  );
}
