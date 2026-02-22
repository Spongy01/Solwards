import { useEffect, useRef } from 'react'

interface MapSearchProps {
  map: google.maps.Map | null
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  className?: string
}

/**
 * Google Places search input; attaches to map and pans to selected place.
 * Requires Places library and a valid map instance.
 */
export default function MapSearch({ map, onPlaceSelect, className = '' }: MapSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!map || !inputRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['geometry', 'name', 'formatted_address'],
      types: ['address'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place.geometry?.location) {
        map.panTo(place.geometry.location)
        map.setZoom(17)
        onPlaceSelect?.(place)
      }
    })
  }, [map, onPlaceSelect])

  return (
    <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-2 ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search address..."
        className="w-full rounded-xl border border-slate-200 bg-white/95 shadow-lg py-3 px-4 text-earth-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-solar-500 focus:border-transparent"
      />
    </div>
  )
}
