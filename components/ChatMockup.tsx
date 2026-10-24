import { Search, UserSearch, Banknote, Check } from "lucide-react";
import HaxioMark from "./HaxioMark";

/**
 * Static, non-interactive mockup of a real Haxio conversation — same visual
 * language as ChatWidget/ToolCallView, for the landing page hero.
 */
export default function ChatMockup() {
  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
      <div className="flex items-center gap-2.5 border-b border-neutral-200 px-4 py-3">
        <HaxioMark size={28} />
        <div>
          <div className="text-sm font-semibold text-neutral-900">Haxio</div>
          <div className="text-xs text-neutral-400">Acme Cloud · agent + RAG demo</div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl bg-brand px-3 py-2 text-sm text-white">
            ACC-1002 says they were double charged $49, can you check?
          </div>
        </div>

        <div className="max-w-[92%] space-y-2">
          <div className="flex items-start gap-2 rounded-lg border border-brand/15 bg-brand-light px-3 py-2 text-sm text-neutral-700">
            <UserSearch size={16} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <span className="font-medium">Looking up account</span>
              <span className="text-neutral-500"> — ACC-1002</span>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-brand/15 bg-brand-light px-3 py-2 text-sm text-neutral-700">
            <Search size={16} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <span className="font-medium">Searching help docs</span>
              <span className="text-neutral-500"> — duplicate charge policy</span>
            </div>
          </div>
          <p className="text-sm text-neutral-700">
            Found two $49.00 charges 11 minutes apart. Policy covers duplicate
            charges within 24h — requesting a refund now.
          </p>
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <Banknote size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <span className="font-medium">Refund requested</span>
              <span className="text-amber-700"> — $49.00, pending approval</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <Check size={13} />
          Waiting on a support lead to approve
        </div>
      </div>
    </div>
  );
}
