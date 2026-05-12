// UCAE 统一认知分析引擎 (Unified Cognitive Analysis Engine)
// 流程: 内容感知 → 关键词提取 → 联网检索 → 图片对比 → 来源验证 → 综合研判

import { chatCompletion, ANALYZE_SYSTEM_PROMPT, type ChatMessage } from './ai';
import { webSearch, newsSearch, generateSearchQueries, downloadImageAsBase64, type SearchResponse } from './search';
import type { AnalysisResult, VerificationResult, RelatedSource, ImageComparisonResult, ImageComparison, MultiSignalRisk, RiskSignal, SignalSeverity } from './mock-data';

/**
 * Phase 1: AI感知 - 分析图片内容并提取文字/声明
 * Returns the raw AI analysis + extracted text for searching
 */
export async function step1_analyzeContent(
  type: string,
  imageBase64?: string,
  textContent?: string,
  mimeType?: string
): Promise<{ analysis: AnalysisResult; extractedText: string; imageDescription: string }> {
  // Build the user message for content analysis
  let userMessage: ChatMessage;

  // Phase 1 prompt: First analyze the image, extract text, describe what you see
  const step1SystemPrompt = `你是"UCAE统一认知分析引擎"的感知模块。你的任务是：
1. 仔细分析用户上传的内容（图片或文本）
2. 如果是图片：描述图片中的所有文字、场景、人物、物体
3. 如果是文本：提取关键声明和主张
4. 初步判断内容是否存在可疑之处

你必须以JSON格式返回，格式如下：
{
  "extractedText": "从图片中OCR识别或从文本中提取的关键文字内容",
  "imageDescription": "对图片内容的客观描述（文本类型则为空字符串）",
  "preliminaryAssessment": {
    "credibilityScore": <0-100>,
    "riskLevel": "<low|medium|high>",
    "aiGeneratedProb": <0-100>,
    "riskFactors": [
      {
        "type": "<emotion|identity|title|voice|deepfake|spread>",
        "label": "<具体风险名称>",
        "score": <0-100>,
        "description": "<基于具体内容的详细解释>"
      }
    ],
    "verificationSuggestions": ["<建议>"],
    "emotionAnalysis": {
      "primary": "<主要情绪>",
      "intensity": <0-100>,
      "manipulationRisk": <0-100>,
      "techniques": ["<手法>"]
    },
    "spreadAnalysis": {
      "velocity": <1-10>,
      "reach": "<扩散范围>",
      "pattern": "<传播模式>",
      "nodes": <影响节点数>
    }
  }
}

原则：
- 先检测再分析，有就有没有就没有
- 图片中的文字必须完整提取
- extractedText是后续联网搜索的关键输入，要包含所有可搜索的关键词和声明`;

  if (imageBase64) {
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
        { type: 'image_url', image_url: { url: dataUrl } },
        {
          type: 'text',
          text: textContent?.trim()
            ? `请仔细查看这张${typeLabel[type] || '图片'}，提取所有文字内容并分析：\n\n${textContent}`
            : `请仔细查看这张${typeLabel[type] || '图片'}，提取所有文字内容并客观分析。`,
        },
      ],
    };
  } else {
    userMessage = {
      role: 'user',
      content: `请分析以下文本内容，提取关键声明：\n\n${textContent}`,
    };
  }

  const aiResponse = await chatCompletion({
    messages: [
      { role: 'system', content: step1SystemPrompt },
      userMessage,
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        analysis: {
          ...parsed.preliminaryAssessment,
          id: undefined,
          type: undefined,
          timestamp: undefined,
        } as AnalysisResult,
        extractedText: parsed.extractedText || textContent || '',
        imageDescription: parsed.imageDescription || '',
      };
    }
  } catch (e) {
    console.error('Phase 1 parse error:', e);
  }

  // Fallback
  return {
    analysis: {
      credibilityScore: 50,
      riskLevel: 'medium',
      aiGeneratedProb: 10,
      riskFactors: [],
      verificationSuggestions: ['建议通过官方渠道核实'],
      emotionAnalysis: { primary: '中性', intensity: 10, manipulationRisk: 5, techniques: [] },
      spreadAnalysis: { velocity: 3, reach: '有限', pattern: '正常', nodes: 10 },
    },
    extractedText: textContent || '',
    imageDescription: '',
  };
}

/**
 * Phase 2: 联网检索 - 搜索相关内容
 * Uses extracted keywords and claims from Phase 1
 */
export async function step2_webSearch(
  contentType: string,
  extractedText: string,
  imageDescription: string,
  hasImage: boolean
): Promise<{ searchResults: SearchResponse; newsResults: SearchResponse; searchQueries: string[] }> {
  // Generate search queries from extracted text
  const searchQueries = generateSearchQueries(contentType, extractedText, imageDescription);

  if (searchQueries.length === 0) {
    return {
      searchResults: { query: '', results: [] },
      newsResults: { query: '', results: [] },
      searchQueries: [],
    };
  }

  // Search with the first query (most relevant), include images if user uploaded an image
  const primaryQuery = searchQueries[0];
  const searchResults = await webSearch(primaryQuery, {
    maxResults: 5,
    searchDepth: 'advanced',
    includeAnswer: true,
    includeImages: hasImage, // Only request images when user uploaded an image
  });

  // Also search for news/timeline
  let newsResults: SearchResponse = { query: '', results: [] };
  if (searchQueries.length > 1) {
    newsResults = await newsSearch(searchQueries[1], { maxResults: 3 });
  }

  return { searchResults, newsResults, searchQueries };
}

/**
 * Phase 2.5: 图片视觉对比 - 下载搜索到的图片，用AI对比
 * 将用户原图与搜索到的网络图片进行视觉对比
 */
export async function step2_5_imageComparison(
  userImageBase64: string,
  searchImages: string[],
  searchResults: SearchResponse
): Promise<ImageComparisonResult | undefined> {
  if (!searchImages || searchImages.length === 0) {
    return undefined;
  }

  // Download up to 3 images for comparison (to limit API cost)
  const imagesToCompare: { url: string; base64: string; sourceTitle: string; sourceUrl: string }[] = [];

  for (const imgUrl of searchImages.slice(0, 3)) {
    const base64 = await downloadImageAsBase64(imgUrl);
    if (base64) {
      // Find the corresponding search result for source info
      const matchingResult = searchResults.results.find(r => imgUrl.includes(new URL(r.url).hostname) || r.url === imgUrl);
      imagesToCompare.push({
        url: imgUrl,
        base64,
        sourceTitle: matchingResult?.title || '网络来源',
        sourceUrl: matchingResult?.url || imgUrl,
      });
    }
  }

  if (imagesToCompare.length === 0) {
    return {
      hasComparisonImages: false,
      comparisons: [],
      comparisonSummary: '搜索到的图片无法下载进行对比。',
    };
  }

  // Prepare the multi-image comparison prompt
  const comparisonPrompt = `你是"UCAE统一认知分析引擎"的视觉对比模块。用户上传了一张图片，我们通过网络搜索找到了可能相关的图片。请对比用户上传的图片和每张网络图片，判断它们的关系。

关系类型：
- same_image: 完全相同的图片（可能是转载）
- same_scene: 同一场景/事件的不同照片
- edited_version: 经过编辑/裁剪/滤镜处理的版本
- similar_content: 主题相似但内容不同
- unrelated: 完全无关

你必须以JSON格式返回：
{
  "comparisons": [
    {
      "visualSimilarity": <0-100的相似度>,
      "relationship": "<关系类型>",
      "differenceDescription": "<描述具体差异，如裁剪区域、滤镜效果、添加的文字等>"
    }
  ],
  "comparisonSummary": "<100字以内的综合对比结论>"
}`;

  // Build message with user image + all comparison images
  const contentParts: { type: string; text?: string; image_url?: { url: string } }[] = [
    {
      type: 'text',
      text: `第一张是用户上传的原始图片，后面${imagesToCompare.length}张是通过网络搜索找到的相关图片。请逐一对比。`,
    },
  ];

  // Add user image
  const userDataUrl = userImageBase64.startsWith('data:')
    ? userImageBase64
    : `data:image/jpeg;base64,${userImageBase64}`;
  contentParts.push({ type: 'image_url', image_url: { url: userDataUrl } });

  // Add comparison images with labels
  imagesToCompare.forEach((img, i) => {
    contentParts.push({
      type: 'text',
      text: `--- 网络图片 ${i + 1}（来源：${img.sourceTitle}）---`,
    });
    contentParts.push({ type: 'image_url', image_url: { url: img.base64 } });
  });

  const aiResponse = await chatCompletion({
    messages: [
      { role: 'system', content: comparisonPrompt },
      { role: 'user', content: contentParts as ChatMessage['content'] },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  });

  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const comparisons: ImageComparison[] = imagesToCompare.map((img, i) => ({
        imageUrl: img.url,
        sourceTitle: img.sourceTitle,
        sourceUrl: img.sourceUrl,
        visualSimilarity: parsed.comparisons?.[i]?.visualSimilarity ?? 0,
        relationship: parsed.comparisons?.[i]?.relationship ?? 'unrelated',
        differenceDescription: parsed.comparisons?.[i]?.differenceDescription ?? '无法对比',
      }));

      return {
        hasComparisonImages: true,
        comparisons,
        comparisonSummary: parsed.comparisonSummary || '图片对比完成，请查看详细结果。',
      };
    }
  } catch (e) {
    console.error('Phase 2.5 parse error:', e);
  }

  // Fallback - still return the downloaded images with basic info
  return {
    hasComparisonImages: true,
    comparisons: imagesToCompare.map((img) => ({
      imageUrl: img.url,
      sourceTitle: img.sourceTitle,
      sourceUrl: img.sourceUrl,
      visualSimilarity: 0,
      relationship: 'unrelated' as const,
      differenceDescription: 'AI对比失败，请手动对比',
    })),
    comparisonSummary: 'AI视觉对比模块异常，已返回搜索到的图片供参考。',
  };
}

/**
 * Phase 3: 验证 - AI对比搜索结果与原始内容
 * Determines: source, timeline, out-of-context, misleading, old news
 */
export async function step3_verifyWithSearchResults(
  extractedText: string,
  imageDescription: string,
  searchResults: SearchResponse,
  newsResults: SearchResponse,
  preliminaryAnalysis: AnalysisResult
): Promise<VerificationResult> {
  const verifySystemPrompt = `你是"UCAE统一认知分析引擎"的验证模块。你的任务是根据联网搜索结果，验证用户提交内容的真实性。

你需要判断：
1. **原始来源**：这条信息最早来自哪里？有没有官方来源？
2. **首次发布时间**：原始信息是什么时候发布的？
3. **旧闻翻炒**：是否把旧新闻重新包装传播？如果是，原始事件是什么时候的？
4. **断章取义**：是否截取了原始内容的一部分，歪曲了原意？
5. **误导传播**：是否在传播过程中被篡改或误导？

**原则**：
- 基于搜索结果中的事实判断，搜索结果中没有的不编造
- 如果搜索结果不包含相关信息，明确说明"未找到相关搜索结果"
- 有就有，没有就没有，实事求是
- 如果搜索结果确认内容属实，就说明属实
- 如果搜索结果发现辟谣信息，要明确指出

返回JSON格式：
{
  "originalSource": "<原始来源，如'某市公安局官网'，未找到则为null>",
  "originalUrl": "<原始链接，未找到则为null>",
  "firstPublishedDate": "<首次发布时间，如'2024-03-15'，未知则为null>",
  "isOldNewsRecycled": <true/false>,
  "oldNewsOriginalDate": "<原始事件日期，如果不是旧闻则为null>",
  "isOutOfContext": <true/false>,
  "contextExplanation": "<如果断章取义，解释原始语境；否则为null>",
  "hasMisleadingSpread": <true/false>,
  "misleadingExplanation": "<如果存在误导，解释如何被误导；否则为null>",
  "relatedSources": [
    {
      "title": "<来源标题>",
      "url": "<来源URL>",
      "snippet": "<来源摘要>",
      "publishedDate": "<发布日期>",
      "isDebunked": <是否是辟谣信息>
    }
  ],
  "aiSummary": "<综合判断：100字以内的简要结论>"
}`;

  // Build search context
  const searchContext = `
## 待验证内容
${extractedText || '（图片内容，描述如下）'}
${imageDescription ? `图片描述：${imageDescription}` : ''}

## 搜索结果
${searchResults.results.length > 0 ? searchResults.results.map((r, i) => `${i + 1}. [${r.title}](${r.url})
   ${r.content}
   ${r.publishedDate ? `发布日期：${r.publishedDate}` : ''}`).join('\n\n') : '未找到相关搜索结果'}

${searchResults.answer ? `## 搜索摘要\n${searchResults.answer}` : ''}

## 新闻搜索结果
${newsResults.results.length > 0 ? newsResults.results.map((r, i) => `${i + 1}. [${r.title}](${r.url})
   ${r.content}
   ${r.publishedDate ? `发布日期：${r.publishedDate}` : ''}`).join('\n\n') : '未找到相关新闻'}

## 初步AI分析
- 可信度评分：${preliminaryAnalysis.credibilityScore}
- 风险等级：${preliminaryAnalysis.riskLevel}
- AI生成概率：${preliminaryAnalysis.aiGeneratedProb}%
`;

  const aiResponse = await chatCompletion({
    messages: [
      { role: 'system', content: verifySystemPrompt },
      { role: 'user', content: searchContext },
    ],
    temperature: 0.2,
    max_tokens: 3000,
  });

  try {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as VerificationResult;
    }
  } catch (e) {
    console.error('Phase 3 parse error:', e);
  }

  // Fallback verification result
  const hasSearchResults = searchResults.results.length > 0 || newsResults.results.length > 0;
  return {
    originalSource: null,
    originalUrl: null,
    firstPublishedDate: null,
    isOldNewsRecycled: false,
    isOutOfContext: false,
    hasMisleadingSpread: false,
    relatedSources: [
      ...searchResults.results.slice(0, 3).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 200),
        publishedDate: r.publishedDate,
        isDebunked: false,
      })),
      ...newsResults.results.slice(0, 2).map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.slice(0, 200),
        publishedDate: r.publishedDate,
        isDebunked: false,
      })),
    ],
    aiSummary: hasSearchResults
      ? '已联网搜索相关内容，但未能明确验证。请参考相关来源自行判断。'
      : '未找到相关搜索结果，无法通过联网验证。建议通过官方渠道核实。',
  };
}

/**
 * Phase 4: 多信号风险聚合 - 将所有分析阶段的信号综合为多信号风险矩阵
 * 整合感知(Phase1) + 检索(Phase2) + 对比(Phase2.5) + 验证(Phase3) 的信号
 */
export function aggregateMultiSignalRisk(
  analysis: AnalysisResult,
  verification?: VerificationResult
): MultiSignalRisk {
  const signals: RiskSignal[] = [];

  // ---- 1. 视觉信号：AI纹理异常 ----
  const aiProb = analysis.aiGeneratedProb;
  const deepfakeFactor = analysis.riskFactors.find(f => f.type === 'deepfake');
  const hasEditedVersion = verification?.imageComparison?.comparisons.some(c => c.relationship === 'edited_version');

  signals.push({
    id: 'ai_texture',
    name: 'AI纹理异常',
    icon: '🔍',
    category: 'visual',
    detected: aiProb > 30 || !!deepfakeFactor || !!hasEditedVersion,
    severity: aiProb > 70 ? 'strong' : aiProb > 40 ? 'medium' : aiProb > 20 ? 'weak' : 'none',
    severityScore: aiProb,
    evidence: aiProb > 70
      ? `AI生成概率${aiProb}%，高度疑似AI生成内容`
      : aiProb > 40
      ? `AI生成概率${aiProb}%，存在一定AI痕迹`
      : aiProb > 20
      ? `AI生成概率${aiProb}%，有轻微AI特征`
      : `AI生成概率${aiProb}%，未检测到明显AI纹理异常`,
    source: 'perception',
  });

  // ---- 2. 情感信号：情绪诱导 ----
  const emotionFactor = analysis.riskFactors.find(f => f.type === 'emotion');
  const manipulationRisk = analysis.emotionAnalysis.manipulationRisk;
  const hasEmotionTechniques = analysis.emotionAnalysis.techniques.length > 0;

  signals.push({
    id: 'emotion_manipulation',
    name: '情绪诱导',
    icon: '🎭',
    category: 'emotion',
    detected: manipulationRisk > 20 || hasEmotionTechniques || !!emotionFactor,
    severity: manipulationRisk > 60 ? 'strong' : manipulationRisk > 35 ? 'medium' : manipulationRisk > 15 ? 'weak' : 'none',
    severityScore: manipulationRisk,
    evidence: manipulationRisk > 60
      ? `强情绪诱导（${manipulationRisk}%），操控手法：${analysis.emotionAnalysis.techniques.join('、') || '恐惧诉求'}`
      : manipulationRisk > 35
      ? `中等情绪诱导（${manipulationRisk}%），主要情绪：${analysis.emotionAnalysis.primary}`
      : manipulationRisk > 15
      ? `轻微情绪诱导倾向（${manipulationRisk}%）`
      : `未检测到明显情绪诱导（${manipulationRisk}%）`,
    source: 'perception',
  });

  // ---- 3. 来源信号：来源不明 ----
  const noOriginalSource = verification && !verification.originalSource;
  const identityFactor = analysis.riskFactors.find(f => f.type === 'identity');

  signals.push({
    id: 'unknown_source',
    name: '来源不明',
    icon: '❓',
    category: 'source',
    detected: !!noOriginalSource || !!identityFactor,
    severity: (noOriginalSource && identityFactor) ? 'strong' : (noOriginalSource || identityFactor) ? 'medium' : 'none',
    severityScore: (noOriginalSource && identityFactor) ? 80 : noOriginalSource ? 55 : identityFactor ? 50 : 5,
    evidence: verification
      ? (noOriginalSource
        ? (identityFactor ? '未找到原始来源，且存在身份冒充' : '联网搜索未找到可追溯的原始来源')
        : `来源可追溯：${verification.originalSource}`)
      : (identityFactor ? '内容中存在身份信任诱导，来源存疑' : '未进行联网搜索，无法判断来源'),
    source: verification ? 'verification' : 'perception',
  });

  // ---- 4. 传播信号：传播异常 ----
  const spreadFactor = analysis.riskFactors.find(f => f.type === 'spread');
  const hasMisleading = verification?.hasMisleadingSpread;
  const highVelocity = analysis.spreadAnalysis.velocity > 6;

  signals.push({
    id: 'spread_anomaly',
    name: '传播异常',
    icon: '🔄',
    category: 'spread',
    detected: !!spreadFactor || !!hasMisleading || highVelocity,
    severity: (hasMisleading && highVelocity) ? 'strong' : (hasMisleading || highVelocity || !!spreadFactor) ? 'medium' : 'none',
    severityScore: (hasMisleading && highVelocity) ? 85 : hasMisleading ? 65 : highVelocity ? 55 : spreadFactor ? 45 : 5,
    evidence: hasMisleading
      ? `检测到误导传播：${verification?.misleadingExplanation || '内容在传播中被篡改或误导'}`
      : highVelocity
      ? `传播速度异常（${analysis.spreadAnalysis.velocity}/10），模式：${analysis.spreadAnalysis.pattern}`
      : spreadFactor
      ? '内容结构符合传播诱导模板'
      : '传播模式正常，未发现异常',
    source: verification ? 'verification' : 'perception',
  });

  // ---- 5. 标题信号：标题夸张 ----
  const titleFactor = analysis.riskFactors.find(f => f.type === 'title');

  signals.push({
    id: 'headline_exaggeration',
    name: '标题夸张',
    icon: '📰',
    category: 'headline',
    detected: !!titleFactor,
    severity: titleFactor ? (titleFactor.score > 70 ? 'strong' : titleFactor.score > 40 ? 'medium' : 'weak') : 'none',
    severityScore: titleFactor?.score || 5,
    evidence: titleFactor
      ? titleFactor.description
      : '标题表述正常，未发现夸张特征',
    source: 'perception',
  });

  // ---- 6. 时间线信号：时间线矛盾 ----
  const isOldNews = verification?.isOldNewsRecycled;
  const isOutOfContext = verification?.isOutOfContext;
  const timelineContradiction = isOldNews || isOutOfContext;

  signals.push({
    id: 'timeline_contradiction',
    name: '时间线矛盾',
    icon: '⏳',
    category: 'timeline',
    detected: !!timelineContradiction,
    severity: (isOldNews && isOutOfContext) ? 'strong' : timelineContradiction ? 'medium' : 'none',
    severityScore: (isOldNews && isOutOfContext) ? 85 : isOldNews ? 65 : isOutOfContext ? 60 : 5,
    evidence: isOldNews
      ? `旧闻翻炒：原始事件日期为${verification?.oldNewsOriginalDate || '未知'}${isOutOfContext ? '，且断章取义' : ''}`
      : isOutOfContext
      ? `断章取义：${verification?.contextExplanation || '内容脱离原始语境'}`
      : '时间线正常，未发现矛盾',
    source: 'verification',
  });

  // ---- 计算分类汇总 ----
  const categories = ['visual', 'emotion', 'source', 'spread', 'headline', 'timeline'] as const;

  const categorySummary = Object.fromEntries(
    categories.map(cat => {
      const catSignals = signals.filter(s => s.category === cat);
      const detected = catSignals.some(s => s.detected);
      const maxScore = Math.max(...catSignals.map(s => s.severityScore));
      const maxSeverity: SignalSeverity = maxScore > 65 ? 'strong' : maxScore > 40 ? 'medium' : maxScore > 15 ? 'weak' : 'none';
      return [cat, { detected, maxSeverity, score: maxScore }];
    })
  ) as MultiSignalRisk['categorySummary'];

  // ---- 计算综合风险 ----
  const detectedCount = signals.filter(s => s.detected).length;
  const strongCount = signals.filter(s => s.severity === 'strong').length;
  const avgScore = Math.round(signals.reduce((sum, s) => sum + s.severityScore, 0) / signals.length);

  let overallRiskLevel: MultiSignalRisk['overallRiskLevel'];
  let overallRiskScore: number;

  if (strongCount >= 3 || avgScore > 65) {
    overallRiskLevel = 'critical';
    overallRiskScore = Math.min(95, Math.round(avgScore * 1.2));
  } else if (strongCount >= 1 || detectedCount >= 4 || avgScore > 45) {
    overallRiskLevel = 'high';
    overallRiskScore = Math.min(85, Math.round(avgScore * 1.1));
  } else if (detectedCount >= 2 || avgScore > 25) {
    overallRiskLevel = 'medium';
    overallRiskScore = Math.round(avgScore);
  } else if (detectedCount >= 1) {
    overallRiskLevel = 'low';
    overallRiskScore = Math.round(avgScore * 0.8);
  } else {
    overallRiskLevel = 'safe';
    overallRiskScore = Math.max(5, Math.round(avgScore * 0.5));
  }

  // ---- 系统综合分析 ----
  const detectedSignals = signals.filter(s => s.detected);
  const signalNames = detectedSignals.map(s => s.name);
  const strongSignals = signals.filter(s => s.severity === 'strong').map(s => s.name);

  let systemSummary: string;
  if (overallRiskLevel === 'safe') {
    systemSummary = '系统综合分析：所有信号均未触发风险阈值，内容整体安全可信。';
  } else if (overallRiskLevel === 'low') {
    systemSummary = `系统综合分析：触发${signalNames.length}个轻微信号（${signalNames.join('、')}），但风险程度较低，建议保持关注。`;
  } else if (overallRiskLevel === 'medium') {
    systemSummary = `系统综合分析：触发${signalNames.length}个风险信号（${signalNames.join('、')}），存在中等程度风险，建议核实来源。`;
  } else if (overallRiskLevel === 'high') {
    systemSummary = `系统综合分析：触发${signalNames.length}个风险信号，其中${strongSignals.length}个强信号（${strongSignals.join('、')}），风险较高，强烈建议通过官方渠道核实。`;
  } else {
    systemSummary = `⚠️ 系统综合分析：触发${signalNames.length}个风险信号，其中${strongSignals.length}个强信号（${strongSignals.join('、')}），极高风险！多个维度同时异常，极可能是虚假/误导内容。`;
  }

  return {
    signals,
    overallRiskLevel,
    overallRiskScore,
    categorySummary,
    systemSummary,
  };
}

/**
 * UCAE 完整分析流程: 感知 → 检索 → 图片对比 → 验证 → 多信号聚合
 */
export async function runFullPipeline(
  type: string,
  imageBase64?: string,
  textContent?: string,
  mimeType?: string
): Promise<AnalysisResult> {
  // Phase 1: 感知 - Analyze content and extract text
  const { analysis, extractedText, imageDescription } = await step1_analyzeContent(
    type,
    imageBase64,
    textContent,
    mimeType
  );

  // Phase 2: 检索 - Search the web (only if there's extracted text)
  const { searchResults, newsResults, searchQueries } = await step2_webSearch(
    type,
    extractedText,
    imageDescription,
    !!imageBase64
  );

  // Phase 2.5: 图片对比 - Compare with web images (only if user uploaded an image)
  let imageComparison: ImageComparisonResult | undefined;
  if (imageBase64 && searchResults.images && searchResults.images.length > 0) {
    imageComparison = await step2_5_imageComparison(
      imageBase64,
      searchResults.images,
      searchResults
    );
  }

  // Phase 3: 验证 - Verify with search results (only if search found something)
  let verification: VerificationResult | undefined;
  if (searchQueries.length > 0) {
    verification = await step3_verifyWithSearchResults(
      extractedText,
      imageDescription,
      searchResults,
      newsResults,
      analysis
    );

    // Attach image comparison results to verification
    if (imageComparison) {
      verification.imageComparison = imageComparison;
    }

    // Update credibility score based on verification results
    if (verification.isOldNewsRecycled || verification.isOutOfContext || verification.hasMisleadingSpread) {
      // If verified as problematic, reduce credibility
      analysis.credibilityScore = Math.min(analysis.credibilityScore, 35);
      analysis.riskLevel = 'high';
    } else if (verification.originalSource && !verification.hasMisleadingSpread) {
      // If verified with a legitimate source, increase credibility
      analysis.credibilityScore = Math.max(analysis.credibilityScore, 60);
      if (analysis.riskLevel === 'high' && !verification.isOutOfContext) {
        analysis.riskLevel = 'medium';
      }
    }

    // If image comparison found same_image or edited_version, adjust score
    if (imageComparison) {
      const hasSameImage = imageComparison.comparisons.some(c => c.relationship === 'same_image');
      const hasEditedVersion = imageComparison.comparisons.some(c => c.relationship === 'edited_version');
      if (hasEditedVersion) {
        analysis.credibilityScore = Math.min(analysis.credibilityScore, 30);
        analysis.riskLevel = 'high';
      }
      if (hasSameImage) {
        // Same image found online - could be legitimate repost or unauthorized use
        analysis.verificationSuggestions.push('该图片在网络上有相同版本，注意确认原始出处');
      }
    }

    // Check if any search result is a debunking
    const hasDebunked = verification.relatedSources.some((s) => s.isDebunked);
    if (hasDebunked) {
      analysis.credibilityScore = Math.min(analysis.credibilityScore, 20);
      analysis.riskLevel = 'high';
    }
  } else {
    verification = {
      originalSource: null,
      originalUrl: null,
      firstPublishedDate: null,
      isOldNewsRecycled: false,
      isOutOfContext: false,
      hasMisleadingSpread: false,
      relatedSources: [],
      aiSummary: '内容较短或无可提取关键词，未进行联网搜索验证。',
    };
    if (imageComparison) {
      verification.imageComparison = imageComparison;
    }
  }

  // Phase 4: 多信号风险聚合
  const multiSignalRisk = aggregateMultiSignalRisk(analysis, verification);

  return {
    ...analysis,
    verification,
    multiSignalRisk,
  };
}
