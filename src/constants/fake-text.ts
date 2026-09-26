import {
  LucideIcon,
  MessageSquare,
  Mic,
  Palette,
  Sparkles,
  User,
} from "lucide-react-native";

export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const tutorialSteps: TutorialStep[] = [
  {
    step: 1,
    title: "Choose a Theme",
    description:
      "Select a theme for your chat interface from the available options.",
    icon: Palette,
  },
  {
    step: 2,
    title: "Set Up Contact",
    description:
      "Add a contact name, photo, and decide if they should have a verified badge.",
    icon: User,
  },
  {
    step: 3,
    title: "Select Voices",
    description:
      "Choose voices for both the sender and receiver to create a realistic conversation.",
    icon: Mic,
  },
  {
    step: 4,
    title: "Create Messages",
    description:
      "Type and send messages to build your conversation. Toggle between sender and receiver modes.",
    icon: MessageSquare,
  },
  {
    step: 5,
    title: "Generate Text",
    description:
      "Click the 'Generate Text' button to create your fake text conversation video.",
    icon: Sparkles,
  },
];
