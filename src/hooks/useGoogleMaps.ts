import { useEffect, useRef, useState } from 'react'

const SCRIPT_ID = 'google-maps-script'
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }
const DEFAULT_ZOOM = 14

/**
 * Loads Google Maps JS API and creates a map in the given container.
 * Returns map ref, ready flag, and error if script load fails.
 * API key: set VITE_GOOGLE_MAPS_API_KEY or replace placeholder in index.html.
 */
export function useGoogleMaps(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const apiKey =
      typeof import.meta.env?.VITE_GOOGLE_MAPS_API_KEY === 'string' &&
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY.length > 0
        ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        : (window as unknown as { __GOOGLE_MAPS_API_KEY__?: string }).__GOOGLE_MAPS_API_KEY__

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setError('Google Maps API key not set. Add VITE_GOOGLE_MAPS_API_KEY to .env or set in index.html.')
      return
    }

    const existingScript = document.getElementById(SCRIPT_ID)
    if (existingScript) {
      if (typeof google !== 'undefined' && google.maps?.Map) {
        initMap()
        return
      }
      existingScript.addEventListener('load', () => initMap())
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__mapsReady`
    script.async = true
    script.defer = true
    ;(window as unknown as { __mapsReady?: () => void }).__mapsReady = () => {
      initMap()
    }
    script.onerror = () => setError('Failed to load Google Maps script.')
    document.head.appendChild(script)

    function initMap() {
      if (!containerRef.current || mapRef.current) return
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      })
      setIsReady(true)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current = null
        setIsReady(false)
      }
    }
  }, [containerRef])

  return { mapRef, isReady, error }
}

export { DEFAULT_CENTER, DEFAULT_ZOOM }
