import { useCallback, useEffect, useRef, useState } from 'react'
import type { LatLng } from '@/types'

interface UsePolygonDrawingOptions {
  map: google.maps.Map | null
  enabled: boolean
}

/**
 * Manages polygon drawing on the map: click to add points, overlay auto-closes.
 * Returns current path, setPath, clear, and whether we're in drawing mode.
 */
export function usePolygonDrawing({ map, enabled }: UsePolygonDrawingOptions) {
  const [path, setPath] = useState<LatLng[]>([])
  const overlayRef = useRef<google.maps.Polygon | null>(null)

  const clear = useCallback(() => {
    setPath([])
    if (overlayRef.current) {
      overlayRef.current.setMap(null)
      overlayRef.current = null
    }
  }, [])

  // Sync overlay with path; auto-close polygon for display
  useEffect(() => {
    if (!map) return

    if (path.length === 0) {
      if (overlayRef.current) {
        overlayRef.current.setMap(null)
        overlayRef.current = null
      }
      return
    }

    const closedPath = path.length >= 3 ? [...path, path[0]] : path
    const gmPath = closedPath.map((p) => ({ lat: p.lat, lng: p.lng }))

    if (!overlayRef.current) {
      overlayRef.current = new google.maps.Polygon({
        paths: gmPath,
        strokeColor: '#16a34a',
        strokeWeight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.35,
        map,
      })
    } else {
      overlayRef.current.setPath(gmPath)
    }
  }, [map, path])

  // Map click: add point when drawing is enabled
  useEffect(() => {
    if (!map || !enabled) return

    const listener = (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()
      if (lat != null && lng != null) {
        setPath((prev) => [...prev, { lat, lng }])
      }
    }

    map.addListener('click', listener)
    return () => {
      google.maps.event.clearListeners(map, 'click')
    }
  }, [map, enabled])

  return { path, setPath, clear, hasPolygon: path.length >= 3 }
}
