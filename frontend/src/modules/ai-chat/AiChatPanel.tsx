import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, User, FileCode, CheckCircle, Copy, RotateCcw } from 'lucide-react';
import { cn } from '@/core/utils';
import { apiClient } from '@/core/api/apiClient';
import { BaseButton } from '@/components/base';
import type { AiMessage, FileChange } from '@/types';

/* ═══════════════════════════════════════════════════════════
   AiChatPanel — AI Builder chat interface
   ═══════════════════════════════════════════════════════════ */

const AiChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'Xin chào! Tôi là AI Builder. Hỏi tôi về code generation, DB schema, debugging, hoặc planning.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Auto scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  /* Send message */
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post<{
        response: string;
        skill?: string;
        plan?: string[];
        proposedChanges?: FileChange[];
      }>('/ai/execute', { prompt: text });

      const aiMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response,
        skillUsed: res.skill,
        plan: res.plan,
        proposedChanges: res.proposedChanges,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Lỗi: ${err.message ?? 'Không thể kết nối AI service'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  /* Apply changes */
  const applyChanges = async (changes: FileChange[]) => {
    try {
      await apiClient.post('/ai/apply', { changes });
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          role: 'system',
          content: `Đã áp dụng ${changes.length} thay đổi thành công.`,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Lỗi khi áp dụng: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  /* Keyboard */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onApply={applyChanges} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mô tả yêu cầu (VD: Tạo CRUD cho bảng products)…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <BaseButton
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </BaseButton>
        </div>
      </div>
    </div>
  );
};

/* ── Message bubble ── */
const MessageBubble: React.FC<{
  message: AiMessage;
  onApply: (changes: FileChange[]) => void;
}> = ({ message, onApply }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white',
          isUser ? 'bg-primary-500' : isSystem ? 'bg-gray-400' : 'bg-gray-700',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[85%] rounded-xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 text-gray-800',
        )}
      >
        {/* Skill badge */}
        {message.skillUsed && (
          <div className="mb-1 text-xs opacity-60">Skill: {message.skillUsed}</div>
        )}

        {/* Text */}
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* Plan */}
        {message.plan?.length ? (
          <div className="mt-2 rounded-lg bg-white/80 p-2 text-xs">
            <p className="font-semibold mb-1">Kế hoạch:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              {message.plan.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </div>
        ) : null}

        {/* Proposed changes */}
        {message.proposedChanges?.length ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-semibold">Thay đổi đề xuất:</p>
            {message.proposedChanges.map((change, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-gray-800 px-2 py-1 text-xs text-green-300">
                <FileCode className="h-3 w-3" />
                <span>{change.action}</span>
                <span className="text-gray-400">{change.filePath}</span>
              </div>
            ))}
            <BaseButton
              size="xs"
              variant="success"
              className="mt-1"
              onClick={() => onApply(message.proposedChanges!)}
            >
              <CheckCircle className="h-3 w-3" /> Áp dụng tất cả
            </BaseButton>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AiChatPanel;
