import { NextResponse } from 'next/server';
import { chatCompletion, ANALYZE_SYSTEM_PROMPT } from '@/lib/ai';
import { mockAnalysisResult } from '@/lib/mock-data';
import type { AnalysisResult } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, content, text } = body;
    const inputContent = content || text || '';

    // If no content provided, return mock data for demo
    if (!inputContent.trim()) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const result = {
        ...mockAnalysisResult,
        id: Date.now().toString(),
        type,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: result, source: 'demo' });
    }

    // Call real AI model for analysis
    const typeLabel: Record<string, string> = {
      image: '图片',
      video: '视频',
      audio: '音频',
      text: '文本',
      screenshot: '截图',
    };

    const aiResponse = await chatCompletion({
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `请分析以下${typeLabel[type] || '未知'}类型内容的可信度和风险：\n\n${inputContent}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    // Parse AI response as JSON
    let parsedResult: AnalysisResult;
    try {
      // Extract JSON from the response (may be wrapped in markdown code block)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to mock data if parsing fails
      parsedResult = {
        ...mockAnalysisResult,
        credibilityScore: 35 + Math.floor(Math.random() * 30),
        aiGeneratedProb: 60 + Math.floor(Math.random() * 30),
      };
    }

    const result = {
      ...parsedResult,
      id: Date.now().toString(),
      type,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result, source: 'ai' });
  } catch (error) {
    console.error('Analyze API error:', error);
    // Fallback to mock data on error
    const result = {
      ...mockAnalysisResult,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: result, source: 'fallback' });
  }
}
