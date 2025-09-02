"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import en from "./english";
import fr from "./french";

type Translations = typeof en;

type TranslationContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (key: string) => string;
  availableLanguages: string[];
};

const languageMap: Record<string, string> = { English: "en", French: "fr" };
const localeMap: Record<string, Translations> = { en, fr };

export const TranslateContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslateProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageCode] = useState("en");

const translate = (key: string) => localeMap[language][key as keyof Translations] || key;


  const availableLanguages = Object.keys(languageMap);

  const setLanguage = (name: string) => {
    const code = languageMap[name];
    if (code) setLanguageCode(code);
  };

  return (
    <TranslateContext.Provider value={{ language, setLanguage, translate, availableLanguages }}>
      {children}
    </TranslateContext.Provider>
  );
};

export const useTranslate = () => {
  const context = useContext(TranslateContext);
  if (!context) throw new Error("useTranslate must be used within a TranslateProvider");
  return context;
};
