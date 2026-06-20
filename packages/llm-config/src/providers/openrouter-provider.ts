import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { LlmProvider, LlmConfig } from '../types';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterProvider implements LlmProvider {
  private client: OpenAI;
  private model: string;
  private defaultMaxTokens: number;
  private defaultTemperature: number;

  constructor(config: LlmConfig) {
    if (!config.apiKey) {
      throw new Error(
        'OpenRouter API key is required. Set LLM_API_KEY or OPENROUTER_API_KEY environment variable.',
      );
    }
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/spatnaik1982/LearnEasy',
        'X-Title': 'LearnEasy',
      },
    });
    this.model = config.model;
    this.defaultMaxTokens = config.maxTokens;
    this.defaultTemperature = config.temperature;
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<T> {
    const response = await this.client.beta.chat.completions.parse({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      response_format: zodResponseFormat(schema, 'result'),
      max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
      temperature: options?.temperature ?? this.defaultTemperature,
    });

    const parsed = response.choices[0]?.message?.parsed;
    if (!parsed) {
      const refusal = response.choices[0]?.message?.refusal;
      throw new Error(
        refusal
          ? `LLM refused to generate: ${refusal}`
          : 'LLM returned no parsed content',
      );
    }
    return schema.parse(parsed);
  }
}
