import TabBar from '@/components/layout/TabBar';
import { SettingsProvider } from '@/components/layout/SettingsProvider';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settingsTabs = [
    { label: 'Overview', href: '/settings' },
    { label: 'Departments', href: '/settings/departments' },
    { label: 'Categories', href: '/settings/categories' },
    { label: 'ESG Config', href: '/settings/esg-config' },
    { label: 'Notification Settings', href: '/settings/notifications' },
  ];

  return (
    <SettingsProvider>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Settings & Administration</h1>
        <TabBar tabs={settingsTabs} />
        <div className="mt-6">
          {children}
        </div>
      </div>
    </SettingsProvider>
  );
}
