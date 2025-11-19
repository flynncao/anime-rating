import type { Request, Response } from 'express'
import type { AnimeDetails, ApiError } from '../types/index.js'
import cors from 'cors'
import express from 'express'
import { getAnimeDetails, searchAnime } from './MAL.js'

const app = express()

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Anime Search API!',
    endpoints: {
      search: '/api/search?title=YOUR_TITLE',
    },
  })
})

app.get('/api/search', async (req: Request, res: Response<AnimeDetails | ApiError>) => {
  const title = req.query.title as string | undefined

  if (!title) {
    res.status(400).json({ error: 'Title query parameter is required' })
    return
  }
  try {
    const animeId = await searchAnime(title)

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

export default app
