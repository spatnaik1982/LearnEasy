import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const ExplanationSchema = z.object({
  explanation: z.string(),
});

const HintSchema = z.object({
  hint: z.string(),
});

const EncouragementSchema = z.object({
  message: z.string(),
});

const InsightSchema = z.object({
  insight: z.string(),
});

const FALLBACK_EXPLANATION = "Let's work through this together, one step at a time.";
const FALLBACK_HINT = "Try breaking the problem into smaller parts.";
const FALLBACK_ENCOURAGEMENT = "You're doing great — keep going!";
const FALLBACK_INSIGHT = "Keep practicing and you'll get better every day.";

export class AiTutorService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
  }

  async explainSimpler(
    conceptName: string,
    objective: string,
    query: string,
  ): Promise<{ explanation: string }> {
    try {
      const prompt = `Explain ${conceptName} (${objective}) simply. User asks: ${query}. Use 2-3 short sentences. Simple words. No metaphors.`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(ExplanationSchema, "explanation"),
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { explanation: FALLBACK_EXPLANATION };
      return ExplanationSchema.parse(JSON.parse(content));
    } catch (error) {
      console.error("[AiTutor] explainSimpler failed:", error);
      return { explanation: FALLBACK_EXPLANATION };
    }
  }

  async generateHint(
    conceptName: string,
    objective: string,
    questionContext: string,
  ): Promise<{ hint: string }> {
    try {
      const prompt = `Give a gentle hint for ${conceptName}: ${objective}. Context: ${questionContext}. One short sentence guiding the student without giving the answer.`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(HintSchema, "hint"),
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { hint: FALLBACK_HINT };
      return HintSchema.parse(JSON.parse(content));
    } catch (error) {
      console.error("[AiTutor] generateHint failed:", error);
      return { hint: FALLBACK_HINT };
    }
  }

  async generateEncouragement(
    conceptName: string,
  ): Promise<{ message: string }> {
    try {
      const prompt = `Generate one short encouraging sentence for a student who just completed ${conceptName}. Warm, simple, positive.`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(EncouragementSchema, "encouragement"),
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { message: FALLBACK_ENCOURAGEMENT };
      return EncouragementSchema.parse(JSON.parse(content));
    } catch (error) {
      console.error("[AiTutor] generateEncouragement failed:", error);
      return { message: FALLBACK_ENCOURAGEMENT };
    }
  }

  async generateInsight(
    studentName: string,
    conceptData: string,
  ): Promise<{ insight: string }> {
    try {
      const prompt = `Based on ${studentName}'s performance in ${conceptData}, write one short sentence about what they find easy or difficult. Simple observation, no judgment.`;
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(InsightSchema, "insight"),
      });
      const content = response.choices[0]?.message?.content;
      if (!content) return { insight: FALLBACK_INSIGHT };
      return InsightSchema.parse(JSON.parse(content));
    } catch (error) {
      console.error("[AiTutor] generateInsight failed:", error);
      return { insight: FALLBACK_INSIGHT };
    }
  }
}