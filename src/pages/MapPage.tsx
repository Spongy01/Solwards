import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { usePolygonDrawing } from '@/hooks/usePolygonDrawing'
import { analyzeSolarArea } from '@/services/solarApi'
import type { AnalysisResponse } from '@/types'
import MapSearch from '@/components/MapSearch'
import ResultsModal from '@/components/ResultsModal'

const DEFAULT_STATE = 'CA'

/** Selected location from map search (lat/lng + optional address) */
interface SelectedLocation {
  lat: number
  lng: number
  address?: string
}

/**
 * Map page: full-screen map, Places search, polygon drawing, analyze flow.
 * Analyze works with either a drawn polygon or a searched location (lat/lng only).
 */
export default function MapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { mapRef, isReady, error } = useGoogleMaps(containerRef)
  const [drawMode, setDrawMode] = useState(false)
  const { path, clear, hasPolygon } = usePolygonDrawing({
    map: isReady ? mapRef.current : null,
    enabled: drawMode,
  })
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  const canAnalyze = hasPolygon || selectedLocation != null

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return
    setLoading(true)
    setResult(null)
    setApiError(null)
    try {
      const options = {
        address: selectedLocation?.address,
        state: DEFAULT_STATE,
      }
      const data = hasPolygon && path.length >= 3
        ? await analyzeSolarArea({ ...options, polygon: path })
        : await analyzeSolarArea({
            ...options,
            latitude: selectedLocation!.lat,
            longitude: selectedLocation!.lng,
          })
      setResult(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Analysis failed'
      setApiError(message)
    } finally {
      setLoading(false)
    }
  }, [canAnalyze, hasPolygon, path, selectedLocation])

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    const location = place.geometry?.location
    if (!location) return
    const lat = 'lat' in location && typeof location.lat === 'function' ? location.lat() : (location as unknown as { lat: number }).lat
    const lng = 'lng' in location && typeof location.lng === 'function' ? location.lng() : (location as unknown as { lng: number }).lng
    setSelectedLocation({
      lat: Number(lat),
      lng: Number(lng),
      address: place.formatted_address ?? (typeof place.name === 'string' ? place.name : undefined),
    })
  }, [])

  const toggleDrawMode = () => {
    if (drawMode) clear()
    setDrawMode((prev) => !prev)
  }

  return (
    <div className="relative w-full h-screen flex flex-col">
      <div ref={containerRef} className="flex-1 w-full min-h-0" />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4">
          <div className="max-w-md rounded-xl bg-white p-6 shadow-lg border border-slate-200">
            <p className="text-earth-800 font-medium">Map unavailable</p>
            <p className="mt-2 text-slate-600 text-sm">{error}</p>
            <p className="mt-3 text-slate-500 text-xs">
              Add <code className="bg-slate-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to a{' '}
              <code className="bg-slate-100 px-1 rounded">.env</code> file, or replace the placeholder in{' '}
              <code className="bg-slate-100 px-1 rounded">index.html</code>.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block text-solar-600 font-medium hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      )}

      {isReady && !error && (
        <>
          <MapSearch map={mapRef.current} onPlaceSelect={handlePlaceSelect} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-3 z-10">
            <button
              type="button"
              onClick={toggleDrawMode}
              className={`rounded-xl font-semibold px-6 py-3 shadow-lg transition-smooth ${
                drawMode
                  ? 'bg-earth-700 text-white hover:bg-earth-800'
                  : 'bg-white text-earth-800 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {drawMode ? 'Cancel drawing' : 'Draw Roof Area'}
            </button>
            {drawMode && path.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-xl bg-white text-slate-600 border border-slate-200 font-medium px-4 py-3 shadow hover:bg-slate-50 transition-smooth"
                >
                  Clear
                </button>
                {path.length >= 3 && (
                  <button
                    type="button"
                    onClick={() => setDrawMode(false)}
                    className="rounded-xl bg-solar-600 text-white font-semibold px-5 py-3 shadow-lg hover:bg-solar-700 transition-smooth"
                  >
                    Done
                  </button>
                )}
              </>
            )}
          </div>
          {(hasPolygon || selectedLocation) && !drawMode && (
            <div className="absolute bottom-6 left-4 z-10">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-solar-600 text-white font-semibold px-6 py-3 shadow-lg hover:bg-solar-700 disabled:opacity-70 disabled:cursor-not-allowed transition-smooth"
              >
                {loading ? 'Analyzing…' : 'Analyze Solar Potential'}
              </button>
              {selectedLocation && !hasPolygon && (
                <p className="mt-1 text-xs text-slate-500">Using searched location (no roof outline)</p>
              )}
            </div>
          )}
        </>
      )}

      <Link
        to="/"
        className="absolute top-4 left-4 z-10 rounded-lg bg-white/95 text-earth-800 font-medium px-4 py-2 shadow border border-slate-200 hover:bg-white transition-smooth"
      >
        ← Home
      </Link>

      {apiError && (
        <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-10 rounded-xl bg-red-50 border border-red-200 p-4 shadow-lg">
          <p className="font-medium text-red-800">Analysis failed</p>
          <p className="text-sm text-red-700 mt-1">{apiError}</p>
          <button
            type="button"
            onClick={() => setApiError(null)}
            className="mt-2 text-sm font-medium text-red-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex items-center gap-4">
            <div className="w-8 h-8 border-2 border-solar-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium text-earth-800">Analyzing solar potential…</span>
          </div>
        </div>
      )}

      {result && (
        <ResultsModal
          result={result}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
