import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  GPU_PRICING,
  MOCK_DATASETS,
  MOCK_MODELS,
  MOCK_WORKLOADS,
  STATUS_COLORS,
} from '../constants';
import { JobPriority, JobStatus, ResourceType, Workload } from '../types';
import {
  Box,
  ChevronDown,
  Cpu,
  Filter,
  GitBranch,
  Info,
  Monitor,
  Pause,
  Plus,
  RotateCcw,
  Timer,
  Trash2,
  X,
} from 'lucide-react';

type BatchJobView = Workload & {
  currentStep: number;
  totalSteps: number;
  metricLabel: string;
  metricValue: string;
  throughput: string;
  featured?: boolean;
};

const PRIORITY_MULTIPLIERS: Record<JobPriority, number> = {
  [JobPriority.LOW]: 0.8,
  [JobPriority.NORMAL]: 1,
  [JobPriority.HIGH]: 1.5,
  [JobPriority.URGENT]: 2,
};

const STATUS_DOT_COLORS: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: 'bg-emerald-400',
  [JobStatus.PENDING]: 'bg-amber-400',
  [JobStatus.PAUSED]: 'bg-violet-400',
  [JobStatus.COMPLETED]: 'bg-sky-400',
  [JobStatus.FAILED]: 'bg-rose-400',
  [JobStatus.TERMINATED]: 'bg-slate-500',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: '运行中',
  [JobStatus.PENDING]: '排队中',
  [JobStatus.PAUSED]: '已暂停',
  [JobStatus.COMPLETED]: '已完成',
  [JobStatus.FAILED]: '失败',
  [JobStatus.TERMINATED]: '已暂停',
};

const BATCH_JOB_DETAILS: Record<
  string,
  Omit<BatchJobView, keyof Workload | 'featured'>
> = {
  'wl-102': {
    currentStep: 4200,
    totalSteps: 10000,
    metricLabel: 'F1',
    metricValue: '91.8%',
    throughput: '1.2k tokens/s',
  },
  'wl-103': {
    currentStep: 1860,
    totalSteps: 5000,
    metricLabel: 'LoRA 损失',
    metricValue: '0.287',
    throughput: '980 tokens/s',
  },
  'wl-103b': {
    currentStep: 500,
    totalSteps: 2000,
    metricLabel: '准确率',
    metricValue: '88.6%',
    throughput: '640 tokens/s',
  },
  'wl-104': {
    currentStep: 8600,
    totalSteps: 8600,
    metricLabel: '处理样本',
    metricValue: '4.8M',
    throughput: '1.0k records/s',
  },
  'wl-105': {
    currentStep: 15234,
    totalSteps: 100000,
    metricLabel: '训练损失',
    metricValue: '1.842',
    throughput: '4.6k tokens/s',
  },
  'wl-106': {
    currentStep: 0,
    totalSteps: 12000,
    metricLabel: 'FID',
    metricValue: '--',
    throughput: '--',
  },
  'wl-107': {
    currentStep: 34300,
    totalSteps: 80000,
    metricLabel: '显存峰值',
    metricValue: '79.6 GB',
    throughput: '3.1k tokens/s',
  },
  'wl-108': {
    currentStep: 6400,
    totalSteps: 6400,
    metricLabel: '准确率',
    metricValue: '94.2%',
    throughput: '820 img/s',
  },
  'wl-109': {
    currentStep: 2900,
    totalSteps: 12000,
    metricLabel: 'WER',
    metricValue: '0.12',
    throughput: '710 samples/s',
  },
  'wl-110': {
    currentStep: 1800,
    totalSteps: 1800,
    metricLabel: 'Recall@10',
    metricValue: '82.4%',
    throughput: '1.7k tokens/s',
  },
  'wl-111': {
    currentStep: 0,
    totalSteps: 9000,
    metricLabel: '蒸馏损失',
    metricValue: '--',
    throughput: '--',
  },
  'wl-112': {
    currentStep: 5600,
    totalSteps: 14000,
    metricLabel: 'BLEU',
    metricValue: '38.5',
    throughput: '1.4k tokens/s',
  },
};

const defaultBatchJobDetails = (
  index: number,
): Omit<BatchJobView, keyof Workload | 'featured'> => ({
  currentStep: 1200 + index * 320,
  totalSteps: 10000,
  metricLabel: '训练损失',
  metricValue: '0.318',
  throughput: '860 tokens/s',
});

const formatCreatedAt = (value: string) =>
  new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

const cardClasses =
  'border border-slate-800 bg-slate-950/20 transition hover:border-slate-700 hover:bg-slate-900/40';

const GPU_CARD_OPTIONS = [
  { type: ResourceType.A100, name: 'A100', memory: '40/80 GB', price: 1.85 },
  { type: ResourceType.H100, name: 'H100', memory: '80 GB', price: 3.5 },
  { type: ResourceType.L40S, name: 'L40s', memory: '48 GB', price: 0.95 },
  { type: ResourceType.V100, name: 'V100', memory: '16/32 GB', price: 0.65 },
];

const EXCLUSIVE_GPU_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const SHARED_GPU_OPTIONS = ['0.5', '0.25'];

const formatPrice = (value: number) => `RMB ${value.toFixed(2)}`;
const formatGpuCount = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toString();

const BatchJobs: React.FC = () => {
  const initialJobs = useMemo<BatchJobView[]>(
    () =>
      MOCK_WORKLOADS.filter((workload) => workload.type === 'BATCH').map((job, index) => ({
        ...job,
        status: job.status === JobStatus.TERMINATED ? JobStatus.PAUSED : job.status,
        timeoutMinutes: job.timeoutMinutes ?? 240,
        ...BATCH_JOB_DETAILS[job.id],
        ...(BATCH_JOB_DETAILS[job.id] ? {} : defaultBatchJobDetails(index)),
        featured: index === 0,
      })),
    [],
  );

  const [jobs, setJobs] = useState<BatchJobView[]>(initialJobs);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskTab, setCreateTaskTab] = useState<'basic' | 'library' | 'hardware'>('basic');
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const [jobPendingPause, setJobPendingPause] = useState<BatchJobView | null>(null);
  const [jobPendingDelete, setJobPendingDelete] = useState<BatchJobView | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const ownerDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
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
    timeoutMinutes: 240,
  });

  const gpuMode = formData.gpuSharingMode === 'shared' ? 'shared' : 'exclusive';
  const exclusiveGpuCount = Number.isInteger(formData.gpuCount)
    ? String(formData.gpuCount)
    : EXCLUSIVE_GPU_OPTIONS[0];
  const sharedGpuCount = SHARED_GPU_OPTIONS.includes(String(formData.gpuCount))
    ? String(formData.gpuCount)
    : SHARED_GPU_OPTIONS[0];
  const effectiveGpuCount = formData.gpuCount;

  const estimatedHourlyCost = useMemo(
    () =>
      GPU_PRICING[formData.gpuType].hourly *
      effectiveGpuCount *
      PRIORITY_MULTIPLIERS[formData.priority],
    [effectiveGpuCount, formData.gpuType, formData.priority],
  );

  const priorityOptions = useMemo(
    () => [
      { value: JobPriority.LOW, label: '低优先级 (0.8x)' },
      { value: JobPriority.NORMAL, label: '普通 (1x)' },
      { value: JobPriority.HIGH, label: '高优先级 (1.5x)' },
      { value: JobPriority.URGENT, label: '紧急 (2x)' },
    ],
    [],
  );

  const updateGpuSelection = (mode: 'exclusive' | 'shared', value: string) => {
    const parsedValue = Number(value);
    setFormData((previous) => ({
      ...previous,
      gpuSharingMode: mode,
      gpuCount: parsedValue,
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setIsOwnerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueOwners = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.owner))).sort(),
    [jobs],
  );

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const matchesStatus =
          selectedStatuses.length === 0 || selectedStatuses.includes(job.status);
        const matchesOwner = selectedOwners.length === 0 || selectedOwners.includes(job.owner);
        return matchesStatus && matchesOwner;
      }),
    [jobs, selectedOwners, selectedStatuses],
  );

  const toggleStatusFilter = (status: JobStatus) => {
    setSelectedStatuses((previous) =>
      previous.includes(status)
        ? previous.filter((item) => item !== status)
        : [...previous, status],
    );
  };

  const toggleOwnerFilter = (owner: string) => {
    setSelectedOwners((previous) =>
      previous.includes(owner)
        ? previous.filter((item) => item !== owner)
        : [...previous, owner],
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedOwners([]);
  };

  const handlePause = (jobId: string) => {
    setJobs((previous) =>
      previous.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: JobStatus.PAUSED,
              updatedAt: new Date().toISOString(),
              logs: [...(job.logs ?? []), 'Job paused by user'],
            }
          : job,
      ),
    );
  };

  const handleRestart = (jobId: string) => {
    setJobs((previous) =>
      previous.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: JobStatus.PENDING,
              updatedAt: new Date().toISOString(),
              logs: [...(job.logs ?? []), 'Job restarted by user'],
            }
          : job,
      ),
    );
  };

  const handleDelete = (jobId: string) => {
    setJobs((previous) => previous.filter((job) => job.id !== jobId));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const now = new Date().toISOString();
    const newJob: BatchJobView = {
      id: `wl-batch-${Math.floor(Math.random() * 1000)}`,
      name: formData.name || 'new-training-job',
      type: 'BATCH',
      owner: 'Admin User',
      gpuRequested: formData.gpuCount,
      gpuType: formData.gpuType,
      status: JobStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      priority: formData.priority,
      timeoutMinutes: formData.timeoutMinutes,
      logs: ['Job queued...', 'Validating manifest...', 'Pulling workspace source...'],
      currentStep: 0,
      totalSteps: 10000,
      metricLabel: '验证损失',
      metricValue: '--',
      throughput: '--',
      featured: true,
    };

    setJobs((previous) =>
      [newJob, ...previous.map((job) => ({ ...job, featured: false }))],
    );
    setIsCreateModalOpen(false);
    setCreateTaskTab('basic');
  };

  const handleNextCreateTaskTab = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setCreateTaskTab((previous) => {
      if (previous === 'basic') {
        return 'library';
      }

      if (previous === 'library') {
        return 'hardware';
      }

      return previous;
    });
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[26px] font-semibold tracking-tight text-slate-50">
            批量任务
          </h1>
          <p className="text-[13px] text-slate-400">
            在此处管理您的模型训练任务。
          </p>
        </div>
        <button
          onClick={() => {
            setCreateTaskTab('basic');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          <Plus size={16} />
          新建任务
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-slate-300">
          <Filter size={16} className="text-slate-500" />
          <span>筛选条件:</span>
        </div>

        <div className="relative" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setIsStatusDropdownOpen((open) => !open)}
            className="inline-flex h-9 min-w-[183px] items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 text-sm text-slate-300 transition hover:border-slate-700"
          >
            <span>
              {selectedStatuses.length === 0
                ? '选择状态'
                : `状态 ${selectedStatuses.length}`}
            </span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
          {isStatusDropdownOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 min-w-[183px] rounded-lg border border-slate-800 bg-slate-950 shadow-2xl">
              {Object.values(JobStatus)
                .filter((status) => status !== JobStatus.TERMINATED)
                .map((status) => {
                const selected = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatusFilter(status)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-slate-900 ${
                      selected ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    <span>{STATUS_LABELS[status]}</span>
                    {selected && <span className="text-blue-400">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" ref={ownerDropdownRef}>
          <button
            type="button"
            onClick={() => setIsOwnerDropdownOpen((open) => !open)}
            className="inline-flex h-9 min-w-[183px] items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 text-sm text-slate-300 transition hover:border-slate-700"
          >
            <span>
              {selectedOwners.length === 0
                ? '选择所有者'
                : `所有者 ${selectedOwners.length}`}
            </span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
          {isOwnerDropdownOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 min-w-[183px] rounded-lg border border-slate-800 bg-slate-950 shadow-2xl">
              {uniqueOwners.map((owner) => {
                const selected = selectedOwners.includes(owner);
                return (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => toggleOwnerFilter(owner)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-sm transition first:rounded-t-lg last:rounded-b-lg hover:bg-slate-900 ${
                      selected ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    <span>{owner}</span>
                    {selected && <span className="text-blue-400">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {(selectedStatuses.length > 0 || selectedOwners.length > 0) && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            清除全部
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => {
          const progressRatio =
            job.totalSteps > 0 ? Math.min(job.currentStep / job.totalSteps, 1) : 0;
          const canPause =
            job.status === JobStatus.RUNNING || job.status === JobStatus.PENDING;
          const canRestart = job.status === JobStatus.PAUSED || job.status === JobStatus.FAILED;

          return (
            <article
              key={job.id}
              className={`rounded-lg p-4 ${cardClasses}`}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT_COLORS[job.status]}`}
                    />
                    <h2 className="text-sm font-medium text-white">{job.name}</h2>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[job.status]}`}
                    >
                      {STATUS_LABELS[job.status]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                    <div className="inline-flex items-center gap-2">
                      <Box size={16} className="text-slate-500" />
                      <span>所有者: {job.owner}</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Cpu size={16} className="text-slate-500" />
                      <span>资源: {job.gpuRequested}x GPU</span>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Timer size={16} className="text-slate-500" />
                      <span>超时: {job.timeoutMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="space-y-1 text-left lg:text-right">
                    <p className="text-sm text-slate-400">创建于</p>
                    <p className="text-sm text-slate-300">{formatCreatedAt(job.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-end">
                    {canPause ? (
                      <button
                        type="button"
                        onClick={() => setJobPendingPause(job)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                      >
                        <Pause size={12} />
                        任务暂停
                      </button>
                    ) : null}
                    {canRestart ? (
                      <button
                        type="button"
                        onClick={() => handleRestart(job.id)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                      >
                        <RotateCcw size={12} />
                        重启任务
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setJobPendingDelete(job);
                        setDeleteConfirmationInput('');
                      }}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs font-medium text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <Trash2 size={12} />
                      任务删除
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr_1fr]">
                <div className="rounded-lg bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-300">训练进度</span>
                    <span className="text-slate-300">
                      进度 {job.currentStep.toLocaleString()} / {job.totalSteps.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-1.5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${progressRatio * 100}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">核心指标：{job.metricLabel}</span>
                    <span className="text-slate-300">{job.metricValue}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-300">吞吐量</span>
                    <span className="text-slate-300">{job.throughput}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/90 p-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-[737px] rounded-lg border border-blue-950 bg-[linear-gradient(104deg,rgba(30,58,138,0.10)_-174.79%,rgba(10,10,10,1)_91.58%),#0a0a0a] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="px-[18px] pt-1">
                  <div className="mx-auto max-w-[705px] space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-50">
                        新建训练任务
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setCreateTaskTab('basic');
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                        aria-label="关闭"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-400">
                      将高性能批处理工作负载部署到集群。
                    </p>
                  </div>
                </div>

                <div className="mx-auto max-w-[705px] rounded-lg border border-blue-950/90 bg-black/15">
                  <div className="grid grid-cols-3 border-b border-blue-950 bg-white/[0.05]">
                    {[
                      { id: 'basic', label: '基础设置' },
                      { id: 'library', label: '资源库' },
                      { id: 'hardware', label: 'GPU选择&配置' },
                    ].map((tab) => {
                      const active = createTaskTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() =>
                            setCreateTaskTab(tab.id as 'basic' | 'library' | 'hardware')
                          }
                          className={`flex h-12 items-center justify-center px-4 text-sm transition ${
                            active
                              ? 'border-b border-blue-500 text-slate-50'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="min-h-[228px] px-[18px] pb-[18px] pt-5">
                    {createTaskTab === 'basic' ? (
                      <div className="grid gap-x-[23px] gap-y-5 md:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-400">名称</span>
                          <input
                            required
                            type="text"
                            placeholder="e.g. transformer-dev-env"
                            value={formData.name}
                            onChange={(event) =>
                              setFormData((previous) => ({
                                ...previous,
                                name: event.target.value,
                              }))
                            }
                            className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-400">优先级</span>
                          <div className="relative">
                            <select
                              value={formData.priority}
                              onChange={(event) =>
                                setFormData((previous) => ({
                                  ...previous,
                                  priority: event.target.value as JobPriority,
                                }))
                              }
                              className="h-9 w-full appearance-none rounded-md bg-white/[0.05] px-3 pr-9 text-sm text-slate-100 outline-none transition focus:bg-white/[0.06]"
                            >
                              {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                          </div>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-400">模型</span>
                          <div className="relative">
                            <select
                              value={formData.modelId}
                              onChange={(event) =>
                                setFormData((previous) => ({
                                  ...previous,
                                  modelId: event.target.value,
                                }))
                              }
                              className="h-9 w-full appearance-none rounded-md bg-white/[0.05] px-3 pr-9 text-sm text-slate-100 outline-none transition focus:bg-white/[0.06]"
                            >
                              <option value="">空 (需自行上传)</option>
                              {MOCK_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                          </div>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm text-slate-400">数据集</span>
                          <div className="relative">
                            <select
                              value={formData.datasetId}
                              onChange={(event) =>
                                setFormData((previous) => ({
                                  ...previous,
                                  datasetId: event.target.value,
                                }))
                              }
                              className="h-9 w-full appearance-none rounded-md bg-white/[0.05] px-3 pr-9 text-sm text-slate-100 outline-none transition focus:bg-white/[0.06]"
                            >
                              <option value="">无</option>
                              {MOCK_DATASETS.map((dataset) => (
                                <option key={dataset.id} value={dataset.id}>
                                  {dataset.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                            />
                          </div>
                        </label>
                      </div>
                    ) : null}

                    {createTaskTab === 'library' ? (
                      <div className="flex min-h-[150px] flex-col gap-5 md:flex-row md:gap-12">
                        <div className="flex w-full flex-col gap-2 md:w-44 md:flex-none">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((previous) => ({ ...previous, sourceType: 'git' }))
                            }
                            className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm transition ${
                              formData.sourceType === 'git'
                                ? 'bg-white/[0.08] text-slate-50'
                                : 'bg-transparent text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                            }`}
                          >
                            <GitBranch size={15} />
                            Github
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((previous) => ({ ...previous, sourceType: 'image' }))
                            }
                            className={`flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm transition ${
                              formData.sourceType === 'image'
                                ? 'bg-white/[0.08] text-slate-50'
                                : 'bg-transparent text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                            }`}
                          >
                            <Monitor size={15} />
                            Docker Image
                          </button>
                        </div>

                        <div className="flex-1 space-y-2">
                          {formData.sourceType === 'git' ? (
                            <>
                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">资源库 URL</span>
                                <input
                                  type="text"
                                  value={formData.gitRepo}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      gitRepo: event.target.value,
                                    }))
                                  }
                                  placeholder="https://github.com/org/repo.git"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>

                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">分支</span>
                                <input
                                  type="text"
                                  value={formData.gitBranch}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      gitBranch: event.target.value,
                                    }))
                                  }
                                  placeholder="main"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>

                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">入口命令</span>
                                <input
                                  type="text"
                                  value={formData.entrypoint}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      entrypoint: event.target.value,
                                    }))
                                  }
                                  placeholder="python train.py"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>
                            </>
                          ) : (
                            <>
                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">镜像 URL</span>
                                <input
                                  type="text"
                                  value={formData.imageUri}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      imageUri: event.target.value,
                                    }))
                                  }
                                  placeholder="registry.example.com/training:latest"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>

                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">镜像标签</span>
                                <input
                                  type="text"
                                  value={formData.gitBranch}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      gitBranch: event.target.value,
                                    }))
                                  }
                                  placeholder="latest"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>

                              <label className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <span className="w-full text-sm text-slate-400 md:w-28">入口命令</span>
                                <input
                                  type="text"
                                  value={formData.imageCommand}
                                  onChange={(event) =>
                                    setFormData((previous) => ({
                                      ...previous,
                                      imageCommand: event.target.value,
                                    }))
                                  }
                                  placeholder="sh launch.sh"
                                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] md:w-[299px]"
                                />
                              </label>
                            </>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {createTaskTab === 'hardware' ? (
                      <div className="space-y-4">
                        <div className="overflow-hidden rounded-lg border border-blue-950/80 bg-white/[0.03]">
                          <div className="grid md:grid-cols-2">
                            <div
                              className={`border-b border-blue-950/80 px-4 py-4 transition md:border-b-0 md:border-r ${
                                gpuMode === 'exclusive' ? 'bg-[#0f172a]' : ''
                              }`}
                            >
                              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-100">
                                <span>独占</span>
                                <Info size={14} className="text-slate-500" />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 flex-1 grid-cols-8 overflow-hidden rounded-md border border-white/10 bg-[#0b1326]">
                                  {EXCLUSIVE_GPU_OPTIONS.map((value) => (
                                    <button
                                      key={`exclusive-${value}`}
                                      type="button"
                                      onClick={() => updateGpuSelection('exclusive', value)}
                                      className={`inline-flex h-full min-w-0 items-center justify-center px-1 text-sm transition ${
                                        gpuMode === 'exclusive' && exclusiveGpuCount === value
                                          ? 'bg-white/[0.08] text-slate-50'
                                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  ))}
                                </div>
                                <span className="shrink-0 text-sm text-slate-400">GPU</span>
                              </div>
                            </div>

                            <div
                              className={`px-4 py-4 transition ${
                                gpuMode === 'shared' ? 'bg-[#111b32]' : 'bg-[#0d162b]'
                              }`}
                            >
                              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-100">
                                <span>共享</span>
                                <Info size={14} className="text-slate-500" />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 flex-1 grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-[#0c1529]">
                                  {SHARED_GPU_OPTIONS.map((value) => (
                                    <button
                                      key={`shared-${value}`}
                                      type="button"
                                      onClick={() => updateGpuSelection('shared', value)}
                                      className={`inline-flex h-full min-w-0 items-center justify-center px-1 text-sm transition ${
                                        gpuMode === 'shared' && sharedGpuCount === value
                                          ? 'bg-white/[0.08] text-slate-50'
                                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                      }`}
                                    >
                                      {value}
                                    </button>
                                  ))}
                                </div>
                                <span className="shrink-0 text-sm text-slate-400">GPU</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-3 text-sm">
                          <div className="text-slate-300">
                            当前模式
                            <span className="ml-2 font-medium text-slate-50">
                              {gpuMode === 'exclusive' ? '独占 GPU' : '共享 GPU'}
                            </span>
                          </div>
                          <div className="text-slate-400">
                            已选数量
                            <span className="ml-2 font-medium text-slate-100">
                              {formatGpuCount(effectiveGpuCount)} GPU
                            </span>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          {GPU_CARD_OPTIONS.map((option) => {
                            const isSelected = formData.gpuType === option.type;

                            return (
                              <button
                                key={option.type}
                                type="button"
                                onClick={() =>
                                  setFormData((current) => ({
                                    ...current,
                                    gpuType: option.type,
                                  }))
                                }
                                className={`flex min-h-[116px] flex-col justify-between rounded-lg border px-4 py-4 text-left transition ${
                                  isSelected
                                    ? 'border-blue-500/60 bg-blue-500/[0.08] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]'
                                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="text-[18px] font-semibold tracking-[-0.03em] text-slate-50">
                                    {option.name}
                                  </div>
                                  <div className="text-sm text-slate-400">{option.memory}</div>
                                </div>
                                <div className="text-sm text-slate-200">
                                  {formatPrice(option.price)}
                                  <span className="ml-1 text-slate-500">/小时</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mx-auto max-w-[705px] rounded-lg border border-blue-950/90 px-[18px] py-[18px]">
                  <div className="mb-4 text-sm text-slate-200">预估成本</div>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-end gap-2">
                        <span className="text-[30px] font-medium leading-none text-slate-50">
                          RMB {estimatedHourlyCost.toFixed(2)}
                        </span>
                        <span className="pb-1 text-sm text-slate-300">/小时</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">按分钟计费</p>
                    </div>

                    <div className="space-y-2 md:w-[323px]">
                      <div className="flex h-9 items-center justify-between rounded-lg bg-white/[0.05] px-[10px] text-sm text-slate-200">
                        <span>按天 (24小时)</span>
                        <span>RMB {(estimatedHourlyCost * 24).toFixed(2)}</span>
                      </div>
                      <div className="flex h-9 items-center justify-between rounded-lg bg-white/[0.05] px-[10px] text-sm text-slate-200">
                        <span>按月 (30天)</span>
                        <span>RMB {(estimatedHourlyCost * 24 * 30).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setCreateTaskTab('basic');
                    }}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                  >
                    取消
                  </button>
                  {createTaskTab === 'hardware' ? (
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      部署
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextCreateTaskTab}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      下一步
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {jobPendingPause ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-md rounded-lg border border-blue-950/80 bg-[linear-gradient(104deg,rgba(30,58,138,0.10),rgba(255,255,255,0)_18%),#0b1120] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <div className="space-y-5 px-[18px] py-1">
              <div className="space-y-2">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-50">
                  确认暂停任务
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  确定要暂停 “{jobPendingPause.name}” 吗？暂停后训练进程将停止推进，后续可再恢复。
                </p>
              </div>

              <div className="flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setJobPendingPause(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePause(jobPendingPause.id);
                    setJobPendingPause(null);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  确认暂停
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {jobPendingDelete ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-md rounded-lg border border-blue-950/80 bg-[linear-gradient(104deg,rgba(30,58,138,0.10),rgba(255,255,255,0)_18%),#0b1120] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <div className="space-y-5 px-[18px] py-1">
              <div className="space-y-2">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-50">
                  确认删除任务
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  确定要删除 “{jobPendingDelete.name}” 吗？此操作不可撤销。
                </p>
              </div>

              <label className="block space-y-2.5 text-sm">
                <span className="block text-sm font-medium text-slate-400">
                  请输入任务名称以确认
                </span>
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(event) => setDeleteConfirmationInput(event.target.value)}
                  placeholder={jobPendingDelete.name}
                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                />
              </label>

              <div className="flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setJobPendingDelete(null);
                    setDeleteConfirmationInput('');
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationInput !== jobPendingDelete.name}
                  onClick={() => {
                    handleDelete(jobPendingDelete.id);
                    setJobPendingDelete(null);
                    setDeleteConfirmationInput('');
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BatchJobs;
