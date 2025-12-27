// init got instance and export
import got from 'got'

// Create a centralized got instance with default configuration and hooks
const gotInstance = got.extend({
  // Default timeout for all requests
  timeout: {
    request: 10000, // 10 seconds
  },

  // Default headers for all requests
  headers: {
    'User-Agent': 'AnimeRatingApp/1.0',
    'Accept': 'application/json',
  },

  // Response handling - automatically parse JSON
  responseType: 'json',

  // Retry configuration
  retry: {
    limit: 2,
    methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
    errorCodes: [
      'ETIMEDOUT',
      'ECONNRESET',
      'EADDRINUSE',
      'ECONNREFUSED',
      'EPIPE',
      'ENOTFOUND',
      'ENETUNREACH',
      'EAI_AGAIN',
    ],
  },

  // Hooks for request/response interception
  hooks: {
    beforeRequest: [
      (options) => {
        console.log(`[GOT] Request started: ${options.method} ${options.url}`)

        // Add timestamp to all requests
        if (!options.headers) {
          options.headers = {}
        }
        options.headers['X-Request-Timestamp'] = Date.now().toString()
      },
    ],
    afterResponse: [
      (response) => {
        console.log(`[GOT] Response received: ${response.statusCode} ${response.requestUrl}`)

        // Calculate response time
        const requestTimestamp = response.request.options.headers?.['X-Request-Timestamp']
        if (requestTimestamp && typeof requestTimestamp === 'string') {
          const responseTime = Date.now() - Number.parseInt(requestTimestamp)
          console.log(`[GOT] Request took ${responseTime}ms`)
        }

        // Handle non-200 status codes
        if (response.statusCode !== 200) {
          throw new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
        }

        return response
      },
    ],
    beforeError: [
      (error) => {
        // Centralized error handling
        if (error.response) {
          // HTTP error (4xx, 5xx)
          const statusCode = error.response.statusCode
          const statusMessage = error.response.statusMessage

          if (statusCode >= 400 && statusCode < 500) {
            console.error(`[GOT] Client error ${statusCode}: ${statusMessage}`)
          }
          else if (statusCode >= 500) {
            console.error(`[GOT] Server error ${statusCode}: ${statusMessage}`)
          }
        }
        else {
          // Network or other error
          console.error(`[GOT] Request failed: ${error.message}`)
        }

        return error
      },
    ],
  },
})

export default gotInstance
