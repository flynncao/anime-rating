# 🎌 Anime Rating Search

A modern full-stack application for searching anime information using MyAnimeList API. Built with **TypeScript** throughout - separated frontend and backend services.

## 📁 Project Structure

```
anime-rating/
├── client/                 # Frontend (Vue 3 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── AnimeSearch.vue    # Search interface component
│   │   ├── App.vue               # Main app component
│   │   ├── main.ts               # App entry point
│   │   ├── style.css             # Global styles
│   │   └── vite-env.d.ts         # Vite type definitions
│   ├── vite.config.ts            # Vite configuration
│   ├── uno.config.ts             # UnoCSS configuration
│   ├── tsconfig.json             # TypeScript config (references)
│   ├── tsconfig.app.json         # TypeScript config (app)
│   └── package.json              # Frontend dependencies
│
├── server/                 # Backend (Express.js + TypeScript)
│   ├── api/
│   │   ├── MAL.ts                # MyAnimeList API integration
│   │   └── bangumi.ts            # Bangumi API (optional)
│   ├── types/
│   │   └── index.ts              # Shared type definitions
│   └── index.ts                  # Express server
│
├── tsconfig.server.json    # TypeScript config for backend
├── .env                    # Environment variables (create this!)
└── package.json            # Root package.json with scripts
```

## 🚀 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe development with strict mode
- **Vite** - Fast build tool and dev server
- **UnoCSS** - Instant on-demand atomic CSS engine (by Anthony Fu)
- **TailwindCSS** - Utility-first CSS framework (via UnoCSS preset)
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Web framework for Node.js
- **TypeScript** - Full type safety on the backend
- **TSX** - TypeScript execution engine (by esbuild)
- **CORS** - Cross-origin resource sharing
- **Got** - HTTP request library
- **MyAnimeList API** - Anime data source

## 📦 Installation

1. **Clone and navigate to the project**
   ```bash
   cd d:\flynncao\anime-rating
   ```

2. **Install dependencies** (root and client)
   ```bash
   pnpm install
   cd client && pnpm install && cd ..
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   MAL_ACCESS_TOKEN=your_myanimelist_api_token_here
   PORT=3000
   ```

   To get a MAL access token:
   - Visit [MyAnimeList API](https://myanimelist.net/apiconfig)
   - Create an application
   - Generate your access token

## 🎮 Usage

### Development Mode (Recommended)

Run both frontend and backend together:
```bash
pnpm run dev
```

Or run them separately:

**Backend only (TypeScript with hot-reload):**
```bash
pnpm run dev:server
```
- Runs on `http://localhost:3000`
- Hot-reloads on file changes with TSX watch mode
- Full TypeScript type checking

**Frontend only:**
```bash
pnpm run dev:client
```
- Runs on `http://localhost:5173`
- Hot-reloads on file changes
- Proxies API requests to backend

### Type Checking

Check TypeScript types without running:
```bash
# Check both frontend and backend
pnpm run type-check

# Check backend only
pnpm run type-check:server

# Check frontend only
pnpm run type-check:client
```

### Production Mode

1. Build both frontend and backend:
   ```bash
   pnpm run build
   ```

2. Start the backend:
   ```bash
   pnpm run start:server
   ```

3. Serve the frontend:
   ```bash
   pnpm run start:client
   ```

## 🎯 Features

- **Type-Safe Development**: Full TypeScript coverage on both frontend and backend
- **Search Interface**: Type any anime title and press Enter or click Search
- **Beautiful UI**: Modern gradient design with responsive layout
- **Detailed Information**:
  - Anime cover image
  - Titles (English, Japanese, Romaji)
  - Scores and rankings
  - Popularity metrics
  - Synopsis
  - Air dates and ratings
- **Loading States**: Visual feedback during searches
- **Error Handling**: User-friendly error messages
- **Strict Type Checking**: Catch bugs before runtime

## 🔌 API Endpoints

### Backend API

**Search Anime**
```
GET /api/search?title=YOUR_ANIME_TITLE
```

**Response:**
```typescript
{
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  mean?: number
  rank?: number
  popularity?: number
  synopsis?: string
  // ... and more
}
```

## 🛠️ Development Tips

### Adding New Features

**Frontend (Vue + TypeScript):**
- Components are in `client/src/components/`
- Use `<script setup lang="ts">` for TypeScript
- Interface definitions for better autocomplete
- UnoCSS classes work like TailwindCSS
- Shortcuts available: `btn`, `btn-primary`, `input`, `card`

**Backend (Express + TypeScript):**
- Add new routes in `server/index.ts`
- API integrations go in `server/api/`
- Shared types in `server/types/index.ts`
- Use proper TypeScript types for request/response
- Don't forget to add CORS for new endpoints

### TypeScript Benefits

- **Auto-completion**: Full IntelliSense in VS Code
- **Type Safety**: Catch errors at compile time
- **Refactoring**: Rename variables/functions safely
- **Documentation**: Types serve as inline documentation

### UnoCSS Shortcuts

Predefined shortcuts in `client/uno.config.ts`:
- `btn` - Base button styles
- `btn-primary` - Primary blue button
- `input` - Styled input field
- `card` - Card container with shadow

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Run both frontend & backend in dev mode |
| `pnpm run dev:server` | Run backend with TSX watch mode |
| `pnpm run dev:client` | Run frontend with Vite |
| `pnpm run build` | Build both frontend & backend |
| `pnpm run build:server` | Build backend TypeScript to dist/ |
| `pnpm run build:client` | Build frontend for production |
| `pnpm run type-check` | Type-check both frontend & backend |
| `pnpm run type-check:server` | Type-check backend only |
| `pnpm run type-check:client` | Type-check frontend only |
| `pnpm run start:server` | Start backend in production |
| `pnpm run lint` | Run ESLint |
| `pnpm run lint:fix` | Fix ESLint errors |

## 📦 Project Features

- ✅ **Full TypeScript Stack** - Both frontend and backend
- ✅ **Modern Vue 3** - Composition API with `<script setup>`
- ✅ **UnoCSS by Anthony Fu** - Instant atomic CSS
- ✅ **Express + TypeScript** - Type-safe REST API
- ✅ **Hot Reload** - Both services support hot-reload
- ✅ **Type Checking** - Catch errors before runtime
- ✅ **ESLint** - Code quality with @antfu/eslint-config
- ✅ **Monorepo Structure** - Organized and maintainable

## 🤝 Contributing

Feel free to fork and contribute to this project!

## 📄 License

MIT © Flynn Cao
