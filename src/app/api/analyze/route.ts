import { NextResponse } from 'next/server';
import { runFullPipeline } from '@/lib/pipeline';
import { mockAnalysisResult } from '@/lib/mock-data';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content, text, imageBase64, mimeType } = body;
    const inputContent = content || text || '';

    if (!inputContent.trim() && !imageBase64) {
      return NextResponse.json(
        { success: false, error: '请提供待分析的内容' },
        { status: 400 }
      );
    }

    // UCAE 统一认知分析引擎:
    // Phase 1: 感知 - AI分析图片，提取文字/声明
    // Phase 2: 检索 - 联网搜索相关内容
    // Phase 3: 验证 - AI对比搜索结果进行验证
    const result = await runFullPipeline(type, imageBase64, inputContent, mimeType);

    const finalResult = {
      ...result,
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: finalResult, source: 'ai' });
  } catch (error) {
    console.error('Analyze API error:', error);
    const result = {
      ...mockAnalysisResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result, source: 'fallback' });
  }
}
