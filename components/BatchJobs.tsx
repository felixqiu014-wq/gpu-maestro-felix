import React, { useMemo, useState } from 'react';
import { GPU_PRICING, MOCK_DATASETS, MOCK_MODELS, MOCK_WORKLOADS, STATUS_COLORS } from '../constants';
import { JobStatus, ResourceType, Workload } from '../types';
import {
  Activity,
  Box,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  Filter,
  GitBranch,
  Globe,
  Layers,
  Monitor,
  Plus,
  Rocket,
  Settings2,
  Terminal,
  Timer,
  X,
} from 'lucide-react';

type SourceType = 'git' | 'image';
type CreateJobTab = 'basic' | 'source' | 'hardware';

type BatchJobView = Workload & {
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  metricLabel?: string;
  metricValue?: string;
  throughput?: string;
};

const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.PENDING]: '排队中',
  [JobStatus.RUNNING]: '运行中',
  [JobStatus.COMPLETED]: '已完成',
  [JobStatus.FAILED]: '失败',
  [JobStatus.TERMINATED]: '已终止',
};

const OWNER_LABELS: Record<string, string> = {
  ai_eng_sarah: 'AI 工程组 / Sarah',
  data_ops: '数据平台组',
  dr_chen: '陈博士团队',
  ml_team: '机器学习平台组',
  research_lab: '研究实验室',
  cv_team: '计算机视觉组',
  audio_research: '音频研究组',
  ai_research: 'AI 研究组',
  model_opt: '模型优化组',
  nlp_team: '自然语言组',
  'Admin User': '管理员',
};

const formatResourceLabel = (job: BatchJobView) => {
  const gpuType = job.gpuType ? job.gpuType.replace('NVIDIA ', '') : 'GPU';
  return `${job.gpuRequested}x ${gpuType}`;
};

const formatGpuName = (gpuType: ResourceType) => gpuType.replace('NVIDIA ', '');

const formatOwnerLabel = (owner: string) => OWNER_LABELS[owner] ?? owner;

const formatGpuCountLabel = (value: number) => (value < 1 ? `${value} GPU` : `${value} 张`);

const formatDate = (value: string) =>
  new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

const initialJobs: BatchJobView[] = MOCK_WORKLOADS.filter((job) => job.type === 'BATCH').map((job, index) => {
  const progressSeed = [42, 68, 31, 100, 16, 0, 0, 83, 54, 0, 0];
  const totalStepsSeed = [10000, 12000, 2000, 1000, 100000, 5000, 8000, 15000, 9000, 6000, 7000];
  const metricSeed = ['验证损失', '训练损失', '准确率', '作业耗时', '困惑度', '等待队列', '等待队列', 'BLEU', '词错误率', '停止原因', '等待队列'];
  const metricValueSeed = ['0.231', '0.184', '93.8%', '4小时 00分', '6.42', '资源调度中', '资源调度中', '38.5', '0.12', '用户终止', '资源调度中'];
  const throughputSeed = ['1.2k token/s', '980 sample/s', '420 sample/s', '2.6TB/h', '4.9k token/s', '-', '-', '2.8k token/s', '180 音频片段/分', '-', '-'];
  const progress = progressSeed[index] ?? 0;
  const totalSteps = totalStepsSeed[index] ?? 10000;

  return {
    ...job,
    timeoutMinutes: job.timeoutMinutes ?? 240,
    progress,
    currentStep: Math.round((progress / 100) * totalSteps),
    totalSteps,
    metricLabel: metricSeed[index] ?? '关键指标',
    metricValue: metricValueSeed[index] ?? '-',
    throughput: throughputSeed[index] ?? '-',
  };
});

const BatchJobs: React.FC = () => {
  const [jobs, setJobs] = useState<BatchJobView[]>(initialJobs);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createJobTab, setCreateJobTab] = useState<CreateJobTab>('basic');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(() => {
    const defaultExpanded = new Set<string>();
    const firstRunningJob = initialJobs.find((job) => job.status === JobStatus.RUNNING);
    if (firstRunningJob) {
      defaultExpanded.add(firstRunningJob.id);
    }
    return defaultExpanded;
  });

  const [formData, setFormData] = useState({
    name: '',
    sourceType: 'git' as SourceType,
    gitRepo: '',
    gitBranch: 'main',
    entrypoint: 'python train.py --config configs/train.yaml',
    imageUri: '',
    imageCommand: '',
    modelId: '',
    datasetId: '',
    gpuType: ResourceType.H100,
    gpuCount: 1,
    gpuSharingMode: 'exclusive' as 'shared' | 'exclusive',
    priority: '标准',
    timeoutMinutes: 240,
  });

  const ownerOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(jobs.map((job) => job.owner)))],
    [jobs]
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
        const matchesOwner = ownerFilter === 'ALL' || job.owner === ownerFilter;
        return matchesStatus && matchesOwner;
      }),
    [jobs, ownerFilter, statusFilter]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJob: BatchJobView = {
      id: `wl-batch-${Math.floor(Math.random() * 10000)}`,
      name: formData.name || '新训练任务',
      type: 'BATCH',
      owner: 'Admin User',
      gpuRequested: formData.gpuCount,
      status: JobStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeoutMinutes: formData.timeoutMinutes,
      gpuType: formData.gpuType,
      logs: ['任务已提交', '正在校验配置', '等待集群分配资源'],
      progress: 0,
      currentStep: 0,
      totalSteps: 8000,
      metricLabel: '等待队列',
      metricValue: '资源调度中',
      throughput: '-',
    };

    setJobs((prev) => [newJob, ...prev]);
    setIsCreateModalOpen(false);
    setCreateJobTab('basic');
    setStatusFilter('ALL');
    setOwnerFilter('ALL');
    setFormData({
      name: '',
      sourceType: 'git',
      gitRepo: '',
      gitBranch: 'main',
      entrypoint: 'python train.py --config configs/train.yaml',
      imageUri: '',
      imageCommand: '',
      modelId: '',
      datasetId: '',
      gpuType: ResourceType.H100,
      gpuCount: 1,
      gpuSharingMode: 'exclusive',
      priority: '标准',
      timeoutMinutes: 240,
    });
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">模型训练与批处理</h1>
            <p className="text-slate-400 mt-1">
              在 H100 / A100 集群上统一管理训练、微调和推理类批处理工作负载。
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            新建训练任务
          </button>
        </div>

        <div className="flex flex-col gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Filter size={16} className="text-slate-500" />
            筛选条件：
          </div>

          <div className="relative min-w-[220px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | JobStatus)}
              className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-indigo-500"
            >
              <option value="ALL">全部状态</option>
              <option value={JobStatus.RUNNING}>运行中</option>
              <option value={JobStatus.PENDING}>排队中</option>
              <option value={JobStatus.COMPLETED}>已完成</option>
              <option value={JobStatus.FAILED}>失败</option>
              <option value={JobStatus.TERMINATED}>已终止</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          <div className="relative min-w-[220px]">
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-10 text-sm text-slate-200 outline-none transition focus:border-indigo-500"
            >
              <option value="ALL">全部负责人</option>
              {ownerOptions
                .filter((owner) => owner !== 'ALL')
                .map((owner) => (
                  <option key={owner} value={owner}>
                    {formatOwnerLabel(owner)}
                  </option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800">
            {filteredJobs.map((job) => {
              const isExpanded = expandedJobs.has(job.id);
              const showProgress = job.status === JobStatus.RUNNING && isExpanded;

              return (
                <section
                  key={job.id}
                  className="bg-slate-900/20 p-6 hover:bg-slate-800/20 transition-all group"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-slate-700 group-hover:border-indigo-500/30 transition-colors shrink-0">
                          <Layers size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold text-white">
                              {job.name}
                            </h2>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[job.status]}`}>
                              {STATUS_LABELS[job.status]}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Box size={14} className="text-slate-500" />
                              <span>负责人：{formatOwnerLabel(job.owner)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Cpu size={14} className="text-slate-500" />
                              <span>资源：{formatResourceLabel(job)}</span>
                            </div>
                            {job.timeoutMinutes ? (
                              <div className="flex items-center gap-1.5">
                                <Timer size={14} className="text-slate-500" />
                                <span>超时限制：{job.timeoutMinutes} 分钟</span>
                              </div>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpand(job.id)}
                            className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <ChevronRight
                              size={14}
                              className={`transition ${isExpanded ? 'rotate-90' : ''}`}
                            />
                            {isExpanded ? '隐藏训练进度' : '显示训练进度'}
                          </button>
                        </div>
                      </div>

                      {showProgress ? (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end animate-in slide-in-from-top-2">
                          <div className="min-w-0">
                            <div className="flex justify-between items-center text-xs mb-2">
                              <span className="font-bold text-slate-500 uppercase tracking-tighter">训练进度</span>
                              <span className="font-mono text-indigo-400">
                                Step {job.currentStep?.toLocaleString('en-US')} / {job.totalSteps?.toLocaleString('en-US')}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all duration-700"
                                style={{ width: `${job.progress ?? 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">
                              指标：{job.metricLabel}
                              </p>
                              <p className="text-sm text-slate-300 font-mono">{job.metricValue}</p>
                            </div>
                            <div className="flex-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">吞吐量</p>
                              <p className="text-sm text-slate-300 font-mono">{job.throughput}</p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 text-right hidden sm:block lg:min-w-[180px]">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                        创建时间
                      </p>
                      <div className="text-xs font-mono text-slate-400">{formatDate(job.createdAt)}</div>
                    </div>
                  </div>
                </section>
              );
            })}

            {filteredJobs.length === 0 ? (
              <div className="px-6 py-14 text-center text-slate-400">
                当前筛选条件下没有匹配的批处理任务。
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Rocket size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">初始化训练任务</h2>
                  <p className="text-[10px] text-slate-500">配置训练入口、数据挂载与硬件资源</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateJobTab('basic')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    createJobTab === 'basic' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Box size={16} />
                  基础设置
                </button>
                <button
                  type="button"
                  onClick={() => setCreateJobTab('source')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    createJobTab === 'source' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Globe size={16} />
                  资源库
                </button>
                <button
                  type="button"
                  onClick={() => setCreateJobTab('hardware')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    createJobTab === 'hardware' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Cpu size={16} />
                  硬件配置
                </button>
              </div>

              <div className="min-h-[320px] bg-slate-950/30 border border-slate-800 rounded-2xl p-5">
                {createJobTab === 'basic' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">任务名称</span>
                      <input
                        required
                        type="text"
                        placeholder="例如: bert-large-finetune-v2"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Box size={12} className="text-indigo-400" />
                        挂载模型
                      </span>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none pr-10"
                          value={formData.modelId}
                          onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                        >
                          <option value="">空(自定义路径)</option>
                          {MOCK_MODELS.map((model) => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600" />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Database size={12} className="text-emerald-400" />
                        挂载数据集
                      </span>
                      <div className="relative">
                        <select
                          className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none pr-10"
                          value={formData.datasetId}
                          onChange={(e) => setFormData({ ...formData, datasetId: e.target.value })}
                        >
                          <option value="">无</option>
                          {MOCK_DATASETS.map((dataset) => (
                            <option key={dataset.id} value={dataset.id}>
                              {dataset.name}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600" />
                      </div>
                    </label>
                  </div>
                ) : null}

                {createJobTab === 'source' ? (
                  <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sourceType: 'git' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                          formData.sourceType === 'git'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <GitBranch size={16} />
                        GitHub
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sourceType: 'image' })}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                          formData.sourceType === 'image'
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Monitor size={16} />
                        Docker Image
                      </button>
                    </div>

                    {formData.sourceType === 'git' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">GitHub 仓库地址</span>
                          <input
                            type="text"
                            placeholder="https://github.com/your-org/project.git"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                            value={formData.gitRepo}
                            onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">分支 / Tag / Commit</span>
                          <input
                            type="text"
                            placeholder="main"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                            value={formData.gitBranch}
                            onChange={(e) => setFormData({ ...formData, gitBranch: e.target.value })}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">启动命令</span>
                          <input
                            type="text"
                            placeholder="python train.py --config configs/train.yaml"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            value={formData.entrypoint}
                            onChange={(e) => setFormData({ ...formData, entrypoint: e.target.value })}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <label className="block col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Docker Image 地址</span>
                          <input
                            type="text"
                            placeholder="registry.example.com/train/pytorch:2.3-cuda12"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500"
                            value={formData.imageUri}
                            onChange={(e) => setFormData({ ...formData, imageUri: e.target.value })}
                          />
                        </label>
                        <label className="block col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">覆盖命令 / 参数</span>
                          <input
                            type="text"
                            placeholder="bash launch.sh --epochs 20"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 font-mono"
                            value={formData.imageCommand}
                            onChange={(e) => setFormData({ ...formData, imageCommand: e.target.value })}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : null}

                {createJobTab === 'hardware' ? (
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
                        <Cpu size={14} className="text-amber-400" />
                        <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">GPU选择</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(ResourceType).map((type) => {
                          const pricing = GPU_PRICING[type];
                          const isSelected = formData.gpuType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData({ ...formData, gpuType: type })}
                              className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'bg-indigo-600/10 border-indigo-500'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-center">
                                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                  {formatGpuName(type)}
                                </p>
                                <p className={`text-[9px] uppercase ${isSelected ? 'text-indigo-300' : 'text-slate-600'}`}>
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

                    <div className="col-span-7 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">GPU分配</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-400/10 text-indigo-400">
                          {formatGpuCountLabel(formData.gpuCount)}
                        </span>
                      </div>

                      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-4">
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            gpuSharingMode: 'exclusive',
                            gpuCount: Math.max(1, Math.ceil(formData.gpuCount))
                          })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            formData.gpuSharingMode === 'exclusive'
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Activity size={15} />
                          独占
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            gpuSharingMode: 'shared',
                            gpuCount: formData.gpuCount > 0.9 ? 0.5 : (formData.gpuCount < 0.1 ? 0.5 : formData.gpuCount)
                          })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            formData.gpuSharingMode === 'shared'
                              ? 'bg-amber-600 text-white shadow-lg'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Cpu size={15} />
                          共享
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">GPU 数量</span>
                          {formData.gpuSharingMode === 'shared' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, gpuCount: 0.5 })}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
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
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
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
                                onChange={(e) => setFormData({ ...formData, gpuCount: parseInt(e.target.value, 10) })}
                                className="w-full accent-indigo-500"
                              />
                              <div className="flex justify-between text-[10px] text-slate-600">
                                <span>1</span>
                                <span>8</span>
                              </div>
                            </>
                          )}

                          <div className={`p-3 rounded-lg text-xs ${
                            formData.gpuSharingMode === 'shared'
                              ? 'bg-amber-400/5 text-amber-300/80 border border-amber-400/10'
                              : 'bg-indigo-400/5 text-indigo-300/80 border border-indigo-400/10'
                          }`}>
                            {formData.gpuSharingMode === 'shared'
                              ? '共享模式：仅提供 0.5 或 0.25 GPU，适合轻量训练、调试与验证。'
                              : formData.gpuCount > 1
                                ? '独占模式：支持 1-8 张 GPU，适合大模型微调与分布式训练。'
                                : '独占模式：单卡专用资源，适合实验验证与常规训练。'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">计费预览</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-slate-300">
                      <div className="rounded-xl border border-indigo-500/15 bg-slate-950/30 p-3">
                        <p className="text-slate-500">执行来源</p>
                        <p className="mt-1 font-semibold text-white">{formData.sourceType === 'git' ? 'GitHub' : 'Docker Image'}</p>
                      </div>
                      <div className="rounded-xl border border-indigo-500/15 bg-slate-950/30 p-3">
                        <p className="text-slate-500">硬件规格</p>
                        <p className="mt-1 font-semibold text-white">{formatGpuName(formData.gpuType)} / {formatGpuCountLabel(formData.gpuCount)}</p>
                      </div>
                      <div className="rounded-xl border border-indigo-500/15 bg-slate-950/30 p-3">
                        <p className="text-slate-500">分配模式</p>
                        <p className="mt-1 font-semibold text-white">{formData.gpuSharingMode === 'shared' ? '共享' : '独占'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4">
                    <div className="text-center mb-3">
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-3xl font-bold text-white">
                          RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount).toFixed(2)}
                        </span>
                        <span className="text-sm text-indigo-300">/小时</span>
                      </div>
                      <p className="text-[10px] text-indigo-200/70">4小时约 RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount * 4).toFixed(2)}，24小时约 RMB {(GPU_PRICING[formData.gpuType].hourly * formData.gpuCount * 24).toFixed(2)}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                      >
                        取消
                      </button>
                      <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                        启动训练任务
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BatchJobs;
