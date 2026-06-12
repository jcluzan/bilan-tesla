import './globals.css';

export const metadata = {
  title: 'Bilan Annuel Tesla',
  description: "Bilan annuel Tesla vs véhicule thermique — économies d'énergie et d'entretien",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
