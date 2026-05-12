import { NextResponse } from 'next/server';

export async function GET() {
  // 返回仪表盘模拟数据
  const data = {
    todayChecks: 12847,
    aiRiskRatio: 34.7,
    highFreqScams: [
      { name: 'AI拟声诈骗', count: 3256, trend: 12.5 },
      { name: 'AI换脸诈骗', count: 2187, trend: 8.3 },
      { name: 'AI新闻伪造', count: 1890, trend: 15.2 },
      { name: '情绪操控信息', count: 1654, trend: -3.1 },
      { name: '身份伪造', count: 1234, trend: 6.8 },
    ],
    userMisjudgeRate: 28.3,
    aiDetectionRate: 92.1,
    weeklyTrend: [
      { day: '周一', checks: 1820, risks: 620 },
      { day: '周二', checks: 1950, risks: 710 },
      { day: '周三', checks: 2100, risks: 780 },
      { day: '周四', checks: 1890, risks: 650 },
      { day: '周五', checks: 2050, risks: 750 },
      { day: '周六', checks: 1650, risks: 580 },
      { day: '周日', checks: 1387, risks: 520 },
    ],
    riskTypeDistribution: [
      { name: 'AI拟声', value: 35 },
      { name: 'AI换脸', value: 25 },
      { name: 'AI新闻', value: 20 },
      { name: '情绪操控', value: 12 },
      { name: '身份伪造', value: 8 },
    ],
  };

  return NextResponse.json({ success: true, data });
}
