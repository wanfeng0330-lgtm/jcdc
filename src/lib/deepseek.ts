// UCAE 统一认知分析引擎 - DeepSeek Agent 服务层
// 专门用于风险解释Agent，基于 DeepSeek V4 Pro

const API_KEY = process.env.DEEPSEEK_API_KEY || '';
const BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekOptions {
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * DeepSeek chat completion (non-streaming)
 */
export async function deepseekChat(options: DeepSeekOptions): Promise<string> {
  if (!API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

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
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * DeepSeek chat completion (streaming)
 */
export async function deepseekChatStream(options: DeepSeekOptions): Promise<ReadableStream<Uint8Array>> {
  if (!API_KEY) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

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
    console.error('DeepSeek API error:', error);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

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
