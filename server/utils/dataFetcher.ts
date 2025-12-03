import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cron from 'node-cron'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')
const ANIME_MAP_FILE = path.join(DATA_DIR, 'anime_map.json')
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Rhilip/BangumiExtLinker/main/data/anime_map.json'

interface DataFetcherState {
  isReady: boolean
  data: any | null
  lastFetch: Date | null
  error: Error | null
}

const state: DataFetcherState = {
  isReady: false,
  data: null,
  lastFetch: null,
  error: null,
}

/**
 * Fetch anime_map.json from GitHub and save it locally
 */
export async function fetchAnimeMap(): Promise<void> {
  console.log('🔄 Reading anime_map.json from Github or local.')

  // if local file exists and is less than 7 days old, skip fetch (check data/log.json)
  const logFile = path.join(DATA_DIR, 'log.json')
  try {
    const logData = await fs.readFile(logFile, 'utf-8')
    const logJson = JSON.parse(logData)

    console.log('logJson.last_update', logJson.last_update)
    let cacheFileExist = false
    const fileStat = await fs.stat(ANIME_MAP_FILE).catch(() => null)
    cacheFileExist = fileStat !== null

    const lastUpdate = new Date(logJson.last_update)
    const now = new Date()
    const diffDays = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    if (cacheFileExist && diffDays < 7) {
      // use local file
      console.log('✅ Local anime_map.json is up-to-date. Skipping fetch.')
      state.isReady = true
      state.lastFetch = lastUpdate
      const localData = await fs.readFile(ANIME_MAP_FILE, 'utf-8')
      state.data = JSON.parse(localData)
    }
    else {
      try {
        // Ensure data directory exists
        await fs.mkdir(DATA_DIR, { recursive: true })

        // Fetch the file from GitHub
        const response = await fetch(GITHUB_RAW_URL)

        if (!response.ok) {
          throw new Error(`Failed to fetch anime_map.json: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        // Save to file
        await fs.writeFile(ANIME_MAP_FILE, JSON.stringify(data, null, 2), 'utf-8')

        // Update state
        state.data = data
        state.isReady = true
        state.lastFetch = new Date()
        state.error = null

        console.log('✅ anime_map.json fetched and saved successfully')
        console.log(`📊 Last fetch: ${state.lastFetch.toISOString()}`)

        // Update log.json
        logJson.last_update = state.lastFetch.toISOString()
        await fs.writeFile(logFile, JSON.stringify(logJson, null, 2), 'utf-8')
      }
      catch (error) {
        console.error('❌ Error fetching anime_map.json:', error)
        state.error = error instanceof Error ? error : new Error(String(error))

        // Try to load from local file if fetch fails
        try {
          const localData = await fs.readFile(ANIME_MAP_FILE, 'utf-8')
          state.data = JSON.parse(localData)
          state.isReady = true
          console.log('⚠️  Using cached local anime_map.json')
        }
        catch (localError) {
          console.error('❌ Failed to load local anime_map.json:', localError)
          state.isReady = false
          throw new Error('Failed to fetch or load anime_map.json. Server cannot start.')
        }
      }
    }
  }
  catch (err) {
    console.error('❌ Error reading log.json:', err)
  }
}

/**
 * Initialize data fetcher - must be called before server starts
 */
export async function initializeDataFetcher(): Promise<void> {
  console.log('🚀 Initializing data fetcher...')

  // Initial fetch (blocking)
  await fetchAnimeMap()

  if (!state.isReady) {
    throw new Error('Failed to initialize anime_map.json. Server cannot start.')
  }

  // Schedule periodic updates every week on Sunday at 3 AM
  cron.schedule('0 3 * * 0', async () => {
    console.log('⏰ Cron job triggered: Updating anime_map.json...')
    try {
      await fetchAnimeMap()
    }
    catch (error) {
      console.error('❌ Cron job failed to update anime_map.json:', error)
      // Don't crash the server, just log the error and keep using cached data
    }
  })

  console.log('✅ Data fetcher initialized. Cron job scheduled for daily updates at 3 AM.')
}

/**
 * Get the current state of the data fetcher
 */
export function getDataFetcherState(): DataFetcherState {
  return { ...state }
}

/**
 * Check if data is ready
 */
export function isDataReady(): boolean {
  return state.isReady
}

/**
 * Get the anime map data
 */
export function getAnimeMapData(): any | null {
  return state.data
}

/**
 * Manually trigger a data refresh
 */
export async function refreshAnimeMap(): Promise<void> {
  await fetchAnimeMap()
}
