// SiliconFlow AI Service - Qwen3-Omni-30B-A3B-Instruct
// OpenAI-compatible API

const API_KEY = process.env.SILICONFLOW_API_KEY || '';
const BASE_URL = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1';
const MODEL = process.env.SILICONFLOW_MODEL || 'Qwen/Qwen3-Omni-30B-A3B-Instruct';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Call SiliconFlow chat completion API (non-streaming)
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

export const ANALYZE_SYSTEM_PROMPT = `你是"识界AI"——一个专业的AI内容可信度分析系统。你的核心能力是从传播学视角分析信息风险，不仅仅是检测AI生成内容，更重要的是解释信息传播中的认知操控风险。

你的分析框架包括：
1. 内容可信度评分（0-100，越高越可信）
2. 风险等级（low/medium/high）
3. AI生成概率（0-100%）
4. 风险因素分析：
   - 情绪操控风险：检测恐惧、愤怒、紧迫感等情绪诱导
   - 身份信任诱导：伪造权威身份建立信任链
   - 极端标题特征：夸张表述和标题党
   - AI拟声特征：语音合成痕迹
   - AI换脸异常：深度伪造视频痕迹
   - 传播诱导模式：社交工程学传播模板
5. 情绪传播分析：主要情绪、强度、操控手法
6. 传播路径分析：速度、范围、模式
7. 验证建议

你必须以JSON格式返回分析结果，格式如下：
{
  "credibilityScore": <0-100>,
  "riskLevel": "<low|medium|high>",
  "aiGeneratedProb": <0-100>,
  "riskFactors": [
    {
      "type": "<emotion|identity|title|voice|deepfake|spread>",
      "label": "<风险名称>",
      "score": <0-100>,
      "description": "<风险解释>"
    }
  ],
  "verificationSuggestions": ["<建议1>", "<建议2>"],
  "emotionAnalysis": {
    "primary": "<主要情绪>",
    "intensity": <0-100>,
    "manipulationRisk": <0-100>,
    "techniques": ["<手法1>", "<手法2>"]
  },
  "spreadAnalysis": {
    "velocity": <1-10>,
    "reach": "<扩散范围描述>",
    "pattern": "<传播模式>",
    "nodes": <潜在影响节点数>
  }
}

只返回JSON，不要有其他文字。`;

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

你不是普通的AI助手，你是信息风险领域的专家。`;

export const LAB_SYSTEM_PROMPT = `你是"识界AI"媒介素养评估系统。你需要根据用户在AI骗局识别测试中的表现，给出专业的AI免疫力评估。

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
