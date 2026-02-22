/**
 * Geometry helpers for polygon area (approximate).
 * Uses spherical approximation for lat/lng; sufficient for demo.
 * Replace with backend calculation when API is ready.
 */

import type { LatLng, Polygon } from '@/types'

/** Centroid of polygon (for API lat/lng when no address selected) */
export function getPolygonCentroid(polygon: Polygon): LatLng {
  if (polygon.length === 0) return { lat: 0, lng: 0 }
  const sum = polygon.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  )
  return {
    lat: sum.lat / polygon.length,
    lng: sum.lng / polygon.length,
  }
}

/**
 * Approximate polygon area in square meters using spherical excess.
 * Assumes lat/lng in degrees. Good enough for display; production should use backend.
 */
export function getPolygonAreaSqM(polygon: Polygon): number {
  if (polygon.length < 3) return 0
  const R = 6371000 // Earth radius in meters
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const latI = (polygon[i].lat * Math.PI) / 180
    const latJ = (polygon[j].lat * Math.PI) / 180
    const dLng = ((polygon[j].lng - polygon[i].lng) * Math.PI) / 180
    area += dLng * (2 + Math.sin(latI) + Math.sin(latJ))
  }
  return Math.abs((area * R * R) / 2)
}

/** Ensure polygon is closed (first point repeated at end) for display */
export function closePolygon(polygon: Polygon): Polygon {
  if (polygon.length < 2) return polygon
  const first = polygon[0]
  const last = polygon[polygon.length - 1]
  if (first.lat === last.lat && first.lng === last.lng) return polygon
  return [...polygon, { ...first }]
}
