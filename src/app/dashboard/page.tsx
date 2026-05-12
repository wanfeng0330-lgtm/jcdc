'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Siren,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';
import PageContainer, { PageHeader, Section } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { dashboardData } from '@/lib/mock-data';

const COLORS = ['#6366f1', '#06b6d4', '#818cf8', '#f59e0b', '#ef4444'];

const sectionIcons = {
  weeklyTrend: TrendingUp,
  riskType: Target,
  highFreqScam: Siren,
  hourly: Clock,
  realtime: Zap,
};

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="数据可视化中心"
        subtitle="AI风险态势实时监控"
        icon="▣"
      />

      {/* Key Metrics */}
      <Section className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '今日检测', value: dashboardData.todayChecks.toLocaleString(), color: 'text-accent', sub: '+12.5%' },
            { label: 'AI风险占比', value: `${dashboardData.aiRiskRatio}%`, color: 'text-danger', sub: '+2.1%' },
            { label: '用户误判率', value: `${dashboardData.userMisjudgeRate}%`, color: 'text-warning', sub: '-3.4%' },
            { label: 'AI识别率', value: `${dashboardData.aiDetectionRate}%`, color: 'text-success', sub: '+1.8%' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-sm p-4"
            >
              <div className="text-xs text-muted mb-1">{item.label}</div>
              <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
              <div className={`text-[10px] ${item.sub.startsWith('+') ? 'text-danger' : 'text-success'}`}>
                {item.sub}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Weekly Trend */}
      <Section delay={0.2} className="mb-4">
        <div className="glass-card-sm p-4">
          <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
            <TrendingUp size={14} className="text-accent" strokeWidth={1.5} />
            本周趋势
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.weeklyTrend}>
                <defs>
                  <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,255,0.06)" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,15,40,0.9)',
                    border: '1px solid rgba(100,100,255,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="checks"
                  stroke="#6366f1"
                  fill="url(#colorChecks)"
                  strokeWidth={2}
                  name="检测量"
                />
                <Area
                  type="monotone"
                  dataKey="risks"
                  stroke="#ef4444"
                  fill="url(#colorRisks)"
                  strokeWidth={2}
                  name="风险量"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* Risk Type Distribution */}
      <Section delay={0.3} className="mb-4">
        <div className="glass-card-sm p-4">
          <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
            <Target size={14} className="text-accent" strokeWidth={1.5} />
            风险类型分布
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.riskTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {dashboardData.riskTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 flex-1">
              {dashboardData.riskTypeDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <span className="text-[10px] text-muted flex-1">{item.name}</span>
                  <span className="text-[10px] font-medium text-foreground/70">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* High Freq Scams */}
      <Section delay={0.4} className="mb-4">
        <div className="glass-card-sm p-4">
          <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
            <Siren size={14} className="text-danger" strokeWidth={1.5} />
            高频诈骗类型
          </h3>
          <div className="space-y-3">
            {dashboardData.highFreqScams.map((scam, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-foreground/70">{scam.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{scam.count.toLocaleString()}</span>
                    <span
                      className={`text-[10px] ${scam.trend > 0 ? 'text-danger' : 'text-success'}`}
                    >
                      {scam.trend > 0 ? '↑' : '↓'} {Math.abs(scam.trend)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-cyan"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(scam.count / dashboardData.highFreqScams[0].count) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Hourly Distribution */}
      <Section delay={0.5} className="mb-4">
        <div className="glass-card-sm p-4">
          <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
            <Clock size={14} className="text-cyan" strokeWidth={1.5} />
            24小时检测分布
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.hourlyChecks}>
                <defs>
                  <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  stroke="#6b7280"
                  fontSize={8}
                  tickLine={false}
                  interval={3}
                />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#06b6d4"
                  fill="url(#colorHourly)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* Real-time Monitor */}
      <Section delay={0.6} className="mb-24">
        <div className="glass-card-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold inline-flex items-center gap-2">
              <Zap size={14} className="text-accent" strokeWidth={1.5} />
              实时监控
            </h3>
            <div className="flex items-center gap-1">
              <Activity size={8} className="text-success" strokeWidth={2} />
              <span className="text-[10px] text-success">运行中</span>
            </div>
          </div>
          <div className="space-y-2 font-mono text-[10px] text-accent/50">
            {[
              '> AI检测模型 v3.2.1 运行正常',
              '> 今日拦截风险内容 4,462 条',
              '> AI拟声检测模块已更新',
              '> UCAE 统一认知分析引擎运行中',
              '> 深度伪造检测准确率 94.2%',
            ].map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.2 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <BottomNav />
    </PageContainer>
  );
}
