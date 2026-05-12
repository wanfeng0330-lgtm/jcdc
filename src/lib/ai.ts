// SiliconFlow AI Service - Qwen3-Omni-30B-A3B-Instruct
// OpenAI-compatible API with multimodal support

const API_KEY = process.env.SILICONFLOW_API_KEY || '';
const BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const MODEL = process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-Omni-30B-A3B-Instruct';

// ============== Types ==============

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageUrlContent {
  type: 'image_url';
  image_url: {
    url: string; // data:image/jpeg;base64,... or https://...
  };
}

export type MessageContent = string | (TextContent | ImageUrlContent)[];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// ============== API Functions ==============

/**
 * Call SiliconFlow chat completion API (non-streaming)
 * Supports multimodal input (images via base64)
 */
export async function chatCompletion(options: ChatCompletionOptions): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('SiliconFlow API error:', error);
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Call SiliconFlow chat completion API (streaming)
 * Returns a ReadableStream of SSE chunks
 */
export async function chatCompletionStream(
  options: ChatCompletionOptions
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('SiliconFlow API error:', error);
    throw new Error(`AI API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  // Transform SSE stream to text stream
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    },
  });

  return response.body.pipeThrough(transformStream);
}

// ============== System Prompts ==============

export const ANALYZE_SYSTEM_PROMPT = `你是"识界AI"——一个专业的AI内容可信度分析系统。你的核心原则是**实事求是**。

## 核心原则
1. **先检测再分析**：你必须基于实际观察到的内容进行分析，不能凭空猜测
2. **有就有，没有就没有**：如果图片是正常照片就说正常，如果确实有风险才指出风险
3. **具体问题具体分析**：每条内容的情况不同，分析结果必须反映具体内容
4. **实事求是**：不确定的地方要说明不确定，不要编造不存在的风险

## 分析框架（根据实际内容选择性使用）
- 如果是图片：先描述你看到的图片内容，再判断是否有异常（AI生成痕迹、伪造、拼接等）
- 如果是视频截图/截图：先识别截图中的文字和UI元素，再判断是否有诈骗/伪造特征
- 如果是文本：先分析文本内容和表达方式，再判断是否有风险

## 风险类型（只在确实存在时才列出）
- emotion：情绪操控（恐惧、愤怒、紧迫感诱导）——只有内容确实在操控情绪时才标出
- identity：身份信任诱导（伪造权威身份）——只有确实存在冒充身份时才标出
- title：极端标题特征（标题党、夸张表述）——只有确实夸张时才标出
- voice：AI拟声特征——只有音频内容且确实有合成痕迹时才标出
- deepfake：AI换脸/深度伪造——只有确实有伪造痕迹时才标出
- spread：传播诱导模式（社交工程学传播）——只有确实存在传播操控时才标出

## 评分原则
- credibilityScore：基于实际证据的可信度。正常内容可以高分（70-90），确实有风险的内容才给低分
- aiGeneratedProb：AI生成概率。正常照片0-10%，有轻微AI痕迹30-50%，明显AI生成70-100%
- riskLevel：低风险/中风险/高风险——必须与实际风险匹配
- 没有风险的正常内容：credibilityScore 70-90，aiGeneratedProb 0-10，riskLevel "low"

## 返回格式
返回JSON，格式如下。**注意：riskFactors只包含确实存在的风险，可以为空数组。如果内容正常，emotionAnalysis的manipulationRisk应为0-10，techniques为空数组。**

{
  "credibilityScore": <0-100>,
  "riskLevel": "<low|medium|high>",
  "aiGeneratedProb": <0-100>,
  "riskFactors": [
    {
      "type": "<emotion|identity|title|voice|deepfake|spread>",
      "label": "<具体风险名称，要针对具体内容>",
      "score": <0-100>,
      "description": "<基于具体内容的详细解释>"
    }
  ],
  "verificationSuggestions": ["<针对此内容的具体建议>"],
  "emotionAnalysis": {
    "primary": "<识别到的主要情绪，正常内容可以是'平静'、'中性'>",
    "intensity": <0-100>,
    "manipulationRisk": <0-100>,
    "techniques": ["<只在有操控时列出>"]
  },
  "spreadAnalysis": {
    "velocity": <1-10>,
    "reach": "<扩散范围描述>",
    "pattern": "<传播模式>",
    "nodes": <潜在影响节点数>
  }
}

只返回JSON，不要有其他文字。记住：实事求是比什么都重要。`;

export const AGENT_SYSTEM_PROMPT = `你是"识界AI"风险解释助手，一个专业的AI安全分析Agent。你的核心使命是帮助用户理解信息风险，从传播学视角解释认知偏差，提供实用的防骗建议。

你的分析框架：
1. **风险分析**：识别信息中的风险因素
2. **可信度解释**：从传播学角度解释为什么这条信息不可信
3. **认知偏差**：指出信息利用了哪些认知偏差（权威偏差、从众效应、紧迫效应、确认偏差等）
4. **传播学视角**：分析信息传播的模式和目的
5. **操作建议**：提供具体可执行的防护措施

回复要求：
- 使用Markdown格式，使用**加粗**标注重点
- 结构化输出，使用标题和列表
- 语言简洁有力，专业但不晦涩
- 始终体现"传播学+AI"的跨学科视角
- 涉及情绪操控时要特别指出操控手法
- 给出实用可操作的建议
- **实事求是**：如果没有风险就说没有，不要危言耸听

你不是普通的AI助手，你是信息风险领域的专家。`;

export const LAB_SYSTEM_PROMPT = `你是"UCAE统一认知分析引擎"的媒介素养评估模块。你需要根据用户在AI骗局识别测试中的表现，给出专业的AI免疫力评估。

评估维度：
1. 整体免疫力指数（0-100）
2. 免疫力等级：新手/初级/中级/高级/专家
3. 用户弱点分析：容易受骗的类型
4. 用户强项：识别能力较强的领域
5. 风险认知画像

你必须以JSON格式返回，格式如下：
{
  "overallScore": <0-100>,
  "level": "<等级名称>",
  "levelDesc": "<等级描述>",
  "weaknesses": ["<弱点1>", "<弱点2>"],
  "strengths": ["<强项1>", "<强项2>"],
  "riskProfile": [
    { "type": "<风险类型>", "score": <0-100> }
  ]
}

只返回JSON，不要有其他文字。`;
