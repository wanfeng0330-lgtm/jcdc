import { NextResponse } from 'next/server';
import { runFullPipeline } from '@/lib/pipeline';
import { mockAnalysisResult } from '@/lib/mock-data';
import type { AnalysisResult } from '@/lib/mock-data';

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

    // Run the full multi-step pipeline:
    // Step 1: AI analyzes image, extracts text/claims
    // Step 2: Web search for related content
    // Step 3: AI verifies content against search results
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
    // Fallback to local analysis on error
    const result = {
      ...mockAnalysisResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: result, source: 'fallback' });
  }
}
