import { Search, UserSearch, Ticket, Banknote, Loader2 } from "lucide-react";

type ToolPart = {
  type: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const TOOL_META: Record<string, { label: string; icon: typeof Search }> = {
  "tool-searchDocs": { label: "Searching help docs", icon: Search },
  "tool-getAccountStatus": { label: "Looking up account", icon: UserSearch },
  "tool-createTicket": { label: "Opening ticket", icon: Ticket },
  "tool-issueRefund": { label: "Requesting refund approval", icon: Banknote },
};

function describeInput(toolType: string, input: unknown): string {
  if (!input || typeof input !== "object") return "";
  const obj = input as Record<string, unknown>;
  if (toolType === "tool-searchDocs") return String(obj.query ?? "");
  if (toolType === "tool-getAccountStatus") return String(obj.accountId ?? "");
  if (toolType === "tool-createTicket") return String(obj.subject ?? "");
  if (toolType === "tool-issueRefund") return String(obj.accountId ?? "");
  return "";
}

export default function ToolCallView({ part }: { part: ToolPart }) {
  const meta = TOOL_META[part.type] ?? { label: part.type, icon: Search };
  const Icon = meta.icon;
  const detail = describeInput(part.type, part.input);
  const isRunning = part.state === "input-streaming" || part.state === "input-available";
  const isError = part.state === "output-error";

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-neutral-200 bg-neutral-50 text-neutral-700"
      }`}
    >
      {isRunning ? (
        <Loader2 size={16} className="mt-0.5 shrink-0 animate-spin text-neutral-400" />
      ) : (
        <Icon size={16} className="mt-0.5 shrink-0 text-neutral-400" />
      )}
      <div className="min-w-0">
        <div className="font-medium">
          {meta.label}
          {detail ? <span className="font-normal text-neutral-500"> — {detail}</span> : null}
        </div>
        {part.state === "output-available" && part.output ? (
          <pre className="mt-1 max-w-full overflow-x-auto whitespace-pre-wrap text-xs text-neutral-500">
            {JSON.stringify(part.output, null, 2)}
          </pre>
        ) : null}
        {isError ? (
          <div className="mt-1 text-xs text-red-600">{part.errorText ?? "Tool call failed"}</div>
        ) : null}
      </div>
    </div>
  );
}
