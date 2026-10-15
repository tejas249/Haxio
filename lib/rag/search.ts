import fs from "node:fs";
import path from "node:path";

/**
 * Lightweight TF-IDF retrieval over the local markdown knowledge base.
 * No embeddings API call, so the demo runs end-to-end with only one
 * LLM key configured. Swap this module for real vector search (e.g.
 * OpenAI/Voyage embeddings + pgvector on Neon) without touching the
 * agent or the route handler — `search()` is the only contract they use.
 */

interface IndexedDoc {
  source: string;
  title: string;
  text: string;
  termCounts: Map<string, number>;
}

const DOCS_DIR = path.join(process.cwd(), "lib", "data", "docs");

let index: IndexedDoc[] | null = null;
let docFreq: Map<string, number> | null = null;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function buildIndex() {
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
  const docs: IndexedDoc[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const title = raw.match(/^#\s+(.+)$/m)?.[1] ?? file;
    const terms = tokenize(raw);
    const termCounts = new Map<string, number>();
    for (const term of terms) {
      termCounts.set(term, (termCounts.get(term) ?? 0) + 1);
    }
    return { source: file, title, text: raw, termCounts };
  });

  const df = new Map<string, number>();
  for (const doc of docs) {
    for (const term of doc.termCounts.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  index = docs;
  docFreq = df;
}

export interface SearchResult {
  source: string;
  title: string;
  excerpt: string;
  score: number;
}

export function search(query: string, topK = 3): SearchResult[] {
  if (!index || !docFreq) buildIndex();
  const docs = index!;
  const df = docFreq!;
  const totalDocs = docs.length;

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  const scored = docs.map((doc) => {
    let score = 0;
    for (const term of queryTerms) {
      const tf = doc.termCounts.get(term) ?? 0;
      if (tf === 0) continue;
      const idf = Math.log(1 + totalDocs / (df.get(term) ?? 1));
      score += tf * idf;
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ doc, score }) => ({
      source: doc.source,
      title: doc.title,
      excerpt: doc.text.replace(/^#.+$/m, "").trim().slice(0, 500),
      score: Math.round(score * 100) / 100,
    }));
}
