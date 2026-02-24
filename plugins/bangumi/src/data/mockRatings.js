export const MOCK_RATINGS = {
  // Format: subjectId: { rating, source }
  8: { rating: 'G', source: 'mock' },
  245: { rating: 'PG', source: 'mock' },
  517057: { rating: 'PG-13', source: 'mock' },
  587454: { rating: 'R', source: 'mock' },
  515759: { rating: 'R18', source: 'mock' },
}

export function getSubjectRating(subjectId) {
  const id = subjectId || extractSubjectIdFromUrl()
  return MOCK_RATINGS[id] || null
}

function extractSubjectIdFromUrl() {
  const match = window.location.href.match(/\/subject\/(\d+)/)
  return match ? parseInt(match[1]) : null
}
