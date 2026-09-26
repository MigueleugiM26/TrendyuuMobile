import {
  LucideIcon,
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from "lucide-react-native";
import { AspectRatioImageAI } from "../types/aiModels";

export const ASPECT_RATIO_OPTIONS_IMAGE: {
  value: AspectRatioImageAI;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  {
    value: "16:9",
    label: "Widescreen (16:9)",
    shortLabel: "Widescreen",
    icon: RectangleHorizontal,
  },
  {
    value: "9:16",
    label: "Story (9:16)",
    shortLabel: "Story",
    icon: RectangleVertical,
  },
  {
    value: "1:1",
    label: "Quadrado (1:1)",
    shortLabel: "Quadrado",
    icon: Square,
  },
  {
    value: "4:3",
    label: "Paisagem (4:3)",
    shortLabel: "Paisagem",
    icon: RectangleHorizontal,
  },
  {
    value: "3:4",
    label: "Retrato (3:4)",
    shortLabel: "Retrato",
    icon: RectangleVertical,
  },
];
