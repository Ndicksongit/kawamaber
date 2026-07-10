Bienvenue dans KAWA MABER — Application de gestion complète pour la transformation du café.

Structure:
- backend/ : API Node + TypeScript + Prisma (Postgres)
- frontend/ : React + TypeScript (Vite)
- docker-compose.yml : Postgres + backend + frontend (dev)

Usage rapide (dev):
1. Copier .env depuis backend/.env.example et adapter DATABASE_URL et JWT_SECRET.
2. docker-compose up --build
3. Dans backend/: npx prisma migrate dev --name init && npx prisma generate
4. Backend: npm run dev
5. Frontend: npm run dev (ou via docker-compose)

Fonctionnalités initiales:
- Auth (username/password, JWT)
- RBAC (ADMIN, MANAGER, AGRONOMIST, ACCOUNTANT, WORKER, IT)
- Gestion des planteurs (Farmers)
- Gestion des parcelles (Field) avec GeoJSON et calcul d'aires (hectares)
- Enregistrement des plantages (Planting)
- Processings, Purchases, Exports
- Gestion des prêts (Loan + Repayment)
- Journal d'activités (ActivityLog)

Prochaines étapes recommandées:
- Ajouter PostGIS pour index spatial si dataset important
- Remplacer stockage JWT par HttpOnly cookies en production
- Ajouter workflows métier (lot tracking, inventaire, qualité)
- Ajouter tests et pipeline CI
