import got from '../utils/got.js'

interface BangumiSearchResult {
  id: number
  name: string
  name_cn?: string
  type: number
}

export async function searchBangumi(title: string): Promise<number | undefined> {
  const URL = `https://api.bgm.tv/v0/search/subject?q=${encodeURIComponent(title)}`
  const response = await got<BangumiSearchResult[]>(URL)
  const data = response.body

  if (data && data.length > 0) {
    const bangumiId = data[0]?.id
    if (bangumiId) {
      console.info(`Bangumi ID for "${title}": ${bangumiId}`)
      return bangumiId
    }
  }

  console.warn(`No results found for "${title}"`)
  return undefined
}
