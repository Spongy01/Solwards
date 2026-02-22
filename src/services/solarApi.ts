
/**
 * Solar analysis API – calls backend at /api/v1/analyze.
 * Set VITE_API_BASE_URL (e.g. http://0.0.0.0:3000) or defaults to same origin.
 * Supports either polygon (user-drawn roof) or latitude/longitude (searched location only).
 */

import type { AnalysisResponse, Polygon, SummaryResponse } from '@/types'
import { getPolygonCentroid } from '@/utils/geometry'

const env = import.meta.env as { VITE_API_BASE_URL?: string; VITE_ANALYZE_PATH?: string }

const getBaseUrl = (): string => {
  const base = env.VITE_API_BASE_URL || ''
  return base.length ? base.replace(/\/$/, '') : ''
}

/** Backend path. Use VITE_ANALYZE_PATH if your API uses e.g. /api/v1/analyze-solar */
const getAnalyzePath = (): string => env.VITE_ANALYZE_PATH || '/api/v1/analyze'

const SUMMARY_PATH = '/api/v1/summary'

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
  const dailyKwh = data.solar_potential?.daily_generation_kwh ?? 0
  data.monthly_generation = computeMonthlyGeneration(dailyKwh)
  return data
}

/**
 * Fetch LLM-generated summary for an analysis result.
 * Call after you have the full AnalysisResponse from analyzeSolarArea.
 */
export async function fetchSummaryForAnalysis(result: AnalysisResponse): Promise<SummaryResponse> {
  const body = {
    analysis_id: result.analysis_id,
    location: result.location,
    solar_potential: result.solar_potential,
    ...(result.financial_outlook ? { financial_outlook: result.financial_outlook } : {}),
    additional_context: undefined as string | undefined,
  }
  const baseUrl = getBaseUrl()
  const url = baseUrl ? `${baseUrl}${SUMMARY_PATH}` : SUMMARY_PATH
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
    throw new Error(detail || `Summary failed (${res.status})`)
  }
  return (await res.json()) as SummaryResponse
}

/** Month keys in calendar order (0 = Jan, 11 = Dec) for monthly_generation output */
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const

/**
 * Baseline seasonal ratios by month (Northern Hemisphere typical solar irradiance).
 * Summer months higher, winter lower. Used so current month's ratio is normalized to 1.
 */
const BASELINE_MONTHLY_RATIOS: Record<(typeof MONTH_KEYS)[number], number> = {
  jan: 0.6,
  feb: 0.7,
  mar: 0.9,
  apr: 1.05,
  may: 1.15,
  jun: 1.2,
  jul: 1.25,
  aug: 1.15,
  sep: 1.0,
  oct: 0.85,
  nov: 0.7,
  dec: 0.6,
}

function getDaysInMonth(monthIndex: number, year: number): number {
  // monthIndex 0 = Jan, 11 = Dec
  if (monthIndex === 1) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28
  }
  const days = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return days[monthIndex] ?? 31
}

/**
 * Compute monthly generation (kWh) from daily rate.
 * Current month's ratio is 1; other months use seasonal ratios (summer > 1, winter < 1 relative to current month).
 */
function computeMonthlyGeneration(dailyGenerationKwh: number): Record<(typeof MONTH_KEYS)[number], number> {
  const now = new Date()
  const currentMonthIndex = now.getMonth()
  const year = now.getFullYear()
  const currentMonthRatio = BASELINE_MONTHLY_RATIOS[MONTH_KEYS[currentMonthIndex]]

  const out = {} as Record<(typeof MONTH_KEYS)[number], number>
  for (let m = 0; m < 12; m++) {
    const key = MONTH_KEYS[m]
    const normalizedRatio = currentMonthRatio === 0 ? 1 : BASELINE_MONTHLY_RATIOS[key] / currentMonthRatio
    const days = getDaysInMonth(m, year)
    out[key] = Math.round(dailyGenerationKwh * days * normalizedRatio)
  }
  return out
}




// const MOCK_DELAY_MS = 1500

// /**
//  * Analyzes solar potential for a roof polygon.
//  * Currently returns mock data after a delay; swap implementation for real API.
//  */
// export async function analyzeSolarArea(polygon: Polygon): Promise<AnalysisResponse> {
//   // Use unused variables to fix TS build errors for mock implementation
//   console.log('Mock analyzing area for polygon, sq meters:', getPolygonAreaSqM(polygon))
//   await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

//   return {
//     "analysis_id": "09153c30-827c-4500-85d8-5b96a6c199b1",
//     "timestamp": "2026-02-22T07:36:28.936941",
//     "location": {
//       "latitude": 37.7749,
//       "longitude": -122.4194,
//       "address": "123 Main St, San Francisco, CA"
//     },
//     "roof_analysis": {
//       "total_area_sqft": 13149.5,
//       "usable_area_sqft": 11177.1,
//       "roof_segments": [
//         {
//           "segment_id": 1,
//           "area_sqft": 13149.5,
//           "orientation_degrees": 180,
//           "orientation_cardinal": "south",
//           "tilt_degrees": 25.0,
//           "panel_capacity": 315,
//           "polygon": {
//             "coordinates": [
//               [
//                 37.775,
//                 -122.419
//               ],
//               [
//                 37.775,
//                 -122.4185
//               ],
//               [
//                 37.7745,
//                 -122.4185
//               ]
//             ],
//             "area_sqft": 13149.5,
//             "confidence": 0.95
//           }
//         }
//       ],
//       "obstacles": {
//         "chimneys": 0,
//         "skylights": 0,
//         "trees_nearby": false,
//         "hvac_units": 0
//       },
//       "confidence_score": 0.95
//     },
//     "solar_data": {
//       "peak_sun_hours_daily": 4.74,
//       "annual_irradiance_kwh_m2": 1728.4,
//       "seasonal_variation": {
//         "summer_sun_hours": 6.54,
//         "winter_sun_hours": 2.65
//       }
//     },
//     "solar_potential": {
//       "system_size_kw": 126.0,
//       "annual_generation_kwh": 150660,
//       "daily_generation_kwh": 412.8,
//       "capacity_factor": 0.136,
//       "energy_offset_percent": 100,
//       "co2_offset_tons_yearly": 60.3,
//       "co2_offset_tons_25year": 1507,
//       "equivalent_trees_planted": 994
//     },
//     "solar_score": 87,
//     "solar_score_breakdown": {
//       "components": {
//         "roof_suitability": {
//           "score": 100,
//           "weight": 0.3,
//           "weighted_score": 30.0,
//           "details": "11177 sqft, south facing (×1.0)"
//         },
//         "solar_irradiance": {
//           "score": 67.7,
//           "weight": 0.25,
//           "weighted_score": 16.9,
//           "details": "4.74 peak sun hours/day"
//         },
//         "system_size": {
//           "score": 100,
//           "weight": 0.2,
//           "weighted_score": 20.0,
//           "details": "126.0 kW system"
//         },
//         "capacity_factor": {
//           "score": 68.0,
//           "weight": 0.15,
//           "weighted_score": 10.2,
//           "details": "13.6% efficiency"
//         },
//         "obstacles": {
//           "score": 100,
//           "weight": 0.1,
//           "weighted_score": 10.0,
//           "details": "0 penalty points"
//         }
//       },
//       "formula": "30% × Roof + 25% × Irradiance + 20% × Size + 15% × Efficiency + 10% × Clear Space"
//     },
//     "financial_outlook": {
//       "system_cost_net": 277830.0,
//       "total_net_savings_25_years": 1277073.0,
//       "net_profit_25_years": 999243.0,
//       "payback_period_years": 6.0,
//       "roi_25_years": 359.7,
//       "first_year_savings_gross": 48076.0,
//       "first_year_savings_net": 37662.0
//     },
//     "monthly_generation": {
//       "jan": 8500,
//       "feb": 9100,
//       "mar": 11500,
//       "apr": 13800,
//       "may": 15200,
//       "jun": 16500,
//       "jul": 16800,
//       "aug": 15900,
//       "sep": 14200,
//       "oct": 12100,
//       "nov": 9500,
//       "dec": 8100
//     }
//   }
// }
