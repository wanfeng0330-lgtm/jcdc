'use client';

import { useState, useCallback } from 'react';
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
  Radio,
  ScanFace,
  Network,
  CheckCircle2,
  ShieldAlert,
  Upload,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import PageContainer, { PageHeader } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { RiskGauge, RadarChart, RiskHeatMap } from '@/components/Charts';
import { AnalysisSteps, AIFlowLine } from '@/components/AIAnimations';
import { mockAnalysisResult } from '@/lib/mock-data';
import type { AnalysisResult } from '@/lib/mock-data';

type FileType = 'image' | 'video' | 'audio' | 'text' | 'screenshot';
type AnalysisPhase = 'idle' | 'uploading' | 'analyzing' | 'result';

const fileTypes: { type: FileType; icon: LucideIcon; label: string }[] = [
  { type: 'image', icon: ImageIcon, label: '图片' },
  { type: 'video', icon: Video, label: '视频' },
  { type: 'audio', icon: Mic, label: '音频' },
  { type: 'text', icon: FileText, label: '文本' },
  { type: 'screenshot', icon: Smartphone, label: '截图' },
];

type StepStatus = 'pending' | 'active' | 'done';

const analysisSteps: { label: string; icon: LucideIcon; status: StepStatus }[] = [
  { label: 'OCR识别与文本提取', icon: Search, status: 'pending' },
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
  const [currentSteps, setCurrentSteps] = useState(analysisSteps);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'score' | 'radar' | 'detail'>('score');

  const startAnalysis = useCallback(() => {
    setPhase('analyzing');
    const steps = [...analysisSteps];
    setCurrentSteps(steps.map((s) => ({ ...s, status: 'pending' as StepStatus })));

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
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
        setTimeout(() => {
          setResult(mockAnalysisResult);
          setPhase('result');
        }, 500);
      }
    }, 800);
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setInputText('');
    setCurrentSteps(analysisSteps);
  }, []);

  const riskFactorIcons: Record<string, LucideIcon> = {
    emotion: AlertTriangle,
    identity: ShieldAlert,
    title: FileText,
    voice: Mic,
    deepfake: ScanFace,
    spread: Network,
  };

  return (
    <PageContainer>
      <PageHeader
        title="AI内容可信度分析"
        subtitle="多维度检测AI生成内容，识别信息风险"
        icon="◎"
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
                      onClick={() => setSelectedType(ft.type)}
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

            {/* Upload Area */}
            <motion.div
              className="glass-card-sm p-6 border-2 border-dashed border-accent/20 hover:border-accent/40 transition-colors cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={startAnalysis}
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
                  点击上传或拖拽文件
                </p>
                <p className="text-xs text-muted">
                  支持 {fileTypes.find((f) => f.type === selectedType)?.label} 格式
                </p>
              </div>
            </motion.div>

            {/* Or Text Input */}
            {selectedType === 'text' && (
              <div className="glass-card-sm p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="粘贴或输入待检测的文本内容..."
                  className="w-full h-32 bg-transparent text-sm text-foreground/80 placeholder-muted/50 resize-none outline-none"
                />
                <button
                  onClick={startAnalysis}
                  disabled={!inputText.trim()}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-accent to-cyan text-white text-sm font-medium disabled:opacity-30 transition-opacity"
                >
                  开始分析
                </button>
              </div>
            )}

            {/* Quick Demo */}
            <button
              onClick={startAnalysis}
              className="w-full py-3 rounded-xl glass-card text-accent text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <Upload size={14} strokeWidth={1.5} />
              体验演示分析
            </button>
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
                <span className="text-xs text-accent animate-pulse">进行中...</span>
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
              <h3 className="text-xs text-muted mb-3">数据流</h3>
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
                  <div className="text-lg font-bold text-danger">{result.aiGeneratedProb}%</div>
                  <div className="text-[10px] text-muted">AI生成概率</div>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2">
              {(['score', 'radar', 'detail'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-accent/15 text-accent border border-accent/20'
                      : 'text-muted bg-white/[0.03] border border-white/5'
                  }`}
                >
                  {tab === 'score' ? '风险热力' : tab === 'radar' ? '雷达图' : '详细分析'}
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

            {/* Emotion Analysis */}
            <div className="glass-card-sm p-4">
              <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
                <Drama size={14} className="text-accent" strokeWidth={1.5} />
                情绪传播分析
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">主要情绪</span>
                  <span className="text-xs text-danger font-medium">{result.emotionAnalysis.primary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">情绪强度</span>
                  <span className="text-xs text-warning">{result.emotionAnalysis.intensity}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">操控风险</span>
                  <span className="text-xs text-danger">{result.emotionAnalysis.manipulationRisk}%</span>
                </div>
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
              </div>
            </div>

            {/* Spread Analysis */}
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
