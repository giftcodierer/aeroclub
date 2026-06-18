export const PILOT_FUNCTIONS = [
  { value: "PIC_SOLO",         label: "PIC Alleinflug" },
  { value: "PIC_WITH_COPILOT", label: "PIC mit Begleitung" },
  { value: "DUAL_STUDENT",     label: "Doppelsitzer Schüler" },
  { value: "DUAL_INSTRUCTOR",  label: "Doppelsitzer Lehrer" },
  { value: "SOLO_STUDENT",     label: "Alleinflug Schüler" },
] as const;

export const PILOT_FUNCTION_LABEL: Record<string, string> = Object.fromEntries(
  PILOT_FUNCTIONS.map(({ value, label }) => [value, label])
);

export const LAUNCH_TYPES = ["Winde", "Schlepper", "Eigenstart"] as const;
export type LaunchType = (typeof LAUNCH_TYPES)[number];

export const LAUNCH_ICON: Record<string, string> = {
  Winde: "🪁",
  Schlepper: "🛩️",
  Eigenstart: "🔋",
};

export const allowsUnlicensed = (pf: string) =>
  pf === "DUAL_STUDENT" || pf === "SOLO_STUDENT";

export const requiresInstructor = (pf: string) =>
  pf === "DUAL_STUDENT" || pf === "DUAL_INSTRUCTOR";
