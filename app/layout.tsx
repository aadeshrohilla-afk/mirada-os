import "./globals.css";

export const metadata = {
  title: "Mirada OS",
  description: "Mirada Promise Portal + Design Room",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
