'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield } from 'lucide-react';
import PageContainer, { PageHeader } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  source?: 'ai' | 'fallback' | 'demo';
}

const quickPrompts = [
  '我妈接到AI拟声电话怎么办？',
  '如何识别AI换脸视频？',
  '收到AI诈骗信息怎么处理？',
  '什么是情绪操控风险？',
  '如何提高AI媒介素养？',
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好，我是识界AI风险解释助手。我可以帮你分析信息风险，从传播学视角解释认知偏差，提供防骗建议。有什么想了解的吗？',
      timestamp: new Date(),
      source: 'demo',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    // Build history for context (exclude current user message and empty assistant)
    const history = messages
      .filter((m) => m.content.trim())
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
        }),
        signal: controller.signal,
      });

      // Check if response is streaming (text/plain) or JSON
      const contentType = response.headers.get('Content-Type') || '';
      const source = (response.headers.get('X-Source') as Message['source']) || 'ai';

      if (contentType.includes('text/plain')) {
        // Streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, isStreaming: true, source }
                : m
            )
          );
        }

        // Streaming complete
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, isStreaming: false, source }
              : m
          )
        );
      } else {
        // JSON response (fallback)
        const data = await response.json();
        const content = data?.data?.content || data?.data || '';

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content, isStreaming: false, source: data?.source || 'fallback' }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      // If streaming was aborted, don't show error
      if ((error as Error).name === 'AbortError') return;

      // Show error in message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: '抱歉，AI服务暂时不可用。请稍后重试。\n\n你可以继续提问，我会尽力帮助你分析信息风险。',
                isStreaming: false,
                source: 'fallback',
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, messages]);

  const renderInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    // Match **bold**, *italic*, `code`, [link](url)
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1]) {
        // **bold**
        parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={key++} className="italic text-foreground/80">{match[4]}</em>);
      } else if (match[5]) {
        // `code`
        parts.push(<code key={key++} className="px-1 py-0.5 rounded bg-white/10 text-accent text-[11px] font-mono">{match[6]}</code>);
      } else if (match[7]) {
        // [link](url)
        parts.push(<a key={key++} href={match[9]} target="_blank" rel="noopener noreferrer" className="text-accent underline">{match[8]}</a>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return (
          <p key={i} className="font-semibold text-foreground mt-4 mb-1 text-sm">
            {renderInlineMarkdown(line.slice(4))}
          </p>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <p key={i} className="font-bold text-foreground mt-4 mb-2 text-sm">
            {renderInlineMarkdown(line.slice(3))}
          </p>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <p key={i} className="font-bold text-foreground mt-4 mb-2">
            {renderInlineMarkdown(line.slice(2))}
          </p>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-foreground mt-3 mb-1">
            {renderInlineMarkdown(line.replace(/^\*\*|\*\*$/g, ''))}
          </p>
        );
      }
      if (line.startsWith('- **') || line.startsWith('* **')) {
        const cleaned = line.replace(/^[-*]\s*/, '');
        const match = cleaned.match(/\*\*(.*?)\*\*[:：]?\s*(.*)/);
        if (match) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-accent text-xs mt-0.5 shrink-0">▸</span>
              <span>
                <span className="font-medium text-accent">{match[1]}</span>
                {match[2] && <span className="text-foreground/70">{match[2]}</span>}
              </span>
            </div>
          );
        }
      }
      if (line.match(/^\d+\./)) {
        const match = line.match(/^(\d+)\.\s*(.*)/);
        if (match) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-accent text-xs font-medium min-w-[16px] shrink-0">{match[1]}.</span>
              <span className="text-foreground/70">{renderInlineMarkdown(match[2])}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <span className="text-accent text-xs mt-0.5 shrink-0">▸</span>
            <span className="text-foreground/70">{renderInlineMarkdown(line.slice(2))}</span>
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <div key={i} className="border-l-2 border-accent/30 pl-3 my-2 text-foreground/60 italic">
            {renderInlineMarkdown(line.slice(2))}
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-foreground/80 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <PageContainer noPadding className="flex flex-col h-dvh">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 shrink-0">
        <PageHeader
          title="AI风险解释Agent"
          subtitle="从传播学视角分析信息风险"
          icon="✦"
        />
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-4 no-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Shield size={14} className="text-white" strokeWidth={1.5} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-md'
                    : 'glass-card-sm text-sm rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="text-xs leading-relaxed">
                    {msg.isStreaming && !msg.content ? (
                      <div className="flex gap-1 py-2">
                        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="thinking-dot w-1.5 h-1.5 rounded-full bg-accent" />
                      </div>
                    ) : (
                      renderContent(msg.content)
                    )}
                    {msg.isStreaming && msg.content && (
                      <span className="typing-cursor" />
                    )}
                    {/* Source indicator */}
                    {!msg.isStreaming && msg.source === 'ai' && (
                      <div className="mt-2 pt-1 border-t border-white/5 text-[9px] text-accent/50">
                        ✓ AI实时分析
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm">{msg.content}</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming indicator */}
        {isStreaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted px-2"
          >
            <div className="flex gap-1">
              <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
              <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
              <span className="thinking-dot w-1 h-1 rounded-full bg-accent" />
            </div>
            AI正在思考...
          </motion.div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 shrink-0">
          <p className="text-[10px] text-muted mb-2">快速提问</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => sendMessage(prompt)}
                disabled={isStreaming}
                className="text-[11px] px-3 py-1.5 rounded-full glass-card-sm text-foreground/70 hover:text-accent transition-colors disabled:opacity-50"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-20 pt-2 shrink-0 safe-bottom">
        <div className="glass-card-sm flex items-center gap-2 px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="描述你遇到的信息风险场景..."
            className="flex-1 bg-transparent text-sm text-foreground/80 placeholder-muted/50 outline-none py-1"
            disabled={isStreaming}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white disabled:opacity-30 transition-opacity shrink-0"
          >
            <Send size={14} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
