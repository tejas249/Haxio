import { pool } from "@/lib/db";
import { embedOne } from "@/lib/rag/embed";

export interface SearchResult {
  source: string;
  title: string;
  excerpt: string;
  score: number;
}

interface KbDocRow {
  id: string;
  title: string;
  content: string;
  distance: number;
}

export async function search(query: string, topK = 3): Promise<SearchResult[]> {
  const queryEmbedding = await embedOne(query);
  const vectorParam = `[${queryEmbedding.join(",")}]`;

  const { rows } = await pool.query<KbDocRow>(
    `select id, title, content, embedding <=> $1::vector as distance
     from kb_docs
     order by distance
     limit $2`,
    [vectorParam, topK],
  );

  return rows.map((row) => ({
    source: row.id,
    title: row.title,
    excerpt: row.content.replace(/^#.+$/m, "").trim().slice(0, 500),
    // Cosine distance is 0 (identical) to 2 (opposite); for the normalized
    // embeddings this model produces it stays in [0, 2] but is ~[0, 1] in
    // practice. Flip to a similarity score so higher means more relevant.
    score: Math.round((1 - row.distance) * 100) / 100,
  }));
}
