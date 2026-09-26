import { createContext, useContext, useState } from "react";

interface IntroPreviewContextType {
  username: string;
  setUsername: (username: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  isEnabled: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
}

const IntroPreviewContext = createContext<IntroPreviewContextType | null>(null);

export const IntroPreviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <IntroPreviewContext.Provider
      value={{
        username,
        setUsername,
        description,
        setDescription,
        isDarkMode,
        setIsDarkMode,
        isEnabled,
        setIsEnabled,
      }}
    >
      {children}
    </IntroPreviewContext.Provider>
  );
};

export const useIntroPreview = () => {
  const context = useContext(IntroPreviewContext);
  if (!context) {
    throw new Error(
      "useIntroPreview must be used within an IntroPreviewProvider",
    );
  }
  return context;
};
