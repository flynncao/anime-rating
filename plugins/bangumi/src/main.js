import { createButton } from './components/layouts/button'
import { createCheckbox } from './components/layouts/checkbox'
import { createBadge } from './components/layouts/badge'
import { BGM_SUBJECT_REGEX } from './constants/index'
import { getSubjectRating } from './data/mockRatings'
import butterupStyles from './static/css/butterup.css'
import styles from './static/css/styles.css'
import butterup from './static/js/butterup'
import Icons from './static/svg/index'
import Storage from './storage/index'
;(async function () {
  // Validate if the current page is a Bangumi subject page
  console.log('Current URL:', location.href)
  if (!BGM_SUBJECT_REGEX.test(location.href)) {
    return
  }

  // Storage
  Storage.init({
    copyJapaneseTitle: false,
    showText: true,
  })

  const userSettings = {
    copyJapaneseTitle: Storage.get('copyJapaneseTitle') || false,
    showText: Storage.get('showText') || true,
  }

  // Badge Display Mode: 'cover' or 'title'
  const BADGE_MODE = 'title' // Change to 'cover' for cover mode

  // Layout and Events
  const injectStyles = () => {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    document.head.append(styleEl)
    const butterupStyleEl = document.createElement('style')
    butterupStyleEl.textContent = butterupStyles
    document.head.append(butterupStyleEl)
  }
  injectStyles()

  // Age Rating Badge
  const initializeBadge = () => {
    const ratingData = getSubjectRating()

    if (!ratingData) {
      console.log('Bangumi: No rating data for this subject')
      return
    }

    if (BADGE_MODE === 'cover') {
      // Mode 1: Badge on cover with absolute positioning
      const targetElement = document.querySelector('div.infobox>div')

      console.log('targetElement (cover mode):', targetElement)
      if (!targetElement) {
        console.log('Bangumi: Badge target element not found')
        return
      }

      // Prevent duplicate badges
      if (targetElement.querySelector('.bct-badge')) {
        return
      }

      // Ensure positioning context
      targetElement.style.position = 'relative'

      const badge = createBadge({
        rating: ratingData.rating,
        className: 'bct-age-rating-badge',
        position: 'top-right',
        mode: 'cover',
      })

      targetElement.append(badge)
      console.log(`Bangumi: Added ${ratingData.rating} rating badge (cover mode)`)
    } else if (BADGE_MODE === 'title') {
      // Mode 2: Badge before title with inline display
      const titleElement = document.querySelector('h1.nameSingle>a')

      console.log('titleElement (title mode):', titleElement)
      if (!titleElement) {
        console.log('Bangumi: Title element not found')
        return
      }

      // Prevent duplicate badges
      if (titleElement.parentElement.querySelector('.bct-badge')) {
        return
      }

      const badge = createBadge({
        rating: ratingData.rating,
        className: 'bct-age-rating-badge',
        mode: 'title',
      })

      // Insert badge before the title link
      titleElement.parentElement.insertBefore(badge, titleElement)
      console.log(`Bangumi: Added ${ratingData.rating} rating badge (title mode)`)
    } else {
      console.error(`Bangumi: Invalid badge mode: ${BADGE_MODE}`)
    }
  }
  initializeBadge()
})()
