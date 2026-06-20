import { z } from 'zod';
import { LlmProvider, LlmConfig } from '../types';

export class AnthropicProvider implements LlmProvider {
  constructor(config: LlmConfig) {
    if (!config.apiKey) {
      throw new Error(
        'Anthropic API key is required. Set ANTHROPIC_API_KEY or LLM_API_KEY environment variable.',
      );
    }
    throw new Error(
      'Anthropic provider is not yet implemented. Use OpenAI provider instead.',
    );
  }

  async generateStructured<T>(
    _prompt: string,
    _schema: z.ZodType<T>,
    _options?: { temperature?: number; maxTokens?: number },
  ): Promise<T> {
    throw new Error('Anthropic provider is not yet implemented.');
  }
}
