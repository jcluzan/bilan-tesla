# Bilan Énergétique Tesla

Calculateur statique (sans base de données, sans login) pour comparer une année
de conduite en Tesla avec l'équivalent thermique (Audi A3 diesel) : énergie
maison, superchargeurs, entretien, et bilan comparatif avec graphes + export PDF.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000

## Déployer sur Vercel

1. Pousser ce dossier sur un repo GitHub (ou via `vercel` CLI directement).
2. Sur vercel.com, "Add New Project" → importer le repo.
3. Vercel détecte automatiquement Next.js, aucune configuration nécessaire.
4. Déployer.

Pour un sous-domaine type `tesla-bilan.cluzan.com`, ajouter le domaine dans
les paramètres du projet Vercel puis créer l'enregistrement CNAME correspondant
chez ton registrar / DNS.

## Notes

- Toutes les données restent dans le navigateur (state React), rien n'est
  envoyé à un serveur ni stocké.
- Le bouton "Exporter en PDF" capture la page (sauf les boutons d'action) et
  génère un PDF multi-pages via html2canvas + jsPDF.
- Couleurs : teal `#5EEAD4` = univers électrique (Tesla), amber `#F4A261` =
  univers thermique (Audi A3).
