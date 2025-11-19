# Environment Configuration

This project uses Vite's environment variable system to manage different API endpoints for development and production.

## Environment Files

- `.env.development` - Used during development (`npm run dev`)
- `.env.production` - Used during production build (`npm run build`)

## Environment Variables

### VITE_API_URL
Controls the backend API endpoint:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-vercel-backend.vercel.app`

## How It Works

### Development Mode
1. Vite loads `.env.development`
2. Proxy is configured to `http://localhost:3000`
3. API calls go through Vite's dev server proxy

### Production Mode
1. Vite loads `.env.production`
2. Frontend makes direct calls to the production backend
3. No proxy is used - calls go directly to Vercel backend

## Configuration Files

### Vite Config (`vite.config.ts`)
- Dynamically sets backend URL based on mode
- Configures proxy for development
- Injects environment variables

### Environment Files
- Automatically loaded by Vite based on the mode
- Variables prefixed with `VITE_` are exposed to the client

## Usage in Code

```typescript
// Access the API URL
const apiUrl = import.meta.env.VITE_API_URL

// Make API calls
const response = await axios.get(`${apiUrl}/api/search`, {
  params: { title: searchTitle }
})
```

## Deployment

### Netlify (Frontend)
Set environment variable in Netlify dashboard:
```
VITE_API_URL=https://your-vercel-backend.vercel.app
```

### Vercel (Backend)
Set environment variable in Vercel dashboard:
```
FRONTEND_URL=https://your-frontend.netlify.app
```
