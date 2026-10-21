import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

/**
 * Chat/agent model is switchable via LLM_PROVIDER so the same agent code
 * runs on Claude, GPT, or a free-tier Groq model — handy for testing the
 * agent without a paid key. Embeddings are unrelated to this switch: RAG
 * retrieval (lib/rag/embed.ts) always uses its own local model, since not
 * every provider here has an embeddings endpoint.
 */
export function getChatModel(): LanguageModel {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();

  if (provider === "openai") {
    return openai(process.env.OPENAI_MODEL ?? "gpt-5.1");
  }

  if (provider === "groq") {
    return groq(process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile");
  }

  return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5");
}
