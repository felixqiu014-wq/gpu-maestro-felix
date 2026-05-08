import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Gauge, Info, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select } from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { ResourceType } from '../../types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  weight: number;
  maxGPUs: number;
  allowedGPUs?: ResourceType[];
  gpuUnlimited?: boolean;
  activeTasks: number;
  burstTasks: number;
}

interface WorkspaceTeam {
  id: string;
  name: string;
  budget: number;
  guaranteedGpus: number;
  burstLimit: number;
  currentUsage: number;
  policy: PolicyValue;
  members: TeamMember[];
}

const POLICY_OPTIONS = [
  {
    value: 'STRICT_PRIORITY',
    label: '严格按优先级抢占',
    description: '当团队内资源不足时，系统优先保障高权重成员的任务，低权重任务可被抢占。',
  },
  {
    value: 'FAIR_SHARE',
    label: '公平共享（禁止抢占）',
    description: '团队成员按公平共享原则竞争资源，一旦任务运行后，团队内部不再触发抢占。',
  },
  {
    value: 'OVER_QUOTA_ONLY',
    label: '仅允许超出保底额度时抢占',
    description: '仅当任务运行在弹性借用区间时允许抢占，保底算力范围内的任务始终受保护。',
  },
] as const;

type PolicyValue = (typeof POLICY_OPTIONS)[number]['value'];

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'tm-001',
    name: '林知行',
    email: 'zhixing.lin@airlab.ai',
    weight: 9,
    maxGPUs: 6,
    allowedGPUs: [ResourceType.H100, ResourceType.A100],
    activeTasks: 4,
    burstTasks: 2,
  },
  {
    id: 'tm-002',
    name: '周若宁',
    email: 'ruoning.zhou@airlab.ai',
    weight: 7,
    maxGPUs: 4,
    gpuUnlimited: true,
    activeTasks: 3,
    burstTasks: 1,
  },
  {
    id: 'tm-003',
    name: '陈拓远',
    email: 'tuoyuan.chen@airlab.ai',
    weight: 5,
    maxGPUs: 3,
    allowedGPUs: [ResourceType.A100, ResourceType.L40S],
    activeTasks: 2,
    burstTasks: 0,
  },
  {
    id: 'tm-004',
    name: '许清禾',
    email: 'qinghe.xu@airlab.ai',
    weight: 3,
    maxGPUs: 2,
    allowedGPUs: [ResourceType.V100],
    activeTasks: 1,
    burstTasks: 0,
  },
];

const INITIAL_TEAMS: WorkspaceTeam[] = [
  {
    id: 'team-001',
    name: 'AI 交叉科学实验室',
    budget: 50000,
    guaranteedGpus: 8,
    burstLimit: 16,
    currentUsage: 11.5,
    policy: 'STRICT_PRIORITY',
    members: INITIAL_MEMBERS,
  },
  {
    id: 'team-002',
    name: '多模态系统团队',
    budget: 36000,
    guaranteedGpus: 6,
    burstLimit: 12,
    currentUsage: 4.5,
    policy: 'FAIR_SHARE',
    members: [
      {
        id: 'tm-101',
        name: '沈明哲',
        email: 'mingzhe.shen@multimodal.ai',
        weight: 8,
        maxGPUs: 4,
        allowedGPUs: [ResourceType.H100, ResourceType.L40S],
        activeTasks: 2,
        burstTasks: 0,
      },
      {
        id: 'tm-102',
        name: '韩书意',
        email: 'shuyi.han@multimodal.ai',
        weight: 5,
        maxGPUs: 3,
        gpuUnlimited: true,
        activeTasks: 1,
        burstTasks: 0,
      },
    ],
  },
];

const defaultNewMember = (): TeamMember => ({
  id: '',
  name: '',
  email: '',
  weight: 5,
  maxGPUs: 2,
  allowedGPUs: [ResourceType.A100],
  gpuUnlimited: false,
  activeTasks: 0,
  burstTasks: 0,
});

const formatGpu = (value: number) => `${value.toFixed(1)} GPUs`;
const getInitials = (name: string) => name.slice(0, 2);

function MetricCard({
  title,
  value,
  description,
  icon,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-slate-800/90 bg-slate-900/50 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)] backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</span>
          <span className={accent}>{icon}</span>
        </div>
        <p className="mt-4 text-2xl font-bold text-white">{value}</p>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

function MemberEditor({
  title,
  description,
  member,
  setMember,
  estimatedGuaranteedGpu,
  onClose,
  onSave,
}: {
  title: string;
  description: string;
  member: TeamMember;
  setMember: React.Dispatch<React.SetStateAction<TeamMember>> | ((value: TeamMember) => void);
  estimatedGuaranteedGpu: string;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
      <div className="flex min-h-full items-center justify-center">
        <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
            <Button variant="ghost" size="sm" className="px-2" onClick={onClose}>
              关闭
            </Button>
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-4 border-b border-slate-800 pb-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">基础信息</span>
                  <p className="mt-2 text-sm text-slate-300">维护成员标识信息与团队内的基础资源约束。</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">姓名</span>
                    <Input value={member.name} onChange={(event) => setMember({ ...member, name: event.target.value })} />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">邮箱</span>
                    <Input value={member.email} onChange={(event) => setMember({ ...member, email: event.target.value })} />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_140px]">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">GPU 配额</span>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      value={member.maxGPUs}
                      onChange={(event) =>
                        setMember({
                          ...member,
                          maxGPUs: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">优先级权重</span>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      value={member.weight}
                      onChange={(event) =>
                        setMember({
                          ...member,
                          weight: Math.min(10, Math.max(1, Number(event.target.value) || 1)),
                        })
                      }
                      className="text-center text-xs font-semibold"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">当前预估保底算力</span>
                  <p className="mt-2 text-sm font-semibold text-slate-100">{estimatedGuaranteedGpu}</p>
                  <p className="mt-1 text-xs text-slate-500">根据团队总权重动态估算，仅用于展示当前分配结果。</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="mb-4 border-b border-slate-800 pb-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">运行态摘要</span>
                  <p className="mt-2 text-sm text-slate-300">查看成员当前任务数量与弹性借用状态，用于辅助判断资源紧张程度。</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">进行中任务</span>
                    <div className="flex h-10 items-center rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm font-semibold text-slate-200">
                      {member.activeTasks}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">该字段为运行态统计，仅用于展示，不支持在此处编辑。</p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">弹性借用任务</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={member.burstTasks}
                      onChange={(event) =>
                        setMember({
                          ...member,
                          burstTasks: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">GPU 访问控制</span>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    控制成员是否拥有无限制 GPU 访问权限，以及在受限模式下可使用的 GPU 卡型范围。
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-200">无限制访问</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      开启后该成员默认可访问所有 GPU 类型，白名单配置将自动失效。
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={member.gpuUnlimited ?? false}
                    onClick={() =>
                      setMember({
                        ...member,
                        gpuUnlimited: !member.gpuUnlimited,
                        allowedGPUs: !member.gpuUnlimited ? undefined : member.allowedGPUs,
                      })
                    }
                    className={cn(
                      'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
                      member.gpuUnlimited ? 'border-indigo-500 bg-indigo-600' : 'border-slate-700 bg-slate-800'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
                        member.gpuUnlimited ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">当前状态</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {member.gpuUnlimited ? '该成员当前可访问全部 GPU 类型' : '该成员当前仅可访问白名单中的 GPU 类型'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {member.gpuUnlimited ? '适用于需要跨卡型调度和紧急任务保障的成员。' : '适用于需要限制高价值资源访问范围的成员。'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                      member.gpuUnlimited
                        ? 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300'
                        : 'border-slate-700 bg-slate-800 text-slate-400'
                    )}
                  >
                    {member.gpuUnlimited ? '无限制访问已开启' : '白名单模式'}
                  </span>
                </div>

                {!member.gpuUnlimited && (
                  <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">GPU 白名单</span>
                        <p className="mt-1 text-xs text-slate-500">未选中的卡型将不会出现在该成员的可用 GPU 范围内。</p>
                      </div>
                      <span className="text-[11px] text-slate-500">按卡型精细控制访问范围</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(ResourceType).map((gpuType) => {
                        const isSelected = member.allowedGPUs?.includes(gpuType);

                        return (
                          <button
                            key={gpuType}
                            type="button"
                            onClick={() => {
                              const current = member.allowedGPUs || [];
                              const next = isSelected ? current.filter((item) => item !== gpuType) : [...current, gpuType];
                              setMember({
                                ...member,
                                allowedGPUs: next,
                              });
                            }}
                            className={cn(
                              'rounded-xl border px-3 py-3 text-left transition-all',
                              isSelected ? 'border-indigo-500 bg-indigo-600/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                            )}
                          >
                            <p className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-slate-300')}>
                              {gpuType.split(' ')[1]}
                            </p>
                            <p className={cn('mt-1 text-[10px]', isSelected ? 'text-indigo-300' : 'text-slate-600')}>
                              {gpuType.split(' ')[0]}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button onClick={onSave}>保存变更</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceManagement() {
  const [teams, setTeams] = useState<WorkspaceTeam[]>(INITIAL_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState(INITIAL_TEAMS[0].id);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberPendingRemove, setMemberPendingRemove] = useState<TeamMember | null>(null);
  const [teamPendingRemove, setTeamPendingRemove] = useState<WorkspaceTeam | null>(null);
  const [teamRemoveConfirmationInput, setTeamRemoveConfirmationInput] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);
  const [managedTeamId, setManagedTeamId] = useState(INITIAL_TEAMS[0].id);
  const [newTeam, setNewTeam] = useState({
    name: '',
    budget: 20000,
    guaranteedGpus: 4,
    burstLimit: 8,
    currentUsage: 0,
  });
  const [newMember, setNewMember] = useState<TeamMember>(defaultNewMember());
  const [savedTeamBanner, setSavedTeamBanner] = useState<string | null>(null);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const managedTeam = teams.find((team) => team.id === managedTeamId) ?? teams[0];
  const teamMembers = selectedTeam.members;
  const totalWeight = useMemo(() => teamMembers.reduce((sum, member) => sum + member.weight, 0), [teamMembers]);
  const guaranteedRatio = (selectedTeam.guaranteedGpus / selectedTeam.burstLimit) * 100;
  const guaranteedUsage = Math.min(selectedTeam.currentUsage, selectedTeam.guaranteedGpus);
  const burstUsage = Math.max(selectedTeam.currentUsage - selectedTeam.guaranteedGpus, 0);
  const guaranteedUsageRatio = (guaranteedUsage / selectedTeam.burstLimit) * 100;
  const burstUsageRatio = (burstUsage / selectedTeam.burstLimit) * 100;
  const clusterStatus = selectedTeam.currentUsage <= selectedTeam.guaranteedGpus ? '空闲' : '拥挤';
  const selectedWorkspacePolicy = POLICY_OPTIONS.find((policy) => policy.value === selectedTeam.policy) ?? POLICY_OPTIONS[0];

  const updateTeam = (updater: (team: WorkspaceTeam) => WorkspaceTeam) => {
    setTeams((current) => current.map((team) => (team.id === selectedTeamId ? updater(team) : team)));
  };

  const getEstimatedGuaranteedGpu = (weight: number) => {
    if (totalWeight === 0) {
      return 0;
    }
    return (selectedTeam.guaranteedGpus * weight) / totalWeight;
  };

  const saveEditingMember = () => {
    if (!editingMember) return;
    updateTeam((team) => ({
      ...team,
      members: team.members.map((member) => (member.id === editingMember.id ? editingMember : member)),
    }));
    setEditingMember(null);
  };

  const removePendingMember = () => {
    if (!memberPendingRemove) return;
    updateTeam((team) => ({
      ...team,
      members: team.members.filter((member) => member.id !== memberPendingRemove.id),
    }));
    setMemberPendingRemove(null);
  };

  const createTeam = () => {
    const teamId = `team-${Date.now()}`;
    const createdTeam: WorkspaceTeam = {
      id: teamId,
      name: newTeam.name.trim() || '未命名团队',
      budget: newTeam.budget,
      guaranteedGpus: newTeam.guaranteedGpus,
      burstLimit: Math.max(newTeam.guaranteedGpus, newTeam.burstLimit),
      currentUsage: newTeam.currentUsage,
      policy: 'STRICT_PRIORITY',
      members: [],
    };
    setTeams((current) => [createdTeam, ...current]);
    setSelectedTeamId(teamId);
    setManagedTeamId(teamId);
    setIsCreateTeamOpen(false);
    setNewTeam({
      name: '',
      budget: 20000,
      guaranteedGpus: 4,
      burstLimit: 8,
      currentUsage: 0,
    });
  };

  const updateManagedTeam = (field: keyof Omit<WorkspaceTeam, 'id' | 'members' | 'policy'>, value: string | number) => {
    setTeams((current) =>
      current.map((team) =>
        team.id === managedTeamId
          ? {
              ...team,
              [field]: value,
            }
          : team
      )
    );
  };

  const saveManagedTeam = () => {
    setSavedTeamBanner(`已保存团队「${managedTeam.name}」的基础信息`);
    window.setTimeout(() => {
      setSavedTeamBanner(null);
    }, 2200);
  };

  const removeManagedTeam = () => {
    if (!teamPendingRemove || teams.length <= 1) {
      return;
    }

    const nextTeams = teams.filter((team) => team.id !== teamPendingRemove.id);
    setTeams(nextTeams);

    const fallbackId = selectedTeamId === teamPendingRemove.id ? nextTeams[0].id : selectedTeamId;
    setSelectedTeamId(fallbackId);
    setManagedTeamId(nextTeams[0].id);
    setTeamPendingRemove(null);
    setTeamRemoveConfirmationInput('');
  };

  const createMember = () => {
    const createdMember: TeamMember = {
      ...newMember,
      id: `tm-${Date.now()}`,
      name: newMember.name.trim() || '新成员',
      email: newMember.email.trim() || `member-${Date.now()}@example.com`,
      allowedGPUs: newMember.gpuUnlimited ? undefined : newMember.allowedGPUs,
    };
    updateTeam((team) => ({
      ...team,
      members: [createdMember, ...team.members],
    }));
    setIsCreateMemberOpen(false);
    setNewMember(defaultNewMember());
  };

  return (
    <>
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">团队管理</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">当前团队：{selectedTeam.name}</h2>
            <p className="mt-1 text-sm text-slate-400">统一管理团队保底算力、弹性上限、内部抢占策略与成员权重分配。</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-[240px]">
              <Select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)}>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              onClick={() => setIsCreateTeamOpen(true)}
              className="h-11 gap-2 rounded-xl px-5 font-bold shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5"
            >
              编辑团队
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="团队总经费"
            value={`¥ ${selectedTeam.budget.toLocaleString('zh-CN')}`}
            description="当前结算周期内可分配预算"
            icon={<Activity size={16} />}
            accent="text-indigo-400"
          />
          <MetricCard
            title="保底算力 (Min)"
            value={`${selectedTeam.guaranteedGpus} GPUs`}
            description="团队始终享有的最低可用 GPU 配额"
            icon={<Shield size={16} />}
            accent="text-cyan-400"
          />
          <MetricCard
            title="弹性上限 (Max)"
            value={`${selectedTeam.burstLimit} GPUs`}
            description="集群空闲时可额外借用的最高 GPU 数量"
            icon={<Gauge size={16} />}
            accent="text-violet-400"
          />
          <Card className="border-slate-800/90 bg-slate-900/50 shadow-[inset_0_1px_0_rgba(148,163,184,0.05)] backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">集群状态</span>
                <div
                  className={cn(
                    'h-2.5 w-2.5 rounded-full',
                    clusterStatus === '空闲'
                      ? 'bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]'
                      : 'bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.75)]'
                  )}
                />
              </div>
              <div
                className={cn(
                  'mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold',
                  clusterStatus === '空闲'
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-rose-400/20 bg-rose-400/10 text-rose-300'
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', clusterStatus === '空闲' ? 'bg-emerald-300' : 'bg-rose-300')} />
                {clusterStatus}
              </div>
              <p className="mt-2 text-sm text-slate-400">根据当前团队消耗与集群余量推断的即时状态</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-start justify-between gap-6">
            <div>
              <CardTitle>资源水位可视化</CardTitle>
              <CardDescription className="mt-2 max-w-3xl">
                总长度代表团队弹性上限。蓝绿色区域表示运行在保底算力内的稳定资源，琥珀色条纹区域表示当前任务正在使用弹性借用资源，集群拥挤时可能触发抢占。
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">当前消耗</p>
              <p className="mt-1 text-xl font-bold text-white">{formatGpu(selectedTeam.currentUsage)}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-5 overflow-hidden rounded-full border border-slate-800 bg-slate-900">
              <div className="absolute inset-y-0 left-0 rounded-l-full bg-gradient-to-r from-cyan-500 to-sky-500" style={{ width: `${guaranteedUsageRatio}%` }} title="保底算力区间内的已用资源" />
              <div
                className="absolute inset-y-0 bg-[repeating-linear-gradient(135deg,rgba(251,191,36,0.95)_0px,rgba(251,191,36,0.95)_10px,rgba(245,158,11,0.45)_10px,rgba(245,158,11,0.45)_20px)]"
                style={{ left: `${guaranteedUsageRatio}%`, width: `${burstUsageRatio}%` }}
                title="运行在弹性超发区间的借用资源，可能被优先抢占"
              />
              <div className="absolute inset-y-[-4px] w-px bg-cyan-100/90 shadow-[0_0_0_1px_rgba(125,211,252,0.45)]" style={{ left: `${guaranteedRatio}%` }} />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>0 GPU</span>
              <span className="font-semibold text-cyan-300">保底阈值 {selectedTeam.guaranteedGpus} GPUs</span>
              <span>弹性上限 {selectedTeam.burstLimit} GPUs</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 px-4 py-3" title="保底算力区间内的任务默认受保护，不参与超发资源回收">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                  <p className="text-sm font-semibold text-cyan-300">保底区间</p>
                </div>
                <p className="mt-1 text-sm text-slate-300">{formatGpu(guaranteedUsage)} 正在使用团队保底算力</p>
              </div>

              <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3" title="弹性超发区间内的任务依赖集群剩余资源，集群拥挤时可能被优先回收">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <p className="text-sm font-semibold text-amber-300">弹性超发区间</p>
                </div>
                <p className="mt-1 text-sm text-slate-300">{formatGpu(burstUsage)} 正在使用借用资源</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>团队内部抢占策略</CardTitle>
                <CardDescription className="mt-2">管理团队成员在保底区间与弹性借用区间中的资源竞争方式。</CardDescription>
              </div>
              <div className="group relative">
                <button type="button" className="rounded-full border border-slate-800 bg-slate-900/80 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200" aria-label="查看抢占策略说明">
                  <Info size={16} />
                </button>
                <div className="pointer-events-none absolute right-0 top-12 z-10 w-72 rounded-2xl border border-slate-800 bg-slate-950/95 p-4 text-xs leading-6 text-slate-300 opacity-0 shadow-2xl transition-opacity duration-200 group-hover:opacity-100">
                  {selectedWorkspacePolicy.description}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">策略选择</span>
                <Select
                  value={selectedTeam.policy}
                  onChange={(event) =>
                    updateTeam((team) => ({
                      ...team,
                      policy: event.target.value as PolicyValue,
                    }))
                  }
                >
                  {POLICY_OPTIONS.map((policy) => (
                    <option key={policy.value} value={policy.value}>
                      {policy.label}
                      {policy.value === 'STRICT_PRIORITY' ? '（推荐）' : ''}
                    </option>
                  ))}
                </Select>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">当前策略摘要</p>
              <h3 className="mt-2 text-lg font-bold text-white">{selectedWorkspacePolicy.label}</h3>
              <CardDescription className="mt-3">{selectedWorkspacePolicy.description}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>成员配额分配表</CardTitle>
                <CardDescription className="mt-2">采用基于权重的团队保底算力分配方式，权重变化会实时影响成员的预估保底算力。</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsCreateMemberOpen(true)}
                className="h-10 rounded-xl border-indigo-500/30 bg-indigo-500/10 px-4 text-indigo-200 hover:border-indigo-400/50 hover:bg-indigo-500/15 hover:text-white"
              >
                新增成员
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <th className="px-6 py-4">成员</th>
                  <th className="px-6 py-4">优先级权重</th>
                  <th className="px-6 py-4">GPU 配额</th>
                  <th className="px-6 py-4">GPU 访问</th>
                  <th className="px-6 py-4">预估保底算力</th>
                  <th className="px-6 py-4">进行中任务</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teamMembers.map((member) => {
                  const estimatedGuaranteed = getEstimatedGuaranteedGpu(member.weight);
                  const weightClassName =
                    member.weight >= 7
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                      : member.weight >= 4
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                        : 'bg-rose-400/10 text-rose-400 border-rose-400/20';

                  return (
                    <tr key={member.id} className="group transition-colors hover:bg-slate-800/30">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-indigo-300">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{member.name}</p>
                            <p className="text-[10px] text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn('inline-flex min-w-8 items-center justify-center rounded-lg border px-2 py-1 text-xs font-bold', weightClassName)}>
                          {member.weight}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-300">{member.maxGPUs} GPUs</span>
                          <span className="text-[10px] text-slate-500">Max</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {member.gpuUnlimited ? (
                          <span className="whitespace-nowrap rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-[9px] font-bold text-indigo-400">所有 GPU</span>
                        ) : member.allowedGPUs && member.allowedGPUs.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {member.allowedGPUs.map((gpu) => (
                              <span key={gpu} className="whitespace-nowrap rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-300">
                                {gpu.split(' ')[1]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="whitespace-nowrap rounded-lg border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[9px] text-amber-400">无</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-100">{formatGpu(estimatedGuaranteed)}</span>
                          <p className="text-[10px] text-slate-500">按团队权重比例实时估算</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-200">{member.activeTasks}</span>
                      </td>
                      <td className="px-6 py-5">
                        {member.burstTasks > 0 ? (
                          <div className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300" title="当前任务正在使用弹性借用资源，集群拥挤时可能会被系统优先抢占">
                            <Zap size={12} />
                            弹性借用中
                          </div>
                        ) : (
                          <div className="inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                            <CheckCircle2 size={12} />
                            保底区间
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="whitespace-nowrap px-2 text-[11px]" onClick={() => setEditingMember(member)}>
                            编辑
                          </Button>
                          <Button variant="ghost" size="sm" className="whitespace-nowrap px-2 text-[11px] hover:text-rose-300" onClick={() => setMemberPendingRemove(member)}>
                            移除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {editingMember && (
        <MemberEditor
          title="编辑成员配置"
          description="调整成员基础信息、资源配额、访问控制与运行态展示配置。"
          member={editingMember}
          setMember={setEditingMember}
          estimatedGuaranteedGpu={formatGpu(getEstimatedGuaranteedGpu(editingMember.weight))}
          onClose={() => setEditingMember(null)}
          onSave={saveEditingMember}
        />
      )}

      {isCreateMemberOpen && (
        <MemberEditor
          title="新增成员"
          description="将新成员加入当前团队，并初始化资源配额与访问控制。"
          member={newMember}
          setMember={setNewMember}
          estimatedGuaranteedGpu={formatGpu(getEstimatedGuaranteedGpu(newMember.weight))}
          onClose={() => setIsCreateMemberOpen(false)}
          onSave={createMember}
        />
      )}

      {isCreateTeamOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-6xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-white">管理团队信息</h3>
                  <p className="mt-1 text-xs text-slate-500">查看团队列表、编辑团队基础信息，并在同一处继续新增团队。</p>
                </div>
                <Button variant="ghost" size="sm" className="px-2" onClick={() => setIsCreateTeamOpen(false)}>
                  关闭
                </Button>
              </div>
              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="border-b border-slate-800 px-5 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队列表</p>
                    <p className="mt-1 text-sm text-slate-400">选择一个团队查看或修改其基础信息。</p>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {teams.map((team) => {
                      const isSelected = team.id === managedTeamId;
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setManagedTeamId(team.id)}
                          className={cn(
                            'w-full px-5 py-4 text-left transition-colors',
                            isSelected ? 'bg-indigo-600/10' : 'hover:bg-slate-900/60'
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className={cn('text-sm font-bold', isSelected ? 'text-white' : 'text-slate-200')}>
                                {team.name}
                              </p>
                              <p className="mt-1 text-[10px] text-slate-500">
                                保底 {team.guaranteedGpus} GPUs / 上限 {team.burstLimit} GPUs / 成员 {team.members.length}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">¥ {team.budget.toLocaleString('zh-CN')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队基本信息</p>
                        <p className="mt-1 text-sm text-slate-400">当前正在编辑：{managedTeam.name}</p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500"
                        onClick={() => setTeamPendingRemove(managedTeam)}
                        disabled={teams.length <= 1}
                      >
                        删除团队
                      </Button>
                    </div>

                    {savedTeamBanner && (
                      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {savedTeamBanner}
                      </div>
                    )}

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队名称</span>
                        <Input value={managedTeam.name} onChange={(e) => updateManagedTeam('name', e.target.value)} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队总经费</span>
                        <Input type="number" min={0} value={managedTeam.budget} onChange={(e) => updateManagedTeam('budget', Math.max(0, Number(e.target.value) || 0))} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">保底算力</span>
                        <Input type="number" min={1} value={managedTeam.guaranteedGpus} onChange={(e) => updateManagedTeam('guaranteedGpus', Math.max(1, Number(e.target.value) || 1))} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">弹性上限</span>
                        <Input type="number" min={1} value={managedTeam.burstLimit} onChange={(e) => updateManagedTeam('burstLimit', Math.max(1, Number(e.target.value) || 1))} />
                      </label>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button onClick={saveManagedTeam}>保存团队信息</Button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                    <div className="border-b border-slate-800 pb-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">新增团队</p>
                      <p className="mt-1 text-sm text-slate-400">创建新的团队，并初始化团队级保底算力与弹性上限。</p>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队名称</span>
                        <Input value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队总经费</span>
                        <Input type="number" min={0} value={newTeam.budget} onChange={(e) => setNewTeam({ ...newTeam, budget: Math.max(0, Number(e.target.value) || 0) })} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">保底算力</span>
                        <Input type="number" min={1} value={newTeam.guaranteedGpus} onChange={(e) => setNewTeam({ ...newTeam, guaranteedGpus: Math.max(1, Number(e.target.value) || 1) })} />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">弹性上限</span>
                        <Input type="number" min={1} value={newTeam.burstLimit} onChange={(e) => setNewTeam({ ...newTeam, burstLimit: Math.max(1, Number(e.target.value) || 1) })} />
                      </label>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button onClick={createTeam}>新增团队</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {memberPendingRemove && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white">移除成员</h3>
                <p className="mt-1 text-sm text-slate-400">
                  你正在从团队配额分配表中移除 <span className="font-semibold text-slate-200">{memberPendingRemove.name}</span>。
                </p>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm leading-6 text-slate-400">
                  该操作仅影响当前团队管理 mock 视图中的成员配置展示，不会删除平台账户本身。确认后，该成员将不再参与团队保底算力估算。
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
                <Button variant="ghost" onClick={() => setMemberPendingRemove(null)}>
                  取消
                </Button>
                <Button className="bg-rose-600 shadow-rose-600/20 hover:bg-rose-500" onClick={removePendingMember}>
                  确认移除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {teamPendingRemove && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="text-lg font-bold text-white">删除团队</h3>
                <p className="mt-1 text-sm text-slate-400">
                  你正在删除团队 <span className="font-semibold text-slate-200">{teamPendingRemove.name}</span>。
                </p>
              </div>

              <div className="space-y-4 px-6 py-5">
                <p className="text-sm leading-6 text-slate-400">
                  该操作会从当前管理视图中移除团队及其成员信息。为防止误删，请完整输入团队名称后再执行删除。
                </p>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-300">删除确认</p>
                  <p className="mt-2 text-sm text-slate-300">
                    请输入：<span className="font-semibold text-white">{teamPendingRemove.name}</span>
                  </p>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">团队名称确认</span>
                  <Input
                    value={teamRemoveConfirmationInput}
                    onChange={(event) => setTeamRemoveConfirmationInput(event.target.value)}
                    placeholder={teamPendingRemove.name}
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTeamPendingRemove(null);
                    setTeamRemoveConfirmationInput('');
                  }}
                >
                  取消
                </Button>
                <Button
                  className="bg-rose-600 shadow-rose-600/20 hover:bg-rose-500 disabled:bg-rose-600/40"
                  onClick={removeManagedTeam}
                  disabled={teamRemoveConfirmationInput.trim() !== teamPendingRemove.name}
                >
                  确认删除
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
