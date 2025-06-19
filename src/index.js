import Koa from 'koa'
import Router from 'koa-router'
import { getAnimeDetails, searchAnime } from './api/MAL.js'

const app = new Koa()

// Create a Koa route to handle requests, input by user or element: japanese title, router should be able to handle GET requests and the url is "/search?title=進撃の巨人", should be ascynchronous because later I will call another API if the title is successfully fetched, using koa-router
const router = new Router()
// base router /
router.get('/', (ctx) => {
  ctx.body = 'Welcome to the Anime Search API! Use /search?title=YOUR_TITLE to search for anime.'
})

router.get('/search', async (ctx) => {
  console.log('ctx.query', ctx.query)
  const title = ctx.query.title

  if (!title) {
    ctx.status = 400
    ctx.body = 'Title query parameter is required'
    return
  }
  try {
    const animeId = await searchAnime(title)

    if (animeId) {
      const animeDetails = await getAnimeDetails(animeId)
      ctx.body = animeDetails
    }
    else {
      ctx.status = 404
      ctx.body = 'Anime not found'
    }
  }
  catch (error) {
    ctx.status = 500
    ctx.body = 'Internal Server Error'
    console.error('Error fetching anime details:', error)
  }
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
