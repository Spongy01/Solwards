/**
 * Shared types for Solwards app.
 * Request/response types match Python backend AnalysisResponse.
 */

/** Lat/lng point (e.g. polygon vertex) */
export interface LatLng {
  lat: number
  lng: number
}

/** Polygon as array of points (closed: first === last optional) */
export type Polygon = LatLng[]

/** Props for components that need map ref (for drawing, etc.) */
export interface MapRefProps {
  mapRef: React.RefObject<google.maps.Map | null>
}

// ----- Backend API types (POST /api/v1/analyze) -----

export interface AnalyzeRequest {
  latitude: number
  longitude: number
  address?: string
  state: string
  zip_code?: string
  user_polygon?: [number, number][] // [[lat, lng], ...]
}

export interface Location {
  latitude: number
  longitude: number
  address: string
}

export interface SeasonalVariation {
  summer_sun_hours: number
  winter_sun_hours: number
}

export interface SolarData {
  peak_sun_hours_daily: number
  annual_irradiance_kwh_m2: number
  seasonal_variation: SeasonalVariation
}

export interface SolarPotential {
  system_size_kw: number
  annual_generation_kwh: number
  daily_generation_kwh: number
  capacity_factor: number
  energy_offset_percent: number
  co2_offset_tons_yearly: number
  co2_offset_tons_25year: number
  equivalent_trees_planted: number
}

export interface RoofAnalysis {
  total_area_sqft: number
  usable_area_sqft: number
  roof_segments: unknown[]
  obstacles: Record<string, unknown>
  confidence_score: number
}

export interface SolarScoreBreakdown {
  components?: Record<string, { score: number; weight: number; weighted_score: number; details?: string }>
  formula?: string
}

export interface FinancialOutlook {
  annual_savings_usd?: number
  payback_years?: number
  net_benefit_25yr?: number,
  system_cost_net?: number
  total_net_savings_25_years?: number
  net_profit_25_years?: number
  payback_period_years?: number
  roi_25_years?: number
  first_year_savings_gross?: number
  first_year_savings_net?: number
}

export type MonthlyGeneration = Record<string, number>

/** Backend analysis response (matches Python AnalysisResponse) */
export interface AnalysisResponse {
  analysis_id: string
  timestamp: string
  location: Location
  roof_analysis: RoofAnalysis
  solar_data: SolarData
  solar_potential: SolarPotential
  solar_score: number
  solar_score_breakdown?: SolarScoreBreakdown | null
  financial_outlook?: FinancialOutlook | null
  monthly_generation?: MonthlyGeneration
}

// ----- Summary API (POST /api/v1/summary) -----

/** Request body for LLM summary endpoint */
export interface SummaryRequest {
  analysis_id: string
  location: Location
  solar_potential: SolarPotential
  financial_outlook?: FinancialOutlook | null
  additional_context?: string
}

/** Response from summary endpoint */
export interface SummaryResponse {
  analysis_id: string
  generated_at: string
  summary_markdown: string
  model_name?: string
}
