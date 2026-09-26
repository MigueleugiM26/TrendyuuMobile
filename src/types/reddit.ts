import { Dispatch, SetStateAction } from "react";

export interface ContentConfigProps {
  formData: {
    username: string;
    description: string;
    script: string;
    avatarUrl: string;
    isDarkMode: boolean;
  };
  updateFormData: (data: Partial<ContentConfigProps["formData"]>) => void;
}

//content-preview
export interface Subtitle {
  className: string;
  preview: string;
}

export interface ContentPreviewProps {
  formData: {
    theme: string;
    username: string;
    description: string;
    script: string;
    avatarUrl: string;
    isDarkMode: boolean;
    selectedSubtitle?: Subtitle | null; // Replace 'any' with 'Subtitle'
    selectedVoice?: Voice | null;
    videoFile: File | null;
    
  };
  isGenerating: boolean;
  progress: number;
}

//content-wizard

export interface Voice {
  id: number;
  name: string;
  image: string;
  audio: string;
  gender: string;
  nationality: string;
}

export interface FormData {
  theme: string;
  username: string;
  description: string;
  script: string;
  avatarUrl: string;
  isDarkMode: boolean;
  redditUrl: string;
  selectedSubtitle: SubtitleStyle | null;
  selectedVoice: Voice | null;
  videoFile: File | null;
  backgroundAudio?: File | null; // Mudar de string para File | null
  backgroundAudioVolume?: number;
  muteVideoBackground?: boolean;
  videoAudioVolume?: number;
}

// Update the component props
export interface ContentWizardProps {
  setRequiredCredits: (credits: number) => void;
  isGenerating: boolean;
  progress: number;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  showLoadingAnimation: boolean;
  generationStatus: string;
  uploadSuccess: boolean;
  fileName: string | null;
  setUploadSuccess: Dispatch<SetStateAction<boolean>>;
  setFileName: Dispatch<SetStateAction<string | "Reddit Post">>;
}

//reddit-import
export interface RedditImportProps {
  redditUrl: string;
  onUrlChange: (url: string) => void;
  onImport: (data: {
    username: string;
    description: string;
    script: string;
    userAvatar?: string;
  }) => void;
}

export interface RedditPostPreview {
  username: string;
  userAvatar?: string;
  title: string;
  description: string;
  content: string;
  thumbnail?: string;
  upvotes: number;
  numComments: number;
}

//subtitle-selector
export interface SubtitleStyle {
  id: string;
  name?: string;
  preview: string;
  className: string;
  type: string;
}

export interface SubtitleSelectorProps {
  selectedSubtitle: SubtitleStyle | null;
  onSelectSubtitle: (subtitle: SubtitleStyle) => void;
}
