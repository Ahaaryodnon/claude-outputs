import type { ThemeName } from "../models/VisualisationRequest.js";

export interface Theme {
  name: ThemeName;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    series: string[];
  };
  fontFamily: string;
  fontSizeBase: number;
}

export const GROUND_CONTROL_COLOURS = {
  darkGreen: "#294238",
  lightGreen: "#B2D235",
  midGreen: "#50B748",
  grey: "#E6EBE3",
  orange: "#F57821",
} as const;

export const groundControlTheme: Theme = {
  name: "ground-control",
  palette: {
    primary: GROUND_CONTROL_COLOURS.darkGreen,
    secondary: GROUND_CONTROL_COLOURS.midGreen,
    accent: GROUND_CONTROL_COLOURS.orange,
    background: "#FFFFFF",
    surface: GROUND_CONTROL_COLOURS.grey,
    text: GROUND_CONTROL_COLOURS.darkGreen,
    muted: "#6B7770",
    series: [
      GROUND_CONTROL_COLOURS.darkGreen,
      GROUND_CONTROL_COLOURS.lightGreen,
      GROUND_CONTROL_COLOURS.midGreen,
      GROUND_CONTROL_COLOURS.orange,
      "#7A9E8E",
      "#D4E48C",
    ],
  },
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSizeBase: 14,
};

export const defaultTheme: Theme = {
  name: "default",
  palette: {
    primary: "#1F2937",
    secondary: "#4B5563",
    accent: "#2563EB",
    background: "#FFFFFF",
    surface: "#F3F4F6",
    text: "#111827",
    muted: "#6B7280",
    series: [
      "#2563EB",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#0EA5E9",
    ],
  },
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSizeBase: 14,
};

export function resolveTheme(name: ThemeName | undefined): Theme {
  if (name === "ground-control") return groundControlTheme;
  return defaultTheme;
}
