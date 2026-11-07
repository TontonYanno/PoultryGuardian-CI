// Journal des actions (auto, manuel, erreurs), conservé dans le navigateur.
const KEY = 'pg_events'
let events = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } })()

export const eventLog = {
  list: () => events,
  add(e) {
    events = [{ ts: Date.now(), ...e }, ...events].slice(0, 300)
    try { localStorage.setItem(KEY, JSON.stringify(events)) } catch { /* stockage plein : on ignore */ }
    return events
  },
  clear() { events = []; try { localStorage.removeItem(KEY) } catch { /* ignore */ } return events },
}
