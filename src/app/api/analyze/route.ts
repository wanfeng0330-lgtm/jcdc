import { NextResponse } from 'next/server';
import { runFullPipeline } from '@/lib/pipeline';
import { mockAnalysisResult } from '@/lib/mock-data';
import { recordAnalysis } from '@/lib/data-service';

// 强制动态渲染 - 数据库操作需要运行时环境
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content, text, imageBase64, mimeType } = body;
    const inputContent = content || text || '';

    // If no content provided at all, return error
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

    // 将分析结果存入数据库（异步，不阻塞响应）
    recordAnalysis({
      type: type || 'text',
      riskLevel: finalResult.multiSignalRisk?.overallRiskLevel || finalResult.riskLevel || 'low',
      riskScore: finalResult.multiSignalRisk?.overallRiskScore || (100 - finalResult.credibilityScore),
      isAIGenerated: (finalResult.aiGeneratedProb || 0) > 0.5,
      riskTypes: (finalResult.riskFactors || []).map(f => f.type),
      source: 'ai',
    }).catch((err) => {
      console.error('Failed to record analysis:', err);
    });

    return NextResponse.json({ success: true, data: finalResult, source: 'ai' });
  } catch (error) {
    console.error('Analyze API error:', error);
    // Fallback to local analysis on error
    const result = {
      ...mockAnalysisResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    // 即使是 fallback 结果也记录
    recordAnalysis({
      type: 'text',
      riskLevel: result.riskLevel || 'low',
      riskScore: 100 - result.credibilityScore,
      isAIGenerated: (result.aiGeneratedProb || 0) > 0.5,
      riskTypes: (result.riskFactors || []).map(f => f.type),
      source: 'fallback',
    }).catch((err) => {
      console.error('Failed to record fallback analysis:', err);
    });

    return NextResponse.json({ success: true, data: result, source: 'fallback' });
  }
}
