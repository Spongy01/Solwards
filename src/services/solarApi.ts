/**
 * Solar analysis API – calls backend at /api/v1/analyze.
 * Set VITE_API_BASE_URL (e.g. http://0.0.0.0:3000) or defaults to same origin.
 * Supports either polygon (user-drawn roof) or latitude/longitude (searched location only).
 */

import type { AnalysisResponse, Polygon } from '@/types'
import { getPolygonCentroid } from '@/utils/geometry'

const env = import.meta.env as { VITE_API_BASE_URL?: string; VITE_ANALYZE_PATH?: string }

const getBaseUrl = (): string => {
  const base = env.VITE_API_BASE_URL || ''
  return base.length ? base.replace(/\/$/, '') : ''
}

/** Backend path. Use VITE_ANALYZE_PATH if your API uses e.g. /api/v1/analyze-solar */
const getAnalyzePath = (): string => env.VITE_ANALYZE_PATH || '/api/v1/analyze'

export interface AnalyzeOptions {
  /** User-drawn roof polygon. When provided, sends user_polygon + centroid as lat/lng. */
  polygon?: Polygon
  /** Latitude (use with longitude when no polygon – e.g. searched location). */
  latitude?: number
  /** Longitude (use with latitude when no polygon). */
  longitude?: number
  /** Address string (e.g. from Places autocomplete). */
  address?: string
  /** US state code (e.g. CA). Required by backend; defaults to CA. */
  state?: string
  zipCode?: string
}

/**
 * Analyzes solar potential via backend API.
 * Call with either:
 * - polygon: sends user_polygon and uses polygon centroid for lat/lng.
 * - latitude + longitude: sends only lat/lng (no polygon); backend uses estimated/fallback roof data.
 */
export async function analyzeSolarArea(options: AnalyzeOptions): Promise<AnalysisResponse> {
  const { polygon, latitude, longitude, address = '', state = 'CA', zipCode } = options

  let lat: number
  let lng: number
  let user_polygon: [number, number][] | undefined

  if (polygon && polygon.length >= 3) {
    const centroid = getPolygonCentroid(polygon)
    lat = centroid.lat
    lng = centroid.lng
    user_polygon = polygon.map((p) => [p.lat, p.lng])
  } else if (latitude != null && longitude != null) {
    lat = latitude
    lng = longitude
    user_polygon = undefined
  } else {
    throw new Error('Provide either a polygon (3+ points) or latitude and longitude')
  }

  const body: Record<string, unknown> = {
    latitude: lat,
    longitude: lng,
    address,
    state,
    ...(zipCode != null && zipCode !== '' ? { zip_code: zipCode } : {}),
  }
  if (user_polygon) body.user_polygon = user_polygon

  const baseUrl = getBaseUrl()
  const path = getAnalyzePath()
  const url = baseUrl ? `${baseUrl}${path}` : path

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    let detail = text
    try {
      const json = JSON.parse(text)
      if (json.detail) detail = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail)
    } catch {
      // use text as-is
    }
    throw new Error(detail || `Analysis failed (${res.status})`)
  }

  const data = (await res.json()) as AnalysisResponse
  return data
}


// /**
//  * Mock solar analysis API.
//  * Replace with real backend calls when API is available.
//  * Suggested endpoint: POST /api/analyze-solar { polygon: LatLng[] }
//  */

// import type { AnalysisResult, Polygon } from '@/types'
// import { getPolygonAreaSqM } from '@/utils/geometry'

// const MOCK_DELAY_MS = 1500

// /**
//  * Analyzes solar potential for a roof polygon.
//  * Currently returns mock data after a delay; swap implementation for real API.
//  */
// export async function analyzeSolarArea(polygon: Polygon): Promise<AnalysisResult> {
//   await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

//   const areaSqM = getPolygonAreaSqM(polygon)
//   // Realistic-ish mock values based on area
//   const usableArea = Math.max(10, areaSqM * 0.7)
//   const solarScore = Math.min(100, Math.round(70 + Math.random() * 25))
//   const kwhPerSqMPerDay = 4.5 + Math.random() * 1.5
//   const energyPerDayKwh = Math.round(usableArea * (kwhPerSqMPerDay / 100) * 100) / 100
//   const costSavingsPerYear = Math.round(energyPerDayKwh * 365 * 0.12 * 100) / 100
//   const co2KgPerKwh = 0.4
//   const co2ReductionKgPerYear = Math.round(energyPerDayKwh * 365 * co2KgPerKwh)
//   const recommendedPanels = Math.max(4, Math.floor(usableArea / 2.5))

//   return {
//     solarScore,
//     energyPerDayKwh,
//     costSavingsPerYear,
//     co2ReductionKgPerYear,
//     roofAreaSqM: Math.round(areaSqM * 100) / 100,
//     recommendedPanels,
//   }
// }
