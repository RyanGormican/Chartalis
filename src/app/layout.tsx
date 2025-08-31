import "./globals.css";
import { TranslateProvider } from "./components/translate/TranslateContext";

export const metadata = {
  title: "Diagramo",
  description: "Dashboard App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TranslateProvider>
          {children}
        </TranslateProvider>
      </body>
    </html>
  );
}
