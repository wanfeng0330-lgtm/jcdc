import { NextResponse } from 'next/server';
import { mockAnalysisResult } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content } = body;

    // 模拟AI分析延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 根据类型返回不同的模拟结果
    const result = {
      ...mockAnalysisResult,
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json(
      { success: false, error: '分析失败，请重试' },
      { status: 500 }
    );
  }
}
