import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

interface MapOverlayProps {
  map: google.maps.Map | null
  position: { lat: number; lng: number }
  children: React.ReactNode
}

/**
 * Renders React nodes at a specific geographic location on a Google Map.
 */
export default function MapOverlay({ map, position, children }: MapOverlayProps) {
  const container = useMemo(() => {
    const div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.cursor = 'auto' // Prevent unwanted map dragging events on the UI
    return div
  }, [])

  const overlayRef = useRef<google.maps.OverlayView | null>(null)

  useEffect(() => {
    if (!map) return

    class CustomOverlay extends google.maps.OverlayView {
      containerDiv: HTMLDivElement

      constructor(div: HTMLDivElement) {
        super()
        this.containerDiv = div
      }

      onAdd() {
        const panes = this.getPanes()
        if (panes?.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(this.containerDiv)
        }
      }

      draw() {
        const projection = this.getProjection()
        if (!projection) return
        
        const pt = projection.fromLatLngToDivPixel(new google.maps.LatLng(position.lat, position.lng))
        if (pt) {
          // Center the div horizontally on the coordinate, and place it just below vertically.
          this.containerDiv.style.left = `${pt.x}px`
          this.containerDiv.style.top = `${pt.y}px`
          // We translate it slightly to perfectly center the content horizontally
          this.containerDiv.style.transform = `translate(-50%, 16px)`
        }
      }

      onRemove() {
        if (this.containerDiv.parentNode) {
          this.containerDiv.parentNode.removeChild(this.containerDiv)
        }
      }
    }

    if (!overlayRef.current) {
      overlayRef.current = new CustomOverlay(container)
      overlayRef.current.setMap(map)
    }

    // Force redraw if position changes
    overlayRef.current.draw()

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null)
        overlayRef.current = null
      }
    }
  }, [map, position, container])

  return createPortal(children, container)
}
