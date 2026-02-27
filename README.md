# modaic ✦ AI Fashion Stylist

> *"Stop saying you have nothing to wear."*

**modaic** is an AI-powered wardrobe intelligence system that digitizes your closet, learns your style, and generates personalized outfit recommendations — reducing decision fatigue, improving wardrobe utilization, and making you look amazing every day.

Built with **MERN Stack** + **Google Gemini AI** (free tier) + **pixel art feminine UI**.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 👗 **Digital Wardrobe** | Upload & catalog clothing with AI auto-tagging |
| 🤖 **AI Stylist "Luna"** | Chat with Gemini-powered fashion advisor |
| ✦ **Outfit Generator** | AI creates outfit combos from your wardrobe |
| 🏗️ **Manual Builder** | Drag-and-pick outfit creation |
| 📊 **Insights** | Sustainability score, cost-per-wear, unloved items |
| 💖 **Style Quiz** | Personalize your AI recommendations |

---

## 🗂️ Folder Structure

```
modaic/
├── backend/                          # Express.js API
│   ├── src/
│   │   ├── app.js                    # Express entry point
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection
│   │   │   ├── logger.js             # Winston logger
│   │   │   └── gemini.js             # Gemini AI setup
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── WardrobeItem.model.js
│   │   │   ├── Outfit.model.js
│   │   │   └── ChatSession.model.js
│   │   ├── controllers/              # HTTP layer (thin)
│   │   │   ├── auth.controller.js
│   │   │   ├── wardrobe.controller.js
│   │   │   ├── stylist.controller.js
│   │   │   └── insights.controller.js
│   │   ├── services/                 # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── wardrobe.service.js
│   │   │   ├── gemini.service.js     # All AI interactions
│   │   │   └── insights.service.js
│   │   ├── routes/                   # Express routers
│   │   │   ├── auth.routes.js
│   │   │   ├── wardrobe.routes.js
│   │   │   ├── outfit.routes.js
│   │   │   ├── stylist.routes.js
│   │   │   ├── insights.routes.js
│   │   │   └── user.routes.js
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.middleware.js    # JWT protection
│   │   │   ├── errorHandler.js       # Centralized errors
│   │   │   └── upload.middleware.js  # Multer + Cloudinary
│   │   ├── validations/
│   │   │   └── validate.js           # express-validator
│   │   └── utils/
│   │       ├── apiResponse.js        # Standardized responses
│   │       └── jwt.js                # Token helpers
│   ├── tests/                        # Jest tests
│   ├── logs/                         # Winston log output
│   ├── .env.example
│   └── package.json
│
└── frontend/                         # React + Vite
    ├── src/
    │   ├── main.jsx                  # React entry
    │   ├── App.jsx                   # Router
    │   ├── styles/
    │   │   └── global.css            # Pixel art design system
    │   ├── context/
    │   │   └── authStore.js          # Zustand auth state
    │   ├── services/
    │   │   └── api.js                # Axios + all API calls
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── PixelIcons.jsx    # SVG pixel art icons
    │   │   └── layout/
    │   │       └── AppLayout.jsx     # Sidebar + topbar shell
    │   └── pages/
    │       ├── LoginPage.jsx
    │       ├── RegisterPage.jsx
    │       ├── StyleQuizPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── WardrobePage.jsx
    │       ├── OutfitBuilderPage.jsx
    │       ├── StylistPage.jsx
    │       └── InsightsPage.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key (FREE at https://aistudio.google.com/app/apikey)
- Cloudinary account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/yourname/modaic.git
cd modaic

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your keys

# Frontend
cd ../frontend
cp .env.example .env
```

**Required `.env` values (backend):**
```env
MONGODB_URI=mongodb://localhost:27017/modaic
JWT_SECRET=your_min_32_char_secret_here
GEMINI_API_KEY=your_free_gemini_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

Open http://localhost:5173 ✦

---

## 🌐 Deployment

### Backend → Railway / Render

1. Push to GitHub
2. Connect repo to Railway/Render
3. Add environment variables
4. Set build command: `npm install`
5. Set start command: `node src/app.js`

### Frontend → Vercel / Netlify

1. Connect GitHub repo
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add env var: `VITE_API_URL=https://your-backend.railway.app/api/v1`

---

## 🤖 AI — Google Gemini (Free Tier)

| Plan | RPM | TPD | Cost |
|------|-----|-----|------|
| Gemini 1.5 Flash | 15 | 1M tokens | **FREE** |

Get your key at: https://aistudio.google.com/app/apikey

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/wardrobe` | Get all items |
| POST | `/api/v1/wardrobe` | Add item (with image) |
| POST | `/api/v1/stylist/chat` | Chat with Luna AI |
| POST | `/api/v1/stylist/generate-outfits` | AI outfit generation |
| GET | `/api/v1/insights` | Wardrobe analytics |

---

## 🎨 Design System

Built with a **pixel art feminine aesthetic**:
- **Font Display:** Press Start 2P (pixel font)
- **Font Body:** Nunito (rounded, friendly)
- **Primary:** `#ec4899` (hot pink)
- **Secondary:** `#a78bfa` (lavender)
- **Accents:** mint, peach, yellow
- **Pattern:** 8px dithered checkerboard background
- **UI:** Zero border-radius, pixel shadows (`4px 4px 0px #db2777`)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini 1.5 Flash (FREE) |
| Images | Cloudinary |
| Auth | JWT (access + refresh tokens) |
| Deployment | Vercel (FE) + Railway (BE) |

---

*Built with 💕 by a 3rd year CS student who wants recruiters to stop scrolling.*
