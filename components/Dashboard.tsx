
import React, { useMemo } from 'react';
import { MOCK_WORKLOADS, STATUS_COLORS, GPU_PRICING } from '../constants';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Cpu, Terminal, Zap, Clock, Activity } from 'lucide-react';
import { JobStatus, ResourceType, JobPriority } from '../types';

// Simulate current user (in production, this would come from auth context)
const CURRENT_USER = 'ai_eng_sarah';

const PRIORITY_MULTIPLIERS: Record<JobPriority, number> = {
  [JobPriority.LOW]: 0.8,
  [JobPriority.NORMAL]: 1.0,
  [JobPriority.HIGH]: 1.5,
  [JobPriority.URGENT]: 2.0,
};

const Dashboard: React.FC = () => {
  // Filter workloads for current user
  const userWorkloads = useMemo(() => {
    return MOCK_WORKLOADS.filter(w => w.owner === CURRENT_USER);
  }, []);

  // Calculate user stats
  const userStats = useMemo(() => {
    const activeJobs = userWorkloads.filter(w => w.status === JobStatus.RUNNING && w.type === 'BATCH');
    const pendingJobs = userWorkloads.filter(w => w.status === JobStatus.PENDING);
    const totalGPUUsed = userWorkloads
      .filter(w => w.status === JobStatus.RUNNING)
      .reduce((acc, job) => acc + job.gpuRequested, 0);

    // Calculate current hourly cost for all active jobs
    const hourlyCost = userWorkloads
      .filter(w => w.status === JobStatus.RUNNING)
      .reduce((acc, job) => {
        const pricing = GPU_PRICING[job.gpuType || ResourceType.H100];
        const multiplier = job.priority ? PRIORITY_MULTIPLIERS[job.priority] : 1.0;
        return acc + (pricing.hourly * job.gpuRequested * multiplier);
      }, 0);

    // Calculate today's accumulated GPU hours (simulated based on job start time)
    const todayGPUHours = userWorkloads
      .filter(w => {
        const jobDate = new Date(w.createdAt);
        const today = new Date();
        return jobDate.toDateString() === today.toDateString() && w.status === JobStatus.RUNNING;
      })
      .reduce((acc, job) => {
        const hoursRunning = (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60);
        return acc + (job.gpuRequested * hoursRunning);
      }, 0);

    return {
      activeJobs: activeJobs.length,
      pendingJobs: pendingJobs.length,
      totalGPUUsed,
      hourlyCost,
      todayGPUHours: todayGPUHours > 0 ? todayGPUHours.toFixed(1) : '0.0'
    };
  }, [userWorkloads]);

  // Cost trend data (simulated for last 7 days)
  const costTrendData = [
    { date: 'Mon', cost: 12.5 },
    { date: 'Tue', cost: 18.2 },
    { date: 'Wed', cost: 15.8 },
    { date: 'Thu', cost: 22.4 },
    { date: 'Fri', cost: 28.6 },
    { date: 'Sat', cost: 8.3 },
    { date: 'Sun', cost: userStats.hourlyCost * 8 }, // Today (partial)
  ];

  // GPU usage distribution by type
  const gpuDistributionData = useMemo(() => {
    const distribution: Record<string, number> = {};
    userWorkloads
      .filter(w => w.status === JobStatus.RUNNING)
      .forEach(job => {
        const gpuType = job.gpuType?.split(' ')[1] || 'H100';
        distribution[gpuType] = (distribution[gpuType] || 0) + job.gpuRequested;
      });

    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [userWorkloads]);

  const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

  // Sort user workloads by update time (most recent first)
  const recentActivities = useMemo(() => {
    return [...userWorkloads]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [userWorkloads]);

  return (
    <div className="space-y-8 px-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">我的仪表盘</h1>
          <p className="text-slate-400 mt-1">个人资源概览与活动追踪</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm text-slate-400">{CURRENT_USER}</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Activity className="text-indigo-400" />}
          label="活跃批量任务"
          value={userStats.activeJobs.toString()}
          subValue={`${userStats.pendingJobs} 等待中`}
        />
        <MetricCard
          icon={<Cpu className="text-emerald-400" />}
          label="使用中的GPU"
          value={userStats.totalGPUUsed % 1 === 0 ? `${userStats.totalGPUUsed} GPU` : `${userStats.totalGPUUsed.toFixed(2)} GPU`}
          subValue={`${userWorkloads.filter(w => w.status === JobStatus.RUNNING).length} 个任务`}
        />
        <MetricCard
          icon={<DollarSign className="text-amber-400" />}
          label="每小时成本"
          value={`RMB ${userStats.hourlyCost.toFixed(2)}`}
          subValue="预估"
        />
        <MetricCard
          icon={<Clock className="text-blue-400" />}
          label="今日GPU时长"
          value={`${userStats.todayGPUHours}h`}
          subValue="累计使用"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cost Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">成本趋势 (最近7天)</h2>
            <div className="flex items-center gap-2">
              <select className="bg-slate-800 border-none rounded-lg text-xs px-3 py-1.5 outline-none text-slate-300">
                <option>最近7天</option>
                <option>最近30天</option>
              </select>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={costTrendData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: any) => [`RMB ${value}`, '成本']}
                />
                <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">本周总计</span>
              <span className="font-bold text-white">RMB {costTrendData.reduce((acc, d) => acc + d.cost, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* GPU Distribution */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">GPU使用分布</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={gpuDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gpuDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(value: any) => [`${value} GPU`, '使用中']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {gpuDistributionData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-white">
                  {item.value % 1 === 0 ? `${item.value} GPU` : `${item.value.toFixed(2)} GPU`}
                </span>
              </div>
            ))}
            {gpuDistributionData.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">暂无活跃GPU使用</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">最近任务</h2>
          <button className="text-xs text-indigo-400 hover:underline">查看所有任务</button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((job) => (
            <div key={job.id} className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                    {job.type === 'INTERACTIVE' ? (
                      <Terminal size={16} className="text-indigo-400" />
                    ) : (
                      <Zap size={16} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {job.name}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[job.status]}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-mono">
                        {job.gpuRequested % 1 === 0 ? `${job.gpuRequested}x` : `${job.gpuRequested}x`} {job.gpuType?.split(' ')[1] || 'H100'}
                      </span>
                      <span>·</span>
                      <span suppressHydrationWarning>
                        {new Date(job.updatedAt).toLocaleDateString()} {new Date(job.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {job.priority && job.priority !== 'NORMAL' && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400">{job.priority}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">预估成本</p>
                  <p className="text-sm font-mono text-white">
                    RMB {(GPU_PRICING[job.gpuType || ResourceType.H100].hourly * job.gpuRequested * PRIORITY_MULTIPLIERS[job.priority || JobPriority.NORMAL]).toFixed(2)}/h
                  </p>
                </div>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">暂无活动记录。开始创建您的第一个任务吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue?: string, trend?: string, positive?: boolean }> = ({ icon, label, value, subValue, trend, positive }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trend === 'Stable' ? 'bg-slate-800 text-slate-400' : positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {subValue && <span className="text-sm text-slate-500">{subValue}</span>}
      </div>
    </div>
    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
      {icon}
    </div>
  </div>
);

export default Dashboard;
