// Choix de la source de données selon les paramètres : Ubidots si configuré, sinon simulateur.
import { createUbidotsApi } from './ubidots'
import { createSimulator } from './simulator'

let sim // un seul simulateur pour toute la session
export function createApi(settings) {
  if (settings.source === 'ubidots' && settings.token && settings.device) return createUbidotsApi(settings)
  return (sim ??= createSimulator())
}
