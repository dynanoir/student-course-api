StudentCourseAPI – Documentation Technique
1. Contexte

StudentCourseAPI est un projet pédagogique pour le module Tests et Qualité à l’Efrei.
Il permet de gérer des étudiants et des cours, avec une API REST documentée via Swagger.
Le projet est sans base de données, toutes les données sont en mémoire via le service storage.

2. Prérequis

Node.js ≥ 18

npm

Git

3. Installation
# Cloner le dépôt
git clone https://github.com/dynanoir/student-course-api.git
cd student-course-api

# Installer les dépendances
npm install

4. Scripts npm
Commande	Description
npm run dev	Lancer le serveur en mode développement avec nodemon
npm test	Lancer les tests unitaires et d’intégration avec Jest
npm run lint	Vérifier la qualité du code avec ESLint
npm run format	Formater le code avec Prettier
5. Structure du projet
student-course-api/
│
├─ src/
│  ├─ app.js           # Entrée principale de l’application
│  ├─ routes/          # Définition des routes (students.js, courses.js)
│  ├─ controllers/     # Logique métier
│  └─ services/        # Stockage et gestion des données en mémoire
│
├─ tests/
│  └─ integration/     # Tests d’intégration
│
├─ swagger.json        # Documentation Swagger (JSON statique)
├─ swaggerDef.js       # Définition Swagger pour JSDoc
├─ package.json
└─ DOCUMENTATION.md    # Documentation technique

6. API Endpoints (Résumé)
Students

GET /students – Récupérer la liste des étudiants

POST /students – Ajouter un nouvel étudiant

Body JSON : { "name": "Alice", "email": "alice@example.com" }

Courses

GET /courses – Liste des cours

POST /courses – Créer un cours

Body JSON : { "title": "Math", "teacher": "Bob" }

GET /courses/:id – Récupérer un cours

DELETE /courses/:id – Supprimer un cours

7. Middleware et gestion des erreurs

404 – Routes inconnues

500 – Erreurs internes

Exemple d’usage :

{
  "error": "Not Found"
}

8. Documentation Swagger

Accessible via : /api-docs

Permet de visualiser les endpoints et de tester l’API directement depuis l’interface Swagger UI.

9. Tests

Tous les tests sont situés dans tests/integration.

Les tests couvrent :

CRUD des étudiants et cours

Gestion des erreurs

Swagger

Lancer : npm test

Coverage peut être généré si nécessaire avec Jest (--coverage).

10. Qualité du code

ESLint pour les standards JavaScript

Prettier pour le formatage

Intégration CI via GitHub Actions pour exécuter les tests et vérifier la qualité sur chaque PR

11. Bonnes pratiques

Utiliser des branches feature/... pour chaque amélioration

Créer une Pull Request documentée avant tout merge sur master

Vérifier les tests et la linting avant de push