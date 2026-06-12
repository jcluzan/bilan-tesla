import './globals.css';

export const metadata = {
  title: 'Bilan Énergétique Tesla',
  description: "Bilan annuel Tesla vs Audi A3 — économies d'énergie et d'entretien",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
