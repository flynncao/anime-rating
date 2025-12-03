import type { Request, Response } from 'express'
import type { AnimeDetails, ApiError } from '../types/index.js'
import cors from 'cors'
import express from 'express'
import { getAnimeDetails, searchAnime } from './MAL.js'
import 'dotenv/config'
import { initializeDataFetcher, isDataReady, getDataFetcherState, getAnimeMapData, refreshAnimeMap } from '../utils/dataFetcher.js'

const app = express()

// CORS debugging middleware
app.use((req, res, next) => {
  console.log('🔍 CORS Debug - Request:', {
    origin: req.headers.origin,
    method: req.method,
    url: req.url,
    headers: req.headers,
  })
  next()
})

// Enable CORS for frontend - VERY PERMISSIVE FOR DEBUGGING
app.use(cors({
  origin(origin, callback) {
    console.log('🌐 CORS Origin Check:', origin)

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      console.log('📍 No origin header - allowing')
      return callback(null, true)
    }

    // List of allowed origins - VERY PERMISSIVE
    const allowedOrigins = [
      // Local development
      'http://localhost:5173',
      'http://localhost:4173',
      'https://localhost:5173',
      'https://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:4173',

      // Known production URLs
      'https://your-netlify-frontend.netlify.app',
      'https://anime-age-rating-server.vercel.app',

      // Allow any Netlify subdomain
      /\.netlify\.app$/,
      /^https:\/\/.*\.netlify\.app$/,

      // Allow any Vercel subdomain
      /\.vercel\.app$/,
      /^https:\/\/.*\.vercel\.app$/,

      // Allow any localhost subdomain
      /localhost/,
      /127\.0\.0\.1/,
    ]

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === 'string') {
        return origin === allowed
      }
      if (allowed instanceof RegExp) {
        return allowed.test(origin)
      }
      return false
    })

    console.log('✅ CORS Check Result:', { origin, isAllowed })

    if (isAllowed) {
      callback(null, true)
    }
    else {
      console.log('❌ CORS Blocked Origin:', origin)
      // For now, allow anyway with a warning (REMOVE THIS IN PRODUCTION!)
      console.log('⚠️  WARNING: Allowing blocked origin for debugging - REMOVE THIS!')
      callback(null, true)
      // In production, use this instead:
      // callback(new Error(`CORS: Origin ${origin} not allowed`), false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'Origin', 'Accept', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Cache-Control', 'Pragma'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Size', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 hours
}))

// Handle preflight requests explicitly for ALL routes
app.options('*', (req, res) => {
  console.log('🚀 OPTIONS Preflight Request:', req.headers.origin)
  res.sendStatus(204)
})

// Add manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key, Origin, Accept, Access-Control-Request-Method, Access-Control-Request-Headers')
    res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-Page-Size')
    res.header('Access-Control-Max-Age', '86400')
  }
  next()
})

// CORS error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err.message && err.message.includes('CORS')) {
    console.error('🚨 CORS Error:', err.message)
    res.status(403).json({
      error: 'CORS Error',
      message: err.message,
      origin: req.headers.origin,
    })
  }
  else {
    next(err)
  }
})

app.use(express.json())

// Middleware: Block all API requests until anime_map.json is loaded
app.use((req: Request, res: Response, next: any) => {
  // Allow health check and data status endpoints
  if (req.path === '/' || req.path === '/api/data-status' || req.path === '/health') {
    return next()
  }

  // Block all other requests if data is not ready
  if (!isDataReady()) {
    console.warn('⏳ Request blocked: Data not ready yet')
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Server is initializing. Please wait for anime_map.json to be fetched.',
    })
    return
  }

  next()
})

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Anime Search API!',
    endpoints: {
      search: '/api/search?title=YOUR_TITLE',
      searchList: '/api/searchList?title=YOUR_TITLE',
      dataStatus: '/api/data-status',
      health: '/health',
    },
  })
})

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  const state = getDataFetcherState()
  res.json({
    status: state.isReady ? 'healthy' : 'initializing',
    dataReady: state.isReady,
    lastFetch: state.lastFetch,
    error: state.error?.message || null,
  })
})

// Data status endpoint
app.get('/api/data-status', (_req: Request, res: Response) => {
  const state = getDataFetcherState()
  const data = getAnimeMapData()
  res.json({
    isReady: state.isReady,
    lastFetch: state.lastFetch,
    error: state.error?.message || null,
    dataSize: data ? Object.keys(data).length : 0,
  })
})

// Manual refresh endpoint (optional, for debugging)
app.post('/api/refresh-data', async (_req: Request, res: Response) => {
  try {
    await refreshAnimeMap()
    res.json({ message: 'Data refreshed successfully', state: getDataFetcherState() })
  }
  catch (error) {
    res.status(500).json({ error: 'Failed to refresh data', message: error instanceof Error ? error.message : String(error) })
  }
})

app.get('/api/searchList', async (req: Request, res: Response<number[] | ApiError>) => {
  const title = req.query.title as string | undefined
  if (!title) {
    res.status(400).json({ error: 'Title query parameter is required' })
    return
  } 
  try {
    const animeIds = await searchAnime(title, false)
    if (animeIds) {
      let animeDetailList: any[] = [];
      animeDetailList = await Promise.all(
        (animeIds as number[]).map(id => getAnimeDetails(id))
      )
      res.json(animeDetailList)
    }
    else {
      res.status(404).json({ error: 'Anime not found' })
    } 
  }
  catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
    console.error('Error fetching anime IDs:', error)
  }
})

app.get('/api/search', async (req: Request, res: Response<AnimeDetails | ApiError>) => {
  const title = req.query.title as string | undefined

  if (!title) {
    res.status(400).json({ error: 'Title query parameter is required' })
    return
  }
  try {
    const searchAnimeRes = await searchAnime(title, true)
    let animeId: number | undefined | number[ ] = undefined
    if(Object.hasOwnProperty.call(searchAnimeRes, 'length')) {
      animeId = (searchAnimeRes as number[])[0]
    }else {
      animeId = searchAnimeRes as number | undefined
    }
    if (animeId) {
      const animeDetails = await getAnimeDetails(animeId)
      if (animeDetails) {
        res.json(animeDetails)
      }
      else {
        res.status(404).json({ error: 'Anime details not found' })
      }
    }
    else {
      res.status(404).json({ error: 'Anime not found' })
    }
  }
  catch (error) {
    res.status(500).json({ error: 'Internal Server Error' })
    console.error('Error fetching anime details:', error)
  }
})

// Initialize data fetcher before starting the server
const port = process.env.PORT || 3000

async function startServer() {
  try {
    console.log('🔧 Starting server initialization...')
    
    // Initialize and fetch anime_map.json (this is blocking)
    await initializeDataFetcher()
    
    // Only start the server after data is ready
    app.listen(port, () => {
      console.info(`🚀 Backend server is running on http://localhost:${port}`)
      console.info(`📡 API endpoint: http://localhost:${port}/api/search?title=YOUR_TITLE`)
      console.info(`💚 Server is ready to accept requests`)
    })
  }
  catch (error) {
    console.error('💥 FATAL ERROR: Failed to initialize server')
    console.error(error)
    console.error('⛔ Server cannot start without anime_map.json. Exiting...')
    process.exit(1) // Exit the process if initialization fails
  }
}

// Start the server
startServer()
