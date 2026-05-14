# Backend - Chic Senegal Style E-commerce

Backend Express.js avec MongoDB pour l'application e-commerce Chic Senegal Style.

## 🚀 Installation

### Prérequis
- Node.js >= 16
- MongoDB Atlas account

### Étapes

1. Installer les dépendances:
```bash
cd backend
npm install
```

2. Configurer le fichier `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://admin:admin2000@chic-senegal.mongodb.net/chic-senegal?retryWrites=true&w=majority
JWT_SECRET=chic_senegal_jwt_secret_key_2026
JWT_EXPIRE=7d

ADMIN_EMAIL=ndiayeabdoumamesaye1234@gmail.com
ADMIN_PASSWORD=abdou@2000
ADMIN_PHONE=76 204 81 19

PAYTECH_API_KEY=400c3e54ea2300bb08bff85a4cce5205b93405d026155aedd5ed0d0ea5d0205c
PAYTECH_API_SECRET=a4857e50f2f4c7072a1d61a97012b5b624506b772a31eb1e1bebd6f8cbb171db
PAYTECH_MERCHANT_ID=CHIC_SENEGAL_2026
PAYTECH_API_URL=https://api.paytech.sn

FRONTEND_URL=http://localhost:8082
```

3. Lancer le serveur:
```bash
npm start        # Production
npm run dev      # Développement
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Créer un compte client
- `POST /api/auth/signin` - Se connecter (client)
- `POST /api/auth/admin-signin` - Connexion admin
- `GET /api/auth/verify` - Vérifier le token

### Products
- `GET /api/products` - Obtenir tous les produits
- `GET /api/products?category=Lacostes` - Filtrer par catégorie
- `GET /api/products/:id` - Détails d'un produit
- `POST /api/products` - Créer un produit (admin)
- `PUT /api/products/:id` - Modifier un produit (admin)
- `DELETE /api/products/:id` - Supprimer un produit (admin)

### Orders
- `POST /api/orders` - Créer une commande
- `GET /api/orders` - Mes commandes (user) / Toutes les commandes (admin)
- `GET /api/orders/:id` - Détails d'une commande
- `PUT /api/orders/:id` - Changer le statut (admin)
- `POST /api/orders/:id/cancel` - Annuler une commande

### Payment
- `POST /api/payment/initiate` - Initier un paiement PayTech
- `POST /api/payment/check-status` - Vérifier le statut du paiement
- `POST /api/payment/webhook` - Webhook PayTech (notification)

## 🔐 Admin Credentials
Email: `ndiayeabdoumamesaye1234@gmail.com`
Password: `abdou@2000`

## 🗄️ Base de Données

### Collections MongoDB
- **Users** - Clients et admin
- **Products** - Catalogue des produits
- **Orders** - Commandes des clients

## 📦 Structure

```
backend/
├── controllers/   # Logique métier
├── models/        # Schémas MongoDB
├── routes/        # Routes API
├── middleware/    # Auth, validation
├── services/      # Services PayTech
├── server.js      # Point d'entrée
└── .env          # Variables d'environnement
```

## 🔗 Intégration Frontend

Le frontend appelle les endpoints du backend:

```javascript
// Exemple
const response = await fetch('http://localhost:5000/api/products', {
  method: 'GET'
});
```

## 📝 Notes
- MongoDB URI à configurer dans `.env`
- Clés PayTech sécurisées côté backend
- JWT pour l'authentification
- Admin unique (ndiayeabdoumamesaye1234@gmail.com)

---

**Backend conforme cahier des charges** ✅
