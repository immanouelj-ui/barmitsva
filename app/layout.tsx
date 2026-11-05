import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Maison des Invitations",
    template: "%s · Maison des Invitations",
  },
  description:
    "Faire-part de mariage et bar-mitsva. Créez votre invitation et retrouvez les réponses de vos invités.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
