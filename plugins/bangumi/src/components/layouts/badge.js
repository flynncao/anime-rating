export function createBadge({ rating, className = '', position = 'top-right', mode = 'cover' }) {
  const badgeContainer = document.createElement('div')
  
  // Build class names based on mode
  let badgeClasses = `bct-badge bct-badge-${rating.toLowerCase().replace('-', '')} ${className}`
  
  if (mode === 'cover') {
    badgeClasses += ` bct-badge-${position}`
  } else if (mode === 'title') {
    badgeClasses += ' bct-badge-inline'
  }
  
  badgeContainer.className = badgeClasses
  badgeContainer.setAttribute('role', 'badge')
  badgeContainer.setAttribute('aria-label', `Age rating: ${rating}`)

  const badgeText = document.createElement('strong')
  badgeText.className = 'bct-badge-text'
  badgeText.textContent = rating

  badgeContainer.append(badgeText)

  return badgeContainer
}
