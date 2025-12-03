import got from 'got'
import 'dotenv/config'

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

interface MALSearchResponse {
  data: Array<{
    node: {
      id: number
      title: string
    }
  }>
}

interface MALAnimeDetails {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  alternative_titles?: {
    synonyms: string[]
    en: string
    ja: string
  }
  synopsis?: string
  mean?: number
  rank?: number
  popularity?: number
  num_list_users?: number
  num_scoring_users?: number
  nsfw?: string
  rating?: string
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

export async function searchAnime(title: string, unique: boolean = true, number?: number): Promise<number | number[] | undefined> {
  try {
    console.info('Searching for anime:', title)
    if (!process.env.MAL_ACCESS_TOKEN) {
      throw new Error('MAL_ACCESS_TOKEN is not set in environment variables')
    }

    const response = await gotInstance(`${BASE_URL}/anime`, {
      searchParams: {
        q: title,
        limit: 20,
      },
    })

    const data: MALSearchResponse = response.body ? JSON.parse(response.body) : {}

    if (data.data && data.data.length > 0) {
      let animeId: number | number[] | undefined

      if (unique || data.data.length === 1) {
        animeId = data.data[0]?.node.id
      }
      else { 
        // leverage number parameter to limit results
        animeId = data.data.slice(0, number || data.data.length).map(item => item.node.id)
      }
      console.log('Found anime IDs:', animeId)
      return animeId
    }

    console.warn(`No results found for "${title}"`)
    return undefined
  }
  catch (error) {
    console.error('Error fetching MyAnimeList data:', error)
    return undefined
  }
}

export async function getAnimeDetails(animeId: number): Promise<MALAnimeDetails | undefined> {
  try {
    console.info('Fetching details for anime ID:', animeId)
    const response = await gotInstance(`${BASE_URL}/anime/${animeId}`, {
      searchParams: {
        fields: 'id,title,main_picture,alternative_titles,synopsis,start_date,end_date,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,rating',
      },
    })

    const data: MALAnimeDetails = response.body ? JSON.parse(response.body) : {}

    return data
  }
  catch (error) {
    console.error('Error fetching anime details:', error)
    return undefined
  }
}
