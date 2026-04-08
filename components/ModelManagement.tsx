
import React, { useState } from 'react';
import { MOCK_MODELS, MOCK_DATASETS, GPU_PRICING } from '../constants';
import { ResourceType, JobStatus, Workload, JobPriority } from '../types';
import { Box, Search, ExternalLink, Tag, Cpu, HardDrive, X, Terminal, Monitor, Rocket, GitBranch, ChevronRight, Database, Timer, Settings2, BrainCircuit, Zap, Activity } from 'lucide-react';

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

const ModelManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
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

  const filteredModels = MOCK_MODELS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'DEPLOYED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'READY': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ARCHIVED': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const handleDeployClick = (modelId: string) => {
    setSelectedModel(modelId);
    setSandboxFormData({ ...sandboxFormData, modelId });
    setTrainingFormData({ ...trainingFormData, modelId });
    setIsDeployModalOpen(true);
  };

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating sandbox with model:', selectedModel, sandboxFormData);
    setIsDeployModalOpen(false);
  };

  const handleTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating training job with model:', selectedModel, trainingFormData);
    setIsDeployModalOpen(false);
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">模型管理</h1>
          <p className="text-slate-400">管理训练权重、架构和部署版本</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
        <div className="flex-1 flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="按名称、框架搜索模型..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Box size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{model.name}</h3>
                  <p className="text-xs text-slate-500">{model.framework}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${getStatusStyle(model.status)}`}>
                {model.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Tag size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Params</span>
                </div>
                <p className="text-sm font-mono text-slate-200">{model.parameters}</p>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <HardDrive size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Storage</span>
                </div>
                <p className="text-sm font-mono text-slate-200">{model.size}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <div className="text-xs text-slate-500">
                  <span className="block opacity-50 uppercase tracking-tighter text-[9px] font-bold">版本</span>
                  <span className="text-slate-300 font-mono">{model.version}</span>
                </div>
                <div className="text-xs text-slate-500">
                  <span className="block opacity-50 uppercase tracking-tighter text-[9px] font-bold">Updated</span>
                  <span className="text-slate-300 font-mono">{model.updatedAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeployClick(model.id)}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-600/10 transition-all"
                  title="Deploy Model"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
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
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <Rocket size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">部署模型</h2>
                    <p className="text-[10px] text-slate-500">已选择: {MOCK_MODELS.find(m => m.id === selectedModel)?.name}</p>
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
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${deployTab === 'sandbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Terminal size={16} />
                  新建沙箱
                </button>
                <button
                  type="button"
                  onClick={() => setDeployTab('training')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${deployTab === 'training' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
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
                            <option value="">无</option>
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

                    {/* GPU Allocation */}
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GPU分配</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          sandboxFormData.gpuSharingMode === 'shared'
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-indigo-400/10 text-indigo-400'
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
                              ? 'bg-indigo-600 text-white shadow-lg'
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

                      {/* GPU Count Slider/Selector */}
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
                        sandboxFormData.gpuSharingMode === 'shared'
                          ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                          : 'bg-indigo-400/5 text-indigo-300/80 border border-indigo-400/10'
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
                    <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 rounded-xl p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">预估成本</span>
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
                          <span className="text-sm text-indigo-300">/小时</span>
                        </div>
                        <span className="text-[8px] text-indigo-300/70 mb-4">按分钟计费</span>
                        <div className="space-y-1.5 pt-3 border-t border-indigo-500/20">
                          <div className="flex justify-between text-[9px]">
                            <span className="text-indigo-200/60">每天(24小时)</span>
                            <span className="font-mono text-indigo-200">
                              RMB {(GPU_PRICING[sandboxFormData.gpuType].hourly * sandboxFormData.gpuCount * PRIORITY_MULTIPLIERS[sandboxFormData.priority] * 24).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-indigo-200/60">每月(30天)</span>
                            <span className="font-mono text-indigo-200">
                              RMB {(GPU_PRICING[sandboxFormData.gpuType].hourly * sandboxFormData.gpuCount * PRIORITY_MULTIPLIERS[sandboxFormData.priority] * 24 * 30).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
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
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
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
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${trainingFormData.sourceType === 'git' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          <GitBranch size={14} />
                          Git仓库
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrainingFormData({...trainingFormData, sourceType: 'image'})}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${trainingFormData.sourceType === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
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
                              <span className="text-[9px] text-slate-500 mb-1 block">分支</span>
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
                            <option value="">无</option>
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
                            <option value="">无</option>
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
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">GPU类型</span>
                          <div className="flex gap-2">
                            {[ResourceType.H100, ResourceType.A100, ResourceType.L40S, ResourceType.V100].map(t => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTrainingFormData({...trainingFormData, gpuType: t})}
                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${trainingFormData.gpuType === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
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
                                : 'bg-indigo-400/10 text-indigo-400'
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
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <Zap size={10} className="inline mr-1" />
                              独占
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
                          {trainingFormData.gpuSharingMode === 'shared' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setTrainingFormData({ ...trainingFormData, gpuCount: 0.5 })}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                  trainingFormData.gpuCount === 0.5
                                    ? 'bg-amber-600 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                                }`}
                              >
                                0.5 GPU
                              </button>
                              <button
                                type="button"
                                onClick={() => setTrainingFormData({ ...trainingFormData, gpuCount: 0.25 })}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                  trainingFormData.gpuCount === 0.25
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
                                max="32"
                                step="1"
                                value={trainingFormData.gpuCount}
                                onChange={e => {
                                  const newVal = parseInt(e.target.value);
                                  setTrainingFormData({
                                    ...trainingFormData,
                                    gpuCount: newVal
                                  });
                                }}
                                className="w-full accent-indigo-500"
                              />
                              <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                                <span>1</span>
                                <span>32</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mode Description for Training */}
                      <div className={`p-2 rounded-lg text-[9px] ${
                        trainingFormData.gpuSharingMode === 'shared'
                          ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                          : 'bg-indigo-400/5 text-indigo-300/80 border border-indigo-400/10'
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
                          <span className="text-xs font-mono text-indigo-400">{trainingFormData.timeoutMinutes}m ({Math.round(trainingFormData.timeoutMinutes / 60 * 10) / 10}h)</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="1440"
                          step="30"
                          value={trainingFormData.timeoutMinutes}
                          onChange={e => setTrainingFormData({...trainingFormData, timeoutMinutes: parseInt(e.target.value)})}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Cost Summary & Actions */}
                  <div className="col-span-5 flex flex-col">
                    {/* Cost Estimation */}
                    <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 rounded-xl p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">预估成本</span>
                        {trainingFormData.priority !== JobPriority.NORMAL && (
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[trainingFormData.priority]}`}>
                            {PRIORITY_NAMES[trainingFormData.priority]} ({PRIORITY_MULTIPLIERS[trainingFormData.priority]}x)
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-center space-y-3">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-white mb-1">
                            RMB {(GPU_PRICING[trainingFormData.gpuType].hourly * trainingFormData.gpuCount * PRIORITY_MULTIPLIERS[trainingFormData.priority]).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-indigo-200/70">每小时</p>
                        </div>

                        <div className="bg-slate-950/30 rounded-lg p-3 border border-indigo-500/10">
                          <div className="flex justify-between items-center text-[9px] mb-2">
                            <span className="text-indigo-200/60">约 {Math.round(trainingFormData.timeoutMinutes / 60 * 10) / 10}小时</span>
                            <span className="font-mono text-white text-sm">
                              RMB {(GPU_PRICING[trainingFormData.gpuType].hourly * trainingFormData.gpuCount * PRIORITY_MULTIPLIERS[trainingFormData.priority] * (trainingFormData.timeoutMinutes / 60)).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="text-center pt-2 border-t border-indigo-500/20">
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
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                      >
                        确认并排队任务
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDeployModalOpen(false)}
                        className="w-full py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-all"
                      >
                        取消
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

export default ModelManagement;
