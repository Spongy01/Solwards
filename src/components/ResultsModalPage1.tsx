import { useState } from 'react'
import { Leaf, Ruler, Zap, TrendingUp, Info, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { AnalysisResponse } from '@/types'

const SUMMARY_COLLAPSED_HEIGHT = 140

interface ResultsModalPage1Props {
  result: AnalysisResponse
  isVisible: boolean
  onNext: () => void
  summaryMarkdown?: string | null
  summaryLoading?: boolean
  summaryError?: string | null
}

export default function ResultsModalPage1({
  result,
  isVisible,
  summaryMarkdown,
  summaryLoading,
  summaryError,
}: ResultsModalPage1Props) {
  const {
    solar_score,
    roof_analysis,
    solar_potential,
    financial_outlook,
    solar_score_breakdown
  } = result

  const scoreGradient =
    solar_score >= 80 ? 'from-solar-400 to-solar-600' :
      solar_score >= 60 ? 'from-sun-400 to-sun-600' :
        'from-earth-400 to-earth-600'

  const [summaryExpanded, setSummaryExpanded] = useState(false)

  return (
    <div className={`p-6 sm:p-8 relative ${isVisible ? 'block animate-fade-in' : 'hidden'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Main Hero Card: Solar Score (Spans 3 cols on lg out of 6) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-8 flex flex-col justify-center items-center relative overflow-hidden stagger-1 group hover:shadow-glass-hover transition-smooth hover:-translate-y-1">
          {/* Background Glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${scoreGradient} opacity-[0.03] group-hover:opacity-[0.08] transition-smooth`} />
          <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${scoreGradient} rounded-full blur-3xl opacity-20 -mr-20 -mt-20`} />

          <p className="text-earth-500 uppercase tracking-widest font-semibold text-sm mb-4 relative z-10">Overall Solar Score</p>
          <div className="relative z-10 flex items-baseline gap-2">
            <span className={`text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br ${scoreGradient} drop-shadow-sm`}>
              {solar_score}
            </span>
            <span className="text-3xl font-bold text-earth-300">/ 100</span>
          </div>
          {solar_score_breakdown?.formula && (
            <div className="mt-8 flex items-start gap-1.5 px-3 py-1.5 rounded-xl border border-earth-200/50 relative z-10">
              <Info className="w-4 h-4 text-earth-400 mt-0.5 shrink-0" />
              <p className="text-xs text-earth-500 font-medium">
                {solar_score_breakdown.formula}
              </p>
            </div>
          )}
        </div>

        {/* Environmental Impact (CO2) (Spans 3 cols on lg out of 6) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden stagger-2 hover:shadow-glass-hover transition-smooth hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover:scale-110 transition-smooth duration-700 text-eco-600">
            <Leaf className="w-40 h-40 rotate-12" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="p-2.5 bg-eco-100/60 border border-eco-200/50 w-max rounded-xl mb-4 text-eco-600 group-hover:bg-eco-200/80 transition-colors">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-earth-900 mb-1">CO₂ Offset</h3>
              <p className="text-earth-500 text-sm">Environmental impact over time</p>
            </div>
            <div className="mt-6">
              <p className="text-5xl font-display font-bold text-eco-600">
                {solar_potential.co2_offset_tons_yearly}
              </p>
              <p className="text-sm text-eco-600/70 font-sans font-semibold mb-6">tons per year</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-xl py-3 px-4 border border-white/60 shadow-sm">
                  <span className="block text-earth-500 text-xs uppercase tracking-wider font-semibold mb-1">25 Yr Total</span>
                  <span className="font-bold text-earth-800 text-lg">{solar_potential.co2_offset_tons_25year} tons</span>
                </div>
                <div className="bg-white/60 rounded-xl py-3 px-4 border border-white/60 shadow-sm flex items-center gap-3">
                  <span className="text-3xl leading-none">🌲</span>
                  <div>
                    <span className="block text-earth-500 text-xs uppercase tracking-wider font-semibold mb-1">Equivalent to</span>
                    <span className="font-bold text-earth-800">{solar_potential.equivalent_trees_planted.toLocaleString()} trees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LLM-generated summary (full width, below score and CO2) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 stagger-2 hover:shadow-glass-hover transition-smooth flex flex-col">
          <h3 className="text-lg font-bold text-earth-900 mb-3">Summary</h3>
          {summaryLoading && (
            <div className="flex items-center gap-3 text-earth-500 py-6">
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
              <span className="text-sm font-medium">Generating summary…</span>
            </div>
          )}
          {summaryError && !summaryLoading && (
            <p className="text-sm text-earth-500 py-2">{summaryError}</p>
          )}
          {summaryMarkdown && !summaryLoading && (
            <>
              <div
                className="relative overflow-hidden transition-[max-height] duration-300 ease-out"
                style={{ maxHeight: summaryExpanded ? 2000 : SUMMARY_COLLAPSED_HEIGHT }}
              >
                <div className="summary-markdown text-earth-700 text-sm [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-earth-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2:first-child]:mt-0 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:text-earth-900">
                  <ReactMarkdown>{summaryMarkdown}</ReactMarkdown>
                </div>
                {!summaryExpanded && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    }}
                  />
                )}
              </div>
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-solar-600 hover:bg-solar-50 hover:text-solar-700 transition-smooth"
                >
                  {summaryExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Read more
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Roof Details */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 stagger-3 hover:shadow-glass-hover transition-smooth group hover:-translate-y-1">
          <div className="p-2.5 bg-earth-100/80 border border-earth-200/50 w-max rounded-xl mb-4 text-earth-600 group-hover:bg-earth-200/80 transition-colors">
            <Ruler className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-earth-900 mb-1">Roof Analysis</h3>
          <p className="text-earth-500 text-sm mb-6">Usable space for installation</p>

          <div className="space-y-3">
            <div className="bg-white/60 rounded-2xl p-4 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-earth-400 to-earth-300" />
              <p className="text-sm text-earth-500 mb-1">Usable Area</p>
              <p className="text-3xl font-bold text-earth-900">
                {roof_analysis.usable_area_sqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-base text-earth-500 font-normal">sq ft</span>
              </p>
            </div>
            <div className="flex items-center justify-between text-sm px-3 py-2 bg-earth-50/50 rounded-xl border border-white/40">
              <span className="text-earth-500">Total Area</span>
              <span className="font-semibold text-earth-800">{roof_analysis.total_area_sqft.toLocaleString(undefined, { maximumFractionDigits: 0 })} sq ft</span>
            </div>
          </div>
        </div>

        {/* Energy Generation */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 stagger-4 hover:shadow-glass-hover transition-smooth group hover:-translate-y-1">
          <div className="p-2.5 bg-solar-100/80 border border-solar-200/50 w-max rounded-xl mb-4 text-solar-600 group-hover:bg-solar-200/80 transition-colors">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-earth-900 mb-1">Energy Gen</h3>
          <p className="text-earth-500 text-sm mb-6">Estimated power output</p>

          <div className="space-y-3">
            <div className="bg-white/60 rounded-2xl p-4 border border-white/60 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-solar-400 to-solar-600" />
              <p className="text-sm text-earth-500 mb-1">Annual Generation</p>
              <p className="text-3xl font-bold text-earth-900">
                {solar_potential.annual_generation_kwh.toLocaleString()} <span className="text-base text-earth-500 font-normal">kWh</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-earth-50/50 rounded-xl border border-white/40 p-3">
                <p className="text-earth-500 text-xs mb-1">Daily Gen</p>
                <p className="font-semibold text-earth-800">{solar_potential.daily_generation_kwh} kWh</p>
              </div>
              <div className="bg-earth-50/50 rounded-xl border border-white/40 p-3">
                <p className="text-earth-500 text-xs mb-1">System Size</p>
                <p className="font-semibold text-earth-800">{solar_potential.system_size_kw} kW</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Outlook */}
        {financial_outlook ? (
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden stagger-5 hover:shadow-glass-hover transition-smooth hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover:scale-110 transition-smooth duration-700 text-green-600">
              <TrendingUp className="w-32 h-32 -rotate-12" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="p-2.5 bg-green-100/60 border border-green-200/50 w-max rounded-xl mb-4 text-green-600 group-hover:bg-green-200/60 transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-earth-900 mb-1">Financial Outlook</h3>
                <p className="text-earth-500 text-sm">Estimated ROI & Savings</p>
              </div>

              {/* Simplified Financial View */}
              <div className="mt-6 flex flex-col gap-3">
                {/* Hero Metric: Net Profit */}
                {financial_outlook.net_profit_25_years != null && (
                  <div className="bg-white/70 py-4 px-5 rounded-2xl border border-white shadow-sm flex flex-col">
                    <span className="text-earth-500 text-xs uppercase tracking-wider font-semibold mb-1">25-Year Net Profit</span>
                    <span className="font-bold text-3xl text-green-600">
                      ${Math.round(financial_outlook.net_profit_25_years).toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {financial_outlook.first_year_savings_net != null && (
                    <div className="bg-earth-50/50 rounded-xl border border-white/40 p-3 flex flex-col justify-center">
                      <span className="text-earth-500 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Yr 1 Savings</span>
                      <span className="font-bold text-earth-800">${Math.round(financial_outlook.first_year_savings_net).toLocaleString()}</span>
                    </div>
                  )}
                  {financial_outlook.payback_period_years != null && (
                    <div className="bg-earth-50/50 rounded-xl border border-white/40 p-3 flex flex-col justify-center">
                      <span className="text-earth-500 text-[11px] uppercase tracking-wider font-semibold mb-0.5">Payback</span>
                      <span className="font-bold text-earth-800">{financial_outlook.payback_period_years} years</span>
                    </div>
                  )}
                </div>

                {/* Subtle Cost Display */}
                {financial_outlook.system_cost_net != null && (
                  <div className="mt-1 pt-3 border-t border-earth-100/50 flex flex-wrap items-center justify-between text-xs px-1">
                    <span className="text-earth-500 font-medium">Est. Net System Cost</span>
                    <span className="font-semibold text-orange-400">${Math.round(financial_outlook.system_cost_net).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center stagger-5 border-dashed border-2 border-earth-200/50 bg-earth-50/20">
            <TrendingUp className="w-10 h-10 text-earth-300 mb-4" />
            <p className="text-earth-500 font-medium">Financial data unavailable</p>
          </div>
        )}
      </div>
    </div>
  )
}
