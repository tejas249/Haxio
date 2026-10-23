"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageCircle, X, Send } from "lucide-react";
import HaxioMark from "./HaxioMark";
import ToolCallView from "./ToolCallView";
import type { SupportAgentMessage } from "@/lib/agent/support-agent";

const SUGGESTIONS = [
  "Why is account ACC-1003 suspended?",
  "ACC-1002 says they were double charged $49, can you check and refund it?",
  "How do I reset my API key?",
];

export default function ChatWidget({ onActionTaken }: { onActionTaken?: () => void }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat<SupportAgentMessage>({
    // A fixed id avoids useChat generating a random one during the
    // server-rendered static shell (Cache Components flags Math.random()
    // outside a request-time boundary); one visitor per session is fine
    // for this demo.
    id: "support-chat",
    onFinish: () => onActionTaken?.(),
  });

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark hover:shadow-xl sm:bottom-6 sm:right-6 sm:px-5"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Ask the copilot</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-4 top-20 flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[600px] sm:w-[380px]">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <HaxioMark size={32} />
          <div>
            <div className="text-sm font-semibold text-neutral-900">Haxio</div>
            <div className="text-xs text-neutral-400">Acme Cloud · agent + RAG demo</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">Try one of these:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm text-neutral-600 transition hover:border-brand/30 hover:bg-brand-light hover:text-brand-dark"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "flex justify-end" : ""}>
            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] space-y-2 rounded-2xl bg-brand px-3 py-2 text-sm text-white"
                  : "max-w-[90%] space-y-2"
              }
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <p key={i} className="whitespace-pre-wrap text-sm">
                      {part.text}
                    </p>
                  );
                }
                if (part.type.startsWith("tool-")) {
                  return <ToolCallView key={i} part={part as never} />;
                }
                return null;
              })}
            </div>
          </div>
        ))}

        {status === "submitted" ? (
          <p className="text-xs text-neutral-400">Thinking…</p>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            The agent ran into a problem. The AI SDK withholds the exact
            server-side error from the client by default — check the terminal
            running `npm run dev` for the real cause (usually a missing or
            invalid API key in .env.local).
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 border-t border-neutral-200 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about an account, a policy, anything…"
          disabled={status === "submitted" || status === "streaming"}
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "submitted" || status === "streaming" || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-40 disabled:shadow-none"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
