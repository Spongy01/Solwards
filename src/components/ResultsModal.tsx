import { useState, useEffect } from 'react'
import type { AnalysisResponse } from '@/types'
import { Sun, ChevronRight, ChevronLeft } from 'lucide-react'
import { fetchSummaryForAnalysis } from '@/services/solarApi'
import ResultsModalPage1 from './ResultsModalPage1'
import ResultsModalPage2 from './ResultsModalPage2'

interface ResultsModalProps {
  result: AnalysisResponse
  onClose: () => void
}

/**
 * Centered modal with solar analysis results from backend API.
 * Uses a modern Bento Box layout with glassmorphism and animated entry.
 * Fetches LLM summary when modal opens.
 */
export default function ResultsModal({ result, onClose }: ResultsModalProps) {
  const {
    roof_analysis,
    solar_data,
  } = result

  // Confidence score for the roof analysis (0 to 1)
  const confidencePercent = Math.round((roof_analysis.confidence_score || 0.95) * 100)
  const confidenceColor = confidencePercent >= 90 ? 'text-eco-500' : confidencePercent >= 70 ? 'text-sun-500' : 'text-earth-400'
  const confidenceStroke = confidencePercent >= 90 ? 'stroke-eco-500' : confidencePercent >= 70 ? 'stroke-sun-500' : 'stroke-earth-400'

  const [currentPage, setCurrentPage] = useState(0)
  const [summaryMarkdown, setSummaryMarkdown] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setSummaryLoading(true)
    setSummaryError(null)
    setSummaryMarkdown(null)
    fetchSummaryForAnalysis(result)
      .then((res) => {
        if (!cancelled) {
          setSummaryMarkdown(res.summary_markdown)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setSummaryError(e instanceof Error ? e.message : 'Summary unavailable')
        }
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false)
      })
    return () => { cancelled = true }
  }, [result.analysis_id])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setCurrentPage((prev) => Math.min(prev + 1, 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentPage((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Backspace' && currentPage === 1) {
        e.preventDefault()
        setCurrentPage(0)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-earth-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      {/* Wrapper to allow elements to protrude without being clipped by the modal's overflow-y-auto */}
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col outline-none pointer-events-none">
        
        {/* Floating Circular 'Next' Button for Page 1 (Centered vertically on the modal) */}
        {currentPage === 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setCurrentPage(1)
            }}
            className="absolute -right-3 md:-right-6 top-1/2 -translate-y-1/2 z-[60] w-12 h-12 bg-earth-900 text-white rounded-full shadow-2xl hover:bg-earth-800 flex items-center justify-center transition-colors duration-300 pointer-events-auto"
            aria-label="Next Details"
          >
            <ChevronRight className="w-7 h-7 ml-0.5" />
          </button>
        )}

        <div
          className="relative w-full h-full overflow-y-auto glass-panel rounded-3xl animate-slide-up-fade [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:px-8 bg-white/30 backdrop-blur-md rounded-t-3xl border-b border-white/40">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-solar-100/80 rounded-xl text-solar-600 border border-white/60">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <h2 id="results-title" className="font-display font-bold text-2xl text-earth-900 tracking-tight">
              Solar Potential Analysis
            </h2>
          </div>

          {/* subtle AI confidence ring in the top right instead of close icon */}
          <div className="relative group flex items-center">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              {/* Background Ring */}
              <path
                className="stroke-white/80 drop-shadow-sm"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress Ring */}
              <path
                className={`${confidenceStroke} transition-all duration-1000 ease-out`}
                strokeDasharray={`${confidencePercent}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className={`text-[10px] font-bold ${confidenceColor}`}>{confidencePercent}%</span>
            </div>
            {/* Tooltip that expands on hover */}
            <div className="absolute right-full mr-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-20">
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-lg border border-earth-100 text-xs font-semibold text-earth-600">
                AI Confidence Score
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full relative shrink-0">
          <ResultsModalPage1
            result={result}
            isVisible={currentPage === 0}
            onNext={() => setCurrentPage(1)}
            summaryMarkdown={summaryMarkdown}
            summaryLoading={summaryLoading}
            summaryError={summaryError}
          />
          <ResultsModalPage2 result={result} isVisible={currentPage === 1} />
        </div>

        {/* Footer Area with Sun Data and Close */}
        <div className="p-6 sm:px-8 mt-auto bg-white/30 border-t border-white/60 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-earth-600 bg-white/60 px-5 py-3 rounded-2xl border border-white/60 shadow-sm w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-sun-500" />
              <span>
                <strong className="text-earth-900">{solar_data.peak_sun_hours_daily}</strong> peak sun hrs/day
              </span>
            </div>
            <span className="hidden sm:inline text-earth-300">|</span>
            <div className="flex items-center gap-2">
              <span>
                <strong className="text-earth-900">{solar_data.annual_irradiance_kwh_m2.toLocaleString()}</strong> kWh/m²/yr irradiance
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {currentPage === 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage(0)}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-white text-earth-900 border border-white/60 font-semibold shadow-sm hover:bg-earth-50 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            
            {currentPage === 0 ? (
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl bg-earth-900 text-white font-semibold shadow-lg hover:bg-earth-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Next Details
                <ChevronRight className="w-5 h-5" />
              </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-solar-500 text-white font-semibold shadow-lg hover:bg-solar-600 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Close Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
