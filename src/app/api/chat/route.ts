import { NextResponse } from 'next/server';
import { chatCompletionStream, chatCompletion, AGENT_SYSTEM_PROMPT, type ChatMessage } from '@/lib/ai';
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
    const messages: ChatMessage[] = [
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

    // Use streaming response
    try {
      const stream = await chatCompletionStream({
        messages,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Source': 'ai',
        },
      });
    } catch (streamError) {
      console.error('Streaming failed, falling back to non-streaming:', streamError);

      // Fallback: non-streaming response
      const aiContent = await chatCompletion({
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
        source: 'ai',
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
