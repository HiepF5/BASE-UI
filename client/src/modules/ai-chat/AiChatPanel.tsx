import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../core/api/apiClient';
import { BaseButton } from '../../components/base';

// ============================================================
// AiChatPanel - Chat UI for AI Builder
// ============================================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposedChanges?: any[];
  timestamp: Date;
}

export function AiChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const executeMutation = useMutation({
    mutationFn: (userInput: string) =>
      apiClient.post<{ messages: string[]; proposedChanges: any[]; skillUsed: string }>(
        '/ai/execute',
        { input: userInput },
      ),
    onSuccess: (data) => {
      const assistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.messages.join('\n'),
        proposedChanges: data.proposedChanges,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (changes: any[]) =>
      apiClient.post('/ai/apply', { changes }),
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    executeMutation.mutate(input);
    setInput('');
  };

  const handleApply = async (changes: any[]) => {
    try {
      await applyMutation.mutateAsync(changes);
      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Applied ${changes.length} file changes successfully.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
    } catch {
      const msg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to apply changes.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
    }
  };

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-bold mb-4">AI Builder</h1>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border rounded-lg p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-400 py-12">
            <p className="text-lg mb-2">🤖 AI Builder</p>
            <p className="text-sm">Ask me to generate code, analyze your project, or create modules.</p>
            <div className="mt-4 space-y-2">
              {[
                'Create a CRUD module for products',
                'Generate a React page for orders',
                'Analyze project structure',
                'Plan auth implementation',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="block mx-auto text-sm text-primary-600 hover:underline"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              <pre className="whitespace-pre-wrap text-sm font-sans">{msg.content}</pre>

              {/* Apply button for proposed changes */}
              {msg.proposedChanges && msg.proposedChanges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">
                    {msg.proposedChanges.length} file change(s) proposed
                  </p>
                  <div className="space-y-1 mb-2">
                    {msg.proposedChanges.map((change: any, i: number) => (
                      <div key={i} className="text-xs text-neutral-600">
                        [{change.action}] {change.filePath}
                      </div>
                    ))}
                  </div>
                  <BaseButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleApply(msg.proposedChanges!)}
                    loading={applyMutation.isPending}
                  >
                    Apply Changes
                  </BaseButton>
                </div>
              )}
            </div>
          </div>
        ))}

        {executeMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-neutral-100 rounded-lg px-4 py-3 text-sm text-neutral-500">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe what you want to build..."
          className="flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <BaseButton onClick={handleSend} loading={executeMutation.isPending}>
          Send
        </BaseButton>
      </div>
    </div>
  );
}
