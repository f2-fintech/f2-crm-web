export type DispositionCategory =
  | "ALL"
  | "INTERESTED"
  | "FOLLOWUP"
  | "RINGING"
  | "NOT_INTERESTED"
  | "PENDING";

export interface DispositionItemConfig {
  value: string;
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  category: DispositionCategory;
}

export const DISPOSITION_CONFIGS: Record<string, DispositionItemConfig> = {
  "Interested": {
    value: "Interested",
    label: "Interested",
    bg: "#dcfce7",
    text: "#15803d",
    border: "#86efac",
    dot: "#22c55e",
    category: "INTERESTED",
  },
  "Login": {
    value: "Login",
    label: "Login",
    bg: "#ccfbf1",
    text: "#0f766e",
    border: "#99f6e4",
    dot: "#14b8a6",
    category: "INTERESTED",
  },
  "Follow up": {
    value: "Follow up",
    label: "Follow up",
    bg: "#fef3c7",
    text: "#b45309",
    border: "#fde68a",
    dot: "#f59e0b",
    category: "FOLLOWUP",
  },
  "Call back": {
    value: "Call back",
    label: "Call back",
    bg: "#fef9c3",
    text: "#a16207",
    border: "#fef08a",
    dot: "#eab308",
    category: "FOLLOWUP",
  },
  "Ringing": {
    value: "Ringing",
    label: "Ringing",
    bg: "#dbeafe",
    text: "#1d4ed8",
    border: "#bfdbfe",
    dot: "#3b82f6",
    category: "RINGING",
  },
  "Voice mail": {
    value: "Voice mail",
    label: "Voice mail",
    bg: "#f3e8ff",
    text: "#6b21a8",
    border: "#e9d5ff",
    dot: "#a855f7",
    category: "RINGING",
  },
  "Not interested": {
    value: "Not interested",
    label: "Not interested",
    bg: "#fee2e2",
    text: "#b91c1c",
    border: "#fca5a5",
    dot: "#ef4444",
    category: "NOT_INTERESTED",
  },
  "Switch off": {
    value: "Switch off",
    label: "Switch off",
    bg: "#ffe4e6",
    text: "#be123c",
    border: "#fecdd3",
    dot: "#f43f5e",
    category: "NOT_INTERESTED",
  },
  "Call cut": {
    value: "Call cut",
    label: "Call cut",
    bg: "#fee2e2",
    text: "#991b1b",
    border: "#f87171",
    dot: "#dc2626",
    category: "NOT_INTERESTED",
  },
  "Not connected": {
    value: "Not connected",
    label: "Not connected",
    bg: "#f1f5f9",
    text: "#475569",
    border: "#cbd5e1",
    dot: "#64748b",
    category: "NOT_INTERESTED",
  },
};

export const PENDING_CONFIG: DispositionItemConfig = {
  value: "",
  label: "Select disposition",
  bg: "#ffffff",
  text: "#64748b",
  border: "#cbd5e1",
  dot: "#94a3b8",
  category: "PENDING",
};

export const ALL_DISPOSITIONS_LIST = Object.values(DISPOSITION_CONFIGS);

/**
 * Robust classification:
 * CRITICAL: Check negative first to avoid "not interested" matching "interested"!
 */
export function getDispositionConfig(val?: string | null): DispositionItemConfig {
  if (!val || !String(val).trim()) return PENDING_CONFIG;
  const clean = String(val).trim();

  // 1. Exact case-insensitive match
  const foundKey = Object.keys(DISPOSITION_CONFIGS).find(
    (k) => k.toLowerCase() === clean.toLowerCase()
  );
  if (foundKey) return DISPOSITION_CONFIGS[foundKey];

  const lower = clean.toLowerCase();

  // 2. CHECK NEGATIVE FIRST! (Prevents "not interested" from matching "interested")
  if (
    lower.startsWith("not") ||
    lower.includes("not interested") ||
    lower.includes("switch off") ||
    lower.includes("call cut") ||
    lower.includes("reject") ||
    lower.includes("fake") ||
    lower.includes("invalid") ||
    lower.includes("wrong")
  ) {
    if (lower.includes("switch")) return DISPOSITION_CONFIGS["Switch off"];
    if (lower.includes("cut")) return DISPOSITION_CONFIGS["Call cut"];
    if (lower.includes("connected")) return DISPOSITION_CONFIGS["Not connected"];
    return DISPOSITION_CONFIGS["Not interested"];
  }

  // 3. Positive match
  if (lower.includes("login") || lower.includes("account")) {
    return DISPOSITION_CONFIGS["Login"];
  }
  if (lower.includes("interested") || lower.includes("sale") || lower.includes("agree")) {
    return DISPOSITION_CONFIGS["Interested"];
  }

  // 4. Follow-up match
  if (lower.includes("call back") || lower.includes("callback")) {
    return DISPOSITION_CONFIGS["Call back"];
  }
  if (lower.includes("follow") || lower.includes("meeting") || lower.includes("pipeline")) {
    return DISPOSITION_CONFIGS["Follow up"];
  }

  // 5. Ringing match
  if (lower.includes("voice") || lower.includes("msg") || lower.includes("mail")) {
    return DISPOSITION_CONFIGS["Voice mail"];
  }
  if (lower.includes("ring") || lower.includes("dial")) {
    return DISPOSITION_CONFIGS["Ringing"];
  }

  // Generic fallback
  return {
    value: clean,
    label: clean,
    bg: "#f8fafc",
    text: "#334155",
    border: "#cbd5e1",
    dot: "#64748b",
    category: "NOT_INTERESTED",
  };
}

export function isDispositionPending(val?: string | null): boolean {
  return !val || !String(val).trim();
}

export interface FilterSegment {
  key: DispositionCategory;
  label: string;
  dot: string;
  activeBg: string;
}

export const FILTER_SEGMENTS: FilterSegment[] = [
  { key: "ALL", label: "All", dot: "#64748b", activeBg: "#0f172a" },
  { key: "INTERESTED", label: "Interested", dot: "#22c55e", activeBg: "#16a34a" },
  { key: "FOLLOWUP", label: "Follow up", dot: "#f59e0b", activeBg: "#d97706" },
  { key: "RINGING", label: "Ringing", dot: "#3b82f6", activeBg: "#2563eb" },
  { key: "NOT_INTERESTED", label: "Not interested", dot: "#ef4444", activeBg: "#dc2626" },
  { key: "PENDING", label: "Pending *", dot: "#ef4444", activeBg: "#b91c1c" },
];
