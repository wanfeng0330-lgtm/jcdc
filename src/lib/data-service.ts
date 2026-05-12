// 数据聚合服务 - 无数据库版本，使用假数据展示
// 适用于 Cloudflare Pages 等无服务器部署环境

import { dashboardData } from './mock-data';

// ============================================
// 数据类型定义
// ============================================

export interface DashboardStats {
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
  dataSource: 'demo';
}

// ============================================
// 获取仪表盘数据（假数据）
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return {
    ...dashboardData,
    realtimeLogs: [
      { time: timeStr, message: '> UCAE 统一认知分析引擎运行中', type: 'info' },
      { time: timeStr, message: '> 文本分析完成 - 高风险', type: 'warning' },
      { time: timeStr, message: '> 图片检测完成 - 低风险', type: 'success' },
      { time: timeStr, message: '> 音频鉴定完成 - 中风险', type: 'warning' },
      { time: timeStr, message: '> AI拟声特征检测触发', type: 'error' },
      { time: timeStr, message: '> 情绪操控分析模块就绪', type: 'success' },
      { time: timeStr, message: '> 数据中心实时监控中', type: 'info' },
    ],
    latestNews: [
      { title: '公安部通报：AI拟声诈骗案同比上升120%', url: '#', source: '新华社', publishedAt: '2025-05-12' },
      { title: '深度伪造技术滥用，多地公安机关发布预警', url: '#', source: '央视新闻', publishedAt: '2025-05-11' },
      { title: 'AI换脸诈骗新手法：视频通话也能造假', url: '#', source: '人民网', publishedAt: '2025-05-10' },
      { title: '网信办：加强AI生成内容标识管理', url: '#', source: '人民日报', publishedAt: '2025-05-09' },
      { title: '高校研究：六成受访者无法分辨AI生成新闻', url: '#', source: '中国科学报', publishedAt: '2025-05-08' },
    ],
    dataSource: 'demo',
  };
}

// 分析结果记录 - 无数据库版本（空操作）
export async function recordAnalysis(_data: {
  type: string;
  riskLevel: string;
  riskScore: number;
  isAIGenerated: boolean;
  riskTypes: string[];
  source: string;
}): Promise<void> {
  // 无数据库，不记录
}

// 实验室结果记录 - 无数据库版本（空操作）
export async function recordLabResult(_data: {
  totalQuestions: number;
  correctCount: number;
  overallScore: number;
  level: string;
}): Promise<void> {
  // 无数据库，不记录
}

// 新闻抓取与缓存 - 无数据库版本（空操作）
export async function fetchAndCacheNews(): Promise<number> {
  return 0;
}
