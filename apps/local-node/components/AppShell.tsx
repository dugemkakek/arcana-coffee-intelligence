// Client wrapper that supplies the active pathname to the server-rendered
// Sidebar. Renders the Sidebar on lg+ and a horizontal scrollable top strip
// on smaller viewports.

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { href: '/roasts/live', label: 'Live', icon: '🔴', match: (p) => p.startsWith('/roasts/live') },
  { href: '/', label: 'Roasts', icon: '☕', match: (p) => p === '/' || (p.startsWith('/roasts/') && !p.startsWith('/roasts/live')) || p === '/import' },
  { href: '/inventory', label: 'Inventory', icon: '📦', match: (p) => p.startsWith('/inventory') },
  { href: '/plan', label: 'Plan', icon: '📋', match: (p) => p.startsWith('/plan') },
];

function MobileBar({ activePath }: { activePath: string }) {
  return (
    <nav className="lg:hidden bg-bean-900 text-bean-50 overflow-x-auto" aria-label="Primary">
      <ul className="flex gap-1 px-3 py-2 min-w-max">
        {NAV.map((item) => {
          const isActive = item.match(activePath);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap',
                  isActive ? 'bg-bean-800 text-roast-300' : 'text-bean-200 hover:bg-bean-800',
                ].join(' ')}
              >
                <span aria-hidden>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DesktopSidebar({ activePath }: { activePath: string }) {
  return (
    <aside
      className="hidden lg:flex bg-bean-900 text-bean-50 min-h-screen w-56 flex-shrink-0 flex-col"
      aria-label="Primary"
    >
      <div className="px-5 py-5 border-b border-bean-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90">
          <span className="text-2xl" aria-hidden>☕</span>
          <div>
            <div className="text-base font-bold leading-tight">Arcana</div>
            <div className="text-[10px] uppercase tracking-wider text-bean-300">
              Coffee Intelligence
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const isActive = item.match(activePath);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex items-center gap-3 px-5 py-2.5 text-sm transition',
                    'border-l-2',
                    isActive
                      ? 'bg-bean-800 text-roast-300 border-roast-500 font-semibold'
                      : 'border-transparent text-bean-200 hover:bg-bean-800 hover:text-bean-50',
                  ].join(' ')}
                >
                  <span aria-hidden className="text-base w-5 text-center">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-5 py-3 border-t border-bean-800 text-[11px] text-bean-300 leading-relaxed">
        <div className="font-mono text-bean-200">v0.3.0 · local node</div>
        <div className="mt-1">
          AI provider:{' '}
          <code className="font-mono text-bean-200">
            {process.env.NEXT_PUBLIC_AI_PROVIDER ?? process.env.AI_PROVIDER ?? 'mock'}
          </code>
        </div>
        <div className="mt-1 text-bean-400">MIT</div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bean-50 text-bean-900 antialiased">
      <MobileBar activePath={pathname} />
      <DesktopSidebar activePath={pathname} />
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
