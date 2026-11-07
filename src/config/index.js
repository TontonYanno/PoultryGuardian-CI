// Un seul endroit pour les réglages : noms des variables Ubidots, seuils, délais.

// Noms des variables côté Ubidots (l'ESP32 doit publier/lire les mêmes labels)
export const VARS = {
  sensors: { t: 'temperature', h: 'humidity', c: 'co2' },
  actuators: ['fan', 'mist', 'heater'], // ventilateur, brumisateur, chauffage
}

export const ACTUATOR_LABELS = {
  fan: { icon: '🌀', name: 'Ventilateur', action: 'Rafraîchir' },
  mist: { icon: '💧', name: 'Brumisateur', action: 'Humidifier' },
  heater: { icon: '🔥', name: 'Chauffage', action: 'Chauffer' },
}

// Valeurs plausibles : tout ce qui sort de ces bornes est considéré comme une mesure invalide
export const LIMITS = { t: [-10, 60], h: [0, 100], c: [300, 10000] }

export const CFG = {
  med: 33, high: 66,            // seuils de l'indice de risque (0-100)
  fanOn: 50, fanOff: 35,        // ventilateur : hystérésis sur le risque
  mistOn: 70, mistOff: 55,      // brumisateur : hystérésis sur le risque
  coldOn: 22, coldOff: 25,      // chauffage : hystérésis sur la température (°C)
  horizon: 10,                  // prédiction à +10 mesures
  pollMs: { sim: 1000, ubidots: 10000 }, // fréquence d'interrogation
  staleMs: 120000,              // au-delà, la donnée est jugée périmée
  timeoutMs: 8000,              // délai max d'une requête
}

export const RANGES = [
  { k: '1h', label: '1 h', ms: 3600e3 },
  { k: '6h', label: '6 h', ms: 6 * 3600e3 },
  { k: '24h', label: '24 h', ms: 24 * 3600e3 },
]
export const METRICS = {
  t: { label: 'Température', unit: '°C', color: '#ff8a4d', variable: 'temperature' },
  h: { label: 'Humidité', unit: '%', color: '#4dc3ff', variable: 'humidity' },
  c: { label: 'CO₂', unit: 'ppm', color: '#b58cff', variable: 'co2' },
}

// Thème automatique : clair le jour, sombre la nuit (heures locales)
export const THEME = { dayStart: 6, nightStart: 19 }
