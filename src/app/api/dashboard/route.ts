import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await getDashboardStats();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}

// 强制动态渲染 - 确保每次请求都获取最新数据
export const dynamic = 'force-dynamic';
