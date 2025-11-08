import got from 'got'

interface BangumiSearchResult {
  id: number
  name: string
  name_cn?: string
  type: number
}

export async function searchBangumi(title: string): Promise<number | null> {
  try {
    const URL = `https://api.bgm.tv/v0/search/subject?q=${encodeURIComponent(title)}`
    const response = await got(URL)
    const data: BangumiSearchResult[] = JSON.parse(response.body)

    if (data && data.length > 0) {
      const bangumiId = data[0]?.id
      if (bangumiId) {
        console.info(`Bangumi ID for "${title}": ${bangumiId}`)
        return bangumiId
      }
    }

    console.warn(`No results found for "${title}"`)
    return null
  }
  catch (error) {
    console.error('Error fetching Bangumi data:', error)
    return null
  }
}
