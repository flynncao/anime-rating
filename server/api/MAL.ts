import fs from 'node:fs'
import path from 'node:path'
import got from '../utils/got.js'
import 'dotenv/config'

const BASE_URL = 'https://api.myanimelist.net/v2'

if (!process.env.MAL_ACCESS_TOKEN) {
  throw new Error('MAL_ACCESS_TOKEN is not set in environment variables')
}

// Function to update environment variables and .env file
async function updateAccessToken(newToken: string): Promise<void> {
  // Update in-memory environment variable
  process.env.MAL_ACCESS_TOKEN = newToken

  // Update .env file if it exists and we're not in production
  if (process.env.NODE_ENV !== 'production') {
    try {
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8')

        // Replace or add MAL_ACCESS_TOKEN
        if (envContent.includes('MAL_ACCESS_TOKEN=')) {
          envContent = envContent.replace(
            /MAL_ACCESS_TOKEN=.*/,
            `MAL_ACCESS_TOKEN=${newToken}`,
          )
        }
        else {
          envContent += `\nMAL_ACCESS_TOKEN=${newToken}\n`
        }

        fs.writeFileSync(envPath, envContent, 'utf8')
        console.log('Access token updated in .env file')
      }
    }
    catch (error) {
      console.warn('Could not update .env file:', error)
    }
  }
}

// Create a retryable got instance with 401 handling
function createGotInstance() {
  return got.extend({
    headers: {
      'User-Agent': 'MyAnimeList API Client',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MAL_ACCESS_TOKEN}`,
    },
    retry: {
      limit: 2,
      calculateDelay: ({ attemptCount, error }) => {
        // Only retry on 401 errors
        if (error.response?.statusCode === 401) {
          return attemptCount === 1 ? 0 : -1 // Retry immediately once, then stop
        }
        return -1 // Don't retry other errors
      },
    },
    hooks: {
      beforeRetry: [
        async (error, retryCount) => {
          if (error.response?.statusCode === 401 && retryCount === 1) {
            await refreshAccessToken()
          }
        },
      ],
      beforeError: [
        (error) => {
          // Only log errors here, no async operations
          console.error('Request failed:', error.message)
          return error
        },
      ],
    },
  })
}

// Initialize the got instance
let gotInstance = createGotInstance()

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
  console.info('Searching for anime:', title)

  const response = await gotInstance<MALSearchResponse>(`${BASE_URL}/anime`, {
    searchParams: {
      q: title,
      limit: 20,
    },
  })

  const data = response.body

  if (data.data && data.data.length > 0) {
    let animeId: number | number[] | undefined

    if (unique || data.data.length === 1) {
      animeId = data.data[0]?.node.id
    }
    else {
      // leverage number parameter to limit results
      animeId = data.data.slice(0, number || data.data.length).map(item => item.node.id)
    }

    if (animeId) {
      console.info(`MAL ID for "${title}": ${animeId}`)
      return animeId
    }
  }

  console.warn(`No results found for "${title}"`)
  return undefined
}

export async function getAnimeDetails(animeId: number): Promise<MALAnimeDetails | undefined> {
  console.info('Fetching details for anime ID:', animeId)

  const response = await gotInstance<MALAnimeDetails>(`${BASE_URL}/anime/${animeId}`, {
    searchParams: {
      fields: 'id,title,main_picture,alternative_titles,synopsis,start_date,end_date,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,rating',
    },
  })

  return response.body
}

// set a function for refreshing tokens
interface TokenResponse {
  access_token?: string
  error?: string
}

export async function refreshAccessToken(): Promise<void> {
  console.info('Refreshing MyAnimeList access token')

  // Use the base got instance without the 401 retry hook to avoid infinite loops
  const refreshGotInstance = got.extend({
    headers: {
      'User-Agent': 'MyAnimeList API Client',
      'Content-Type': 'application/json',
    },
  })

  const response = await refreshGotInstance<TokenResponse>(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    searchParams: {
      client_id: process.env.MAL_CLIENT_ID,
      refresh_token: process.env.MAL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    },
  })

  const data = response.body

  if (data.access_token) {
    await updateAccessToken(data.access_token)

    // Recreate the got instance with the new token
    gotInstance = createGotInstance()

    console.log('Access token refreshed successfully')
  }
  else {
    console.error('Error refreshing access token:', data)
    const error = new Error(`Failed to refresh access token: ${data.error || 'Unknown error'}`)

    // If refresh fails, prompt user to update tokens manually
    const separator = '='.repeat(60)
    console.warn(`\n${separator}`)
    console.warn('⚠️  AUTOMATIC TOKEN REFRESH FAILED')
    console.warn(separator)
    console.warn('Your MyAnimeList access token and refresh token have expired.')
    console.warn('Please update your tokens and restart the server:')
    console.warn('')
    console.warn('1. Get new tokens from: https://myanimelist.net/apiconfig')
    console.warn('2. Update MAL_ACCESS_TOKEN in your .env file')
    console.warn('3. Update MAL_REFRESH_TOKEN in your .env file')
    console.warn('4. Restart the server')
    console.warn(`${separator}\n`)

    throw error
  }
}
