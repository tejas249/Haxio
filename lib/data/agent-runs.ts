import { pool } from "@/lib/db";

export interface AgentToolCallLog {
  name: string;
  input: unknown;
  output: unknown;
}

export interface AgentRun {
  id: number;
  createdAt: string;
  userMessage: string;
  assistantText: string | null;
  toolCalls: AgentToolCallLog[];
  finishReason: string | null;
  outcome: string | null;
  errorMessage: string | null;
  durationMs: number | null;
}

interface AgentRunRow {
  id: number;
  created_at: Date;
  user_message: string;
  assistant_text: string | null;
  tool_calls: AgentToolCallLog[];
  finish_reason: string | null;
  outcome: string | null;
  error_message: string | null;
  duration_ms: number | null;
}

function toAgentRun(row: AgentRunRow): AgentRun {
  return {
    id: row.id,
    createdAt: row.created_at.toISOString(),
    userMessage: row.user_message,
    assistantText: row.assistant_text,
    toolCalls: row.tool_calls,
    finishReason: row.finish_reason,
    outcome: row.outcome,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
  };
}

export async function listAgentRuns(limit = 20): Promise<AgentRun[]> {
  const { rows } = await pool.query<AgentRunRow>(
    "select * from agent_runs order by created_at desc limit $1",
    [limit],
  );
  return rows.map(toAgentRun);
}

export async function createAgentRun(input: {
  userMessage: string;
  assistantText: string | null;
  toolCalls: AgentToolCallLog[];
  finishReason: string | null;
  outcome: string | null;
  errorMessage: string | null;
  durationMs: number;
}): Promise<AgentRun> {
  const { rows } = await pool.query<AgentRunRow>(
    `insert into agent_runs
       (user_message, assistant_text, tool_calls, finish_reason, outcome, error_message, duration_ms)
     values ($1, $2, $3::jsonb, $4, $5, $6, $7)
     returning *`,
    [
      input.userMessage,
      input.assistantText,
      JSON.stringify(input.toolCalls),
      input.finishReason,
      input.outcome,
      input.errorMessage,
      input.durationMs,
    ],
  );
  return toAgentRun(rows[0]);
}
