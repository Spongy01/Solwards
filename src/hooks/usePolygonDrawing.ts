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
  const markersRef = useRef<google.maps.Marker[]>([])

  const clear = useCallback(() => {
    setPath([])
    if (overlayRef.current) {
      overlayRef.current.setMap(null)
      overlayRef.current = null
    }
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
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

    const closedPath = path.length === 4 ? [...path, path[0]] : path
    const gmPath = closedPath.map((p) => ({ lat: p.lat, lng: p.lng }))

    if (!overlayRef.current) {
      overlayRef.current = new google.maps.Polygon({
        paths: gmPath,
        strokeColor: '#d97706',
        strokeWeight: 2,
        fillColor: '#f59e0b',
        fillOpacity: 0.35,
        map,
      })
    } else {
      overlayRef.current.setPath(gmPath)
    }

    // Sync markers
    if (path.length > markersRef.current.length) {
      const newPoint = path[path.length - 1]
      const marker = new google.maps.Marker({
        position: newPoint,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#f59e0b',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff',
        },
      })
      markersRef.current.push(marker)
    }
  }, [map, path])

  // Map click: add point when drawing is enabled
  useEffect(() => {
    if (!map || !enabled) return

    const listener = (e: google.maps.MapMouseEvent) => {
      // Limit to 4 points
      if (path.length >= 4) return

      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()
      if (lat != null && lng != null) {
        setPath((prev) => {
          if (prev.length >= 4) return prev
          return [...prev, { lat, lng }]
        })
      }
    }

    const mapListener = map.addListener('click', listener)
    return () => {
      google.maps.event.removeListener(mapListener)
    }
  }, [map, enabled, path.length])

  return { path, setPath, clear, isComplete: path.length === 4 }
}
