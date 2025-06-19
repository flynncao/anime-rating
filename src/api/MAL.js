import got from 'got'
import 'dotenv/config'
// Ensure you have dotenv installed and configured
const BASE_URL = 'https://api.myanimelist.net/v2'

if (!process.env.MAL_ACCESS_TOKEN) {
  throw new Error('MAL_ACCESS_TOKEN is not set in environment variables')
}

const gotInstance = got.extend({
  headers: {
    'User-Agent': 'MyAnimeList API Client',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.MAL_ACCESS_TOKEN}`,
  },
})

export async function searchAnime(title) {
  try {
    console.log('Searching for anime:', title)
    if (!process.env.MAL_ACCESS_TOKEN) {
      throw new Error('MAL_ACCESS_TOKEN is not set in environment variables')
    }

    const response = await gotInstance(`${BASE_URL}/anime`, {
      searchParams: {
        q: title,
        limit: 4,
      },
    })
    response.headers['user-agent'] = 'MyAnimeList API Client'
    // print headers
    const data = response.body ? JSON.parse(response.body) : {}

    if (data.data && data.data.length > 0) {
      // Assuming the first result is the most relevant
      const animeId = data.data[0].node.id
      console.log(`Anime ID for "${title}": ${animeId}`)
      return animeId
    }
    else {
      console.log(`No results found for "${title}"`)
      return null
    }
  }
  catch (error) {
    console.error('Error fetching MyAnimeList data:', error)
    return null
  }
}

export async function getAnimeDetails(animeId) {
  try {
    console.log('Fetching details for anime ID:', animeId)
    const response = await gotInstance(`${BASE_URL}/anime/${animeId}`, {
      searchParams: {
        fields: 'id,title,main_picture,alternative_titles,synopsis,start_date,end_date,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,rating',
      },
    })

    const data = response.body ? JSON.parse(response.body) : {}

    return data
  }
  catch (error) {
    console.error('Error fetching anime details:', error)
    return null
  }
}
