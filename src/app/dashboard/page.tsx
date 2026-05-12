'use client';

import { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Database,
} from 'lucide-react';
import PageContainer, { PageHeader, Section } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';

const COLORS = ['#6366f1', '#06b6d4', '#818cf8', '#f59e0b', '#ef4444'];

// 数据类型定义
interface DashboardData {
  todayChecks: number;
  aiRiskRatio: number;
  userMisjudgeRate: number;
  aiDetectionRate: number;
  highFreqScams: {
    name: string;
    count: number;
    trend: number;
  }[];
  weeklyTrend: {
    day: string;
    checks: number;
    risks: number;
  }[];
  riskTypeDistribution: {
    name: string;
    value: number;
  }[];
  hourlyChecks: {
    hour: string;
    count: number;
  }[];
  realtimeLogs: {
    time: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }[];
  latestNews: {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
  }[];
  dataSource: 'real' | 'seed';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新 - 每30秒
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // 加载状态
  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="数据可视化中心" subtitle="AI风险态势实时监控" icon="▣" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw size={24} className="text-accent animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted">正在加载数据...</p>
          </div>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <PageHeader title="数据可视化中心" subtitle="AI风险态势实时监控" icon="▣" />
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted">数据加载失败，请刷新页面</p>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  const isSeed = data.dataSource === 'seed';

  return (
    <PageContainer>
      <PageHeader
        title="数据可视化中心"
        subtitle="AI风险态势实时监控"
        icon="▣"
      />

      {/* 数据来源标识 + 控制栏 */}
      <Section className="mb-3">
        <div className="glass-card-sm px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={12} className={isSeed ? 'text-warning' : 'text-success'} />
            <span className="text-[10px] text-muted">
              {isSeed ? '等待首次检测后数据将实时更新' : '实时数据'}
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-muted/50">
                更新于 {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[10px] text-muted hover:text-accent transition-colors"
            >
              {autoRefresh ? '自动刷新:开' : '自动刷新:关'}
            </button>
            <button
              onClick={fetchData}
              className="text-[10px] text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              <RefreshCw size={10} />
              刷新
            </button>
          </div>
        </div>
      </Section>

      {/* Key Metrics */}
      <Section className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '今日检测', value: data.todayChecks.toLocaleString(), color: 'text-accent', sub: data.dataSource === 'real' ? '实时' : '—' },
            { label: 'AI风险占比', value: `${data.aiRiskRatio}%`, color: 'text-danger', sub: data.aiRiskRatio > 30 ? '偏高' : '正常' },
            { label: '用户误判率', value: `${data.userMisjudgeRate}%`, color: 'text-warning', sub: data.userMisjudgeRate > 30 ? '需关注' : '良好' },
            { label: 'AI识别率', value: `${data.aiDetectionRate}%`, color: 'text-success', sub: data.aiDetectionRate > 90 ? '优秀' : '待提升' },
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
              <div className={`text-[10px] ${item.sub === '偏高' || item.sub === '需关注' ? 'text-danger' : 'text-success'}`}>
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
              <AreaChart data={data.weeklyTrend}>
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
          {data.riskTypeDistribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.riskTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.riskTypeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {data.riskTypeDistribution.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-[10px] text-muted flex-1">{item.name}</span>
                    <span className="text-[10px] font-medium text-foreground/70">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertTriangle size={20} className="text-warning mx-auto mb-2" />
              <p className="text-[10px] text-muted">暂无风险类型数据，开始使用分析功能后将自动生成</p>
            </div>
          )}
        </div>
      </Section>

      {/* High Freq Scams */}
      <Section delay={0.4} className="mb-4">
        <div className="glass-card-sm p-4">
          <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
            <Siren size={14} className="text-danger" strokeWidth={1.5} />
            高频诈骗类型
          </h3>
          {data.highFreqScams.length > 0 ? (
            <div className="space-y-3">
              {data.highFreqScams.map((scam, i) => (
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
                        width: `${(scam.count / Math.max(...data.highFreqScams.map(s => s.count), 1)) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[10px] text-muted">暂无诈骗类型统计，检测到风险内容后将自动更新</p>
            </div>
          )}
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
              <AreaChart data={data.hourlyChecks}>
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

      {/* Latest AI Risk News - 新增模块 */}
      {data.latestNews.length > 0 && (
        <Section delay={0.55} className="mb-4">
          <div className="glass-card-sm p-4">
            <h3 className="text-sm font-semibold mb-3 inline-flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning" strokeWidth={1.5} />
              最新AI风险动态
              <span className="text-[10px] text-muted font-normal ml-auto">Tavily 实时搜索</span>
            </h3>
            <div className="space-y-2">
              {data.latestNews.slice(0, 5).map((news, i) => (
                <motion.a
                  key={i}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="block p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <ExternalLink size={10} className="text-accent mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed">{news.title}</p>
                      <p className="text-[10px] text-muted mt-1">{news.source}</p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </Section>
      )}

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
          <div className="space-y-2 font-mono text-[10px]">
            {data.realtimeLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                className={`${
                  log.type === 'warning' ? 'text-warning/70' :
                  log.type === 'error' ? 'text-danger/70' :
                  log.type === 'success' ? 'text-success/70' :
                  'text-accent/50'
                }`}
              >
                <span className="text-muted/40 mr-2">{log.time}</span>
                {log.message}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <BottomNav />
    </PageContainer>
  );
}
