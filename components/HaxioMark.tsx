type HaxioMarkProps = {
  /** Rendered width and height in px. Works from 16 up. */
  size?: number;
  className?: string;
  /** Accessible name. Pass "" when the mark sits next to the word "Haxio". */
  title?: string;
};

/**
 * Haxio icon mark: two linked rings, the agent (white) and the human
 * approver (flare) on an ink chip. Source files: public/brand/icon/.
 */
export default function HaxioMark({ size = 32, className, title = "" }: HaxioMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <rect width="48" height="48" rx="12" fill="var(--ink, #0b0f1a)" />
      <circle cx="19" cy="24" r="8" stroke="#ffffff" strokeWidth="5" />
      <circle cx="29" cy="24" r="8" stroke="var(--flare, #ff6b2c)" strokeWidth="5" />
    </svg>
  );
}
