export type { LlmConfig, LlmProvider } from './types';
export { loadConfig } from './types';
export { OpenAIProvider } from './providers/openai-provider';
export { AnthropicProvider } from './providers/anthropic-provider';
export { OpenRouterProvider } from './providers/openrouter-provider';

import { LlmConfig, LlmProvider, loadConfig } from './types';
import { OpenAIProvider } from './providers/openai-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { OpenRouterProvider } from './providers/openrouter-provider';

export function createLlmProvider(config?: LlmConfig): LlmProvider {
  const cfg = config ?? loadConfig();

  switch (cfg.provider) {
    case 'openai':
      return new OpenAIProvider(cfg);
    case 'anthropic':
      return new AnthropicProvider(cfg);
    case 'openrouter':
      return new OpenRouterProvider(cfg);
    default:
      throw new Error(
        `Unknown LLM provider: ${cfg.provider}. Supported: openai, anthropic, openrouter`,
      );
  }
}
