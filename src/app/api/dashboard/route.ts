import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data-service';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
