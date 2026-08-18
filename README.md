# EatWise Backend API

AI-powered food safety & nutrition analysis backend for families.

## Tech Stack

- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens) + bcrypt

## Setup

```bash
# Install dependencies
npm install

# Create .env file (see .env.example)
cp .env .env.local

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/eatwise` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `FRONTEND_URL` | CORS origin | `http://localhost:5173` |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (protected)
- `PUT /api/auth/profile` — Update profile (protected)

### Child Profiles
- `GET /api/children` — List children
- `POST /api/children` — Add child
- `PUT /api/children/:childId` — Update child
- `DELETE /api/children/:childId` — Remove child

### Products & Scanning
- `GET /api/products/search?q=` — Search products
- `GET /api/products/scan/:barcode` — Scan barcode
- `POST /api/products/analyze-label` — Analyze label image (AI placeholder)
- `GET /api/products/history` — Scan history
- `GET /api/products/:id` — Get product details

### Community
- `GET /api/community` — List posts
- `POST /api/community` — Create post
- `GET /api/community/:id` — Get post with replies
- `POST /api/community/:id/reply` — Reply to post
- `PUT /api/community/:id/like` — Toggle like

### AI Chat
- `POST /api/chat/message` — Send message
- `GET /api/chat/sessions` — List chat sessions
- `GET /api/chat/sessions/:sessionId` — Get chat history

### Health Check
- `GET /api/health` — API status
