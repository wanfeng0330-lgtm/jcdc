'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';
import BottomNav from '@/components/BottomNav';
import { DataStream } from '@/components/AIAnimations';

const features = [
  {
    icon: '🛡️',
    title: 'AI内容可信度分析',
    desc: '多维度检测AI生成内容，识别深度伪造、AI拟声、情绪操控等风险',
    href: '/analyze',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: '🧪',
    title: 'AI媒介素养实验室',
    desc: '互动式体验，测试你的AI骗局识别能力，构建认知防线',
    href: '/lab',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: '🤖',
    title: 'AI风险解释Agent',
    desc: '对话式AI助手，从传播学视角解释信息风险与认知偏差',
    href: '/agent',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '📊',
    title: '数据可视化中心',
    desc: '实时监控AI风险态势，洞察虚假信息传播规律',
    href: '/dashboard',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { label: '今日检测', value: '12,847' },
  { label: '风险拦截', value: '4,462' },
  { label: '识别率', value: '92.1%' },
  { label: '用户免疫提升', value: '67%' },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  return (
    <div ref={containerRef} className="min-h-dvh bg-background overflow-hidden">
      <ParticleBackground />

      {/* Hero Section */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 px-6 pt-16 pb-8 safe-top"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-cyan mb-6 shadow-lg shadow-accent/20"
          >
            <span className="text-4xl">◈</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-2"
          >
            <span className="gradient-text">识界</span>
            <span className="text-foreground">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted mb-4 max-w-[280px] mx-auto"
          >
            面向AIGC时代的内容可信度
            <br />
            认知与传播干预平台
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-accent font-medium mb-8"
          >
            用AI对抗AI生成的虚假信息
          </motion.p>

          {/* Data Stream */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-[200px] mx-auto mb-8"
          >
            <DataStream lines={3} />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Link href="/analyze">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent to-cyan text-white font-semibold text-sm shadow-lg shadow-accent/20 transition-all"
              >
                开始检测
              </motion.button>
            </Link>
            <div className="flex gap-3">
              <Link href="/lab" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-2xl glass-card text-accent font-medium text-sm"
                >
                  AI风险实验室
                </motion.button>
              </Link>
              <Link href="/lab" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 rounded-2xl glass-card text-cyan font-medium text-sm"
                >
                  AI免疫力测试
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 mb-8"
      >
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-sm p-4 text-center"
            >
              <div className="text-xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 pb-32"
      >
        <h2 className="text-lg font-bold mb-4 gradient-text">核心功能</h2>
        <div className="space-y-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={feature.href}>
                <div className="glass-card-sm p-4 flex items-start gap-4 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">{feature.desc}</p>
                  </div>
                  <span className="text-muted group-hover:text-accent transition-colors mt-1">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 px-4 pb-8 text-center"
      >
        <Link href="/tech">
          <div className="glass-card-sm inline-flex items-center gap-2 px-4 py-2">
            <span className="text-xs text-muted">Powered by</span>
            <span className="text-xs font-medium gradient-text">AI Native Workflow</span>
            <span className="text-xs text-accent">→</span>
          </div>
        </Link>
      </motion.div>

      <BottomNav />
    </div>
  );
}
