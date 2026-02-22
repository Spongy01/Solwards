import { Link } from 'react-router-dom'

/**
 * Hero section for the homepage.
 * Title, tagline, and primary CTA to the map flow.
 */
export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-solar-50 via-white to-sun-400/10 -z-10" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-solar-200/30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-sun-400/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto text-center animate-fade-in">
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-earth-900 tracking-tight">
          Solwards
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-earth-700 font-medium">
          See your roof. Save the planet.
        </p>
        <p className="mt-3 text-slate-600 text-lg max-w-xl mx-auto">
          Draw your rooftop on the map and discover solar potential, savings, and environmental impact in seconds.
        </p>
        <Link
          to="/map"
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-solar-600 text-white font-semibold px-8 py-4 shadow-lg shadow-solar-600/30 hover:bg-solar-700 hover:shadow-solar-700/30 transition-smooth hover:scale-[1.02] active:scale-[0.98]"
        >
          Analyze My Roof
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
