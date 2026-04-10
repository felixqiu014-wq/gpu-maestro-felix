import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  Info,
  Package,
  Play,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  SquareTerminal,
  StopCircle,
  Trash2,
  X,
} from 'lucide-react';
import { MOCK_WORKLOADS } from '../constants';
import { JobStatus, ResourceType, Workload } from '../types';

const STATUS_STYLES: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
  [JobStatus.PENDING]: 'border border-amber-500/20 bg-amber-500/10 text-amber-200',
  [JobStatus.PAUSED]: 'border border-violet-500/20 bg-violet-500/10 text-violet-200',
  [JobStatus.COMPLETED]: 'border border-sky-500/20 bg-sky-500/10 text-sky-200',
  [JobStatus.FAILED]: 'border border-rose-500/20 bg-rose-500/10 text-rose-200',
  [JobStatus.TERMINATED]: 'border border-slate-700/80 bg-slate-800/80 text-slate-300',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.RUNNING]: '运行中',
  [JobStatus.PENDING]: '排队中',
  [JobStatus.PAUSED]: '已暂停',
  [JobStatus.COMPLETED]: '已完成',
  [JobStatus.FAILED]: '失败',
  [JobStatus.TERMINATED]: '已停止',
};

const GPU_OPTIONS = [
  ResourceType.H100,
  ResourceType.A100,
  ResourceType.L40S,
  ResourceType.V100,
];

const INTERFACE_OPTIONS = [
  'VS Code + Web Terminal',
  'VS Code',
  'Web Terminal',
];

const CREATE_TABS = ['基础设置', 'GPU选择&配置', '环境变量'];
const SESSION_DETAIL_TABS = ['修改代码与连接', '环境状态', '沙盒运行记录'];

const PRIORITY_OPTIONS = ['普通 (1x)', '高优先级 (2x)', '批处理 (0.5x)'];
const MODEL_OPTIONS = ['空 (需自行上传)', 'Llama 3 70B', 'Qwen 2.5 72B'];
const DATASET_OPTIONS = [
  '无',
  'WikiText-103-Pretrain',
  'ImageNet-1K-Val',
  'Instruction-Tuning-Internal',
];
const CUSTOM_CONFIG_MAP_OPTION = '自定义配置';
const CONFIG_MAP_OPTIONS = ['无', 'app-config', 'training-params', 'model-config', CUSTOM_CONFIG_MAP_OPTION];
const EMPTY_ENV_VAR = { id: '', key: '', value: '' };

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

const formatDate = (value: string) =>
  new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

const formatLogTime = (value: string, index: number) => {
  const baseDate = new Date(value);
  baseDate.setMinutes(baseDate.getMinutes() + index);

  return baseDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const TABLE_COLUMNS = [
  'minmax(260px, 1.6fr)',
  '140px',
  '180px',
  '120px',
  '170px',
  '110px',
  '132px',
].join(' ');

const Sandboxes: React.FC = () => {
  const priorityDropdownRef = useRef<HTMLDivElement | null>(null);
  const modelDropdownRef = useRef<HTMLDivElement | null>(null);
  const datasetDropdownRef = useRef<HTMLDivElement | null>(null);
  const configMapDropdownRef = useRef<HTMLDivElement | null>(null);
  const [sessions, setSessions] = useState<Workload[]>(
    MOCK_WORKLOADS.filter((workload) => workload.type === 'INTERACTIVE')
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);
  const [sessionPendingDelete, setSessionPendingDelete] = useState<Workload | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [sessionPendingStop, setSessionPendingStop] = useState<Workload | null>(null);
  const [exportingSession, setExportingSession] = useState<Workload | null>(null);
  const [selectedSession, setSelectedSession] = useState<Workload | null>(null);
  const [query, setQuery] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);
  const [activeSessionDetailTab, setActiveSessionDetailTab] = useState(0);
  const [copiedConnection, setCopiedConnection] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    priority: PRIORITY_OPTIONS[0],
    model: MODEL_OPTIONS[0],
    dataset: DATASET_OPTIONS[0],
    configMap: CONFIG_MAP_OPTIONS[0],
    customConfigMapName: '',
    customConfigMapContent: '',
    interface: INTERFACE_OPTIONS[0],
    gpuType: ResourceType.H100,
    gpuCount: 1,
  });
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isDatasetOpen, setIsDatasetOpen] = useState(false);
  const [isConfigMapOpen, setIsConfigMapOpen] = useState(false);
  const [activeCreateTab, setActiveCreateTab] = useState(0);
  const [gpuMode, setGpuMode] = useState<'exclusive' | 'shared'>('exclusive');
  const [exclusiveGpuCount, setExclusiveGpuCount] = useState('1');
  const [sharedGpuCount, setSharedGpuCount] = useState('0.5');
  const [envVars, setEnvVars] = useState<Array<{ id: string; key: string; value: string }>>([]);
  const [exportFormData, setExportFormData] = useState({
    imageName: '',
    imageTag: 'latest',
    description: '',
    registry: 'registry.hub.docker.com',
  });

  const resetCreateModal = () => {
    setActiveCreateTab(0);
    setGpuMode('exclusive');
    setExclusiveGpuCount('1');
    setSharedGpuCount('0.5');
    setEnvVars([]);
    closeCreateDropdowns();
  };

  const closeCreateDropdowns = () => {
    setIsPriorityOpen(false);
    setIsModelOpen(false);
    setIsDatasetOpen(false);
    setIsConfigMapOpen(false);
  };

  const closeCreateModal = () => {
    resetCreateModal();
    setIsCreateModalOpen(false);
  };

  const openSessionDetail = (session: Workload) => {
    setSelectedSession(session);
    setActiveSessionDetailTab(0);
    setCopiedConnection(false);
    setIsSessionDetailOpen(true);
  };

  const closeSessionDetail = () => {
    setIsSessionDetailOpen(false);
    setActiveSessionDetailTab(0);
    setCopiedConnection(false);
    setSelectedSession(null);
  };

  useEffect(() => {
    if (!isCreateModalOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideDropdown = [
        priorityDropdownRef.current,
        modelDropdownRef.current,
        datasetDropdownRef.current,
        configMapDropdownRef.current,
      ].some((element) => element?.contains(target));

      if (!clickedInsideDropdown) {
        closeCreateDropdowns();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isCreateModalOpen]);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sessions.filter((session) => {
      if (!normalizedQuery) {
        return true;
      }

      return [
        session.name,
        session.id,
        session.owner,
        session.gpuType ?? '',
        STATUS_LABELS[session.status],
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, sessions, refreshTick]);

  const sessionMetrics = useMemo(() => {
    const gpuModel = selectedSession?.gpuType ?? '';
    const metricPreset =
      gpuModel === ResourceType.H100
        ? { vramUsed: 12.4, vramTotal: 80, gpuUsage: 72, gpuPower: 185 }
        : gpuModel === ResourceType.A100
          ? { vramUsed: 19.6, vramTotal: 40, gpuUsage: 64, gpuPower: 146 }
          : gpuModel === ResourceType.L40S
            ? { vramUsed: 15.8, vramTotal: 48, gpuUsage: 58, gpuPower: 121 }
            : { vramUsed: 8.2, vramTotal: 32, gpuUsage: 46, gpuPower: 96 };

    const vramPercent = Math.min(
      100,
      Math.max(0, (metricPreset.vramUsed / metricPreset.vramTotal) * 100)
    );

    return {
      ...metricPreset,
      vramPercent,
    };
  }, [selectedSession]);

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (activeCreateTab < 2) {
      setActiveCreateTab((current) => current + 1);
      return;
    }

    const newSession: Workload = {
      id: `wl-${Math.floor(Math.random() * 9000) + 1000}`,
      name: formData.name.trim() || 'untitled-sandbox',
      type: 'INTERACTIVE',
      owner: 'Admin User',
      gpuRequested: formData.gpuCount,
      gpuType: formData.gpuType,
      status: JobStatus.RUNNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [
        'Allocating GPU resources...',
        'Starting remote development services...',
        'Sandbox is ready.',
      ],
    };

    setSessions((current) => [newSession, ...current]);
    setFormData({
      name: '',
      priority: PRIORITY_OPTIONS[0],
      model: MODEL_OPTIONS[0],
      dataset: DATASET_OPTIONS[0],
      configMap: CONFIG_MAP_OPTIONS[0],
      customConfigMapName: '',
      customConfigMapContent: '',
      interface: INTERFACE_OPTIONS[0],
      gpuType: ResourceType.H100,
      gpuCount: 1,
    });
    closeCreateModal();
  };

  const handleNextStep = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setActiveCreateTab((current) => Math.min(current + 1, 2));
  };

  const updateGpuSelection = (mode: 'exclusive' | 'shared', value: string) => {
    const parsedCount = Number.parseFloat(value) || 0;

    setGpuMode(mode);

    if (mode === 'exclusive') {
      setExclusiveGpuCount(value);
    } else {
      setSharedGpuCount(value);
    }

    setFormData((current) => ({
      ...current,
      gpuCount: parsedCount,
    }));
  };

  const selectedGpuOption =
    GPU_CARD_OPTIONS.find((option) => option.type === formData.gpuType) ?? GPU_CARD_OPTIONS[1];
  const effectiveGpuCount = formData.gpuCount;
  const hourlyCost = selectedGpuOption.price * effectiveGpuCount;
  const dailyCost = hourlyCost * 24;
  const monthlyCost = dailyCost * 30;

  const addEnvVar = () => {
    setEnvVars((current) => [
      ...current,
      {
        ...EMPTY_ENV_VAR,
        id: `env-${Date.now()}-${current.length}`,
      },
    ]);
  };

  const updateEnvVar = (id: string, field: 'key' | 'value', value: string) => {
    setEnvVars((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeEnvVar = (id: string) => {
    setEnvVars((current) => current.filter((item) => item.id !== id));
  };

  const handleExportClick = (session: Workload) => {
    setExportingSession(session);
    setExportFormData({
      imageName: session.name.toLowerCase().replace(/\s+/g, '-'),
      imageTag: 'latest',
      description: `Exported from sandbox ${session.name}`,
      registry: 'registry.hub.docker.com',
    });
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsExportModalOpen(false);
    setExportingSession(null);
  };

  const exportImagePreview = `${exportFormData.registry}/${exportFormData.imageName || 'sandbox-image'}:${exportFormData.imageTag || 'latest'}`;

  const handleCopyConnection = async () => {
    if (!selectedSession) {
      return;
    }

    const command = `ssh -p 2222 root@${selectedSession.id}.sandbox.gpu-maestro.local`;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedConnection(true);
      window.setTimeout(() => setCopiedConnection(false), 1800);
    } catch {
      setCopiedConnection(false);
    }
  };

  const handleStop = (sessionId: string) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: JobStatus.TERMINATED,
              updatedAt: new Date().toISOString(),
            }
          : session
      )
    );

    setSelectedSession((current) =>
      current?.id === sessionId
        ? {
            ...current,
            status: JobStatus.TERMINATED,
            updatedAt: new Date().toISOString(),
          }
        : current
    );
  };

  const handleStart = (sessionId: string) => {
    setSessions((current) =>
      current.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: JobStatus.RUNNING,
              updatedAt: new Date().toISOString(),
            }
          : session
      )
    );

    setSelectedSession((current) =>
      current?.id === sessionId
        ? {
            ...current,
            status: JobStatus.RUNNING,
            updatedAt: new Date().toISOString(),
          }
        : current
    );
  };

  const handleDelete = (sessionId: string) => {
    setSessions((current) => current.filter((session) => session.id !== sessionId));

    if (selectedSession?.id === sessionId) {
      closeSessionDetail();
    }
  };

  return (
    <>
      <div className="flex w-full flex-col gap-[18px] px-4 py-4 sm:px-5 lg:px-[18px] lg:py-[18px] 2xl:px-6">
        <section className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <h1 className="text-[26px] font-semibold tracking-tight text-slate-50">沙箱环境</h1>
                <p className="text-[13px] text-slate-400">
                  高性能远程开发环境，提供 VS Code、终端访问和独占 GPU 资源。
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetCreateModal();
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-400/30 bg-blue-500 px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)] transition hover:bg-blue-400"
              >
                <Plus size={16} />
                新建沙箱
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-[linear-gradient(90deg,rgba(30,64,175,0.16),rgba(15,23,42,0.78)_52%,rgba(15,23,42,0.92))]">
              <div className="pointer-events-none absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_68%)]" />
              <div className="relative flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-200">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-slate-100">远程环境可用</p>
                    <p className="text-[13px] leading-5 text-slate-300">
                      您可以通过 VS Code Remote-SSH 连接，或直接使用我们提供的在线 IDE。
                    </p>
                  </div>
                </div>

                <div className="inline-flex h-8 items-center gap-2 self-start rounded-full border border-sky-400/20 bg-sky-500/10 px-3 text-[10px] font-semibold tracking-[0.18em] text-sky-100 sm:self-auto">
                  <ShieldCheck size={12} />
                  SSH SECURE
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-800/80 bg-slate-950/30">
              <div className="flex flex-col gap-3 border-b border-slate-800/80 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full max-w-md">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索沙箱 / GPU / 状态"
                    className="h-9 w-full rounded-lg border border-slate-800 bg-slate-950 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setRefreshTick((value) => value + 1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-blue-500/30 hover:bg-slate-900 hover:text-slate-100"
                  aria-label="刷新列表"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[1080px]">
                  <div
                    className="grid border-b border-slate-800/80 bg-slate-950/60 text-left text-[11px] font-medium tracking-[0.02em] text-slate-400"
                    style={{ gridTemplateColumns: TABLE_COLUMNS }}
                  >
                    <div className="px-4 py-3 uppercase">沙箱名称</div>
                    <div className="px-4 py-3 uppercase">交互界面</div>
                    <div className="px-4 py-3 uppercase">GPU数量/资源</div>
                    <div className="px-4 py-3 uppercase">GPU类型</div>
                    <div className="px-4 py-3 uppercase">创建时间</div>
                    <div className="px-4 py-3 uppercase">状态</div>
                    <div className="px-4 py-3 text-right uppercase">操作</div>
                  </div>

                  {filteredSessions.map((session) => (
                    <div
                      key={session.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openSessionDetail(session)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openSessionDetail(session);
                        }
                      }}
                      className="grid cursor-pointer border-b border-slate-800/70 text-sm transition hover:bg-slate-900/55 last:border-b-0"
                      style={{ gridTemplateColumns: TABLE_COLUMNS }}
                    >
                      <div className="flex items-center px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900 text-slate-200">
                            <SquareTerminal size={15} />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium text-slate-100">{session.name}</div>
                            <div className="text-xs text-slate-500">{session.id}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/80 bg-slate-900 text-slate-200">
                            <Code2 size={14} />
                          </span>
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/80 bg-slate-900 text-slate-200">
                            <SquareTerminal size={14} />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium text-slate-100">
                            {session.gpuRequested} x GPU
                          </div>
                          <div className="text-xs text-slate-500">独占计算资源</div>
                        </div>
                      </div>

                      <div className="flex items-center px-4 py-3 text-sm text-slate-300">
                        {session.gpuType ?? '-'}
                      </div>

                      <div className="flex items-center px-4 py-3 text-sm text-slate-400">
                        <span suppressHydrationWarning>{formatDate(session.createdAt)}</span>
                      </div>

                      <div className="flex items-center px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[session.status]}`}
                        >
                          {STATUS_LABELS[session.status]}
                        </span>
                      </div>

                      <div className="flex items-center justify-end px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleExportClick(session);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/80 bg-slate-950 text-slate-400 transition hover:border-blue-500/30 hover:bg-slate-900 hover:text-slate-100"
                            aria-label={`导出 ${session.name}`}
                          >
                            <Package size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (session.status === JobStatus.TERMINATED) {
                                handleStart(session.id);
                                return;
                              }

                              setSessionPendingStop(session);
                            }}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/80 bg-slate-950 text-slate-400 transition ${
                              session.status === JobStatus.TERMINATED
                                ? 'hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-200'
                                : 'hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-200'
                            }`}
                            aria-label={`${session.status === JobStatus.TERMINATED ? '开始' : '停止'} ${session.name}`}
                          >
                            {session.status === JobStatus.TERMINATED ? (
                              <Play size={14} />
                            ) : (
                              <StopCircle size={14} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSessionPendingDelete(session);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-700/80 bg-slate-950 text-slate-400 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
                            aria-label={`删除 ${session.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="flex min-h-56 flex-col items-center justify-center gap-2 px-5 py-16 text-center">
                  <div className="text-sm font-medium text-slate-300">未找到匹配的沙箱</div>
                  <div className="text-sm text-slate-500">尝试调整关键字，或直接创建一个新的沙箱环境。</div>
                </div>
              ) : null}
            </div>
        </section>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-[820px] rounded-lg border border-[#172554] bg-[linear-gradient(102deg,rgba(30,58,138,0.10)_-174.79%,#0a0a0a_91.58%),#0a0a0a] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="px-[18px] pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-50">
                      新建沙箱环境
                    </h2>
                    <button
                      type="button"
                      onClick={closeCreateModal}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                      aria-label="关闭"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-400">配置沙箱交互和硬件信息</p>
                </div>
              </div>

              <div
                className={`relative overflow-visible rounded-lg border border-blue-950/80 bg-slate-950/30 pb-[18px] ${
                  isPriorityOpen || isModelOpen || isDatasetOpen || isConfigMapOpen ? 'z-20' : ''
                }`}
              >
                <div className="flex h-12 items-stretch border-b border-blue-950/80 bg-white/[0.05]">
                  {CREATE_TABS.map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        if (index <= 2) {
                          setActiveCreateTab(index);
                        }
                      }}
                      className={`relative inline-flex min-w-0 flex-1 items-center justify-center px-4 text-sm transition ${
                        index === activeCreateTab ? 'text-slate-50' : 'text-slate-500'
                      }`}
                    >
                      <span className="whitespace-nowrap">{tab}</span>
                      {index === activeCreateTab ? (
                        <span className="absolute inset-x-0 bottom-0 h-px bg-blue-500" />
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="min-h-[320px]">
                {activeCreateTab === 0 ? (
                  <div className="grid gap-x-[23px] gap-y-4 px-[18px] pt-5 md:grid-cols-2">
                    <label className="space-y-2.5 text-sm">
                      <span className="block text-sm font-medium text-slate-200">沙箱名称</span>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, name: event.target.value }))
                        }
                        placeholder="e.g. transformer-dev-env"
                        className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                      />
                    </label>

                    <div className="space-y-2.5 text-sm">
                      <div className="block text-sm font-medium text-slate-200">优先级</div>
                      <div
                        ref={priorityDropdownRef}
                        className={`relative ${isPriorityOpen ? 'z-40' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsPriorityOpen((current) => !current);
                            setIsModelOpen(false);
                            setIsDatasetOpen(false);
                          }}
                          className="flex h-9 w-full items-center justify-between rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 transition hover:bg-white/[0.06]"
                        >
                          <span>{formData.priority}</span>
                          <ChevronDown
                            size={18}
                            className={`text-slate-500 transition ${isPriorityOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isPriorityOpen ? (
                          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 shadow-[0_28px_80px_rgba(2,6,23,0.5)]">
                            {PRIORITY_OPTIONS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setFormData((current) => ({ ...current, priority: item }));
                                  setIsPriorityOpen(false);
                                }}
                                className={`flex h-9 w-full items-center rounded-md px-3 text-left text-sm transition ${
                                  formData.priority === item
                                    ? 'bg-white/[0.05] text-slate-50'
                                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="block text-sm font-medium text-slate-200">模型</div>
                      <div
                        ref={modelDropdownRef}
                        className={`relative ${isModelOpen ? 'z-40' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsModelOpen((current) => !current);
                            setIsPriorityOpen(false);
                            setIsDatasetOpen(false);
                          }}
                          className="flex h-9 w-full items-center justify-between rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 transition hover:bg-white/[0.06]"
                        >
                          <span>{formData.model}</span>
                          <ChevronDown
                            size={18}
                            className={`text-slate-500 transition ${isModelOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isModelOpen ? (
                          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 shadow-[0_28px_80px_rgba(2,6,23,0.5)]">
                            {MODEL_OPTIONS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setFormData((current) => ({ ...current, model: item }));
                                  setIsModelOpen(false);
                                }}
                                className={`flex h-9 w-full items-center rounded-md px-3 text-left text-sm transition ${
                                  formData.model === item
                                    ? 'bg-white/[0.05] text-slate-50'
                                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="block text-sm font-medium text-slate-200">数据集</div>
                      <div
                        ref={datasetDropdownRef}
                        className={`relative ${isDatasetOpen ? 'z-40' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsDatasetOpen((current) => !current);
                            setIsPriorityOpen(false);
                            setIsModelOpen(false);
                          }}
                          className="flex h-9 w-full items-center justify-between rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 transition hover:bg-white/[0.06]"
                        >
                          <span>{formData.dataset}</span>
                          <ChevronDown
                            size={18}
                            className={`text-slate-500 transition ${isDatasetOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isDatasetOpen ? (
                          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 shadow-[0_28px_80px_rgba(2,6,23,0.5)]">
                            {DATASET_OPTIONS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setFormData((current) => ({ ...current, dataset: item }));
                                  setIsDatasetOpen(false);
                                }}
                                className={`flex h-9 w-full items-center rounded-md px-3 text-left text-sm transition ${
                                  formData.dataset === item
                                    ? 'bg-white/[0.05] text-slate-50'
                                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm md:col-span-2">
                      <div className="block text-sm font-medium text-slate-200">
                        选择 ConfigMap（可选）
                      </div>
                      <div
                        ref={configMapDropdownRef}
                        className={`relative ${isConfigMapOpen ? 'z-40' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfigMapOpen((current) => !current);
                            setIsPriorityOpen(false);
                            setIsModelOpen(false);
                            setIsDatasetOpen(false);
                          }}
                          className="flex h-9 w-full items-center justify-between rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 transition hover:bg-white/[0.06]"
                        >
                          <span>{formData.configMap}</span>
                          <ChevronDown
                            size={18}
                            className={`text-slate-500 transition ${isConfigMapOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isConfigMapOpen ? (
                          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full rounded-lg border border-slate-800 bg-slate-950 p-1.5 shadow-[0_28px_80px_rgba(2,6,23,0.5)]">
                            {CONFIG_MAP_OPTIONS.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => {
                                  setFormData((current) => ({ ...current, configMap: item }));
                                  setIsConfigMapOpen(false);
                                }}
                                className={`flex h-9 w-full items-center rounded-md px-3 text-left text-sm transition ${
                                  formData.configMap === item
                                    ? 'bg-white/[0.05] text-slate-50'
                                    : 'text-slate-300 hover:bg-white/[0.04] hover:text-slate-100'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {formData.configMap === CUSTOM_CONFIG_MAP_OPTION ? (
                        <div className="mt-4 space-y-4">
                          <label className="block space-y-2.5 text-sm">
                            <span className="block text-sm font-medium text-slate-200">
                              配置名称
                            </span>
                            <input
                              type="text"
                              value={formData.customConfigMapName}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  customConfigMapName: event.target.value,
                                }))
                              }
                              placeholder="例如 app-config"
                              className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                            />
                          </label>

                          <label className="block space-y-2.5 text-sm">
                            <span className="block text-sm font-medium text-slate-200">
                              配置内容
                            </span>
                            <textarea
                              rows={7}
                              value={formData.customConfigMapContent}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  customConfigMapContent: event.target.value,
                                }))
                              }
                              placeholder={'key: value\nnested:\n  enabled: true'}
                              className="w-full rounded-md bg-white/[0.05] px-3 py-2.5 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : activeCreateTab === 1 ? (
                  <div className="space-y-4 px-[18px] pt-5">
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
                ) : (
                  <div className="px-[18px] pt-5">
                    {envVars.length === 0 ? (
                      <div className="flex min-h-[252px] flex-col items-center justify-center gap-4 pb-5 text-center">
                        <div className="text-sm text-slate-500">暂未配置环境变量</div>
                        <button
                          type="button"
                          onClick={addEnvVar}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                        >
                          <Plus size={16} />
                          新增
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 pb-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-slate-200">环境变量</div>
                          <button
                            type="button"
                            onClick={addEnvVar}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                          >
                            <Plus size={16} />
                            新增
                          </button>
                        </div>

                        <div className="space-y-3">
                          {envVars.map((item) => (
                            <div
                              key={item.id}
                              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]"
                            >
                              <input
                                type="text"
                                value={item.key}
                                onChange={(event) =>
                                  updateEnvVar(item.id, 'key', event.target.value)
                                }
                                placeholder="变量名，如 API_KEY"
                                className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                              />
                              <input
                                type="text"
                                value={item.value}
                                onChange={(event) =>
                                  updateEnvVar(item.id, 'value', event.target.value)
                                }
                                placeholder="变量值"
                                className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                              />
                              <button
                                type="button"
                                onClick={() => removeEnvVar(item.id)}
                                className="inline-flex h-9 w-10 items-center justify-center rounded-md bg-white/[0.05] text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-200"
                                aria-label="删除环境变量"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>

              <div className="rounded-lg border border-blue-950/80 bg-slate-950/30 px-[18px] py-[18px]">
                <div className="mb-4 text-sm font-medium text-slate-100">预估成本</div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 pt-[10px]">
                    <div className="flex items-end gap-2 text-slate-50">
                      <span className="text-[30px] font-semibold leading-none tracking-[-0.04em]">
                        {formatPrice(hourlyCost)}
                      </span>
                      <span className="pb-0.5 text-sm text-slate-300">/小时</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {gpuMode === 'exclusive'
                        ? '独占规格支持 1-8 张 GPU'
                        : '共享规格支持 0.5 / 0.25 GPU'}
                    </div>
                  </div>

                  <div className="grid min-w-[323px] gap-2">
                    <div className="flex h-9 items-center justify-between rounded-lg bg-white/[0.05] px-[10px]">
                      <span className="text-sm text-slate-400">按天 (24h)</span>
                      <span className="text-sm font-semibold text-slate-100">
                        {formatPrice(dailyCost)}
                      </span>
                    </div>
                    <div className="flex h-9 items-center justify-between rounded-lg bg-white/[0.05] px-[10px]">
                      <span className="text-sm text-slate-400">按月 (30d)</span>
                      <span className="text-sm font-semibold text-slate-100">
                        {formatPrice(monthlyCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-[10px] px-[18px] pb-1">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                {activeCreateTab < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                  >
                    下一步
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={effectiveGpuCount === 0}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    部署
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {sessionPendingStop ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-md rounded-lg border border-blue-950/80 bg-[linear-gradient(104deg,rgba(30,58,138,0.10),rgba(255,255,255,0)_18%),#0b1120] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <div className="space-y-5 px-[18px] py-1">
              <div className="space-y-2">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-50">
                  确认停止沙箱
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  确定要停止 “{sessionPendingStop.name}” 吗？停止后 GPU 资源将被释放。
                </p>
              </div>

              <div className="flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => setSessionPendingStop(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleStop(sessionPendingStop.id);
                    setSessionPendingStop(null);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  确认停止
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {sessionPendingDelete ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-md rounded-lg border border-blue-950/80 bg-[linear-gradient(104deg,rgba(30,58,138,0.10),rgba(255,255,255,0)_18%),#0b1120] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <div className="space-y-5 px-[18px] py-1">
              <div className="space-y-2">
                <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-50">
                  确认删除沙箱
                </h2>
                <p className="text-sm leading-6 text-slate-400">
                  确定要删除 “{sessionPendingDelete.name}” 吗？此操作不可撤销。
                </p>
              </div>

              <label className="block space-y-2.5 text-sm">
                <span className="block text-sm font-medium text-slate-400">
                  请输入沙箱名称以确认
                </span>
                <input
                  type="text"
                  value={deleteConfirmationInput}
                  onChange={(event) => setDeleteConfirmationInput(event.target.value)}
                  placeholder={sessionPendingDelete.name}
                  className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                />
              </label>

              <div className="flex items-center justify-end gap-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setSessionPendingDelete(null);
                    setDeleteConfirmationInput('');
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmationInput !== sessionPendingDelete.name}
                  onClick={() => {
                    handleDelete(sessionPendingDelete.id);
                    setSessionPendingDelete(null);
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

      {isSessionDetailOpen && selectedSession ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-[820px] rounded-lg border border-[#172554] bg-[linear-gradient(102deg,rgba(30,58,138,0.10)_-174.79%,#0a0a0a_91.58%),#0a0a0a] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <div className="space-y-5">
              <div className="px-[18px] pt-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-50">
                        {selectedSession.name}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[selectedSession.status]}`}
                      >
                        {STATUS_LABELS[selectedSession.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                      <span>Instance: {selectedSession.id}</span>
                      <span>GPU Model: {selectedSession.gpuType ?? '-'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeSessionDetail}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                    aria-label="关闭"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-blue-950/80 bg-slate-950/30">
                <div className="flex h-12 items-stretch border-b border-blue-950/80 bg-white/[0.05]">
                  {SESSION_DETAIL_TABS.map((tab, index) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveSessionDetailTab(index)}
                      className={`relative inline-flex min-w-0 flex-1 items-center justify-center px-4 text-sm transition ${
                        index === activeSessionDetailTab ? 'text-slate-50' : 'text-slate-500'
                      }`}
                    >
                      <span className="whitespace-nowrap">{tab}</span>
                      {index === activeSessionDetailTab ? (
                        <span className="absolute inset-x-0 bottom-0 h-px bg-blue-500" />
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className="min-h-[320px] px-[18px] py-5">
                  {activeSessionDetailTab === 0 ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-blue-500/20 bg-blue-500/[0.07] px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-slate-50">
                                VS Code Remote
                              </div>
                              <span className="inline-flex items-center rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-200">
                                推荐
                              </span>
                            </div>
                            <p className="text-sm leading-6 text-slate-400">
                              通过 Remote-SSH 连接到当前沙箱，直接在本地 VS Code 中修改代码并调试运行。
                            </p>
                            {copiedConnection ? (
                              <p className="text-xs text-blue-200">连接命令已复制</p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopyConnection}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.1] hover:text-slate-50"
                              aria-label="复制连接命令"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.1] hover:text-slate-50"
                              aria-label="打开 VS Code Remote"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg bg-white/[0.03] px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-50">
                              Jupyter Notebook
                            </div>
                            <p className="text-sm leading-6 text-slate-400">
                              在浏览器中打开 Notebook 环境，适合实验验证、模型推理和交互式分析。
                            </p>
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.1] hover:text-slate-50"
                            aria-label="打开 Jupyter Notebook"
                          >
                            <BookOpen size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg bg-white/[0.03] px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-slate-50">Web终端</div>
                            <p className="text-sm leading-6 text-slate-400">
                              打开内置终端窗口，执行命令、查看日志或快速检查容器环境状态。
                            </p>
                          </div>
                          <button
                            type="button"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.1] hover:text-slate-50"
                            aria-label="打开 Web终端"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : activeSessionDetailTab === 1 ? (
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200">VRAM Usage</span>
                          <span className="text-slate-100">
                            {sessionMetrics.vramUsed.toFixed(1)} / {sessionMetrics.vramTotal} GB
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#172554,#3b82f6)]"
                            style={{ width: `${sessionMetrics.vramPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200">GPU Usage</span>
                          <span className="text-slate-100">{sessionMetrics.gpuUsage}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#172554,#3b82f6)]"
                            style={{ width: `${sessionMetrics.gpuUsage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-200">GPU Power</span>
                        <span className="text-slate-100">{sessionMetrics.gpuPower}W</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSession.logs && selectedSession.logs.length > 0 ? (
                        <>
                          {selectedSession.logs.map((log, index) => (
                            <div
                              key={`${selectedSession.id}-log-${index}`}
                              className="flex items-start gap-8 text-sm"
                            >
                              <span className="min-w-[72px] text-slate-500">
                                <span suppressHydrationWarning>
                                  {formatLogTime(selectedSession.createdAt, index)}
                                </span>
                              </span>
                              <span className="text-slate-100">{log}</span>
                            </div>
                          ))}
                          <div className="text-sm text-slate-500">-</div>
                        </>
                        ) : (
                          <div className="py-10 text-center text-sm text-slate-500">
                            暂无运行记录
                          </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-[10px] px-[18px] pb-1">
                <button
                  type="button"
                  onClick={closeSessionDetail}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => handleStop(selectedSession.id)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  停止并释放GPU
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isExportModalOpen && exportingSession ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/70 px-4 py-8 backdrop-blur-md">
          <div className="w-full max-w-[820px] rounded-lg border border-blue-950/80 bg-[linear-gradient(104deg,rgba(30,58,138,0.10),rgba(255,255,255,0)_18%),#0b1120] p-4 shadow-[0_36px_120px_rgba(2,6,23,0.62)]">
            <form onSubmit={handleExportSubmit} className="space-y-5">
              <div className="px-[18px] pt-1">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-slate-50">
                        将 “{exportingSession.name}” 导出为容器镜像
                      </h2>
                      <p className="text-sm text-slate-400">
                        为批量训练任务打包您的开发环境。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportModalOpen(false);
                        setExportingSession(null);
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-slate-100"
                      aria-label="关闭"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-[18px]">
                <div className="grid gap-x-[23px] gap-y-4 md:grid-cols-2">
                  <label className="space-y-2.5 text-sm">
                    <span className="block text-sm font-medium text-slate-400">镜像名称</span>
                    <input
                      type="text"
                      value={exportFormData.imageName}
                      onChange={(event) =>
                        setExportFormData((current) => ({
                          ...current,
                          imageName: event.target.value,
                        }))
                      }
                      placeholder="e.g. transformer-dev-env"
                      className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                    />
                  </label>

                  <label className="space-y-2.5 text-sm">
                    <span className="block text-sm font-medium text-slate-400">标签</span>
                    <input
                      type="text"
                      value={exportFormData.imageTag}
                      onChange={(event) =>
                        setExportFormData((current) => ({
                          ...current,
                          imageTag: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                    />
                  </label>
                </div>

                <label className="space-y-2.5 text-sm">
                  <span className="block text-sm font-medium text-slate-400">描述</span>
                  <textarea
                    rows={4}
                    value={exportFormData.description}
                    onChange={(event) =>
                      setExportFormData((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    className="w-full rounded-md bg-white/[0.05] px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                  />
                </label>

                <label className="space-y-2.5 text-sm">
                  <span className="block text-sm font-medium text-slate-400">目标注册表</span>
                  <input
                    type="text"
                    value={exportFormData.registry}
                    onChange={(event) =>
                      setExportFormData((current) => ({
                        ...current,
                        registry: event.target.value,
                      }))
                    }
                    placeholder="e.g. registry.hub.docker.com"
                    className="h-9 w-full rounded-md bg-white/[0.05] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06]"
                  />
                </label>

                <div className="space-y-2.5 pt-2 text-sm">
                  <span className="block text-sm font-medium text-slate-400">镜像URL预览</span>
                  <div className="flex h-9 items-center gap-3 rounded-md bg-white/[0.05] px-3 text-sm text-slate-100">
                    <span className="min-w-0 flex-1 truncate">{exportImagePreview}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(exportImagePreview)}
                      className="inline-flex h-6 w-6 items-center justify-center text-slate-400 transition hover:text-slate-100"
                      aria-label="复制镜像URL"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-[10px] px-[18px] pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsExportModalOpen(false);
                    setExportingSession(null);
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-200 px-4 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-600"
                >
                  导出
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Sandboxes;
