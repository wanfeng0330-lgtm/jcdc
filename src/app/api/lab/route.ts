import { NextResponse } from 'next/server';
import { chatCompletion, LAB_SYSTEM_PROMPT } from '@/lib/ai';
import { recordLabResult } from '@/lib/data-service';

// 强制动态渲染 - 数据库操作需要运行时环境
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, totalQuestions, correctCount } = body;

    const aiResponse = await chatCompletion({
      messages: [
        { role: 'system', content: LAB_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `用户完成了AI媒介素养测试，共${totalQuestions}题，答对${correctCount}题。答题详情：${JSON.stringify(answers)}。请评估用户的AI免疫力并给出风险认知画像。`,
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        // 记录实验室结果到数据库
        recordLabResult({
          totalQuestions: totalQuestions || 0,
          correctCount: correctCount || 0,
          overallScore: result.overallScore || 0,
          level: result.level || '中级',
        }).catch((err) => {
          console.error('Failed to record lab result:', err);
        });

        return NextResponse.json({ success: true, data: result, source: 'ai' });
      }
    } catch {
      // parse failed, return calculated result
    }

    // Fallback: calculate based on score
    const score = Math.round((correctCount / totalQuestions) * 100);
    const level = score >= 90 ? '专家' : score >= 75 ? '高级' : score >= 60 ? '中级' : score >= 40 ? '初级' : '新手';
    const levelDesc = score >= 90 ? '你具有极强的AI风险识别能力' : score >= 75 ? '你的AI风险识别能力较强' : score >= 60 ? '你的AI风险识别能力中等' : score >= 40 ? '你需要提高AI风险识别能力' : '你容易被AI生成内容欺骗';

    // 记录实验室结果到数据库
    recordLabResult({
      totalQuestions: totalQuestions || 0,
      correctCount: correctCount || 0,
      overallScore: score,
      level,
    }).catch((err) => {
      console.error('Failed to record lab result:', err);
    });

    return NextResponse.json({
      success: true,
      data: {
        overallScore: score,
        level,
        levelDesc,
        weaknesses: ['情绪型诈骗识别能力不足', '对权威伪装的抵抗力较弱'],
        strengths: ['对明显骗局有一定警觉', '愿意核实信息来源'],
        riskProfile: [
          { type: 'AI拟声识别', score: Math.min(score + 10, 100) },
          { type: 'AI换脸识别', score: Math.min(score + 5, 100) },
          { type: '情绪操控防御', score: Math.max(score - 15, 10) },
          { type: '身份信任验证', score: Math.max(score - 10, 10) },
          { type: '传播诱导防御', score: Math.min(score, 100) },
        ],
      },
      source: 'calculated',
    });
  } catch (error) {
    console.error('Lab evaluate API error:', error);
    return NextResponse.json(
      { success: false, error: '评估失败' },
      { status: 500 }
    );
  }
}
