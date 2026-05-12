'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageContainer, { PageHeader } from '@/components/PageContainer';
import BottomNav from '@/components/BottomNav';
import { agentResponses } from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateStreaming = (text: string, messageId: string) => {
    setIsStreaming(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        const chunkSize = Math.min(Math.floor(Math.random() * 3) + 1, text.length - index);
        const chunk = text.slice(0, index + chunkSize);
        index += chunkSize;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content: chunk, isStreaming: true } : m
          )
        );
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isStreaming: false } : m
          )
        );
        setIsStreaming(false);
      }
    }, 30);
  };

  const sendMessage = (text: string) => {
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

    // 模拟AI回复
    setTimeout(() => {
      const response = agentResponses.default;
      simulateStreaming(response, assistantId);
    }, 800);
  };

  const renderContent = (content: string) => {
    // 简单的Markdown渲染
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-foreground mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      if (line.startsWith('- **')) {
        const match = line.match(/- \*\*(.*?)\*\*[:：]\s*(.*)/);
        if (match) {
          return (
            <div key={i} className="flex items-start gap-2 my-1">
              <span className="text-accent text-xs mt-0.5">▸</span>
              <span>
                <span className="font-medium text-accent">{match[1]}</span>
                {match[2] && <span className="text-foreground/70">：{match[2]}</span>}
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
              <span className="text-accent text-xs font-medium min-w-[16px]">{match[1]}.</span>
              <span className="text-foreground/70">{match[2]}</span>
            </div>
          );
        }
      }
      if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-2 my-1">
            <span className="text-accent text-xs mt-0.5">▸</span>
            <span className="text-foreground/70">{line.slice(2)}</span>
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-foreground/80 leading-relaxed">
          {line}
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
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-sm shrink-0 mr-2 mt-1">
                  ◈
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
                className="text-[11px] px-3 py-1.5 rounded-full glass-card-sm text-foreground/70 hover:text-accent transition-colors"
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
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
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
            ↑
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
