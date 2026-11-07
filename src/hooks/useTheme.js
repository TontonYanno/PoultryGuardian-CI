// Thème clair le jour, sombre la nuit (ou forcé par l'utilisateur).
// Applique data-theme sur <html> : tout le reste passe par des variables CSS.
import { useEffect, useState } from 'react'
import { THEME } from '../config'

const byClock = () => {
  const h = new Date().getHours()
  return h >= THEME.dayStart && h < THEME.nightStart ? 'light' : 'dark'
}

export function useTheme(pref) {
  const [clock, setClock] = useState(byClock)
  useEffect(() => { const id = setInterval(() => setClock(byClock()), 60000); return () => clearInterval(id) }, [])
  const effective = pref === 'auto' ? clock : pref
  useEffect(() => {
    document.documentElement.dataset.theme = effective
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', effective === 'dark' ? '#0b0f17' : '#f3f5f9')
  }, [effective])
  return effective
}
