/**
 * Benefits of solar energy and product value props.
 * Sustainability-focused copy with icons.
 */

const benefits = [
  {
    title: 'Lower bills, predictable energy',
    description: 'Generate your own electricity and reduce dependence on the grid. Lock in savings for decades.',
    icon: '💰',
  },
  {
    title: 'Real environmental impact',
    description: 'Every kWh from your roof means less fossil fuel and fewer emissions. See your CO₂ reduction in real numbers.',
    icon: '🌍',
  },
  {
    title: 'Simple visual analysis',
    description: 'No guesswork. Draw your roof once and get an instant solar score plus daily generation and cost estimates.',
    icon: '📐',
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-earth-900 text-center mb-4">
          Why go solar?
        </h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-14">
          Solar isn’t just good for the planet—it’s good for your wallet and your peace of mind.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((item, i) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-solar-200 hover:bg-solar-50/50 transition-smooth animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-earth-900 text-lg">{item.title}</h3>
              <p className="mt-2 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
