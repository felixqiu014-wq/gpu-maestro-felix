
import React, { useState } from 'react';
import { Save, Shield, Info, Gauge, Zap, Server, Sliders, Cpu, Database, Thermometer, CheckCircle2, AlertTriangle, Fingerprint, Users, X, Edit2, Plus, Check, Activity } from 'lucide-react';
import { MOCK_GPUS } from '../constants';
import { ResourceType } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  maxGPUs: number;
  balance: number;
  allowedGPUs?: ResourceType[];
  gpuUnlimited?: boolean;
  priority: number; // 1-10, 1为最低优先级，10为最高优先级
}

const MOCK_USERS: User[] = [
  { id: 'u-001', name: 'Dr. Chen', email: 'dr_chen@university.edu', maxGPUs: 4, balance: 500.00, allowedGPUs: [ResourceType.H100, ResourceType.A100], priority: 7 },
  { id: 'u-002', name: 'Sarah Eng', email: 'sarah@company.com', maxGPUs: 8, balance: 1200.50, gpuUnlimited: true, priority: 5 },
  { id: 'u-003', name: 'DataOps Team', email: 'dataops@company.com', maxGPUs: 16, balance: 2500.00, allowedGPUs: [ResourceType.A100], priority: 9 },
  { id: 'u-004', name: 'Research Intern', email: 'intern@university.edu', maxGPUs: 2, balance: 150.00, allowedGPUs: [ResourceType.L40S, ResourceType.V100], priority: 2 },
];

const AdminPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'settings' | 'nodes'>('settings');
  const [preemption, setPreemption] = useState('BEST_EFFORT');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    maxGPUs: 4,
    balance: 0,
    allowedGPUs: undefined,
    gpuUnlimited: false,
    priority: 5,
  });

  const nodes = Array.from(new Set(MOCK_GPUS.map(g => g.nodeName)));

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">管理中心</h1>
          <p className="text-slate-400 mt-1">管理全局策略和集群基础设施健康状态</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sliders size={16} />
            平台设置
          </button>
          <button
            onClick={() => setActiveSubTab('nodes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'nodes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Server size={16} />
            节点与集群
          </button>
        </div>
      </div>

      {activeSubTab === 'settings' ? (
        <div className="grid grid-cols-1 gap-8">
          {/* Main Settings */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-8">
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                  <Shield className="text-indigo-400" size={20} />
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">访问与抢占</h2>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="block font-bold text-slate-100 mb-2">抢占策略</span>
                    <select 
                      value={preemption}
                      onChange={(e) => setPreemption(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="STRICT">按用户配额抢占</option>
                      <option value="BEST_EFFORT">按优先级抢占</option>
                      <option value="DISABLED">严格禁止抢占，按任务先后顺序</option>
                    </select>
                  </label>

                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4">
                    <Info className="text-amber-500 shrink-0" size={20} />
                    <p className="text-xs text-amber-200/70 leading-relaxed italic">
                      注意：更改抢占规则不会影响当前运行的任务。新策略将在下一个调度周期生效。
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <Users className="text-indigo-400" size={20} />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">用户管理</h2>
                  </div>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <Plus size={14} />
                    添加用户
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800">
                        <th className="px-4 py-3">用户</th>
                        <th className="px-4 py-3">GPU配额</th>
                        <th className="px-4 py-3">GPU访问</th>
                        <th className="px-4 py-3">优先级</th>
                        <th className="px-4 py-3">余额</th>
                        <th className="px-4 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-bold text-slate-100">{user.name}</p>
                              <p className="text-[10px] text-slate-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-300">{user.maxGPUs} GPUs</span>
                              <span className="text-[10px] text-slate-500">Max</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {user.gpuUnlimited ? (
                              <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg border border-indigo-400/20">
                                所有GPU
                              </span>
                            ) : user.allowedGPUs && user.allowedGPUs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {user.allowedGPUs.map((gpu) => (
                                  <span
                                    key={gpu}
                                    className="text-[9px] font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                                  >
                                    {gpu.split(' ')[1]}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                                无
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                              user.priority >= 7 ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                              user.priority >= 4 ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                              'bg-red-400/10 text-red-400 border-red-400/20'
                            }`}>
                              {user.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-mono font-bold ${user.balance > 100 ? 'text-emerald-400' : user.balance > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                              RMB {user.balance.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 ml-auto"
                            >
                              <Edit2 size={12} />
                              编辑配额
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="pt-4">
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all">
                  <Save size={20} />
                  保存更改
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Nodes view remains same, but inherits some UI updates if needed */
        <div className="grid grid-cols-1 gap-8 animate-in fade-in zoom-in-95 duration-300">
          {nodes.map((nodeName) => {
            const nodeGpus = MOCK_GPUS.filter(g => g.nodeName === nodeName);
            const isHealthy = nodeGpus.every(g => g.status === 'HEALTHY');

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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          gpu.status === 'HEALTHY' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 
                          gpu.status === 'WARNING' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' : 
                          'text-red-400 border-red-400/20 bg-red-400/5'
                        }`}>
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
                          <span className="font-mono text-slate-200">{gpu.usedMemoryGB}/{gpu.totalMemoryGB}GB</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full group-hover:bg-indigo-400 transition-colors" style={{ width: `${(gpu.usedMemoryGB/gpu.totalMemoryGB)*100}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Activity size={12} />
                            <span>GPU使用率</span>
                          </div>
                          <span className="font-mono text-slate-200">{gpu.utilizationPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full group-hover:bg-emerald-400 transition-colors ${gpu.utilizationPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${gpu.utilizationPercent}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Thermometer size={12} />
                            <span>温度</span>
                          </div>
                          <span className={`font-mono ${gpu.temperatureCelsius > 70 ? 'text-amber-400' : 'text-slate-200'}`}>{gpu.temperatureCelsius}°C</span>
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

      {/* Edit User Quota Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">编辑资源配额</h2>
                  <p className="text-[10px] text-slate-500">{editingUser.name}</p>
                </div>
              </div>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                setEditingUser(null);
              }}
              className="p-6 space-y-5 overflow-y-auto"
            >
              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">最大GPU数量</span>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={editingUser.maxGPUs}
                    onChange={(e) => setEditingUser({ ...editingUser, maxGPUs: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">余额 (RMB)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingUser.balance}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">优先级 (1-10)</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingUser.priority}
                    onChange={(e) => setEditingUser({ ...editingUser, priority: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">1为最低优先级，10为最高优先级</p>
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPU访问权限</span>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, gpuUnlimited: !editingUser.gpuUnlimited, allowedGPUs: undefined })}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      editingUser.gpuUnlimited
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {editingUser.gpuUnlimited ? '✓ 无限制访问' : '设为无限制'}
                  </button>
                </div>

                {!editingUser.gpuUnlimited && (
                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-500">选择用户可访问的GPU类型：</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(ResourceType).map((gpuType) => {
                        const isSelected = editingUser.allowedGPUs?.includes(gpuType);
                        return (
                          <button
                            key={gpuType}
                            type="button"
                            onClick={() => {
                              const current = editingUser.allowedGPUs || [];
                              const updated = isSelected
                                ? current.filter(g => g !== gpuType)
                                : [...current, gpuType];
                              setEditingUser({ ...editingUser, allowedGPUs: updated });
                            }}
                            className={`p-3 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'bg-indigo-600/10 border-indigo-500'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                  {gpuType.split(' ')[1]}
                                </p>
                                <p className={`text-[9px] ${isSelected ? 'text-indigo-300' : 'text-slate-600'}`}>
                                  {gpuType.split(' ')[0]}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {(editingUser.allowedGPUs?.length ?? 0) === 0 && (
                      <p className="text-[9px] text-amber-400 bg-amber-400/10 px-3 py-2 rounded-lg border border-amber-400/20">
                        ⚠️ 未选择GPU类型 - 用户将无法创建沙箱
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                  保存更改
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <Plus size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">添加新用户</h2>
                  <p className="text-[10px] text-slate-500">创建用户并分配资源配额</p>
                </div>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const user: User = {
                  id: `u-${Date.now()}`,
                  name: newUser.name!,
                  email: newUser.email!,
                  maxGPUs: newUser.maxGPUs!,
                  balance: newUser.balance!,
                  allowedGPUs: newUser.allowedGPUs,
                  gpuUnlimited: newUser.gpuUnlimited,
                  priority: newUser.priority!,
                };
                setUsers([...users, user]);
                setNewUser({
                  name: '',
                  email: '',
                  maxGPUs: 4,
                  balance: 0,
                  allowedGPUs: undefined,
                  gpuUnlimited: false,
                  priority: 5,
                });
                setIsAddUserModalOpen(false);
              }}
              className="p-6 space-y-5 overflow-y-auto"
            >
              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">用户名</span>
                  <input
                    type="text"
                    required
                    placeholder="例如: 张三"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  />
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">邮箱</span>
                  <input
                    type="email"
                    required
                    placeholder="例如: zhangsan@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  />
                </label>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">资源配额</p>

                <div>
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">最大GPU数量</span>
                    <input
                      type="number"
                      min="1"
                      max="64"
                      value={newUser.maxGPUs}
                      onChange={(e) => setNewUser({ ...newUser, maxGPUs: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">初始余额 (RMB)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newUser.balance}
                      onChange={(e) => setNewUser({ ...newUser, balance: parseFloat(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                    />
                  </label>
                </div>

                <div>
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">优先级 (1-10)</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newUser.priority}
                      onChange={(e) => setNewUser({ ...newUser, priority: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                    />
                    <p className="text-[9px] text-slate-500 mt-1">1为最低优先级，10为最高优先级</p>
                  </label>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GPU访问权限</span>
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, gpuUnlimited: !newUser.gpuUnlimited, allowedGPUs: undefined })}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        newUser.gpuUnlimited
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {newUser.gpuUnlimited ? '✓ 无限制访问' : '设为无限制'}
                    </button>
                  </div>

                  {!newUser.gpuUnlimited && (
                    <div className="space-y-2">
                      <p className="text-[9px] text-slate-500">选择用户可访问的GPU类型：</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.values(ResourceType).map((gpuType) => {
                          const isSelected = newUser.allowedGPUs?.includes(gpuType);
                          return (
                            <button
                              key={gpuType}
                              type="button"
                              onClick={() => {
                                const current = newUser.allowedGPUs || [];
                                const updated = isSelected
                                  ? current.filter(g => g !== gpuType)
                                  : [...current, gpuType];
                                setNewUser({ ...newUser, allowedGPUs: updated });
                              }}
                              className={`p-3 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                  ? 'bg-indigo-600/10 border-indigo-500'
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                    {gpuType.split(' ')[1]}
                                  </p>
                                  <p className={`text-[9px] ${isSelected ? 'text-indigo-300' : 'text-slate-600'}`}>
                                    {gpuType.split(' ')[0]}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {(newUser.allowedGPUs?.length ?? 0) === 0 && (
                        <p className="text-[9px] text-amber-400 bg-amber-400/10 px-3 py-2 rounded-lg border border-amber-400/20">
                          ⚠️ 未选择GPU类型 - 用户将无法创建沙箱
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20"
                >
                  创建用户
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

export default AdminPanel;
