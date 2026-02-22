import Hero from '@/components/Hero'
import BenefitsSection from '@/components/BenefitsSection'
import ImpactSection from '@/components/ImpactSection'
import Footer from '@/components/Footer'

/**
 * Homepage: hero, benefits, impact, CTA.
 * Single scroll; CTA leads to /map.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <BenefitsSection />
      <ImpactSection />
      <Footer />
    </div>
  )
}
