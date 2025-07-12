import got from 'got'
// input by user or element: japanese title

// output by user or element: Bangumi ID

const title = '進撃の巨人'

const URL = `https://api.bgm.tv/v0/search/subject?q=${encodeURIComponent(title)}`

export async function searchBangumi(title) {
  try {
    const response = await got(URL)
    const data = JSON.parse(response.body)

    if (data && data.length > 0) {
      // Assuming the first result is the most relevant
      const bangumiId = data[0].id
      console.log(`Bangumi ID for "${title}": ${bangumiId}`)
      return bangumiId
    }
    else {
      console.log(`No results found for "${title}"`)
      return null
    }
  }
  catch (error) {
    console.error('Error fetching Bangumi data:', error)
    return null
  }
}
