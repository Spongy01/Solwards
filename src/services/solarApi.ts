/**
 * Mock solar analysis API.
 * Replace with real backend calls when API is available.
 * Suggested endpoint: POST /api/analyze-solar { polygon: LatLng[] }
 */

import type { AnalysisResponse, Polygon } from '@/types'
import { getPolygonAreaSqM } from '@/utils/geometry'

const MOCK_DELAY_MS = 1500

/**
 * Analyzes solar potential for a roof polygon.
 * Currently returns mock data after a delay; swap implementation for real API.
 */
export async function analyzeSolarArea(polygon: Polygon): Promise<AnalysisResponse> {
  // Use unused variables to fix TS build errors for mock implementation
  console.log('Mock analyzing area for polygon, sq meters:', getPolygonAreaSqM(polygon))
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))

  return {
    "analysis_id": "09153c30-827c-4500-85d8-5b96a6c199b1",
    "timestamp": "2026-02-22T07:36:28.936941",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "123 Main St, San Francisco, CA"
    },
    "roof_analysis": {
      "total_area_sqft": 13149.5,
      "usable_area_sqft": 11177.1,
      "roof_segments": [
        {
          "segment_id": 1,
          "area_sqft": 13149.5,
          "orientation_degrees": 180,
          "orientation_cardinal": "south",
          "tilt_degrees": 25.0,
          "panel_capacity": 315,
          "polygon": {
            "coordinates": [
              [
                37.775,
                -122.419
              ],
              [
                37.775,
                -122.4185
              ],
              [
                37.7745,
                -122.4185
              ]
            ],
            "area_sqft": 13149.5,
            "confidence": 0.95
          }
        }
      ],
      "obstacles": {
        "chimneys": 0,
        "skylights": 0,
        "trees_nearby": false,
        "hvac_units": 0
      },
      "confidence_score": 0.95
    },
    "solar_data": {
      "peak_sun_hours_daily": 4.74,
      "annual_irradiance_kwh_m2": 1728.4,
      "seasonal_variation": {
        "summer_sun_hours": 6.54,
        "winter_sun_hours": 2.65
      }
    },
    "solar_potential": {
      "system_size_kw": 126.0,
      "annual_generation_kwh": 150660,
      "daily_generation_kwh": 412.8,
      "capacity_factor": 0.136,
      "energy_offset_percent": 100,
      "co2_offset_tons_yearly": 60.3,
      "co2_offset_tons_25year": 1507,
      "equivalent_trees_planted": 994
    },
    "solar_score": 87,
    "solar_score_breakdown": {
      "components": {
        "roof_suitability": {
          "score": 100,
          "weight": 0.3,
          "weighted_score": 30.0,
          "details": "11177 sqft, south facing (×1.0)"
        },
        "solar_irradiance": {
          "score": 67.7,
          "weight": 0.25,
          "weighted_score": 16.9,
          "details": "4.74 peak sun hours/day"
        },
        "system_size": {
          "score": 100,
          "weight": 0.2,
          "weighted_score": 20.0,
          "details": "126.0 kW system"
        },
        "capacity_factor": {
          "score": 68.0,
          "weight": 0.15,
          "weighted_score": 10.2,
          "details": "13.6% efficiency"
        },
        "obstacles": {
          "score": 100,
          "weight": 0.1,
          "weighted_score": 10.0,
          "details": "0 penalty points"
        }
      },
      "formula": "30% × Roof + 25% × Irradiance + 20% × Size + 15% × Efficiency + 10% × Clear Space"
    },
    "financial_outlook": {
      "system_cost_net": 277830.0,
      "total_net_savings_25_years": 1277073.0,
      "net_profit_25_years": 999243.0,
      "payback_period_years": 6.0,
      "roi_25_years": 359.7,
      "first_year_savings_gross": 48076.0,
      "first_year_savings_net": 37662.0
    },
    "monthly_generation": {
      "jan": 8500,
      "feb": 9100,
      "mar": 11500,
      "apr": 13800,
      "may": 15200,
      "jun": 16500,
      "jul": 16800,
      "aug": 15900,
      "sep": 14200,
      "oct": 12100,
      "nov": 9500,
      "dec": 8100
    }
  }
}
