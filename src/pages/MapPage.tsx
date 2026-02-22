import { useRef, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { usePolygonDrawing } from '@/hooks/usePolygonDrawing'
import { analyzeSolarArea } from '@/services/solarApi'
import type { AnalysisResponse } from '@/types'
import MapSearch from '@/components/MapSearch'
import ResultsModal from '@/components/ResultsModal'


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
  const { mapRef, isReady, error, setDrawingCursor } = useGoogleMaps(containerRef)
  const [drawMode, setDrawMode] = useState(false)

  // Sync cursor when draw mode changes
  useEffect(() => {
    setDrawingCursor(drawMode)
  }, [drawMode, setDrawingCursor])
  
  const { path, clear, isComplete } = usePolygonDrawing({
    map: isReady ? mapRef.current : null,
    enabled: drawMode,
  })

  // Auto-finish drawing when 4 points are collected
  useEffect(() => {
    if (isComplete && drawMode) {
      setDrawMode(false)
    }
  }, [isComplete, drawMode])

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)

  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  const canAnalyze = isComplete || selectedLocation != null

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return
    setLoading(true)
    setResult(null)
    setApiError(null)
    try {
      const options = {
        address: selectedLocation?.address,
        state: 'CA' as const,
      }
      const data =
        isComplete && path.length >= 3
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
  }, [canAnalyze, isComplete, path, selectedLocation])

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
    if (drawMode) {
      clear()
    }
    setDrawMode((prev) => !prev)
  }

  const handleClearSelection = () => {
    clear()
    setDrawMode(false)
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
          
          {/* Main Draw Action / Instructions overlay at bottom */}
          {!isComplete && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              {drawMode ? (
                <div className="bg-earth-900/90 backdrop-blur-md text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-slide-up-fade border border-earth-700/50">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          i < path.length 
                            ? 'bg-solar-500 scale-110' 
                            : i === path.length 
                              ? 'bg-white/80 animate-pulse' 
                              : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {path.length === 0 ? 'Click to set first point' : `Select point ${path.length + 1} of 4`}
                  </span>
                  <div className="w-px h-5 bg-white/20 mx-2" />
                  <button
                    onClick={toggleDrawMode}
                    className="text-earth-300 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={toggleDrawMode}
                  className="rounded-full bg-solar-500 text-white font-semibold px-8 py-4 shadow-xl hover:bg-solar-600 transition-all duration-300 flex items-center gap-3 active:scale-95 border border-transparent"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Draw Roof Area
                </button>
              )}
            </div>
          )}

          {/* Map Actions (Analyze / Clear) placed in the same bottom flow */}
          {isComplete && path.length > 0 && mapRef.current && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <div className="flex items-center gap-4 animate-slide-up-fade">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white text-earth-900 font-semibold px-8 py-4 text-lg shadow-2xl hover:bg-white transition-all duration-300 flex items-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-earth-200 border-t-solar-500 rounded-full animate-spin" />
                      <span>Analyzing…</span>
                    </>
                  ) : (
                    <>
                      Analyze Solar Potential
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-4 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 hover:shadow-red-500/30 transition-all focus:outline-none"
                  aria-label="Clear selection"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </>
      )}



      {apiError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 rounded-2xl bg-red-50/95 backdrop-blur border border-red-200 p-4 shadow-xl max-w-sm w-[calc(100%-2rem)] flex gap-4 animate-slide-up-fade">
          <div className="shrink-0">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-red-900">Analysis Failed</p>
            <p className="text-sm text-red-700 mt-1">{apiError}</p>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-earth-900/40 backdrop-blur-[2px] flex items-center justify-center z-40 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-2xl px-10 py-8 flex items-center gap-6 animate-slide-up">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-solar-100 border-t-solar-500 text-transparent rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center pb-1">
                <div className="w-2 h-2 bg-solar-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <p className="font-display font-bold text-xl text-earth-900">Analyzing Area</p>
              <p className="text-earth-600 text-sm font-medium mt-1">Calculating solar potential…</p>
            </div>
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
