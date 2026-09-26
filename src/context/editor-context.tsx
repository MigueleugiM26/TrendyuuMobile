import { createContext, useContext, useState } from "react";

export type EditorMode =
  | "upload"
  | "download"
  | "projects"
  | "subtitles"
  | "audio"
  | "text"
  | "whatsapp"
  | "translate"
  | "effects"
  | "combine"
  | "portrait"
  | "theme"
  | "videos"
  | "filter"
  | "transitions"
  | "gallery"
  | "voice"
  | "aiVideo"
  | "aiImage";

export interface EditorContextType {
  activeMode: EditorMode;
  setActiveMode: (mode: EditorMode) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [activeMode, setActiveMode] = useState<EditorMode>("upload");

  return (
    <EditorContext.Provider value={{ activeMode, setActiveMode }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
