import express from 'express'
import { getAnimeDetails, searchAnime } from './api/MAL.js'
import 'dotenv/config'

const app = express()

app.get('/', (req, res) => {
  res.send('Welcome to the Anime Search API! Use /search?title=YOUR_TITLE to search for anime.')
})

app.get('/search', async (req, res) => {
  console.log('req.query', req.query)
  const title = req.query.title

  if (!title) {
    res.status(400).send('Title query parameter is required')
    return
  }
  try {
    const animeId = await searchAnime(title)

    if (animeId) {
      const animeDetails = await getAnimeDetails(animeId)
      res.json(animeDetails)
    }
    else {
      res.status(404).send('Anime not found')
    }
  }
  catch (error) {
    res.status(500).send('Internal Server Error')
    console.error('Error fetching anime details:', error)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
