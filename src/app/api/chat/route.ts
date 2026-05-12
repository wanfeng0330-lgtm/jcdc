import { NextResponse } from 'next/server';
import { deepseekChatStream, deepseekChat, type DeepSeekMessage } from '@/lib/deepseek';
import { AGENT_SYSTEM_PROMPT } from '@/lib/ai';
import { agentResponses } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: '消息不能为空' },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
    ];

    // Add history if provided
    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    // Use DeepSeek streaming response
    try {
      const stream = await deepseekChatStream({
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Source': 'deepseek-agent',
        },
      });
    } catch (streamError) {
      console.error('DeepSeek streaming failed, falling back to non-streaming:', streamError);

      // Fallback: non-streaming response
      const aiContent = await deepseekChat({
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: Date.now().toString(),
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toISOString(),
        },
        source: 'deepseek-agent',
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    // Final fallback to mock data
    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        role: 'assistant',
        content: agentResponses.default,
        timestamp: new Date().toISOString(),
      },
      source: 'fallback',
    });
  }
}
