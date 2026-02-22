/**
 * Environmental & cost impact teaser.
 * Reinforces value before CTA.
 */

const stats = [
  { value: '25+', label: 'Years of typical system life' },
  { value: '~40%', label: 'Possible reduction in electricity bills' },
  { value: 'Zero', label: 'Emissions from your rooftop generation' },
]

export default function ImpactSection() {
  return (
    <section className="py-20 px-4 bg-earth-800 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl mb-4">
          Environmental & cost impact
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mb-14">
          Solar panels pay for themselves over time while cutting your carbon footprint. See what your roof could do.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="p-6 rounded-2xl bg-earth-700/50 border border-earth-600">
              <div className="text-3xl font-bold text-sun-400">{s.value}</div>
              <div className="mt-1 text-slate-300 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
