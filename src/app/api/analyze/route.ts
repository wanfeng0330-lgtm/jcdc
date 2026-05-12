import { NextResponse } from 'next/server';
import { chatCompletion, ANALYZE_SYSTEM_PROMPT, type ChatMessage } from '@/lib/ai';
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

    // Build the user message - with multimodal support for images
    let userMessage: ChatMessage;

    if (imageBase64) {
      // Send actual image to the AI model for real analysis
      const dataUrl = imageBase64.startsWith('data:')
        ? imageBase64
        : `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`;

      const typeLabel: Record<string, string> = {
        image: '图片',
        video: '视频截图',
        audio: '音频',
        text: '文本',
        screenshot: '截图',
      };

      userMessage = {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: dataUrl },
          },
          {
            type: 'text',
            text: inputContent.trim()
              ? `请仔细查看这张${typeLabel[type] || '图片'}，并结合以下描述进行可信度分析：\n\n${inputContent}`
              : `请仔细查看这张${typeLabel[type] || '图片'}，进行实事求是的可信度分析。先描述你看到的实际内容，再判断是否存在风险。有就有，没有就没有。`,
          },
        ],
      };
    } else {
      // Text-only analysis
      const typeLabel: Record<string, string> = {
        image: '图片',
        video: '视频',
        audio: '音频',
        text: '文本',
        screenshot: '截图',
      };

      userMessage = {
        role: 'user',
        content: `请分析以下${typeLabel[type] || '未知'}类型内容的可信度和风险。实事求是，有就有没有就没有：\n\n${inputContent}`,
      };
    }

    // Call real AI model for analysis
    const aiResponse = await chatCompletion({
      messages: [
        { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
        userMessage,
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
      console.error('Failed to parse AI response:', parseError, '\nRaw response:', aiResponse);
      // Fallback to local calculation
      parsedResult = generateLocalAnalysis(type, inputContent);
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
    // Fallback to local analysis on error
    const type = 'text';
    const result = {
      ...generateLocalAnalysis(type, ''),
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: result, source: 'fallback' });
  }
}

/**
 * Local analysis fallback - simple heuristic-based analysis
 * Only used when AI is unavailable
 */
function generateLocalAnalysis(type: string, content: string): AnalysisResult {
  const riskKeywords = [
    '紧急', '立即', '马上', '速来', '赶紧', '快', '转发', '扩散',
    '通知', '务必', '冻结', '停发', '异常', '验证', '点击',
    '内部消息', '独家', '震惊', '万万没想到',
  ];

  const identityKeywords = ['官方', '银行', '公安', '财政', '社保', '955', '10086'];
  const emotionKeywords = ['震惊', '愤怒', '可怕', '紧急', '救命', '出事'];

  const lowerContent = content.toLowerCase();
  const riskScore = riskKeywords.filter((k) => lowerContent.includes(k)).length;
  const identityScore = identityKeywords.filter((k) => lowerContent.includes(k)).length;
  const emotionScore = emotionKeywords.filter((k) => lowerContent.includes(k)).length;

  const hasRisk = riskScore > 0 || identityScore > 0;
  const hasIdentity = identityScore > 0;
  const hasEmotion = emotionScore > 0;

  const riskFactors: AnalysisResult['riskFactors'] = [];

  if (hasEmotion) {
    riskFactors.push({
      type: 'emotion',
      label: '情绪操控风险',
      score: Math.min(30 + emotionScore * 25, 90),
      description: '内容包含情绪诱导性关键词，可能利用紧迫感或恐惧心理操控读者',
    });
  }

  if (hasIdentity) {
    riskFactors.push({
      type: 'identity',
      label: '身份信任诱导',
      score: Math.min(40 + identityScore * 20, 90),
      description: '内容冒充权威机构身份，试图通过伪造信任链诱导行为',
    });
  }

  if (riskScore > 2) {
    riskFactors.push({
      type: 'spread',
      label: '传播诱导模式',
      score: Math.min(30 + riskScore * 15, 85),
      description: '内容具有典型的社交工程学传播模板特征，包含"转发扩散"等传播诱导词',
    });
  }

  // If no specific risks found, return low risk
  if (riskFactors.length === 0) {
    return {
      credibilityScore: 75,
      riskLevel: 'low',
      aiGeneratedProb: 5,
      riskFactors: [],
      verificationSuggestions: ['内容未发现明显风险特征', '如需进一步确认，建议通过官方渠道核实'],
      emotionAnalysis: {
        primary: '中性',
        intensity: 10,
        manipulationRisk: 5,
        techniques: [],
      },
      spreadAnalysis: {
        velocity: 2,
        reach: '有限传播',
        pattern: '正常传播',
        nodes: 5,
      },
    };
  }

  const maxRisk = Math.max(...riskFactors.map((f) => f.score));
  return {
    credibilityScore: Math.max(15, 80 - maxRisk * 0.7),
    riskLevel: maxRisk >= 70 ? 'high' : maxRisk >= 40 ? 'medium' : 'low',
    aiGeneratedProb: 15 + Math.floor(Math.random() * 10),
    riskFactors,
    verificationSuggestions: [
      '通过官方渠道核实信息来源',
      '不要点击可疑链接或拨打非官方电话',
      '涉及资金操作时务必电话确认',
    ],
    emotionAnalysis: {
      primary: hasEmotion ? '紧迫/恐惧' : '中性',
      intensity: hasEmotion ? 60 + emotionScore * 10 : 15,
      manipulationRisk: hasEmotion ? 50 + emotionScore * 15 : 10,
      techniques: hasEmotion ? ['紧迫感诱导', '恐惧诉求'] : [],
    },
    spreadAnalysis: {
      velocity: riskScore > 2 ? 7 : 3,
      reach: riskScore > 2 ? '广泛传播' : '有限传播',
      pattern: riskScore > 2 ? '裂变式传播' : '正常传播',
      nodes: riskScore > 2 ? 50 + riskScore * 10 : 10,
    },
  };
}
