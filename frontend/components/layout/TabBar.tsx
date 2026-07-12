'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface Tab {
  label: string;
  href: string;
}

export interface TabBarProps {
  tabs: Tab[];
}

export default function TabBar({ tabs }: TabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 border-b border-gray-200 mb-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
