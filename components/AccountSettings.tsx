
import React, { useState } from 'react';
import { User, Mail, Shield, Key, Bell, CreditCard, Clock, DollarSign, Settings2, Eye, EyeOff, Copy, Check } from 'lucide-react';

interface UserSettings {
  fullName: string;
  email: string;
  role: string;
  department: string;
  notifications: {
    email: boolean;
    jobComplete: boolean;
    jobFailed: boolean;
    quotaWarning: boolean;
  };
  preferences: {
    defaultGPUType: string;
    defaultPriority: string;
    autoStopTimeout: number;
  };
}

const AccountSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    fullName: 'Admin User',
    email: 'admin@gpumaestro.com',
    role: 'Platform Admin',
    department: 'ML Infrastructure',
    notifications: {
      email: true,
      jobComplete: true,
      jobFailed: true,
      quotaWarning: true,
    },
    preferences: {
      defaultGPUType: 'NVIDIA H100',
      defaultPriority: 'NORMAL',
      autoStopTimeout: 30,
    },
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'billing'>('profile');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const mockApiKey = 'sk-gpu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  const tabs = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'security', label: '安全', icon: Shield },
    { id: 'preferences', label: '偏好设置', icon: Settings2 },
    { id: 'billing', label: '账单', icon: CreditCard },
  ] as const;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 px-6 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">账户设置</h1>
        <p className="text-slate-400 mt-1">管理您的个人资料、安全和偏好</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">本月使用量</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={16} />
                  <span className="text-sm">GPU时长</span>
                </div>
                <span className="font-mono text-white font-bold">127.5小时</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <DollarSign size={16} />
                  <span className="text-sm">成本</span>
                </div>
                <span className="font-mono text-white font-bold">RMB 446.25</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Key size={16} />
                  <span className="text-sm">任务数</span>
                </div>
                <span className="font-mono text-white font-bold">24</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {settings.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{settings.fullName}</h2>
                    <p className="text-slate-400">{settings.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      全名
                    </label>
                    <input
                      type="text"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      邮箱
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      角色
                    </label>
                    <input
                      type="text"
                      value={settings.role}
                      readOnly
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                      部门
                    </label>
                    <input
                      type="text"
                      value={settings.department}
                      onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* API Key Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">API密钥</h3>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-slate-400 mb-2">您的API密钥</p>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 font-mono text-sm">
                          <span className="text-slate-500">
                            {showApiKey ? mockApiKey : 'sk-gpu-xxxxxxxx' + mockApiKey.slice(-8)}
                          </span>
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="ml-auto text-slate-500 hover:text-slate-300"
                          >
                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="ml-4 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? '已复制!' : '复制'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      保密您的API密钥。使用它与GPU Maestro CLI和API进行身份验证。
                    </p>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                      + 生成新API密钥
                    </button>
                  </div>
                </div>

                {/* SSH Keys Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">SSH密钥</h3>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-white">id_rsa_ed25519</p>
                        <p className="text-xs text-slate-500 mt-1">Added on Jan 15, 2025</p>
                      </div>
                      <button className="text-xs text-red-400 hover:text-red-300 font-medium">
                        Remove
                      </button>
                    </div>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                      + Add new SSH key
                    </button>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                          新密码
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                          确认密码
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                        />
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
                      更新密码
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-indigo-400" />
                    通知
                  </h3>
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: '邮件通知', desc: '通过邮件接收通知' },
                      { key: 'jobComplete', label: '任务完成', desc: '任务成功完成时通知' },
                      { key: 'jobFailed', label: '任务失败', desc: '任务失败或超时时通知' },
                      { key: 'quotaWarning', label: '配额警告', desc: '接近资源限制时警告' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked,
                                },
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Default Settings */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Settings2 size={20} className="text-indigo-400" />
                    默认设置
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                        默认GPU类型
                      </label>
                      <select
                        value={settings.preferences.defaultGPUType}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, defaultGPUType: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="NVIDIA H100">NVIDIA H100</option>
                        <option value="NVIDIA A100">NVIDIA A100</option>
                        <option value="NVIDIA L40S">NVIDIA L40S</option>
                        <option value="NVIDIA V100">NVIDIA V100</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                        默认优先级
                      </label>
                      <select
                        value={settings.preferences.defaultPriority}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, defaultPriority: e.target.value },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="LOW">低 (0.8x)</option>
                        <option value="NORMAL">正常 (1.0x)</option>
                        <option value="HIGH">高 (1.5x)</option>
                        <option value="URGENT">Urgent (2.0x)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                        自动停止超时(分钟)
                      </label>
                      <input
                        type="number"
                        value={settings.preferences.autoStopTimeout}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            preferences: { ...settings.preferences, autoStopTimeout: parseInt(e.target.value) },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        在此无活动期后自动停止交互式沙箱
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-8">
                {/* Current Plan */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">当前计划</h3>
                  <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-300">团队计划</p>
                        <p className="text-3xl font-bold text-white mt-2">RMB 499/月</p>
                        <p className="text-sm text-indigo-200/70 mt-2">最多包含500 GPU小时</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-indigo-200/70">本月</p>
                        <p className="text-2xl font-bold text-white mt-1">RMB 446.25</p>
                        <p className="text-xs text-indigo-200/70 mt-1">已使用127.5 GPU小时</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Breakdown */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">使用明细</h3>
                  <div className="space-y-3">
                    {[
                      { gpu: 'NVIDIA H100', hours: 85, cost: 297.5, percentage: 67 },
                      { gpu: 'NVIDIA A100', hours: 32, cost: 59.2, percentage: 25 },
                      { gpu: 'NVIDIA L40S', hours: 10.5, cost: 9.98, percentage: 8 },
                    ].map((item) => (
                      <div key={item.gpu} className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{item.gpu}</span>
                          <div className="text-right">
                            <span className="text-sm font-mono text-white">{item.hours}h</span>
                            <span className="text-slate-500 mx-2">·</span>
                            <span className="text-sm font-mono text-white">RMB {item.cost.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-600 to-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">支付方式</h3>
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} className="text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-white">•••• •••• •••• 4242</p>
                          <p className="text-xs text-slate-500 mt-1">到期时间 12/2026</p>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                        更新
                      </button>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">账单历史</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'December 2024', amount: 512.75, status: 'Paid' },
                      { date: 'November 2024', amount: 487.30, status: 'Paid' },
                      { date: 'October 2024', amount: 495.00, status: 'Paid' },
                    ].map((bill) => (
                      <div key={bill.date} className="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-xl hover:bg-slate-950/50 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-white">{bill.date}</p>
                          <p className="text-xs text-slate-500 mt-1">RMB {bill.amount.toFixed(2)}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                          已支付
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
