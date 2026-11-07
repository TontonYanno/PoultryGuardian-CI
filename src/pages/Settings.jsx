import { useState } from 'react'
import { createApi } from '../services'
import Btn from '../components/Btn'
import { THEME } from '../config'

const field = 'w-full px-3 py-2 rounded-xl bg-surface border border-line text-ink text-sm'

export default function Settings({ settings, update }) {
  const [test, setTest] = useState(null)
  const check = async () => {
    setTest('…')
    try {
      const { sensors } = await createApi({ ...settings, source: 'ubidots' }).readSensors()
      setTest(`✅ Connexion réussie (T = ${Number(sensors.t).toFixed(1)} °C)`)
    } catch (e) { setTest('❌ ' + e.message) }
  }
  return (
    <div className="grid gap-4 max-w-xl">
      <div className="panel p-5 grid gap-3">
        <div className="text-[11px] tracking-widest uppercase text-mute">Source des données</div>
        <div className="flex gap-2">
          <Btn on={settings.source === 'sim'} onClick={() => update({ source: 'sim' })}>Simulation</Btn>
          <Btn on={settings.source === 'ubidots'} onClick={() => update({ source: 'ubidots' })}>Ubidots</Btn>
        </div>
        <input className={field} type="password" placeholder="Token Ubidots (BBFF-…)" value={settings.token} onChange={(e) => update({ token: e.target.value.trim() })} />
        <input className={field} placeholder="Device label (ex. poultry-guardian)" value={settings.device} onChange={(e) => update({ device: e.target.value.trim() })} />
        <div className="flex items-center gap-3"><Btn onClick={check} disabled={!settings.token}>Tester la connexion</Btn><span className="text-sm">{test}</span></div>
        {settings.source === 'ubidots' && !(settings.token && settings.device) && <p className="text-xs text-warn">Token et device requis : le simulateur reste actif en attendant.</p>}
      </div>
      <div className="panel p-5 grid gap-3">
        <div className="text-[11px] tracking-widest uppercase text-mute">Apparence</div>
        <div className="flex flex-wrap gap-2">
          {[['auto', '🌗 Auto jour/nuit'], ['light', '☀️ Clair'], ['dark', '🌙 Sombre']].map(([k, label]) => (
            <Btn key={k} on={settings.theme === k} onClick={() => update({ theme: k })}>{label}</Btn>
          ))}
        </div>
        <p className="text-xs text-mute2">Auto : thème clair de {THEME.dayStart} h à {THEME.nightStart} h, sombre le reste du temps.</p>
      </div>
      <div className="panel p-5 text-sm text-body space-y-2">
        <div className="text-[11px] tracking-widest uppercase text-mute">Variables attendues sur Ubidots</div>
        <p><b>Publiées par l’ESP32</b> : <code>temperature</code>, <code>humidity</code>, <code>co2</code>, et l’état réel <code>fan</code>, <code>mist</code>, <code>heater</code> (0/1).</p>
        <p><b>Écrites par l’application</b> : <code>fan</code>, <code>mist</code>, <code>heater</code> (0/1). L’ESP32 lit ces variables et active les relais.</p>
        <p className="text-xs text-mute2">Le token reste dans ce navigateur (localStorage). Pour un usage réel, utilisez un token limité à ce device.</p>
      </div>
    </div>
  )
}
