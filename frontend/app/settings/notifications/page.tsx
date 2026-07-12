'use client';

import { useEffect, useState } from 'react';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/api-client';
import { NotificationSettings } from '@/lib/types';

export default function NotificationsPage() {
  const [formData, setFormData] = useState<NotificationSettings>({
    emailEnabled: true, inAppEnabled: true, 
    notifyOnComplianceIssue: true, notifyOnComplianceOverdue: true,
    notifyOnCsrApproval: true, notifyOnChallengeApproval: true,
    notifyOnPolicyReminder: true, notifyOnBadgeUnlock: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getNotificationSettings();
        setFormData(data);
      } catch (err) {
        console.error(err);
      }
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, []);

  if (!formData) {
    return <div className="text-gray-500">Loading notification settings...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    
    try {
      await updateNotificationSettings(formData);
      setSuccess('Notification settings saved successfully.');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getActiveTriggers = () => {
    const active = [];
    if (formData.notifyOnComplianceIssue) active.push("New Compliance Issue");
    if (formData.notifyOnComplianceOverdue) active.push("Overdue Compliance");
    if (formData.notifyOnCsrApproval || formData.notifyOnChallengeApproval) active.push("CSR/Challenge Approval");
    if (formData.notifyOnPolicyReminder) active.push("Policy Reminder");
    if (formData.notifyOnBadgeUnlock) active.push("Badge Unlocked");
    return active;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Channels */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Delivery Channels</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" checked={formData.inAppEnabled} onChange={e => setFormData({...formData, inAppEnabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">In-App Notifications</span>
                </label>
                <label className="flex items-center space-x-3 mt-4">
                  <input type="checkbox" checked={formData.emailEnabled} onChange={e => setFormData({...formData, emailEnabled: e.target.checked})} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                </label>
              </div>
            </div>

            {/* Triggers */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-8">Notification Triggers</h3>
              <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Compliance Issue Raised</h4>
                <p className="text-sm text-gray-500">Notify when a new compliance issue is flagged during audit</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, notifyOnComplianceIssue: !formData.notifyOnComplianceIssue})}
                className={`${formData.notifyOnComplianceIssue ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${formData.notifyOnComplianceIssue ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Compliance Issue Overdue</h4>
                <p className="text-sm text-gray-500">Notify when an open issue passes its deadline</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, notifyOnComplianceOverdue: !formData.notifyOnComplianceOverdue})}
                className={`${formData.notifyOnComplianceOverdue ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${formData.notifyOnComplianceOverdue ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">CSR Approval Decisions</h4>
                <p className="text-sm text-gray-500">Notify employees when their CSR activity is approved</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, notifyOnCsrApproval: !formData.notifyOnCsrApproval})}
                className={`${formData.notifyOnCsrApproval ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${formData.notifyOnCsrApproval ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Policy Reminders</h4>
                <p className="text-sm text-gray-500">Send automated reminders for unacknowledged policies</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, notifyOnPolicyReminder: !formData.notifyOnPolicyReminder})}
                className={`${formData.notifyOnPolicyReminder ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${formData.notifyOnPolicyReminder ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Badge Unlocks</h4>
                <p className="text-sm text-gray-500">Notify users when they earn a new badge</p>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({...formData, notifyOnBadgeUnlock: !formData.notifyOnBadgeUnlock})}
                className={`${formData.notifyOnBadgeUnlock ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${formData.notifyOnBadgeUnlock ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
              </div>
            </div>

            <div className="pt-5 border-t">
              <button disabled={isSaving} type="submit" className={`px-4 py-2 text-white font-medium rounded shadow ${!isSaving ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Panel</h3>
          
          <div className="space-y-4">
            {!formData.inAppEnabled && !formData.emailEnabled ? (
              <p className="text-sm text-gray-500 italic">All delivery channels are disabled. Users will not receive notifications.</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Simulated Notifications</p>
                {getActiveTriggers().length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No triggers selected.</p>
                ) : (
                  getActiveTriggers().map((trigger, idx) => (
                    <div key={idx} className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-gray-800">{trigger}</span>
                        {formData.inAppEnabled && <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded">In-App</span>}
                        {formData.emailEnabled && <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded ml-1">Email</span>}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        You have a new alert regarding: <strong>{trigger}</strong>. Please check your dashboard for details.
                      </p>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
