// Shared type definitions for the anime rating application

export interface AnimeDetails {
  id: number
  title: string
  main_picture?: {
    medium: string
    large: string
  }
  alternative_titles?: {
    synonyms: string[]
    en: string
    ja: string
  }
  synopsis?: string
  mean?: number
  rank?: number
  popularity?: number
  num_list_users?: number
  num_scoring_users?: number
  nsfw?: string
  rating?: string
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

export interface SearchParams {
  title: string
}

export interface ApiError {
  error: string
}
