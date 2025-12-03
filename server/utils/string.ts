/**
 * Interface for anime mapping data from BangumiExtLinker
 */
export interface AnimeMappingItem {
  name: string
  name_cn: string
  date: string
  bgm_id: string
  douban_id?: string
  anidb_id?: string
  mal_id?: string
  tmdb_id?: string
  imdb_id?: string
  tvdb_id?: string
}

/**
 * Interface for the converted anime map keyed by bgm_id
 */
export interface AnimeMappingRecord {
  name: string
  name_cn: string
  date: string
  douban_id?: string
  anidb_id?: string
  mal_id?: string
  tmdb_id?: string
  imdb_id?: string
  tvdb_id?: string
}

export type AnimeMapData = Record<string, AnimeMappingRecord>

/**
 * Convert anime mapping array to object keyed by bgm_id
 * 
 * Transforms:
 * [{ bgm_id: "8", name: "...", ... }] 
 * 
 * Into:
 * { "8": { name: "...", ... } }
 * 
 * @param animeArray - Array of anime mapping items
 * @returns Object keyed by bgm_id with anime data (bgm_id field removed from values)
 */
export function convertAnimeMapArrayToObject(animeArray: AnimeMappingItem[]): AnimeMapData {
  const result: AnimeMapData = {}

  for (const anime of animeArray) {
    const { bgm_id, ...animeData } = anime
    
    if (bgm_id) {
      result[bgm_id] = animeData
    } else {
      console.warn('⚠️  Anime item missing bgm_id:', anime)
    }
  }

  return result
}
