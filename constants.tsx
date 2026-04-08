
import React from 'react';
import { LayoutDashboard, Rocket, Terminal, Settings, Box, Database, FolderTree } from 'lucide-react';
import { ResourceType, JobStatus, GPUResource, Workload, Model, Dataset } from './types';

export const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表盘', icon: <LayoutDashboard size={20} /> },
  { id: 'sandboxes', label: '沙箱环境', icon: <Terminal size={20} /> },
  { id: 'jobs', label: '批处理任务', icon: <Rocket size={20} /> },
  { id: 'models', label: '模型管理', icon: <Box size={20} /> },
  { id: 'datasets', label: '数据集', icon: <Database size={20} /> },
  { id: 'files', label: '文件存储', icon: <FolderTree size={20} /> },
  { id: 'admin', label: '管理中心', icon: <Settings size={20} /> },
];

export const MOCK_GPUS: GPUResource[] = [
  { id: 'gpu-001', name: 'GPU 0', type: ResourceType.H100, totalMemoryGB: 80, usedMemoryGB: 45, utilizationPercent: 62, temperatureCelsius: 58, nodeName: 'k8s-worker-01', status: 'HEALTHY', powerUsageWatts: 245 },
  { id: 'gpu-002', name: 'GPU 1', type: ResourceType.H100, totalMemoryGB: 80, usedMemoryGB: 78, utilizationPercent: 98, temperatureCelsius: 74, nodeName: 'k8s-worker-01', status: 'WARNING', powerUsageWatts: 320 },
  { id: 'gpu-003', name: 'GPU 0', type: ResourceType.A100, totalMemoryGB: 40, usedMemoryGB: 0, utilizationPercent: 0, temperatureCelsius: 32, nodeName: 'k8s-worker-02', status: 'HEALTHY', powerUsageWatts: 35 },
  { id: 'gpu-004', name: 'GPU 1', type: ResourceType.A100, totalMemoryGB: 40, usedMemoryGB: 12, utilizationPercent: 25, temperatureCelsius: 45, nodeName: 'k8s-worker-02', status: 'HEALTHY', powerUsageWatts: 125 },
];

export const MOCK_WORKLOADS: Workload[] = [
  { id: 'wl-101', name: 'jupyter-lab-research-01', type: 'INTERACTIVE', owner: 'dr_chen', gpuRequested: 0.25, status: JobStatus.RUNNING, createdAt: '2023-10-25T10:00:00Z', updatedAt: '2023-10-25T10:00:00Z', logs: ['Starting JupyterLab...', 'Mounted PVC /data/models', 'Kernel initialized'], gpuType: ResourceType.H100 },
  { id: 'wl-102', name: 'bert-large-finetuning', type: 'BATCH', owner: 'ai_eng_sarah', gpuRequested: 1, status: JobStatus.RUNNING, createdAt: '2023-10-25T08:30:00Z', updatedAt: '2023-10-25T11:45:00Z', logs: ['Epoch 1: loss=0.45', 'Epoch 2: loss=0.32', 'Checkpoint saved'], gpuType: ResourceType.A100, priority: 'HIGH' as any, timeoutMinutes: 240 },
  { id: 'wl-103', name: 'llama-inference-finetune', type: 'BATCH', owner: 'ai_eng_sarah', gpuRequested: 0.5, status: JobStatus.RUNNING, createdAt: '2023-10-25T12:00:00Z', updatedAt: '2023-10-25T12:00:00Z', logs: ['Loading Llama-3-8B model...', 'Starting LoRA fine-tuning...'], gpuType: ResourceType.L40S, priority: 'NORMAL' as any, timeoutMinutes: 120 },
  { id: 'wl-103b', name: 'tinybert-experiment', type: 'BATCH', owner: 'ai_eng_sarah', gpuRequested: 0.25, status: JobStatus.RUNNING, createdAt: '2023-10-25T11:30:00Z', updatedAt: '2023-10-25T12:30:00Z', logs: ['Training TinyBERT...', 'Step 500/2000'], gpuType: ResourceType.V100, priority: 'LOW' as any, timeoutMinutes: 60 },
  { id: 'wl-104', name: 'data-proc-spark-gpu', type: 'BATCH', owner: 'data_ops', gpuRequested: 2, status: JobStatus.COMPLETED, createdAt: '2023-10-24T22:00:00Z', updatedAt: '2023-10-25T02:00:00Z', gpuType: ResourceType.A100, priority: 'NORMAL' as any, timeoutMinutes: 180 },
  { id: 'wl-105', name: 'llama-3-70b-pretraining', type: 'BATCH', owner: 'dr_chen', gpuRequested: 8, status: JobStatus.RUNNING, createdAt: '2023-10-25T06:00:00Z', updatedAt: '2023-10-25T13:30:00Z', logs: ['Initializing DeepSpeed...', 'Loading model shards...', 'Training in progress - Step 15234/100000'], gpuType: ResourceType.H100, priority: 'URGENT' as any, timeoutMinutes: 720 },
  { id: 'wl-106', name: 'stable-diffusion-xl-finetune', type: 'BATCH', owner: 'ml_team', gpuRequested: 4, status: JobStatus.PENDING, createdAt: '2023-10-25T13:15:00Z', updatedAt: '2023-10-25T13:15:00Z', logs: ['Job queued...', 'Waiting for GPU allocation'], gpuType: ResourceType.H100, priority: 'HIGH' as any, timeoutMinutes: 360 },
  { id: 'wl-107', name: 'gpt-4-instruct-clone', type: 'BATCH', owner: 'research_lab', gpuRequested: 16, status: JobStatus.FAILED, createdAt: '2023-10-24T18:00:00Z', updatedAt: '2023-10-25T01:30:00Z', logs: ['OOM error on GPU 7', 'Training stopped due to CUDA error'], gpuType: ResourceType.A100, priority: 'NORMAL' as any, timeoutMinutes: 480 },
  { id: 'wl-108', name: 'vit-image-classification', type: 'BATCH', owner: 'cv_team', gpuRequested: 2, status: JobStatus.COMPLETED, createdAt: '2023-10-24T14:00:00Z', updatedAt: '2023-10-24T20:00:00Z', logs: ['Training completed', 'Final accuracy: 94.2%'], gpuType: ResourceType.L40S, priority: 'LOW' as any, timeoutMinutes: 120 },
  { id: 'wl-109', name: 'whisper-fine-tuning', type: 'BATCH', owner: 'audio_research', gpuRequested: 1, status: JobStatus.RUNNING, createdAt: '2023-10-25T09:00:00Z', updatedAt: '2023-10-25T13:00:00Z', logs: ['Processing audio dataset...', 'Epoch 5/20: WER=0.12'], gpuType: ResourceType.V100, priority: 'NORMAL' as any, timeoutMinutes: 300 },
  { id: 'wl-110', name: 'multi-modal-embedding', type: 'BATCH', owner: 'ai_research', gpuRequested: 4, status: JobStatus.TERMINATED, createdAt: '2023-10-24T20:00:00Z', updatedAt: '2023-10-25T08:00:00Z', logs: ['Job terminated by user', 'Resources released'], gpuType: ResourceType.H100, priority: 'HIGH' as any, timeoutMinutes: 240 },
  { id: 'wl-111', name: 'diffusion-model-distillation', type: 'BATCH', owner: 'model_opt', gpuRequested: 2, status: JobStatus.PENDING, createdAt: '2023-10-25T13:20:00Z', updatedAt: '2023-10-25T13:20:00Z', logs: ['Job queued...', 'Pending resource allocation'], gpuType: ResourceType.A100, priority: 'LOW' as any, timeoutMinutes: 200 },
  { id: 'wl-112', name: 'transformer-en-de-translation', type: 'BATCH', owner: 'nlp_team', gpuRequested: 3, status: JobStatus.RUNNING, createdAt: '2023-10-25T07:00:00Z', updatedAt: '2023-10-25T13:25:00Z', logs: ['BLEU score improving...', 'Epoch 12: BLEU=38.5'], gpuType: ResourceType.L40S, priority: 'NORMAL' as any, timeoutMinutes: 400 },
];

export const MOCK_MODELS: Model[] = [
  { id: 'm-001', name: 'Llama-3-8B-Instruct', version: 'v1.2', framework: 'PyTorch / Transformers', parameters: '8B', size: '14.9 GB', status: 'DEPLOYED', updatedAt: '2023-10-26 14:20' },
  { id: 'm-002', name: 'Stable-Diffusion-XL-Base', version: 'v1.0', framework: 'Diffusers', parameters: '6.6B', size: '12.5 GB', status: 'READY', updatedAt: '2023-10-24 09:15' },
  { id: 'm-003', name: 'Mistral-7B-v0.1', version: 'v1.0', framework: 'Transformers', parameters: '7B', size: '13.2 GB', status: 'ARCHIVED', updatedAt: '2023-10-20 18:45' },
  { id: 'm-004', name: 'ResNet-50-Classifier', version: 'v2.4', framework: 'TensorFlow', parameters: '25.6M', size: '98 MB', status: 'READY', updatedAt: '2023-10-25 11:30' },
];

export const MOCK_DATASETS: Dataset[] = [
  { id: 'd-001', name: 'WikiText-103-Pretrain', source: 'S3://llm-data-bucket', format: 'Parquet', size: '540 MB', items: '103M Tokens', category: 'TRAIN', status: 'SYNCED' },
  { id: 'd-002', name: 'ImageNet-1K-Val', source: 'PVC://k8s-storage-01', format: 'WebP', size: '6.4 GB', items: '50k images', category: 'VAL', status: 'SYNCED' },
  { id: 'd-003', name: 'Instruction-Tuning-Internal', source: 'NFS://nas-04', format: 'JSONL', size: '1.2 GB', items: '250k samples', category: 'TRAIN', status: 'PENDING' },
];

export const STATUS_COLORS = {
  [JobStatus.RUNNING]: 'text-green-400 bg-green-400/10 border-green-400/20',
  [JobStatus.PENDING]: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  [JobStatus.COMPLETED]: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  [JobStatus.FAILED]: 'text-red-400 bg-red-400/10 border-red-400/20',
  [JobStatus.TERMINATED]: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

export const GPU_PRICING = {
  [ResourceType.H100]: {
    hourly: 3.50,
    description: 'H100 - 旗舰级训练',
    vram: '80 GB',
    bestFor: '大规模训练与大语言模型微调'
  },
  [ResourceType.A100]: {
    hourly: 1.85,
    description: 'A100 - 均衡之选',
    vram: '40/80 GB',
    bestFor: '生产环境推理与训练'
  },
  [ResourceType.L40S]: {
    hourly: 0.95,
    description: 'L40S - 高性价比',
    vram: '48 GB',
    bestFor: '可视化与推理任务'
  },
  [ResourceType.V100]: {
    hourly: 0.65,
    description: 'V100 - 经济实惠',
    vram: '16/32 GB',
    bestFor: '轻量级训练与开发'
  }
};
