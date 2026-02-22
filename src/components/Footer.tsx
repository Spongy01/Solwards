import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="py-10 px-4 bg-earth-900 text-slate-400 text-center text-sm">
      <p>Solwards — Sustainability track. Built for Hopper Hacks 2026.</p>
      <Link to="/map" className="mt-2 inline-block text-solar-400 hover:text-solar-300 transition-smooth">
        Analyze My Roof →
      </Link>
    </footer>
  )
}
