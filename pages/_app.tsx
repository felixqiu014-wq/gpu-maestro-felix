import React from 'react';
import type { AppProps } from 'next/app';
import { Bell, Cpu, User } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import '../styles/globals.css';

export default function App({ Component, pageProps, router }: AppProps) {
  // Map pathname to tab id
  const pathToTab = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'dashboard';
      case '/sandboxes':
        return 'sandboxes';
      case '/jobs':
        return 'jobs';
      case '/models':
        return 'models';
      case '/datasets':
        return 'datasets';
      case '/files':
        return 'files';
      case '/admin':
        return 'admin';
      default:
        return 'dashboard';
    }
  };

  const activeTab = pathToTab(router.pathname);

  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case 'dashboard':
        router.push('/');
        break;
      case 'sandboxes':
        router.push('/sandboxes');
        break;
      case 'jobs':
        router.push('/jobs');
        break;
      case 'models':
        router.push('/models');
        break;
      case 'datasets':
        router.push('/datasets');
        break;
      case 'files':
        router.push('/files');
        break;
      case 'admin':
        router.push('/admin');
        break;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#08111f] text-slate-100">
      <div className="flex h-full bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),linear-gradient(180deg,#08111f_0%,#0b1220_55%,#0a1020_100%)]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/50 px-[18px] py-[18px] backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3 px-1 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)]">
              <Cpu size={22} />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.16em] text-slate-500">GPU MAESTRO</div>
              <div className="text-base font-semibold text-slate-100">私有化平台</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-slate-50'
                      : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-blue-300' : 'text-slate-500'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 space-y-1 border-t border-slate-800/80 pt-4">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-900/70 hover:text-slate-100">
              <Bell size={20} className="text-slate-500" />
              <span>消息中心</span>
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-slate-900/70 hover:text-slate-100">
              <User size={20} className="text-slate-500" />
              <span>帐户设置</span>
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-slate-950/18">
          <div className="border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                <Cpu size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">GPU MAESTRO</div>
                <div className="text-sm font-semibold text-slate-100">私有化平台</div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <Component {...pageProps} />
          </div>
        </main>
      </div>
    </div>
  );
}
