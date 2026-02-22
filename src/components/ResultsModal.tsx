import type { AnalysisResponse } from '@/types'

interface ResultsModalProps {
  result: AnalysisResponse
  onClose: () => void
}

/**
 * Centered modal with solar analysis results from backend API.
 * Displays solar_score, roof_analysis, solar_data, solar_potential, financial_outlook.
 */
export default function ResultsModal({ result, onClose }: ResultsModalProps) {
  const { solar_score, roof_analysis, solar_data, solar_potential, financial_outlook, solar_score_breakdown } = result
  const scoreColor =
    solar_score >= 80 ? 'text-solar-600' : solar_score >= 60 ? 'text-sun-600' : 'text-slate-600'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 id="results-title" className="font-display font-bold text-xl text-earth-900">
            Solar potential
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-earth-800 transition-smooth"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Solar Score */}
          <div className="text-center py-4 rounded-xl bg-solar-50 border border-solar-100">
            <span className="text-4xl font-bold text-earth-900">{solar_score}</span>
            <span className={`text-xl font-semibold ${scoreColor}`}> / 100</span>
            <p className="text-sm text-slate-600 mt-1">Solar score</p>
          </div>

          {/* Roof */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">📐</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">Roof area</p>
              <p className="font-semibold text-earth-900">
                {roof_analysis.total_area_sqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft total
                {' · '}
                {roof_analysis.usable_area_sqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft usable
              </p>
            </div>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">Energy generation</p>
              <p className="font-semibold text-earth-900">
                {solar_potential.daily_generation_kwh} kWh/day · {solar_potential.annual_generation_kwh.toLocaleString()} kWh/year
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                System size: {solar_potential.system_size_kw} kW · {solar_potential.energy_offset_percent}% of typical home use
              </p>
            </div>
          </div>

          {/* CO₂ */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">🌍</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">CO₂ offset</p>
              <p className="font-semibold text-earth-900">
                {solar_potential.co2_offset_tons_yearly} tons/year · {solar_potential.co2_offset_tons_25year} tons over 25 years
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Equivalent to ~{solar_potential.equivalent_trees_planted} trees planted
              </p>
            </div>
          </div>

          {/* Solar data (irradiance) */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-2xl">☀️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-600">Peak sun & irradiance</p>
              <p className="font-semibold text-earth-900">
                {solar_data.peak_sun_hours_daily} peak sun hours/day · {solar_data.annual_irradiance_kwh_m2.toLocaleString()} kWh/m²/year
              </p>
            </div>
          </div>

          {/* Financial outlook (if present) */}
          {financial_outlook && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-solar-50 border border-solar-100">
              <span className="text-2xl">💰</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600">Financial outlook</p>
                <p className="font-semibold text-earth-900">
                  {financial_outlook.annual_savings_usd != null && `$${financial_outlook.annual_savings_usd.toLocaleString()}/yr savings`}
                  {financial_outlook.payback_years != null && ` · Payback in ~${financial_outlook.payback_years} years`}
                  {financial_outlook.net_benefit_25yr != null && ` · $${financial_outlook.net_benefit_25yr.toLocaleString()} net over 25 yr`}
                  {!financial_outlook.annual_savings_usd && !financial_outlook.payback_years && !financial_outlook.net_benefit_25yr && '—'}
                </p>
              </div>
            </div>
          )}

          {/* Score breakdown (if present) */}
          {solar_score_breakdown?.formula && (
            <p className="text-xs text-slate-500 text-center italic">
              {solar_score_breakdown.formula}
            </p>
          )}
        </div>

        <div className="p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-solar-600 text-white font-semibold py-3 hover:bg-solar-700 transition-smooth"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
