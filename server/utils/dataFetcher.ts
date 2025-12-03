import type { AnimeMapData, AnimeMappingItem } from './string.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cron from 'node-cron'
import { convertAnimeMapArrayToObject } from './string.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../data')
const ANIME_MAP_FILE = path.join(DATA_DIR, 'anime_map.json')
const FETCH_LOG_FILE = path.join(DATA_DIR, 'log.json')
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Rhilip/BangumiExtLinker/main/data/anime_map.json'

interface DataFetcherState {
  isReady: boolean
  data: AnimeMapData | null
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
  console.log('🔄 Fetching anime_map.json from GitHub...')
  // TODO(refactor): improve error handling and logging (not elegant currently)
  try {
    // Ensure data directory exists
    try {
      await fs.access(DATA_DIR)
    }
    catch {
      await fs.mkdir(DATA_DIR)
    }
    let needsRetrieve = false // flag to determine if we need to fetch new data
    let map_file: any = null
    let log_file: any = null

    map_file = await fs.readFile(ANIME_MAP_FILE, 'utf-8').catch(() => null)
    log_file = await fs.readFile(FETCH_LOG_FILE, 'utf-8').catch(() => null)

    if (log_file) {
      const logData = JSON.parse(log_file)
      console.log('logData', logData)
      const lastFetch = new Date(logData.lastFetch)
      const now = new Date()
      const diffInHours = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60)
      console.log('diffInHours', diffInHours)
      if (diffInHours < 168) {
        console.log('✅ anime_map.json is up-to-date. No need to fetch.')
        needsRetrieve = false
      }
      else {
        needsRetrieve = true
      }
    }
    else {
      needsRetrieve = true
    }
    let rawData: any
    console.log('needsRetrieve', needsRetrieve)
    if (needsRetrieve) {
      // Fetch the file from GitHub
      const response = await fetch(GITHUB_RAW_URL)

      if (!response.ok) {
        throw new Error(`Failed to fetch anime_map.json: ${response.status} ${response.statusText}`)
      }
      rawData = await response.json()
      // Save raw data to file for backup
      await fs.writeFile(ANIME_MAP_FILE, JSON.stringify(rawData, null, 2), 'utf-8')
      // Save fetch log
      const logData = {
        lastFetch: new Date().toISOString(),
      }
      await fs.writeFile(FETCH_LOG_FILE, JSON.stringify(logData, null, 2), 'utf-8')
    }
    else {
      // load from local file
      rawData = JSON.parse(map_file)
    }
    // Convert array to object keyed by bgm_id
    const convertedData = convertAnimeMapArrayToObject(rawData as AnimeMappingItem[])
    // Update state with converted data
    state.data = convertedData
    state.isReady = true
    state.lastFetch = new Date()
    state.error = null

    console.log('✅ anime_map.json fetched and converted successfully')
    console.log(`📊 Total entries: ${Object.keys(convertedData).length}`)
    console.log(`📊 Last fetch: ${state.lastFetch.toISOString()}`)
  }
  catch (error) {
    console.error('❌ Error fetching anime_map.json:', error)
    state.error = error as Error
    if (!state.data) {
      state.isReady = false
    }
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
export function getAnimeMapData(): AnimeMapData | null {
  return state.data
}

/**
 * Manually trigger a data refresh
 */
export async function refreshAnimeMap(): Promise<void> {
  await fetchAnimeMap()
}
