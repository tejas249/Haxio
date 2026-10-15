import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/**
 * Chat/agent model is switchable via LLM_PROVIDER so the same agent code
 * runs on Claude or GPT. Embeddings have no Anthropic equivalent, so RAG
 * retrieval (lib/rag/search.ts) uses its own lexical index instead of a
 * provider-specific embeddings call.
 */
export function getChatModel(): LanguageModel {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();

  if (provider === "openai") {
    return openai(process.env.OPENAI_MODEL ?? "gpt-5.1");
  }

  return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5");
}
