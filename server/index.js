import express from 'express'
import cors from 'cors'
import { getAnimeDetails, searchAnime } from './api/MAL.js'
import 'dotenv/config'

const app = express()

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Anime Search API!',
    endpoints: {
      search: '/api/search?title=YOUR_TITLE',
    },
  })
})

app.get('/api/search', async (req, res) => {
  const title = req.query.title

  if (!title) {
    res.status(400).json({ error: 'Title query parameter is required' })
    return
  }
  try {
    const animeId = await searchAnime(title)

    if (animeId) {
      const animeDetails = await getAnimeDetails(animeId)
      res.json(animeDetails)
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.info(`🚀 Backend server is running on http://localhost:${port}`)
  console.info(`📡 API endpoint: http://localhost:${port}/api/search?title=YOUR_TITLE`)
})
