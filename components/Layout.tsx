
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Cpu, Bell, User, Search, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 flex-shrink-0">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Cpu className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">GPU Maestro</span>
        </div>

        <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto" style={{ minHeight: 0 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('Nav item clicked:', item.id);
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Account Button at Bottom */}
        <button
          onClick={() => {
            console.log('Account button clicked!');
            setActiveTab('account');
          }}
          className="flex-shrink-0 mx-4 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent hover:border-slate-700"
        >
          <User size={20} />
          <span className="font-medium">账户设置</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 z-10">
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full w-96">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="搜索工作负载、节点、日志..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <Activity size={16} className="text-indigo-400" />
              <span className="text-sm font-medium">85% 利用率</span>
            </div>
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className="relative flex items-center gap-3 pl-6 pr-2 py-2 border-l border-slate-800 hover:bg-slate-800/50 -mr-2 transition-all cursor-pointer z-20"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-white leading-tight">管理员</p>
                <p className="text-xs text-slate-500">平台管理员</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                AD
              </div>
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
