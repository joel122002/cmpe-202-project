import { useEffect, useRef, useState } from 'react'
import { WONDERS } from './wonderCatalog'
import WonderBackdrop from './WonderBackdrop'

export default function StayScene() {
  const host = useRef(null)
  const [active, setActive] = useState(0)
  const [onscreen, setOnscreen] = useState(true)
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const [reducedMotion, setReducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (reducedMotion || !onscreen || !pageVisible) return
    const timer = window.setInterval(() => setActive(index => (index + 1) % WONDERS.length), 7000)
    return () => window.clearInterval(timer)
  }, [reducedMotion, onscreen, pageVisible, active])

  useEffect(() => {
    const observer = new IntersectionObserver(entries => setOnscreen(entries[0].isIntersecting))
    observer.observe(host.current)
    const updateVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = event => setReducedMotion(event.matches)
    preference.addEventListener('change', updatePreference)
    return () => {
      preference.removeEventListener('change', updatePreference)
    }
  }, [])

  return <div ref={host} className="stay-scene">
    <div className="scene-background" aria-hidden="true"><WonderBackdrop key={active} index={active} /></div>
    <div className="wonder-label">
      <span className="wonder-index">{String(active + 1).padStart(2, '0')} / 07</span>
      <div><strong>{WONDERS[active].name}</strong><span>{WONDERS[active].country}</span></div>
    </div>
    <div className="wonder-controls" aria-label="Explore the seven wonders">
      <button className="wonder-arrow" aria-label="Previous wonder" onClick={() => setActive(index => (index + WONDERS.length - 1) % WONDERS.length)}>←</button>
      <div className="wonder-progress" aria-label="Choose a wonder">
        {WONDERS.map((wonder, index) => <button key={wonder.name} aria-label={`View ${wonder.name}`} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}
      </div>
      <button className="wonder-arrow" aria-label="Next wonder" onClick={() => setActive(index => (index + 1) % WONDERS.length)}>→</button>
    </div>
  </div>
}
