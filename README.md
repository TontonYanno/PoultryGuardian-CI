# PoultryGuardian-CI (React + Tailwind + PWA)

    npm install && npm run dev        # http://localhost:5173
    npm run build && npm run preview  # version PWA

## Architecture en couches (chaque couche ne connaît que celles du dessous)
    pages/        écrans (Dashboard, History, Settings)
    components/   éléments visuels réutilisables (Gauge, Coop, LineChart, ...)
    hooks/        useCoop (orchestration), useHistory, useSettings
    domain/       règles métier pures : risk, forecast, control, validate (sans React ni réseau)
    services/     monde extérieur : ubidots.js (API), simulator.js (démo), eventLog.js ; index.js choisit la source
    config/       noms des variables, seuils, délais

Le simulateur et le client Ubidots exposent la même interface (readSensors / readHistory / sendCommand) :
le reste de l'application ne sait pas lequel est utilisé.

## Ubidots
Réglages -> Source « Ubidots », token + device label, « Tester la connexion ».
- L'ESP32 publie : temperature, humidity, co2 et l'état réel fan, mist, heater (0/1)
- L'application écrit fan, mist, heater (0/1) ; l'ESP32 lit ces variables et commande les relais
