/** Tag colours. Each key has a --tag-<key> / --tag-<key>-soft pair in globals.css (light and dark). */
export const TAG_COLORS = ["brick", "clay", "ochre", "olive", "leaf", "teal", "indigo", "plum", "stone"] as const;

export type TagColor = (typeof TAG_COLORS)[number];

export const TAG_COLOR_LABELS: Record<TagColor, string> = {
  brick: "Brick",
  clay: "Clay",
  ochre: "Ochre",
  olive: "Olive",
  leaf: "Leaf",
  teal: "Teal",
  indigo: "Indigo",
  plum: "Plum",
  stone: "Stone",
};

export function isTagColor(value: unknown): value is TagColor {
  return typeof value === "string" && (TAG_COLORS as readonly string[]).includes(value);
}

export interface TagRef {
  id: string;
  name: string;
  color: string;
}
