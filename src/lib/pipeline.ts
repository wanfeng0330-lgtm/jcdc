// 多步验证流水线
// Pipeline: 图片分析 → 提取关键词 → 联网搜索 → 对比来源 → 综合判断

import { chatCompletion, ANALYZE_SYSTEM_PROMPT, type ChatMessage } from './ai';
import { webSearch, newsSearch, generateSearchQueries, type SearchResponse } from './search';
import type { AnalysisResult, VerificationResult, RelatedSource } from './mock-data';

/**
 * Step 1: AI analyzes image content and extracts text/claims
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

  // Step 1 prompt: First analyze the image, extract text, describe what you see
  const step1SystemPrompt = `你是"识界AI"内容分析系统。你的任务是：
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
    console.error('Step 1 parse error:', e);
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
 * Step 2: Search the web for related content
 * Uses extracted keywords and claims from Step 1
 */
export async function step2_webSearch(
  contentType: string,
  extractedText: string,
  imageDescription: string
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

  // Search with the first query (most relevant)
  const primaryQuery = searchQueries[0];
  const searchResults = await webSearch(primaryQuery, {
    maxResults: 5,
    searchDepth: 'advanced',
    includeAnswer: true,
  });

  // Also search for news/timeline
  let newsResults: SearchResponse = { query: '', results: [] };
  if (searchQueries.length > 1) {
    newsResults = await newsSearch(searchQueries[1], { maxResults: 3 });
  }

  return { searchResults, newsResults, searchQueries };
}

/**
 * Step 3: AI compares search results with original content
 * Determines: source, timeline, out-of-context, misleading, old news
 */
export async function step3_verifyWithSearchResults(
  extractedText: string,
  imageDescription: string,
  searchResults: SearchResponse,
  newsResults: SearchResponse,
  preliminaryAnalysis: AnalysisResult
): Promise<VerificationResult> {
  const verifySystemPrompt = `你是"识界AI"事实核查系统。你的任务是根据联网搜索结果，验证用户提交内容的真实性。

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
    console.error('Step 3 parse error:', e);
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
 * Full pipeline: Step 1 + Step 2 + Step 3
 */
export async function runFullPipeline(
  type: string,
  imageBase64?: string,
  textContent?: string,
  mimeType?: string
): Promise<AnalysisResult> {
  // Step 1: Analyze content and extract text
  const { analysis, extractedText, imageDescription } = await step1_analyzeContent(
    type,
    imageBase64,
    textContent,
    mimeType
  );

  // Step 2: Search the web (only if there's extracted text)
  const { searchResults, newsResults, searchQueries } = await step2_webSearch(
    type,
    extractedText,
    imageDescription
  );

  // Step 3: Verify with search results (only if search found something)
  let verification: VerificationResult | undefined;
  if (searchQueries.length > 0) {
    verification = await step3_verifyWithSearchResults(
      extractedText,
      imageDescription,
      searchResults,
      newsResults,
      analysis
    );

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
  }

  return {
    ...analysis,
    verification,
  };
}
