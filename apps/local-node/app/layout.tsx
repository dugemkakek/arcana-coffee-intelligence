import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Arcana Coffee Intelligence',
  description: 'AI-powered roast analysis for Indonesian micro-roasteries',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bean-50 text-bean-900 antialiased">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="bg-bean-900 text-bean-50 shadow-md">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3">
                  <span className="text-2xl">☕</span>
                  <div>
                    <h1 className="text-lg font-bold">Arcana Coffee Intelligence</h1>
                    <p className="text-xs text-bean-200">v0.1.0 · local node</p>
                  </div>
                </a>
                <nav className="flex gap-4 text-sm">
                  <a href="/" className="hover:text-roast-300">
                    Roasts
                  </a>
                  <a href="/import" className="hover:text-roast-300">
                    Import
                  </a>
                </nav>
              </div>
            </header>
            <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">{children}</main>
            <footer className="bg-bean-100 text-bean-700 text-xs">
              <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
                <span>Arcana Coffee Intelligence · MIT</span>
                <span>
                  AI provider: <code className="font-mono">{process.env.AI_PROVIDER ?? 'minimax'}</code>
                </span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
