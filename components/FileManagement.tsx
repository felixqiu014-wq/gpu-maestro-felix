
import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  File,
  Search,
  Download,
  Trash2,
  Share2,
  Box,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Clock,
  HardDrive,
  ExternalLink,
  Plus,
  FolderOpen,
  Upload,
  Edit2,
  ChevronDown,
  Database,
  X
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  lastModified: string;
  isModel?: boolean;
  jobId?: string;
  bucketId: string;
}

interface Bucket {
  id: string;
  name: string;
  storageUsed: string;
  storageTotal: string;
  storagePercent: number;
  fileCount: number;
  visibility?: 'private' | 'publicReadonly' | 'publicReadWrite';
}

const FileManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedBucket, setSelectedBucket] = useState('default');

  // Create bucket modal state
  const [isCreateBucketModalOpen, setIsCreateBucketModalOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');
  const [newBucketStorage, setNewBucketStorage] = useState('1'); // in TB
  const [newBucketVisibility, setNewBucketVisibility] = useState<'private' | 'publicReadonly' | 'publicReadWrite'>('private');

  // Buckets - all buckets with visibility
  const [allBuckets, setAllBuckets] = useState<Bucket[]>([
    { id: 'default', name: 'default', storageUsed: '2.1 TB', storageTotal: '5 TB', storagePercent: 42, fileCount: 156, visibility: 'private' },
    { id: 'checkpoints', name: 'checkpoints', storageUsed: '1.8 TB', storageTotal: '3 TB', storagePercent: 60, fileCount: 89, visibility: 'private' },
    { id: 'datasets', name: 'datasets', storageUsed: '800 GB', storageTotal: '2 TB', storagePercent: 40, fileCount: 234, visibility: 'private' },
    { id: 'models', name: 'models', storageUsed: '3.2 TB', storageTotal: '5 TB', storagePercent: 64, fileCount: 45, visibility: 'private' },
    { id: 'team-research', name: 'team-research', storageUsed: '4.5 TB', storageTotal: '10 TB', storagePercent: 45, fileCount: 312, visibility: 'publicReadWrite' },
    { id: 'pretrained', name: 'pretrained-models', storageUsed: '8.2 TB', storageTotal: '20 TB', storagePercent: 41, fileCount: 78, visibility: 'publicReadonly' },
  ]);

  // All files for all buckets
  const allFiles: FileItem[] = [
    // default bucket files
    { id: 'f-001', name: 'my_training_data.csv', type: 'file', size: '2.4 GB', lastModified: '2 hours ago', bucketId: 'default' },
    { id: 'f-002', name: 'checkpoints', type: 'folder', size: '8.2 GB', lastModified: '5 hours ago', bucketId: 'default' },
    { id: 'f-003', name: 'experiment_results', type: 'folder', size: '1.1 GB', lastModified: '1 day ago', bucketId: 'default' },
    { id: 'f-004', name: 'config.json', type: 'file', size: '4 KB', lastModified: '2 days ago', bucketId: 'default' },
    { id: 'f-005', name: 'notes.txt', type: 'file', size: '12 KB', lastModified: '3 days ago', bucketId: 'default' },
    { id: 'f-006', name: 'README.md', type: 'file', size: '8 KB', lastModified: '1 week ago', bucketId: 'default' },
    // checkpoints bucket files
    { id: 'f-101', name: 'llama-finetune-v1', type: 'folder', lastModified: '2023-10-26 10:15', isModel: true, bucketId: 'checkpoints' },
    { id: 'f-102', name: 'resnet50_epoch_100.pt', type: 'file', size: '256 MB', lastModified: '2023-10-26 14:22', isModel: true, jobId: 'wl-batch-882', bucketId: 'checkpoints' },
    { id: 'f-103', name: 'bert-large-uncased.pt', type: 'file', size: '1.2 GB', lastModified: '2023-10-25 09:30', isModel: true, bucketId: 'checkpoints' },
    { id: 'f-104', name: 'gpt2_checkpoint.bin', type: 'file', size: '512 MB', lastModified: '2023-10-24 16:45', isModel: true, bucketId: 'checkpoints' },
    { id: 'f-105', name: 'epoch_50.ckpt', type: 'file', size: '128 MB', lastModified: '2 days ago', isModel: true, bucketId: 'checkpoints' },
    // datasets bucket files
    { id: 'f-201', name: 'train_dataset.csv', type: 'file', size: '4.5 GB', lastModified: '1 week ago', bucketId: 'datasets' },
    { id: 'f-202', name: 'val_dataset.csv', type: 'file', size: '1.2 GB', lastModified: '1 week ago', bucketId: 'datasets' },
    { id: 'f-203', name: 'test_images', type: 'folder', size: '8.9 GB', lastModified: '3 days ago', bucketId: 'datasets' },
    { id: 'f-204', name: 'raw_data', type: 'folder', size: '15.3 GB', lastModified: '5 days ago', bucketId: 'datasets' },
    { id: 'f-205', name: 'preprocessed_data.pkl', type: 'file', size: '2.1 GB', lastModified: '1 day ago', bucketId: 'datasets' },
    { id: 'f-206', name: 'annotations.json', type: 'file', size: '45 MB', lastModified: '2 days ago', bucketId: 'datasets' },
    { id: 'f-207', name: 'sample_data', type: 'folder', size: '230 MB', lastModified: '6 hours ago', bucketId: 'datasets' },
    // models bucket files
    { id: 'f-301', name: 'vit-large-patch16-224.pt', type: 'file', size: '1.3 GB', lastModified: '2023-10-20 14:22', isModel: true, bucketId: 'models' },
    { id: 'f-302', name: 'swin_transformer_base', type: 'folder', size: '880 MB', lastModified: '2023-10-21 09:15', isModel: true, bucketId: 'models' },
    { id: 'f-303', name: 'efficientnet_b0.pth', type: 'file', size: '22 MB', lastModified: '3 days ago', isModel: true, bucketId: 'models' },
    { id: 'f-304', name: 'densenet121.onnx', type: 'file', size: '32 MB', lastModified: '1 week ago', isModel: true, bucketId: 'models' },
    { id: 'f-305', name: 'mobilenet_v3.pt', type: 'file', size: '18 MB', lastModified: '2 weeks ago', isModel: true, bucketId: 'models' },
    { id: 'f-306', name: 'transformer_encoder', type: 'folder', size: '450 MB', lastModified: '4 days ago', isModel: true, bucketId: 'models' },
    { id: 'f-307', name: 'custom_yolo_weights.pt', type: 'file', size: '150 MB', lastModified: '5 days ago', isModel: true, bucketId: 'models' },
    // team-research bucket files
    { id: 's-001', name: 'imagenet_val.zip', type: 'file', size: '6.4 GB', lastModified: '1 week ago', bucketId: 'team-research' },
    { id: 's-002', name: 'pretrained_models', type: 'folder', size: '45 GB', lastModified: '3 days ago', bucketId: 'team-research' },
    { id: 's-003', name: 'common_voice_dataset', type: 'file', size: '12.8 GB', lastModified: '5 days ago', bucketId: 'team-research' },
    { id: 's-004', name: 'research_papers', type: 'folder', size: '2.1 GB', lastModified: '1 week ago', bucketId: 'team-research' },
    { id: 's-005', name: 'shared_code', type: 'folder', size: '890 MB', lastModified: '2 days ago', bucketId: 'team-research' },
    // pretrained-models bucket files
    { id: 's-101', name: 'gpt-4-model-weights', type: 'folder', size: '850 GB', lastModified: '2 weeks ago', bucketId: 'pretrained' },
    { id: 's-102', name: 'bert-base-uncased', type: 'file', size: '440 MB', lastModified: '1 month ago', bucketId: 'pretrained' },
    { id: 's-103', name: 'claude-model-checkpoints', type: 'folder', size: '25 GB', lastModified: '3 weeks ago', bucketId: 'pretrained' },
    { id: 's-104', name: 'llama-3-70b', type: 'folder', size: '140 GB', lastModified: '1 week ago', bucketId: 'pretrained' },
    { id: 's-105', name: 'stable-diffusion-xl', type: 'file', size: '6.9 GB', lastModified: '5 days ago', bucketId: 'pretrained' },
  ];

  const getFilesForCurrentBucket = () => {
    return allFiles.filter(f => f.bucketId === selectedBucket);
  };

  const currentBucketFiles = getFilesForCurrentBucket();

  const filteredFiles = currentBucketFiles.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentBucket = () => {
    return allBuckets.find(b => b.id === selectedBucket);
  };

  const toggleFileSelection = (id: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedFiles(newSelection);
  };

  const deleteSelectedFiles = () => {
    setSelectedFiles(new Set());
  };

  const handlePublish = (file: FileItem) => {
    alert(`Publishing ${file.name} to Model Registry...`);
  };

  const handleMount = (file: FileItem) => {
    const mountTarget = file.isModel ? 'Models' : 'Datasets';
    alert(`正在将 ${file.name} 挂载到 ${mountTarget} 模块...\n\n这将使文件在 ${mountTarget} 模块中可用，用于训练和评估。`);
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate bucket name
    const sanitizedName = newBucketName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (!sanitizedName) {
      alert('Please enter a valid bucket name');
      return;
    }

    // Check if bucket already exists
    if (allBuckets.find(b => b.id === sanitizedName)) {
      alert('A bucket with this name already exists');
      return;
    }

    // Create new bucket
    const newBucket: Bucket = {
      id: sanitizedName,
      name: sanitizedName,
      storageUsed: '0 GB',
      storageTotal: `${newBucketStorage} TB`,
      storagePercent: 0,
      fileCount: 0,
      visibility: newBucketVisibility
    };

    setAllBuckets([...allBuckets, newBucket]);
    setSelectedBucket(sanitizedName);
    setNewBucketName('');
    setNewBucketStorage('1');
    setNewBucketVisibility('private');
    setIsCreateBucketModalOpen(false);
  };

  const getVisibilityBadge = (visibility?: 'private' | 'publicReadonly' | 'publicReadWrite') => {
    switch (visibility) {
      case 'private':
        return <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase">私有</span>;
      case 'publicReadonly':
        return <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-700/50 text-emerald-400 font-bold uppercase">公开(只读)</span>;
      case 'publicReadWrite':
        return <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-700/50 text-purple-400 font-bold uppercase">公开(读写)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Bucket List */}
      <div className="w-80 bg-slate-950/50 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white mb-1">存储桶</h2>
          <p className="text-xs text-slate-500">选择存储桶查看文件</p>
        </div>

        {/* Create Bucket Button */}
        <div className="p-4 border-b border-slate-800">
          <button
            onClick={() => setIsCreateBucketModalOpen(true)}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} />
            创建新存储桶
          </button>
        </div>

        {/* Bucket List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {allBuckets.map((bucket) => {
            const isSelected = bucket.id === selectedBucket;
            return (
              <button
                key={bucket.id}
                onClick={() => {
                  setSelectedBucket(bucket.id);
                  setSelectedFiles(new Set());
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'bg-indigo-600/10 border-indigo-500'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database size={16} className={isSelected ? 'text-indigo-400' : 'text-slate-500'} />
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{bucket.name}</p>
                    </div>
                  </div>
                  {getVisibilityBadge(bucket.visibility)}
                </div>

                {/* Storage Progress */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className={isSelected ? 'text-indigo-300' : 'text-slate-500'}>{bucket.storageUsed} / {bucket.storageTotal}</span>
                    <span className={isSelected ? 'text-indigo-300' : 'text-slate-500'}>{bucket.fileCount} 个文件</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${isSelected ? 'bg-indigo-500' : 'bg-slate-600'}`}
                      style={{ width: `${bucket.storagePercent}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Content - File Management */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Database size={24} className="text-indigo-400" />
                <h1 className="text-2xl font-bold text-white">{getCurrentBucket()?.name}</h1>
                {getVisibilityBadge(getCurrentBucket()?.visibility)}
              </div>
              <p className="text-slate-400 ml-9">管理此存储桶中的文件</p>
            </div>
            <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2">
              <RefreshCw size={14} />
              刷新
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-white text-xs font-bold hover:bg-indigo-500 transition-all">
                <Folder size={14} />
                新建文件夹
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white text-xs font-bold hover:bg-emerald-500 transition-all">
                <Upload size={14} />
                上传文件
              </button>
              {selectedFiles.size > 0 && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-slate-300 text-xs font-bold hover:bg-slate-600 transition-all">
                    <Edit2 size={14} />
                    重命名
                  </button>
                  <button
                    onClick={deleteSelectedFiles}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-white text-xs font-bold hover:bg-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                    删除 ({selectedFiles.size})
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Search size={16} className="text-slate-500" />
              <input
                type="text"
                placeholder="搜索文件..."
                className="bg-transparent border-none outline-none text-sm w-48 text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* File List */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === currentBucketFiles.length && currentBucketFiles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(new Set(currentBucketFiles.map(f => f.id)));
                        } else {
                          setSelectedFiles(new Set());
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600"
                    />
                  </th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Modified</th>
                  <th className="px-6 py-4">Context</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${file.type === 'folder' ? 'bg-indigo-500/10 text-indigo-400' : file.isModel ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                          {file.type === 'folder' ? <FolderOpen size={18} /> : <File size={18} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{file.name}</p>
                          {file.isModel && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-tighter">
                              <Box size={10} />
                              模型文件
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{file.size || '--'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.lastModified}</td>
                    <td className="px-6 py-4">
                      {file.jobId ? (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-950/50 border border-slate-800 w-fit">
                          <span className="text-[10px] text-slate-500">任务:</span>
                          <span className="text-[10px] font-mono text-indigo-400 hover:underline cursor-pointer">{file.jobId}</span>
                        </div>
                      ) : file.isModel ? (
                        <span className="text-[10px] text-emerald-400">模型产物</span>
                      ) : (
                        <span className="text-[10px] text-slate-700">手动上传</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleMount(file)}
                          className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-all"
                          title={`挂载到${file.isModel ? '模型' : '数据集'}模块`}
                        >
                          <HardDrive size={14} />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
                          <Download size={14} />
                        </button>
                        <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mount Info */}
          <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-xl text-white">
                <ExternalLink size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">挂载存储桶为卷</h4>
                <p className="text-xs text-indigo-300/80">通过挂载 <code className="text-indigo-300">/buckets/{getCurrentBucket()?.name}</code> PVC直接从沙箱或任务访问此存储桶</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all">
              复制挂载代码
            </button>
          </div>
        </div>
      </div>

      {/* Create Bucket Modal */}
      {isCreateBucketModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-center min-h-full">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">创建新存储桶</h2>
                  <p className="text-[10px] text-slate-500">创建新的存储桶用于文件隔离</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateBucketModalOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBucket} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">存储桶名称</span>
                  <input
                    type="text"
                    required
                    placeholder="例如: experiments, backups"
                    value={newBucketName}
                    onChange={(e) => setNewBucketName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                  />
                </label>
                <p className="text-[9px] text-slate-600 mt-1.5">仅允许小写字母、数字和连字符</p>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">存储配额</span>
                  <select
                    value={newBucketStorage}
                    onChange={(e) => setNewBucketStorage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="0.5">500 GB</option>
                    <option value="1">1 TB</option>
                    <option value="2">2 TB</option>
                    <option value="5">5 TB</option>
                    <option value="10">10 TB</option>
                    <option value="20">20 TB</option>
                  </select>
                </label>
              </div>

              <div>
                <label className="block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">可见性</span>
                  <select
                    value={newBucketVisibility}
                    onChange={(e) => setNewBucketVisibility(e.target.value as 'private' | 'publicReadonly' | 'publicReadWrite')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="private">私有 - 仅您可访问</option>
                    <option value="publicReadonly">公开(只读) - 团队可查看</option>
                    <option value="publicReadWrite">公开(读写) - 团队可编辑</option>
                  </select>
                </label>
                <p className="text-[9px] text-slate-600 mt-1.5">
                  {newBucketVisibility === 'private'
                    ? '私有存储桶仅对您可见和可访问'
                    : newBucketVisibility === 'publicReadonly'
                    ? '团队成员可在共享空间查看和下载文件，但不能修改'
                    : '团队成员可在共享空间查看、下载、上传和修改文件'}
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateBucketModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                >
                  创建存储桶
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

export default FileManagement;
