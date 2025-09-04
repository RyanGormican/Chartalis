"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import { TranslateProvider } from "./components/translate/TranslateContext";
import Script from "next/script";

export default function Client({ children }: { children: ReactNode }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-QJ0PGNFDKL"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QJ0PGNFDKL');
          `,
        }}
      />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com"   crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Amarante&family=Chivo:ital,wght@0,100..900;1,100..900&family=Vollkorn:ital,wght@0,400..900;1,400..900&display=swap"
        rel="stylesheet"
      />

      <meta
        name="google-site-verification"
        content="O2QkssZfWtjEBcaSjNOnuGjCyW9qqBIAq32Oy9hgtnM"
      />

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TranslateProvider>{children}</TranslateProvider>
      </ThemeProvider>
    </>
  );
}
