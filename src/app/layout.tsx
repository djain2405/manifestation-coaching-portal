import type { Metadata } from "next";
import { Libre_Baskerville, Raleway } from "next/font/google";
import { getCurriculum } from "@/lib/curriculum";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const curriculum = await getCurriculum();
  return {
    title: {
      default: curriculum.site.title,
      template: `%s · ${curriculum.site.title}`,
    },
    description: curriculum.site.tagline,
    openGraph: {
      title: curriculum.site.title,
      description: curriculum.site.tagline,
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${raleway.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-lg text-foreground">
        <div className="portal-content flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
