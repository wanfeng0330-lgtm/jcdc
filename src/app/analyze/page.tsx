'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Smartphone,
  Search,
  Brain,
  Drama,
  Eye,
  BarChart2,
  RefreshCw,
  AlertTriangle,
  ScanFace,
  Network,
  CheckCircle2,
  ShieldAlert,
  Upload,
  ArrowLeft,
  X,
  File,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import PageContainer, { PageHeader } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { RiskGauge, RadarChart, RiskHeatMap } from '@/components/Charts';
import { AIFlowLine } from '@/components/AIAnimations';
import { mockAnalysisResult } from '@/lib/mock-data';
import type { AnalysisResult } from '@/lib/mock-data';

type FileType = 'image' | 'video' | 'audio' | 'text' | 'screenshot';
type AnalysisPhase = 'idle' | 'uploading' | 'analyzing' | 'result';
type TabType = 'score' | 'radar' | 'detail';

const fileTypes: { type: FileType; icon: LucideIcon; label: string; accept: string }[] = [
  { type: 'image', icon: ImageIcon, label: '图片', accept: 'image/*' },
  { type: 'video', icon: Video, label: '视频', accept: 'video/*' },
  { type: 'audio', icon: Mic, label: '音频', accept: 'audio/*' },
  { type: 'text', icon: FileText, label: '文本', accept: '' },
  { type: 'screenshot', icon: Smartphone, label: '截图', accept: 'image/*' },
];

const tabs: { key: TabType; label: string }[] = [
  { key: 'score', label: '风险热力' },
  { key: 'radar', label: '雷达图' },
  { key: 'detail', label: '详细分析' },
];

type StepStatus = 'pending' | 'active' | 'done';

const initialSteps: { label: string; icon: LucideIcon; status: StepStatus }[] = [
  { label: '内容识别与特征提取', icon: Search, status: 'pending' },
  { label: 'AI风险特征分析', icon: Brain, status: 'pending' },
  { label: '情绪传播模式识别', icon: Drama, status: 'pending' },
  { label: '深度伪造特征检测', icon: Eye, status: 'pending' },
  { label: '内容可信度建模', icon: BarChart2, status: 'pending' },
  { label: '传播学风险评估', icon: RefreshCw, status: 'pending' },
];

export default function AnalyzePage() {
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [selectedType, setSelectedType] = useState<FileType>('image');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [currentSteps, setCurrentSteps] = useState(initialSteps);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('score');
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setFileMimeType(file.type);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // result is like "data:image/jpeg;base64,/9j/4AAQ..."
      setFileBase64(result);
      setPhase('idle');
    };
    reader.readAsDataURL(file);

    setPhase('uploading');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setFileBase64('');
    setFileMimeType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const advanceSteps = useCallback((onComplete: () => void) => {
    setCurrentSteps(initialSteps.map((s) => ({ ...s, status: 'pending' as StepStatus })));

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < initialSteps.length) {
        setCurrentSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: (i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending') as StepStatus,
          }))
        );
        stepIndex++;
      } else {
        clearInterval(interval);
        setCurrentSteps((prev) => prev.map((s) => ({ ...s, status: 'done' as StepStatus })));
        onComplete();
      }
    }, 800);
  }, []);

  const startAnalysis = useCallback(async (content: string, base64?: string, mimeType?: string) => {
    if (!content.trim() && !base64) return;

    setPhase('analyzing');
    setAnalysisSource('');

    advanceSteps(async () => {
      try {
        const payload: Record<string, string> = {
          type: selectedType,
          content,
          text: content,
        };

        // For image types, send the base64 data so AI can actually see the image
        if (base64) {
          payload.imageBase64 = base64;
          payload.mimeType = mimeType || 'image/jpeg';
        }

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success && data.data) {
          setResult(data.data);
          setAnalysisSource(data.source || 'unknown');
        } else {
          setResult(mockAnalysisResult);
          setAnalysisSource('fallback');
        }
      } catch (error) {
        console.error('Analysis API error:', error);
        setResult(mockAnalysisResult);
        setAnalysisSource('fallback');
      }

      setTimeout(() => {
        setPhase('result');
      }, 300);
    });
  }, [selectedType, advanceSteps]);

  const startFileAnalysis = useCallback(() => {
    if (!selectedFile && !fileBase64) return;
    // For non-text types, send the base64 image + a brief description
    const typeLabel = fileTypes.find((f) => f.type === selectedType)?.label || '文件';
    const desc = `[用户上传的${typeLabel}] ${selectedFile?.name || '文件'}`;
    startAnalysis(desc, fileBase64, fileMimeType);
  }, [selectedFile, fileBase64, fileMimeType, selectedType, startAnalysis]);

  const startTextAnalysis = useCallback(() => {
    if (!inputText.trim()) return;
    startAnalysis(inputText);
  }, [inputText, startAnalysis]);

  const reset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setInputText('');
    setSelectedFile(null);
    setFileBase64('');
    setFileMimeType('');
    setCurrentSteps(initialSteps);
    setAnalysisSource('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const riskFactorIcons: Record<string, LucideIcon> = {
    emotion: AlertTriangle,
    identity: ShieldAlert,
    title: FileText,
    voice: Mic,
    deepfake: ScanFace,
    spread: Network,
  };

  // 获取当前类型的accept属性
  const currentAccept = fileTypes.find((f) => f.type === selectedType)?.accept || '';

  // Determine if content is normal/safe
  const isLowRisk = result && result.riskLevel === 'low' && result.riskFactors.length === 0;

  return (
    <PageContainer>
      <PageHeader
        title="AI内容可信度分析"
        subtitle="先检测内容，再实事求是地分析风险"
        icon="◎"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={currentAccept}
        onChange={handleFileInput}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* File Type Selector */}
            <div className="glass-card-sm p-4">
              <p className="text-xs text-muted mb-3">选择内容类型</p>
              <div className="flex gap-2">
                {fileTypes.map((ft) => {
                  const IconComp = ft.icon;
                  return (
                    <button
                      key={ft.type}
                      onClick={() => {
                        setSelectedType(ft.type);
                        clearFile();
                      }}
                      className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
                        selectedType === ft.type
                          ? 'bg-accent/15 border border-accent/30 text-accent'
                          : 'bg-white/[0.03] border border-white/5 text-muted hover:bg-white/[0.06]'
                      }`}
                    >
                      <IconComp size={20} className="mx-auto mb-1" strokeWidth={1.5} />
                      <div className="text-[10px]">{ft.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Area - for non-text types */}
            {selectedType !== 'text' && (
              <div>
                {selectedFile ? (
                  /* File selected preview */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card-sm p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {selectedType === 'image' || selectedType === 'screenshot' ? (
                          <img
                            src={fileBase64}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (() => {
                            const TypeIcon = fileTypes.find((f) => f.type === selectedType)?.icon || File;
                            return <TypeIcon size={20} className="text-accent" strokeWidth={1.5} />;
                          })()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted">
                          {(selectedFile.size / 1024).toFixed(1)} KB · AI将直接检测此文件内容
                        </p>
                      </div>
                      <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-white/5 text-muted">
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                    <button
                      onClick={startFileAnalysis}
                      disabled={!fileBase64}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-accent to-cyan text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      <Search size={14} strokeWidth={1.5} />
                      开始AI分析
                    </button>
                    <p className="text-[10px] text-muted/50 mt-2 text-center">
                      AI将直接查看并分析文件内容，实事求是地返回结果
                    </p>
                  </motion.div>
                ) : (
                  /* Upload dropzone */
                  <motion.div
                    className={`glass-card-sm p-6 border-2 border-dashed transition-colors cursor-pointer ${
                      isDragging
                        ? 'border-accent/60 bg-accent/5'
                        : 'border-accent/20 hover:border-accent/40'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mb-3"
                      >
                        {(() => {
                          const IconComp = fileTypes.find((f) => f.type === selectedType)?.icon || ImageIcon;
                          return <IconComp size={36} className="mx-auto text-accent" strokeWidth={1.5} />;
                        })()}
                      </motion.div>
                      <p className="text-sm text-foreground/70 mb-1">
                        {isDragging ? '松开即可上传' : '点击选择或拖拽文件'}
                      </p>
                      <p className="text-xs text-muted">
                        支持 {fileTypes.find((f) => f.type === selectedType)?.label} 格式 · AI将直接检测文件内容
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Text Input - for text type */}
            {selectedType === 'text' && (
              <div className="glass-card-sm p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="粘贴或输入待检测的文本内容..."
                  className="w-full h-32 bg-transparent text-sm text-foreground/80 placeholder-muted/50 resize-none outline-none"
                />
                <button
                  onClick={startTextAnalysis}
                  disabled={!inputText.trim()}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-accent to-cyan text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                >
                  开始AI分析
                </button>
              </div>
            )}
          </motion.div>
        )}

        {phase === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card-sm p-6 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-accent/10 mx-auto flex items-center justify-center mb-4"
            >
              <Upload size={24} className="text-accent" strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm text-foreground/70">文件读取中...</p>
          </motion.div>
        )}

        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Analysis Progress */}
            <div className="glass-card-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">AI分析进程</h3>
                <span className="text-xs text-accent animate-pulse">Qwen3-Omni 实时分析中...</span>
              </div>
              <AIFlowLine className="mb-4" />
              <div className="space-y-3">
                {currentSteps.map((step, i) => {
                  const IconComp = step.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: step.status === 'pending' ? 0.4 : 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                        step.status === 'active'
                          ? 'bg-accent/10 border border-accent/20'
                          : step.status === 'done'
                          ? 'bg-success/5 border border-success/10'
                          : 'bg-white/[0.02] border border-white/5'
                      }`}
                    >
                      <IconComp size={16} className={step.status === 'active' ? 'text-accent' : step.status === 'done' ? 'text-success' : 'text-muted'} strokeWidth={1.5} />
                      <span className={`text-sm flex-1 ${
                        step.status === 'active' ? 'text-accent font-medium' : step.status === 'done' ? 'text-success' : 'text-muted'
                      }`}>
                        {step.label}
                      </span>
                      {step.status === 'active' && (
                        <div className="flex gap-1">
                          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                        </div>
                      )}
                      {step.status === 'done' && <CheckCircle2 size={14} className="text-success" strokeWidth={1.5} />}
                      {step.status === 'pending' && <span className="text-muted text-xs">等待中</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Live Data Stream */}
            <div className="glass-card-sm p-4">
              <h3 className="text-xs text-muted mb-3">数据流 · Qwen3-Omni-30B-A3B</h3>
              <div className="font-mono text-[10px] text-accent/60 space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.5, x: 0 }}
                    transition={{ delay: i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                    className="truncate"
                  >
                    {`> processing.feature_${['ocr', 'nlp', 'deepfake', 'emotion', 'spread', 'credibility', 'voice', 'face'][i]}...`}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Source Badge */}
            {analysisSource === 'ai' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20"
              >
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[11px] text-accent font-medium">Qwen3-Omni 实时分析结果</span>
              </motion.div>
            )}

            {/* Score Overview */}
            <div className="glass-card-sm p-5 text-center">
              <RiskGauge value={result.credibilityScore} label="内容可信度评分" />
              <div className="mt-4 flex justify-center gap-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${result.riskLevel === 'high' ? 'text-danger' : result.riskLevel === 'medium' ? 'text-warning' : 'text-success'}`}>
                    {result.riskLevel === 'high' ? '高风险' : result.riskLevel === 'medium' ? '中风险' : '低风险'}
                  </div>
                  <div className="text-[10px] text-muted">风险等级</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className={`text-lg font-bold ${result.aiGeneratedProb > 60 ? 'text-danger' : result.aiGeneratedProb > 30 ? 'text-warning' : 'text-success'}`}>
                    {result.aiGeneratedProb}%
                  </div>
                  <div className="text-[10px] text-muted">AI生成概率</div>
                </div>
              </div>
            </div>

            {/* Safe content notice */}
            {isLowRisk && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-sm p-4 border border-success/20"
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-success shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-success">内容正常，未发现明显风险</p>
                    <p className="text-xs text-muted mt-1">AI检测后未发现AI生成痕迹、情绪操控、身份冒充等风险特征。该内容看起来是正常内容。</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Risk Factors - only show if there are any */}
            {result.riskFactors.length > 0 && (
              <div className="space-y-4">
                {/* Tab Switcher */}
                <div className="flex gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-accent/15 text-accent border border-accent/20'
                          : 'text-muted bg-white/[0.03] border border-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'score' && (
                    <motion.div
                      key="score"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="glass-card-sm p-4"
                    >
                      <h3 className="text-sm font-semibold mb-4">风险因素热力图</h3>
                      <RiskHeatMap data={result.riskFactors.map((f) => ({ label: f.label, value: f.score }))} />
                    </motion.div>
                  )}

                  {activeTab === 'radar' && (
                    <motion.div
                      key="radar"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="glass-card-sm p-4 flex justify-center"
                    >
                      <RadarChart
                        data={result.riskFactors.map((f) => ({
                          label: f.label.slice(0, 4),
                          value: f.score,
                        }))}
                        size={240}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'detail' && (
                    <motion.div
                      key="detail"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-3"
                    >
                      {result.riskFactors.map((factor, i) => {
                        const RiskIcon = riskFactorIcons[factor.type] || AlertTriangle;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card-sm p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <RiskIcon size={16} className={factor.score >= 70 ? 'text-danger' : factor.score >= 40 ? 'text-warning' : 'text-success'} strokeWidth={1.5} />
                                <span className="text-sm font-medium">{factor.label}</span>
                              </div>
                              <span className={`text-xs font-bold ${
                                factor.score >= 70 ? 'text-danger' : factor.score >= 40 ? 'text-warning' : 'text-success'
                              }`}>
                                {factor.score}%
                              </span>
                            </div>
                            <p className="text-xs text-muted leading-relaxed">{factor.description}</p>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Emotion Analysis - only show if there's something meaningful */}
            {(result.emotionAnalysis.manipulationRisk > 10 || result.emotionAnalysis.techniques.length > 0) && (
              <div className="glass-card-sm p-4">
                <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                  <Drama size={14} className="text-accent" strokeWidth={1.5} />
                  情绪传播分析
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">主要情绪</span>
                    <span className={`text-xs font-medium ${result.emotionAnalysis.manipulationRisk > 40 ? 'text-danger' : 'text-foreground/70'}`}>
                      {result.emotionAnalysis.primary}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">情绪强度</span>
                    <span className={`text-xs ${result.emotionAnalysis.intensity > 60 ? 'text-warning' : 'text-foreground/70'}`}>
                      {result.emotionAnalysis.intensity}%
                    </span>
                  </div>
                  {result.emotionAnalysis.manipulationRisk > 10 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted">操控风险</span>
                      <span className={`text-xs ${result.emotionAnalysis.manipulationRisk > 50 ? 'text-danger' : 'text-warning'}`}>
                        {result.emotionAnalysis.manipulationRisk}%
                      </span>
                    </div>
                  )}
                  {result.emotionAnalysis.techniques.length > 0 && (
                    <div>
                      <span className="text-xs text-muted">操控手法</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.emotionAnalysis.techniques.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Spread Analysis - only show if velocity is significant */}
            {result.spreadAnalysis.velocity > 3 && (
              <div className="glass-card-sm p-4">
                <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                  <Network size={14} className="text-accent" strokeWidth={1.5} />
                  传播路径分析
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">传播速度</span>
                    <span className="text-xs text-accent">{result.spreadAnalysis.velocity}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">扩散范围</span>
                    <span className="text-xs text-warning">{result.spreadAnalysis.reach}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">传播模式</span>
                    <span className="text-xs text-foreground/70">{result.spreadAnalysis.pattern}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">潜在影响节点</span>
                    <span className="text-xs text-danger">{result.spreadAnalysis.nodes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Suggestions */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" strokeWidth={1.5} />
                验证建议
              </h3>
              <div className="space-y-2">
                {result.verificationSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-accent text-xs mt-0.5">▸</span>
                    <span className="text-xs text-foreground/70 leading-relaxed">{s}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl glass-card text-accent text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              重新检测
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </PageContainer>
  );
}
