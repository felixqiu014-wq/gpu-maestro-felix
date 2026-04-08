
import React, { useState } from 'react';
import { MOCK_DATASETS, MOCK_MODELS, GPU_PRICING } from '../constants';
import { ResourceType, JobPriority } from '../types';
import { Database, Search, RefreshCw, ExternalLink, Terminal, X, Cpu, Box, ChevronRight, BrainCircuit, Rocket, GitBranch, Monitor, Settings2, Timer, Zap, Activity } from 'lucide-react';

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

const PRIORITY_NAMES: Record<JobPriority, string> = {
  [JobPriority.LOW]: '低',
  [JobPriority.NORMAL]: '正常',
  [JobPriority.HIGH]: '高',
  [JobPriority.URGENT]: '紧急',
};

const DatasetManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [deployTab, setDeployTab] = useState<'sandbox' | 'training'>('sandbox');

  // Sandbox Form State
  const [sandboxFormData, setSandboxFormData] = useState({
    name: '',
    modelId: '',
    datasetId: '',
    gpuType: ResourceType.H100,
    gpuCount: 1,
    gpuSharingMode: 'exclusive' as 'shared' | 'exclusive',
    priority: JobPriority.NORMAL
  });

  // Training Job Form State
  const [trainingFormData, setTrainingFormData] = useState({
    name: '',
    sourceType: 'git' as 'git' | 'image',
    gitRepo: '',
    gitBranch: 'main',
    entrypoint: 'train.py',
    imageUri: '',
    imageCommand: '',
    modelId: '',
    datasetId: '',
    gpuType: ResourceType.H100,
    gpuCount: 1,
    gpuSharingMode: 'exclusive' as 'shared' | 'exclusive',
    priority: JobPriority.NORMAL,
    timeoutMinutes: 240
  });

  const filteredDatasets = MOCK_DATASETS.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeployClick = (datasetId: string) => {
    setSelectedDataset(datasetId);
    setSandboxFormData({ ...sandboxFormData, datasetId });
    setTrainingFormData({ ...trainingFormData, datasetId });
    setIsDeployModalOpen(true);
  };

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating sandbox with dataset:', selectedDataset, sandboxFormData);
    setIsDeployModalOpen(false);
  };

  const handleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating training job with dataset:', selectedDataset, trainingFormData);
    setIsDeployModalOpen(false);
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">公共数据集</h1>
        <p className="text-slate-400 mt-1">浏览和使用平台提供的数据集用于训练和评估任务</p>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex-1 max-w-md">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="搜索数据集..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all">
          <RefreshCw size={14} />
          刷新
        </button>
      </div>

      {/* Dataset List */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800">
              <th className="px-6 py-4">数据集名称</th>
              <th className="px-6 py-4">大小/项目数</th>
              <th className="px-6 py-4">格式</th>
              <th className="px-6 py-4">类别</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredDatasets.map((ds) => (
              <tr key={ds.id} className="group hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${ds.category === 'TRAIN' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      <Database size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white transition-colors text-sm">{ds.name}</p>
                      <p className="text-[10px] text-slate-600 font-mono truncate max-w-[180px]">{ds.source}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-300">{ds.size}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{ds.items}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
                    {ds.format}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${ds.category === 'TRAIN' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {ds.category}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    ds.status === 'SYNCED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                    ds.status === 'PENDING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                    'text-red-400 border-red-400/20 bg-red-400/5'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${ds.status === 'SYNCED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    {ds.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => handleDeployClick(ds.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-all"
                  >
                    <ExternalLink size={14} />
                    使用数据集
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DEPLOY MODAL WITH TABS */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/90 backdrop-blur-sm p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            {/* Modal Header with Tabs */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                    <Rocket size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">使用数据集</h2>
                    <p className="text-[10px] text-slate-500">已选择: {MOCK_DATASETS.find(d => d.id === selectedDataset)?.name}</p>
                  </div>
                </div>
                <button onClick={() => setIsDeployModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeployTab('sandbox')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${deployTab === 'sandbox' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Terminal size={16} />
                  新建沙箱
                </button>
                <button
                  type="button"
                  onClick={() => setDeployTab('training')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${deployTab === 'training' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <BrainCircuit size={16} />
                  新建训练任务
                </button>
              </div>
            </div>

            {/* New Sandbox Tab */}
            {deployTab === 'sandbox' && (
              <form onSubmit={handleSandboxSubmit} className="p-6 overflow-y-auto">
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          value={sandboxFormData.name}
                          onChange={(e) => setSandboxFormData({...sandboxFormData, name: e.target.value})}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">优先级</span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                            value={sandboxFormData.priority}
                            onChange={(e) => setSandboxFormData({...sandboxFormData, priority: e.target.value as JobPriority})}
                          >
                            {Object.values(JobPriority).map((priority) => (
                              <option key={priority} value={priority}>
                                {PRIORITY_NAMES[priority]} ({PRIORITY_MULTIPLIERS[priority]}x)
                              </option>
                            ))}
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                        </div>
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
                            value={sandboxFormData.modelId}
                            onChange={(e) => setSandboxFormData({...sandboxFormData, modelId: e.target.value})}
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
                          挂载数据集
                        </span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                            value={sandboxFormData.datasetId}
                            onChange={(e) => setSandboxFormData({...sandboxFormData, datasetId: e.target.value})}
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

                    {/* GPU Selection */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                        <Cpu size={14} className="text-amber-400" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">GPU选择</h3>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.values(ResourceType).map(t => {
                          const pricing = GPU_PRICING[t];
                          const isSelected = sandboxFormData.gpuType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setSandboxFormData({...sandboxFormData, gpuType: t})}
                              className={`relative p-2 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'bg-emerald-600/10 border-emerald-500'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-center">
                                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                  {t.split(' ')[1]}
                                </p>
                                <p className={`text-[8px] uppercase ${isSelected ? 'text-emerald-300' : 'text-slate-600'}`}>
                                  {pricing.vram}
                                </p>
                                <p className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  RMB {pricing.hourly}/hr
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* GPU Allocation */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GPU分配</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          sandboxFormData.gpuSharingMode === 'shared'
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-emerald-400/10 text-emerald-400'
                        }`}>
                          {sandboxFormData.gpuCount} GPU
                        </span>
                      </div>

                      {/* GPU Sharing Mode Toggle */}
                      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-4">
                        <button
                          type="button"
                          onClick={() => setSandboxFormData({
                            ...sandboxFormData,
                            gpuSharingMode: 'exclusive',
                            gpuCount: Math.max(1, Math.ceil(sandboxFormData.gpuCount))
                          })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            sandboxFormData.gpuSharingMode === 'exclusive'
                              ? 'bg-emerald-600 text-white shadow-lg'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Zap size={14} />
                          独占
                        </button>
                        <button
                          type="button"
                          onClick={() => setSandboxFormData({
                            ...sandboxFormData,
                            gpuSharingMode: 'shared',
                            gpuCount: sandboxFormData.gpuCount > 0.9 ? 0.5 : (sandboxFormData.gpuCount < 0.1 ? 0.5 : sandboxFormData.gpuCount)
                          })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            sandboxFormData.gpuSharingMode === 'shared'
                              ? 'bg-amber-600 text-white shadow-lg'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Activity size={14} />
                          共享
                        </button>
                      </div>

                      {/* GPU Count Selector */}
                      <div>
                        {sandboxFormData.gpuSharingMode === 'shared' ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSandboxFormData({ ...sandboxFormData, gpuCount: 0.5 })}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                sandboxFormData.gpuCount === 0.5
                                  ? 'bg-amber-600 text-white shadow-lg'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                              }`}
                            >
                              0.5 GPU
                            </button>
                            <button
                              type="button"
                              onClick={() => setSandboxFormData({ ...sandboxFormData, gpuCount: 0.25 })}
                              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                sandboxFormData.gpuCount === 0.25
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
                            value={sandboxFormData.gpuCount}
                            onChange={e => {
                              const newVal = parseInt(e.target.value);
                              setSandboxFormData({
                                ...sandboxFormData,
                                gpuCount: newVal
                              });
                            }}
                            className="w-full accent-emerald-500"
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
                        sandboxFormData.gpuSharingMode === 'shared'
                          ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                          : 'bg-emerald-400/5 text-emerald-300/80 border border-emerald-400/10'
                      }`}>
                        {sandboxFormData.gpuSharingMode === 'shared'
                          ? '共享模式：轻量级工作负载的GPU分片分配'
                          : '独占模式：专用GPU资源，性能最大化'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Cost Summary & Actions */}
                  <div className="col-span-5 flex flex-col">
                    {/* Estimated Cost Panel */}
                    <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/30 rounded-xl p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">预估成本</span>
                        {sandboxFormData.priority !== JobPriority.NORMAL && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[sandboxFormData.priority]}`}>
                            {sandboxFormData.priority} ({PRIORITY_MULTIPLIERS[sandboxFormData.priority]}x)
                          </span>
                        )}
                      </div>
                      <div className="text-center mb-3 flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                          <span className="text-3xl font-bold text-white">
                            RMB {(GPU_PRICING[sandboxFormData.gpuType].hourly * sandboxFormData.gpuCount * PRIORITY_MULTIPLIERS[sandboxFormData.priority]).toFixed(2)}
                          </span>
                          <span className="text-sm text-emerald-300">/小时</span>
                        </div>
                        <span className="text-[8px] text-emerald-300/70 mb-4">按分钟计费</span>
                        <div className="space-y-1.5 pt-3 border-t border-emerald-500/20">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-emerald-200/60">每天(24小时)</span>
                            <span className="font-mono text-emerald-200">
                              RMB {(GPU_PRICING[sandboxFormData.gpuType].hourly * sandboxFormData.gpuCount * PRIORITY_MULTIPLIERS[sandboxFormData.priority] * 24).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-emerald-200/60">每月(30天)</span>
                            <span className="font-mono text-emerald-200">
                              RMB {(GPU_PRICING[sandboxFormData.gpuType].hourly * sandboxFormData.gpuCount * PRIORITY_MULTIPLIERS[sandboxFormData.priority] * 24 * 30).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20">
                        启动开发沙箱
                      </button>
                      <div className="text-center text-[9px] text-slate-600 space-y-1">
                        <p>您的沙箱将在约30秒内准备就绪</p>
                        <p>30分钟无活动后自动停止</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* New Training Job Tab */}
            {deployTab === 'training' && (
              <form onSubmit={handleTrainingSubmit} className="p-6 overflow-y-auto">
                <div className="grid grid-cols-12 gap-4">
                  {/* Left Column - Main Settings */}
                  <div className="col-span-7 space-y-4">
                    {/* Basic Meta */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">任务名称</span>
                        <input
                          required
                          type="text"
                          placeholder="例如: resnet-finetune-v1"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                          value={trainingFormData.name}
                          onChange={(e) => setTrainingFormData({...trainingFormData, name: e.target.value})}
                        />
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">优先级</span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                            value={trainingFormData.priority}
                            onChange={(e) => setTrainingFormData({...trainingFormData, priority: e.target.value as JobPriority})}
                          >
                            {Object.values(JobPriority).map((priority) => (
                              <option key={priority} value={priority}>
                                {PRIORITY_NAMES[priority]} ({PRIORITY_MULTIPLIERS[priority]}x)
                              </option>
                            ))}
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                        </div>
                      </label>
                    </div>

                    {/* Source Selection */}
                    <div>
                      <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-3">
                        <button
                          type="button"
                          onClick={() => setTrainingFormData({...trainingFormData, sourceType: 'git'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${trainingFormData.sourceType === 'git' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <GitBranch size={14} />
                          Git仓库
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrainingFormData({...trainingFormData, sourceType: 'image'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${trainingFormData.sourceType === 'image' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <Monitor size={14} />
                          容器镜像
                        </button>
                      </div>

                      {trainingFormData.sourceType === 'git' ? (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block">
                              <span className="text-[9px] text-slate-500 mb-1 block">仓库URL</span>
                              <input
                                type="text"
                                placeholder="https://github.com/org/repo.git"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                                value={trainingFormData.gitRepo}
                                onChange={(e) => setTrainingFormData({...trainingFormData, gitRepo: e.target.value})}
                              />
                            </label>
                          </div>
                          <div>
                            <label className="block">
                              <span className="text-[9px] text-slate-500 mb-1 block">Branch</span>
                              <input
                                type="text"
                                placeholder="main"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                                value={trainingFormData.gitBranch}
                                onChange={(e) => setTrainingFormData({...trainingFormData, gitBranch: e.target.value})}
                              />
                            </label>
                          </div>
                          <div className="col-span-3">
                            <label className="block">
                              <span className="text-[9px] text-slate-500 mb-1 block">入口命令</span>
                              <input
                                type="text"
                                placeholder="python train.py --config config.yaml"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none"
                                value={trainingFormData.entrypoint}
                                onChange={(e) => setTrainingFormData({...trainingFormData, entrypoint: e.target.value})}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="block">
                              <span className="text-[9px] text-slate-500 mb-1 block">镜像URL</span>
                              <input
                                type="text"
                                placeholder="registry.hub.docker.com/pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                                value={trainingFormData.imageUri}
                                onChange={(e) => setTrainingFormData({...trainingFormData, imageUri: e.target.value})}
                              />
                            </label>
                          </div>
                          <div>
                            <label className="block">
                              <span className="text-[9px] text-slate-500 mb-1 block">覆盖命令</span>
                              <input
                                type="text"
                                placeholder="sh launch.sh --epochs 100"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono outline-none"
                                value={trainingFormData.imageCommand}
                                onChange={(e) => setTrainingFormData({...trainingFormData, imageCommand: e.target.value})}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Data & Model Mounts */}
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Box size={12} className="text-indigo-400" />
                          模型
                        </span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                            value={trainingFormData.modelId}
                            onChange={(e) => setTrainingFormData({...trainingFormData, modelId: e.target.value})}
                          >
                            <option value="">None</option>
                            {MOCK_MODELS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Database size={12} className="text-emerald-400" />
                          数据集
                        </span>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none pr-8"
                            value={trainingFormData.datasetId}
                            onChange={(e) => setTrainingFormData({...trainingFormData, datasetId: e.target.value})}
                          >
                            <option value="">None</option>
                            {MOCK_DATASETS.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                        </div>
                      </label>
                    </div>

                    {/* Hardware Config */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Settings2 size={14} className="text-amber-400" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">硬件配置</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">GPU类型</span>
                          <div className="flex gap-2">
                            {[ResourceType.H100, ResourceType.A100, ResourceType.L40S, ResourceType.V100].map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTrainingFormData({...trainingFormData, gpuType: t})}
                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${trainingFormData.gpuType === t ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                              >
                                {t.split(' ')[1]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">GPU分配</span>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-lg ${
                              trainingFormData.gpuSharingMode === 'shared'
                                ? 'bg-amber-400/10 text-amber-400'
                                : 'bg-emerald-400/10 text-emerald-400'
                            }`}>
                              {trainingFormData.gpuCount}
                            </span>
                          </div>
                          <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 mb-2">
                            <button
                              type="button"
                              onClick={() => setTrainingFormData({
                                ...trainingFormData,
                                gpuSharingMode: 'exclusive',
                                gpuCount: Math.max(1, Math.ceil(trainingFormData.gpuCount))
                              })}
                              className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
                                trainingFormData.gpuSharingMode === 'exclusive'
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Zap size={10} className="inline mr-1" />
                              Exclusive
                            </button>
                            <button
                              type="button"
                              onClick={() => setTrainingFormData({
                                ...trainingFormData,
                                gpuSharingMode: 'shared',
                                gpuCount: trainingFormData.gpuCount > 0.9 ? 0.5 : (trainingFormData.gpuCount < 0.1 ? 0.5 : trainingFormData.gpuCount)
                              })}
                              className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
                                trainingFormData.gpuSharingMode === 'shared'
                                  ? 'bg-amber-600 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Activity size={10} className="inline mr-1" />
                              共享
                            </button>
                          </div>
                          <input
                            type="range"
                            min={trainingFormData.gpuSharingMode === 'shared' ? '0.1' : '1'}
                            max={trainingFormData.gpuSharingMode === 'shared' ? '0.9' : '32'}
                            step={trainingFormData.gpuSharingMode === 'shared' ? '0.1' : '1'}
                            value={trainingFormData.gpuSharingMode === 'shared' && trainingFormData.gpuCount > 0.9 ? 0.5 : trainingFormData.gpuCount}
                            onChange={e => {
                              let newVal = trainingFormData.gpuSharingMode === 'shared' ? parseFloat(e.target.value) : parseInt(e.target.value);

                              // 如果在shared模式下，确保不超过0.9
                              if (trainingFormData.gpuSharingMode === 'shared' && newVal > 0.9) {
                                newVal = 0.9;
                              }

                              // 根据值自动切换模式
                              const newMode = newVal < 1 ? 'shared' : trainingFormData.gpuSharingMode;

                              setTrainingFormData({
                                ...trainingFormData,
                                gpuCount: newVal,
                                gpuSharingMode: newMode
                              });
                            }}
                            className={`w-full ${trainingFormData.gpuSharingMode === 'shared' ? 'accent-amber-500' : 'accent-emerald-500'}`}
                          />
                        </div>
                      </div>

                      {/* Mode Description for Training */}
                      <div className={`p-2 rounded-lg text-[9px] ${
                        trainingFormData.gpuSharingMode === 'shared'
                          ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                          : 'bg-emerald-400/5 text-emerald-300/80 border border-emerald-400/10'
                      }`}>
                        {trainingFormData.gpuSharingMode === 'shared'
                          ? '共享模式：多个任务可共享同一GPU'
                          : '独占模式：为该任务分配专用GPU'}
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="flex items-center gap-2">
                            <Timer size={14} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">超时时间</span>
                          </label>
                          <span className="text-xs font-mono text-emerald-400">{trainingFormData.timeoutMinutes}m ({Math.round(trainingFormData.timeoutMinutes / 60 * 10) / 10}h)</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="1440"
                          step="30"
                          value={trainingFormData.timeoutMinutes}
                          onChange={e => setTrainingFormData({...trainingFormData, timeoutMinutes: parseInt(e.target.value)})}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Cost Summary & Actions */}
                  <div className="col-span-5 flex flex-col">
                    {/* Cost Estimation */}
                    <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/30 rounded-xl p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">预估成本</span>
                        {trainingFormData.priority !== JobPriority.NORMAL && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[trainingFormData.priority]}`}>
                            {trainingFormData.priority} ({PRIORITY_MULTIPLIERS[trainingFormData.priority]}x)
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center space-y-3">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white mb-1">
                            RMB {(GPU_PRICING[trainingFormData.gpuType].hourly * trainingFormData.gpuCount * PRIORITY_MULTIPLIERS[trainingFormData.priority]).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-emerald-200/70">per hour</p>
                        </div>

                        <div className="bg-slate-950/30 rounded-lg p-3 border border-emerald-500/10">
                          <div className="flex justify-between items-center text-[9px] mb-2">
                            <span className="text-emerald-200/60">For {Math.round(trainingFormData.timeoutMinutes / 60 * 10) / 10}h</span>
                            <span className="font-mono text-white text-sm">
                              RMB {(GPU_PRICING[trainingFormData.gpuType].hourly * trainingFormData.gpuCount * PRIORITY_MULTIPLIERS[trainingFormData.priority] * (trainingFormData.timeoutMinutes / 60)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="text-center pt-2 border-t border-emerald-500/20">
                          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
                            <Cpu size={12} />
                            <span>{trainingFormData.gpuType.split(' ')[1]}</span>
                            <span>×</span>
                            <span>{trainingFormData.gpuCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                      >
                        确认并排队任务
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeployModalOpen(false)}
                        className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetManagement;
