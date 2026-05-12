'use client';

import { motion } from 'framer-motion';

interface ThinkingAnimationProps {
  text?: string;
}

export function ThinkingAnimation({ text = 'AI分析中' }: ThinkingAnimationProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex gap-1">
        <span className="thinking-dot w-2 h-2 rounded-full bg-accent" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-accent" />
        <span className="thinking-dot w-2 h-2 rounded-full bg-accent" />
      </div>
      <span className="text-sm text-accent animate-pulse">{text}</span>
    </div>
  );
}

interface AnalysisStepProps {
  steps: { label: string; icon: string; status: 'pending' | 'active' | 'done' }[];
}

export function AnalysisSteps({ steps }: AnalysisStepProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
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
          <span className="text-lg">{step.icon}</span>
          <span className={`text-sm flex-1 ${
            step.status === 'active' ? 'text-accent font-medium' : step.status === 'done' ? 'text-success' : 'text-muted'
          }`}>
            {step.label}
          </span>
          {step.status === 'active' && <ThinkingAnimation />}
          {step.status === 'done' && <span className="text-success text-xs">✓</span>}
          {step.status === 'pending' && <span className="text-muted text-xs">等待中</span>}
        </motion.div>
      ))}
    </div>
  );
}

interface AIFlowLineProps {
  className?: string;
}

export function AIFlowLine({ className = '' }: AIFlowLineProps) {
  return (
    <div className={`relative h-[2px] w-full overflow-hidden rounded-full bg-accent/10 ${className}`}>
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full"
        animate={{ x: ['-100%', '300%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

interface DataStreamProps {
  lines?: number;
}

export function DataStream({ lines = 5 }: DataStreamProps) {
  return (
    <div className="space-y-1 overflow-hidden">
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-accent/30 to-transparent"
          initial={{ width: '0%', opacity: 0 }}
          animate={{ width: `${30 + Math.random() * 70}%`, opacity: [0, 0.5, 0] }}
          transition={{
            duration: 1.5 + Math.random(),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
