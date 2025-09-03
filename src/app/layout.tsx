import "./globals.css";
import { TranslateProvider } from "./components/translate/TranslateContext";

export const metadata = {
  title: "Diagramo",
  description:
    "Diagramo is a web app for creating UML diagrams, managing projects, and exploring a UML glossary with examples. Supports class diagrams, aggregation, composition, inheritance, associations, and dependencies.",
  keywords:
    "UML, UML diagrams, UML diagram editor, class diagram, aggregation, composition, inheritance, association, dependency, diagram tool, software design",
  authors: [{ name: "Ryan Gormican", url: "https://ryangormicanportfoliohub.vercel.app/" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QJ0PGNFDKL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QJ0PGNFDKL');
            `,
          }}
        />

        {/* Google Search Console verification */}
        <meta
          name="google-site-verification"
          content="O2QkssZfWtjEBcaSjNOnuGjCyW9qqBIAq32Oy9hgtnM"
        />
      </head>
      <body>
        <TranslateProvider>{children}</TranslateProvider>
      </body>
    </html>
  );
}
