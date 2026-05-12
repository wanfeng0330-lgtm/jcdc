'use client';

import { motion } from 'framer-motion';
import PageContainer, { PageHeader, Section } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { AIFlowLine } from '@/components/AIAnimations';

interface FlowNode {
  icon: string;
  title: string;
  desc: string;
  color: string;
}

const mainFlow: FlowNode[] = [
  { icon: '📥', title: '内容输入', desc: '图片/视频/音频/文本', color: 'from-cyan-500 to-blue-500' },
  { icon: '🔍', title: 'OCR识别', desc: '文字提取与结构化', color: 'from-blue-500 to-indigo-500' },
  { icon: '🎙️', title: 'Whisper语音', desc: '语音转文字分析', color: 'from-indigo-500 to-purple-500' },
  { icon: '🧠', title: 'AI风险引擎', desc: '多维度特征分析', color: 'from-purple-500 to-pink-500' },
  { icon: '🎭', title: '情绪分析', desc: '情绪操控模式识别', color: 'from-pink-500 to-rose-500' },
  { icon: '🔄', title: '传播分析', desc: '传播路径与影响建模', color: 'from-rose-500 to-orange-500' },
  { icon: '📊', title: '可信度评分', desc: '综合风险评级输出', color: 'from-orange-500 to-amber-500' },
  { icon: '👤', title: '人机协同', desc: '专家验证与反馈', color: 'from-amber-500 to-emerald-500' },
];

const aiModules = [
  {
    icon: '🤖',
    title: 'AIGC检测模型',
    desc: '基于深度学习的AI生成内容识别，支持文本、图像、音频、视频多模态检测',
    tags: ['深度学习', '多模态', '实时检测'],
  },
  {
    icon: '👁️',
    title: '深度伪造检测',
    desc: '针对AI换脸、AI拟声等深度伪造技术的专项检测，识别面部不连续性和语音合成痕迹',
    tags: ['换脸检测', '拟声识别', '频域分析'],
  },
  {
    icon: '🧠',
    title: '风险解释引擎',
    desc: '从传播学视角分析信息风险，输出情绪操控、身份诱导、传播模式等传播学解释',
    tags: ['传播学', '认知偏差', '风险解释'],
  },
  {
    icon: '📝',
    title: 'OCR文字识别',
    desc: '高精度文字提取与结构化，支持截图、手写体、多语言识别',
    tags: ['OCR', '多语言', '结构化'],
  },
  {
    icon: '🎙️',
    title: 'Whisper语音分析',
    desc: '语音转文字与声纹分析，识别AI合成语音特征，检测拟声诈骗',
    tags: ['Whisper', '声纹分析', 'AI拟声'],
  },
  {
    icon: '📊',
    title: '可信度建模',
    desc: '融合多维度分析结果，建立内容可信度评估模型，输出综合评分与风险等级',
    tags: ['可信度', '多维度', '评分模型'],
  },
];

export default function TechPage() {
  return (
    <PageContainer>
      <PageHeader
        title="AI Native 技术架构"
        subtitle="识界AI核心工作流与技术模块"
        icon="⚙️"
      />

      {/* AI Workflow */}
      <Section className="mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 gradient-text">AI工作流</h3>
          <div className="space-y-1">
            {mainFlow.map((node, i) => (
              <div key={i}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 py-2"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center text-lg shrink-0 shadow-lg`}
                  >
                    {node.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{node.title}</div>
                    <div className="text-[10px] text-muted">{node.desc}</div>
                  </div>
                  <span className="text-[10px] text-accent">Step {i + 1}</span>
                </motion.div>
                {i < mainFlow.length - 1 && <AIFlowLine className="ml-5 my-1" />}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI Modules */}
      <Section delay={0.3} className="mb-6">
        <h3 className="text-sm font-semibold mb-3 gradient-text">核心AI模块</h3>
        <div className="space-y-3">
          {aiModules.map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card-sm p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1">{mod.title}</h4>
                  <p className="text-xs text-muted leading-relaxed mb-2">{mod.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Human-AI Collaboration */}
      <Section delay={0.6} className="mb-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 gradient-text">🤝 人机协同结构</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 glass-card-sm p-3 text-center">
                <div className="text-xl mb-1">🤖</div>
                <div className="text-xs font-medium">AI检测</div>
                <div className="text-[10px] text-muted">高速筛选与初判</div>
              </div>
              <div className="flex items-center text-accent text-xs">⇌</div>
              <div className="flex-1 glass-card-sm p-3 text-center">
                <div className="text-xl mb-1">👤</div>
                <div className="text-xs font-medium">专家验证</div>
                <div className="text-[10px] text-muted">深度判断与定性</div>
              </div>
              <div className="flex items-center text-accent text-xs">⇌</div>
              <div className="flex-1 glass-card-sm p-3 text-center">
                <div className="text-xl mb-1">🔄</div>
                <div className="text-xs font-medium">反馈迭代</div>
                <div className="text-[10px] text-muted">模型持续优化</div>
              </div>
            </div>
            <p className="text-[10px] text-muted leading-relaxed text-center">
              识界AI采用人机协同架构，AI负责高速内容筛选与初步风险评估，领域专家负责深度判断与定性，通过反馈迭代机制持续优化模型性能。
            </p>
          </div>
        </div>
      </Section>

      {/* Core Values */}
      <Section delay={0.7} className="mb-24">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold mb-4 gradient-text">🎯 项目核心</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🔍', title: '信息可信度', desc: '多维度评估信息可靠性' },
              { icon: '🌐', title: '风险传播', desc: '追踪虚假信息传播路径' },
              { icon: '🧠', title: '认知偏差', desc: '识别利用认知漏洞的攻击' },
              { icon: '🎭', title: '情绪操控', desc: '检测情绪操控与诱导模式' },
              { icon: '📚', title: '媒介素养', desc: '构建信息风险认知防线' },
              { icon: '🛡️', title: 'AI内容治理', desc: '建立AIGC内容治理体系' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass-card-sm p-3 text-center"
              >
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="text-xs font-medium mb-0.5">{item.title}</div>
                <div className="text-[10px] text-muted">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <BottomNav />
    </PageContainer>
  );
}
