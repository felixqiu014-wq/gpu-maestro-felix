
import React, { useState, useEffect } from 'react';
import { MOCK_WORKLOADS, STATUS_COLORS, MOCK_MODELS, MOCK_DATASETS, GPU_PRICING } from '../constants';
import { JobStatus, Workload, ResourceType, JobPriority } from '../types';
import { Plus, Terminal, Clock, ExternalLink, Search, Zap, StopCircle, RefreshCcw, Activity, Code2, Globe, Cpu, Database, Box, X, ChevronRight, Copy, Monitor, ShieldCheck, Trash2, Package, Check, BookOpen } from 'lucide-react';
import { getJobStatusInsights } from '../services/geminiService';

const PRIORITY_MULTIPLIERS: Record<JobPriority, number> = {
  [JobPriority.LOW]: 0.8,
  [JobPriority.NORMAL]: 1.0,
  [JobPriority.HIGH]: 1.5,
  [JobPriority.URGENT]: 2.0,
};

const PRIORITY_COLORS: Record<JobPriority, string> = {
  [JobPriority.LOW]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  [JobPriority.NORMAL]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  [JobPriority.HIGH]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [JobPriority.URGENT]: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const Sandboxes: React.FC = () => {
  const [sessions, setSessions] = useState<Workload[]>(MOCK_WORKLOADS.filter(w => w.type === 'INTERACTIVE'));
  const [selectedSession, setSelectedSession] = useState<Workload | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportingSession, setExportingSession] = useState<Workload | null>(null);

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    interface: 'Web Terminal + VS Code',
    modelId: '',
    datasetId: '',
    gpuType: ResourceType.H100,
    gpuCount: 1,
    gpuSharingMode: 'exclusive' as 'shared' | 'exclusive',
    priority: JobPriority.NORMAL,
    configMapName: '',
    envVars: [] as Array<{ key: string; value: string }>
  });

  // Export Form State
  const [exportFormData, setExportFormData] = useState({
    imageName: '',
    imageTag: 'latest',
    description: '',
    registryPath: 'registry.hub.docker.com'
  });

  const fetchInsights = async (session: Workload) => {
    if (!session.logs) return;
    setIsLoadingInsight(true);
    const result = await getJobStatusInsights(session.logs, session.name);
    setInsight(result);
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    if (selectedSession) {
      fetchInsights(selectedSession);
    } else {
      setInsight(null);
    }
  }, [selectedSession]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: Workload = {
      id: `wl-${Math.floor(Math.random() * 1000)}`,
      name: formData.name || 'new-dev-env',
      type: 'INTERACTIVE',
      owner: 'Admin User',
      gpuRequested: formData.gpuCount,
      gpuType: formData.gpuType,
      status: JobStatus.RUNNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: formData.priority,
      logs: [
        '正在分配GPU资源...',
        '正在启动SSH隧道服务...',
        '正在初始化Web终端(ttyd)...',
        '模型权重已挂载到 /mnt/models',
        '已准备好进行远程开发。'
      ]
    };
    setSessions([newSession, ...sessions]);
    setIsCreateModalOpen(false);
  };

  const copySSH = (id: string) => {
    navigator.clipboard.writeText(`ssh -p 2222 user@cluster-node-${id}.gpu-maestro.io`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportClick = (session: Workload) => {
    setExportingSession(session);
    setExportFormData({
      imageName: session.name.toLowerCase().replace(/\s+/g, '-'),
      imageTag: 'latest',
      description: `Container image exported from sandbox: ${session.name}`,
      registryPath: 'registry.hub.docker.com'
    });
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to export the image
    console.log('Exporting sandbox as image:', {
      session: exportingSession?.name,
      ...exportFormData
    });
    setIsExportModalOpen(false);
    setExportingSession(null);
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">交互式沙箱</h1>
          <p className="text-slate-400 mt-1">高性能开发环境，支持VS Code和Web终端访问</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          创建沙箱
        </button>
      </div>

      {/* Connectivity Banner */}
      <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Monitor size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">远程开发已启用</h4>
            <p className="text-xs text-indigo-300/80 text-pretty">通过VS Code Remote-SSH连接，或使用集成的Web终端在浏览器中直接访问</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-[10px] text-emerald-400 font-bold">
            <ShieldCheck size={12} />
            SSH安全
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 w-full max-w-md">
            <Search size={18} className="text-slate-500" />
            <input type="text" placeholder="筛选沙箱..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-600" />
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><RefreshCcw size={18} /></button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800">
              <th className="px-6 py-4">名称</th>
              <th className="px-6 py-4">接口</th>
              <th className="px-6 py-4">计算资源</th>
              <th className="px-6 py-4">GPU型号</th>
              <th className="px-6 py-4">创建时间</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sessions.map((session) => (
              <tr 
                key={session.id} 
                className="group hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700">
                      <Terminal size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{session.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {session.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex gap-2">
                    <span className="p-1.5 bg-slate-800 rounded-lg text-indigo-400" title="VS Code Support"><Code2 size={14} /></span>
                    <span className="p-1.5 bg-slate-800 rounded-lg text-emerald-400" title="Web Terminal Support"><Terminal size={14} /></span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-sm font-medium text-slate-300">{session.gpuRequested}x GPU</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-medium text-slate-300">
                    {session.gpuType}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-slate-400" suppressHydrationWarning>
                    {new Date(session.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${STATUS_COLORS[session.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportClick(session);
                      }}
                      title="Export as Image"
                    >
                      <Package size={18} />
                    </button>
                    <button
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StopCircle size={18} />
                    </button>
                    <button
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">初始化新沙箱</h2>
                  <p className="text-[10px] text-slate-500">配置开发接口和硬件资源</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-12 gap-4">
                {/* Left Column - Main Settings */}
                <div className="col-span-7 space-y-4">
                  {/* Basic Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">沙箱名称</span>
                      <input
                        required
                        type="text"
                        placeholder="例如: transformer-dev-env"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </label>
                  </div>

                  {/* Mount Model & Dataset */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Box size={12} className="text-indigo-400" />
                        挂载模型
                      </span>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                          value={formData.modelId}
                          onChange={(e) => setFormData({...formData, modelId: e.target.value})}
                        >
                          <option value="">空(自定义上传)</option>
                          {MOCK_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600" />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Database size={12} className="text-emerald-400" />
                        Mount Dataset
                      </span>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                          value={formData.datasetId}
                          onChange={(e) => setFormData({...formData, datasetId: e.target.value})}
                        >
                          <option value="">None</option>
                          {MOCK_DATASETS.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600" />
                      </div>
                    </label>
                  </div>

                  {/* GPU Selection - Compact */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                      <Cpu size={14} className="text-amber-400" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">GPU选择</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.values(ResourceType).map(t => {
                        const pricing = GPU_PRICING[t];
                        const isSelected = formData.gpuType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData({...formData, gpuType: t})}
                            className={`relative p-2 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? 'bg-indigo-600/10 border-indigo-500'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="text-center">
                              <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {t.split(' ')[1]}
                              </p>
                              <p className={`text-[8px] uppercase ${isSelected ? 'text-indigo-300' : 'text-slate-600'}`}>
                                {pricing.vram}
                              </p>
                              <p className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}>
                                RMB {pricing.hourly}/hr
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GPU Count Slider */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GPU分配</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        formData.gpuSharingMode === 'shared'
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-indigo-400/10 text-indigo-400'
                      }`}>
                        {formData.gpuCount} GPU
                      </span>
                    </div>

                    {/* GPU Sharing Mode Toggle */}
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          gpuSharingMode: 'exclusive',
                          gpuCount: Math.max(1, Math.ceil(formData.gpuCount))
                        })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                          formData.gpuSharingMode === 'exclusive'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Zap size={14} />
                        独占
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          gpuSharingMode: 'shared',
                          gpuCount: formData.gpuCount > 0.9 ? 0.5 : (formData.gpuCount < 0.1 ? 0.5 : formData.gpuCount)
                        })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                          formData.gpuSharingMode === 'shared'
                            ? 'bg-amber-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Activity size={14} />
                        共享
                      </button>
                    </div>

                    {/* GPU Count Slider/Selector */}
                    <div>
                      {formData.gpuSharingMode === 'shared' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gpuCount: 0.5 })}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                              formData.gpuCount === 0.5
                                ? 'bg-amber-600 text-white shadow-lg'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            0.5 GPU
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, gpuCount: 0.25 })}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                              formData.gpuCount === 0.25
                                ? 'bg-amber-600 text-white shadow-lg'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            0.25 GPU
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="range"
                            min="1"
                            max="8"
                            step="1"
                            value={formData.gpuCount}
                            onChange={e => {
                              const newVal = parseInt(e.target.value);
                              setFormData({
                                ...formData,
                                gpuCount: newVal
                              });
                            }}
                            className="w-full accent-indigo-500"
                          />
                          <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                            <span>1</span>
                            <span>8</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Mode Description */}
                    <div className={`mt-3 p-2 rounded-lg text-[9px] ${
                      formData.gpuSharingMode === 'shared'
                        ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                        : 'bg-indigo-400/5 text-indigo-300/80 border border-indigo-400/10'
                    }`}>
                      {formData.gpuSharingMode === 'shared'
                        ? '共享模式：轻量级工作负载的GPU分片分配'
                        : '独占模式：专用GPU资源以实现最大性能'}
                    </div>
                  </div>

                  {/* ConfigMap Selection */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                      <Database size={14} className="text-purple-400" />
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">配置映射</h3>
                    </div>
                    <div>
                      <label className="block">
                        <span className="text-[9px] text-slate-500 mb-2 block">选择配置映射(可选)</span>
                        <select
                          className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                          value={formData.configMapName}
                          onChange={(e) => setFormData({...formData, configMapName: e.target.value})}
                        >
                          <option value="">无</option>
                          <option value="app-config">app-config</option>
                          <option value="training-params">training-params</option>
                          <option value="model-config">model-config</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-emerald-400" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">环境变量</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, envVars: [...formData.envVars, { key: '', value: '' }]})}
                        className="text-[9px] px-2 py-1 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-600/20 transition-all"
                      >
                        + 添加
                      </button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {formData.envVars.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-[9px] text-slate-600 italic">未配置环境变量</p>
                        </div>
                      ) : (
                        formData.envVars.map((env, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="KEY"
                              value={env.key}
                              onChange={(e) => {
                                const newEnvVars = [...formData.envVars];
                                newEnvVars[index].key = e.target.value;
                                setFormData({...formData, envVars: newEnvVars});
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            />
                            <input
                              type="text"
                              placeholder="VALUE"
                              value={env.value}
                              onChange={(e) => {
                                const newEnvVars = [...formData.envVars];
                                newEnvVars[index].value = e.target.value;
                                setFormData({...formData, envVars: newEnvVars});
                              }}
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] text-slate-200 outline-none focus:border-emerald-500 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newEnvVars = formData.envVars.filter((_, i) => i !== index);
                                setFormData({...formData, envVars: newEnvVars});
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Cost Summary & Actions */}
                <div className="col-span-5 flex flex-col">
                  {/* Estimated Cost Panel */}
                  <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 rounded-xl p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">预估成本</span>
                      {formData.priority !== JobPriority.NORMAL && (
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[formData.priority]}`}>
                          {formData.priority} ({PRIORITY_MULTIPLIERS[formData.priority]}x)
                        </span>
                      )}
                    </div>
                    <div className="text-center mb-3 flex-1 flex flex-col justify-center">
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-3xl font-bold text-white">
                          RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount * PRIORITY_MULTIPLIERS[formData.priority]).toFixed(2)}
                        </span>
                        <span className="text-sm text-indigo-300">/小时</span>
                      </div>
                      <span className="text-[8px] text-indigo-300/70 mb-4">按分钟计费</span>
                      <div className="space-y-1.5 pt-3 border-t border-indigo-500/20">
                        <div className="flex justify-between text-[9px]">
                          <span className="text-indigo-200/60">每天(24小时)</span>
                          <span className="font-mono text-indigo-200">
                            RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount * PRIORITY_MULTIPLIERS[formData.priority] * 24).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px]">
                          <span className="text-indigo-200/60">每月(30天)</span>
                          <span className="font-mono text-indigo-200">
                            RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount * PRIORITY_MULTIPLIERS[formData.priority] * 24 * 30).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {/* Launch Button */}
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                      启动开发沙箱
                    </button>

                    {/* Info */}
                    <div className="text-center text-[9px] text-slate-600 space-y-1">
                      <p>沙箱将在约30秒内就绪</p>
                      <p>30分钟无活动后自动停止</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedSession && !isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 border border-indigo-600/30">
                  <Terminal size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSession.name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[selectedSession.status]}`}>{selectedSession.status}</span>
                     <span className="text-xs text-slate-500">Instance: {selectedSession.id}</span>
                     <span className="text-xs text-slate-500">GPU Model: {selectedSession.gpuType}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8 custom-scrollbar">
              <div className="md:col-span-2 space-y-8">
                {/* Connection Options */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">修改代码与连接</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 shrink-0">
                          <Code2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-white text-sm">VS Code Remote</h4>
                            <span className="text-[8px] font-bold text-indigo-400 uppercase bg-indigo-400/5 px-2 py-0.5 rounded shrink-0">推荐</span>
                          </div>
                          <p className="text-xs text-slate-500">通过VS Code的Remote-SSH扩展连接，获得原生IDE体验。</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                            <code className="text-[10px] text-slate-400 font-mono">ssh -p 2222</code>
                            <button
                              onClick={() => copySSH(selectedSession.id)}
                              className="p-1 hover:bg-slate-800 rounded-md text-slate-500 hover:text-white transition-colors"
                            >
                              <Copy size={12} className={copied ? "text-emerald-400" : ""} />
                            </button>
                          </div>
                          <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                            Open
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-orange-500 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-orange-600/10 rounded-xl text-orange-400 shrink-0">
                          <BookOpen size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm mb-1">Jupyter Notebook</h4>
                          <p className="text-xs text-slate-500">Interactive notebook environment for data analysis and experimentation.</p>
                        </div>
                        <button className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2 shrink-0">
                          <ExternalLink size={12} />
                          Launch Jupyter
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-600/10 rounded-xl text-emerald-400 shrink-0">
                          <Terminal size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm mb-1">Web终端</h4>
                          <p className="text-xs text-slate-500">即时浏览器终端访问，用于快速编辑和执行。</p>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2 shrink-0">
                          <ExternalLink size={12} />
                          启动终端
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sandbox Activity</h3>
                  <div className="bg-black/60 rounded-2xl border border-slate-800 p-6 font-mono text-[11px] text-slate-400 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectedSession.logs?.map((log, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="opacity-30">09:4{i}:12</span>
                        <span className="text-indigo-300/80">{log}</span>
                      </div>
                    ))}
                    <div className="text-emerald-400 animate-pulse">_</div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Environment Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">VRAM Usage</span>
                      <span className="text-slate-200 font-bold font-mono">12.4 / 80 GB</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[15%]"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-slate-500">GPU Usage</span>
                      <span className="text-slate-200 font-bold font-mono">72%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[72%]"></div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="text-slate-500">GPU Power</span>
                      <span className="text-slate-200 font-bold font-mono">185W</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={16} className="text-indigo-400" />
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">AI Debugging</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    {insight || "Gemini is monitoring environment for potential CUDA OOM issues..."}
                  </p>
                </div>

                <button className="w-full py-4 bg-slate-800 text-red-400 border border-red-400/20 font-bold rounded-2xl hover:bg-red-400 hover:text-white transition-all">
                   停止并释放GPU
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT AS IMAGE MODAL */}
      {isExportModalOpen && exportingSession && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Package size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Export Sandbox as Container Image</h2>
                  <p className="text-[10px] text-slate-500">Package your development environment for batch training jobs.</p>
                </div>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="p-6 space-y-6 overflow-y-auto">
              {/* Source Info */}
              <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Terminal size={20} className="text-indigo-400" />
                  <div>
                    <p className="text-xs text-slate-500">Exporting from sandbox</p>
                    <p className="text-sm font-bold text-white">{exportingSession.name}</p>
                  </div>
                </div>
              </div>

              {/* 镜像配置 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">镜像名称</span>
                    <input
                      type="text"
                      required
                      value={exportFormData.imageName}
                      onChange={(e) => setExportFormData({ ...exportFormData, imageName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                      placeholder="my-training-env"
                    />
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">标签</span>
                    <input
                      type="text"
                      required
                      value={exportFormData.imageTag}
                      onChange={(e) => setExportFormData({ ...exportFormData, imageTag: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                      placeholder="latest"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Description</span>
                  <textarea
                    value={exportFormData.description}
                    onChange={(e) => setExportFormData({ ...exportFormData, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all resize-none"
                    rows={3}
                    placeholder="Describe this environment..."
                  />
                </label>
              </div>

              {/* 注册表配置 */}
              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">目标注册表</span>
                  <input
                    type="text"
                    value={exportFormData.registryPath}
                    onChange={(e) => setExportFormData({ ...exportFormData, registryPath: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all font-mono"
                    placeholder="registry.hub.docker.com"
                  />
                </label>
              </div>

              {/* Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">镜像URL预览</p>
                <code className="text-xs text-indigo-400 font-mono break-all">
                  {exportFormData.registryPath}/{exportFormData.imageName}:{exportFormData.imageTag}
                </code>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Package size={18} />
                  Export Image
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sandboxes;
