import "./globals.css";

export const metadata = {
  title: "Smriti · AI Cognitive Care & Memory Assistance for North East India",
  description:
    "Accessible, culturally-adapted cognitive therapy, memory training games, and caregiver analytics designed for dementia support in the North Eastern Region.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#1F4E45",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory text-ink selection:bg-marigold/30 selection:text-pine-dark">
        {children}
      </body>
    </html>
  );
}
