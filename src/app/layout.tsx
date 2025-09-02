import "./globals.css";
import { TranslateProvider } from "./components/translate/TranslateContext";

export const metadata = {
  title: "Diagramo",
  description: "Diagramo is a web app for creating UML diagrams, managing projects, and exploring a UML glossary with examples. Supports class diagrams, aggregation, composition, inheritance, associations, and dependencies.",
  keywords: "UML, UML diagrams, UML diagram editor, class diagram, aggregation, composition, inheritance, association, dependency, diagram tool, software design",
  authors: [{ name: "Ryan Gormican", url: "https://ryangormicanportfoliohub.vercel.app/" }],
  viewport: "width=device-width, initial-scale=1.0",
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
