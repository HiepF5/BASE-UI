import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// ============================================================
// LLM Provider - Interface cho LLM calls
// ============================================================
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

@Injectable()
export class LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gọi LLM API (OpenAI-compatible)
   * Placeholder - cần implement với API key thực
   */
  async chat(messages: LlmMessage[]): Promise<LlmResponse> {
    const apiKey = this.configService.get('OPENAI_API_KEY');

    if (!apiKey) {
      // Fallback: trả về response mẫu khi chưa có API key
      return {
        content:
          'LLM not configured. Please set OPENAI_API_KEY in environment.',
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    }

    // TODO: Implement actual LLM call
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${apiKey}`,
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-4',
    //     messages,
    //   }),
    // });

    return {
      content: 'LLM response placeholder',
      usage: { promptTokens: 0, completionTokens: 0 },
    };
  }

  async generateCode(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: LlmMessage[] = [
      {
        role: 'system',
        content: systemPrompt || 'You are a code generation assistant. Output only code.',
      },
      { role: 'user', content: prompt },
    ];

    const response = await this.chat(messages);
    return response.content;
  }
}
