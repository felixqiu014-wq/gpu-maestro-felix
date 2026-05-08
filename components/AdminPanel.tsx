import React, { useState } from 'react';
import { Server, Sliders, Cpu, Database, Thermometer, CheckCircle2, AlertTriangle, Activity, Zap } from 'lucide-react';
import { MOCK_GPUS } from '../constants';
import WorkspaceManagement from './admin/WorkspaceManagement';

const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'nodes'>('settings');
  const nodes = Array.from(new Set(MOCK_GPUS.map((gpu) => gpu.nodeName)));

  return (
    <div className="space-y-8 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">管理中心</h1>
          <p className="text-slate-400 mt-1">管理全局策略和集群基础设施健康状态</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={16} />
            团队概览
          </button>
          <button
            onClick={() => setActiveSubTab('nodes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeSubTab === 'nodes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server size={16} />
            节点与集群
          </button>
        </div>
      </div>

      {activeSubTab === 'settings' ? (
        <div className="grid grid-cols-1 gap-8">
          <WorkspaceManagement />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in-95 duration-300">
          {nodes.map((nodeName) => {
            const nodeGpus = MOCK_GPUS.filter((gpu) => gpu.nodeName === nodeName);
            const isHealthy = nodeGpus.every((gpu) => gpu.status === 'HEALTHY');

            return (
              <div key={nodeName} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="p-6 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      <Server size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{nodeName}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">CPU使用率</p>
                      <p className="text-sm font-bold text-white">12 / 64 核心</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">内存</p>
                      <p className="text-sm font-bold text-white">45 / 256 GB</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      {isHealthy ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span className="text-xs font-bold uppercase tracking-wider">{isHealthy ? '健康' : '检测到问题'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {nodeGpus.map((gpu) => (
                    <div key={gpu.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-indigo-400">
                          <Cpu size={20} />
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            gpu.status === 'HEALTHY'
                              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5'
                              : gpu.status === 'WARNING'
                                ? 'text-amber-400 border-amber-400/20 bg-amber-400/5'
                                : 'text-red-400 border-red-400/20 bg-red-400/5'
                          }`}
                        >
                          {gpu.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100">{gpu.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{gpu.type}</p>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Database size={12} />
                            <span>显存</span>
                          </div>
                          <span className="font-mono text-slate-200">
                            {gpu.usedMemoryGB}/{gpu.totalMemoryGB}GB
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full group-hover:bg-indigo-400 transition-colors" style={{ width: `${(gpu.usedMemoryGB / gpu.totalMemoryGB) * 100}%` }} />
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Activity size={12} />
                            <span>GPU使用率</span>
                          </div>
                          <span className="font-mono text-slate-200">{gpu.utilizationPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className={`h-full group-hover:bg-emerald-400 transition-colors ${
                              gpu.utilizationPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${gpu.utilizationPercent}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Thermometer size={12} />
                            <span>温度</span>
                          </div>
                          <span className={`font-mono ${gpu.temperatureCelsius > 70 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {gpu.temperatureCelsius}°C
                          </span>
                        </div>

                        {gpu.powerUsageWatts !== undefined && (
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Zap size={12} />
                              <span>功耗</span>
                            </div>
                            <span className="font-mono text-slate-200">{gpu.powerUsageWatts}W</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
