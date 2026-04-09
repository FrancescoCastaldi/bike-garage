# Bike Garage

Applicazione desktop per la gestione e il monitoraggio della bici: componenti, materiali di consumo e attivita' GPX.

## Funzionalita'

- **Bici**: Aggiungi piu' bici con nome, immagine e note
- **Componenti**: Traccia i componenti montati su ogni bici (catena, cassetta, freni, ecc.)
- **Consumabili**: Monitora l'usura dei materiali con soglie km configurabili e barre di avanzamento
- **Attivita'**: Importa file .gpx con parsing automatico di distanza, elevazione, frequenza cardiaca e watt
- **Dashboard**: Statistiche aggregate e panoramica generale
- **Storage locale**: Tutti i dati vengono salvati in un database SQLite locale sul tuo PC

## Stack Tecnico

- **Electron** - Framework desktop cross-platform
- **React + Vite** - UI moderna e reattiva
- **SQLite (better-sqlite3)** - Database locale
- **Recharts** - Grafici e visualizzazioni
- **Leaflet** - Mappe per le tracce GPX

## Installazione

```bash
# Clona il repository
git clone https://github.com/FrancescoCastaldi/bike-garage.git
cd bike-garage

# Installa le dipendenze
npm install

# Avvia in modalita' sviluppo
npm run dev
```

## Build

```bash
# Crea l'eseguibile per Windows
npm run build
```

L'eseguibile sara' disponibile nella cartella `dist/`.

## Struttura del Progetto

```
bike-garage/
├── electron/
│   ├── main.js        # Main process Electron + SQLite
│   └── preload.js     # Bridge sicuro renderer <-> main
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Bikes.jsx
│   │   ├── BikeDetail.jsx
│   │   ├── Components.jsx
│   │   ├── Consumables.jsx
│   │   └── Activities.jsx
│   ├── utils/
│   │   └── gpxParser.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## Database Schema

- `bikes` - Bici con nome, immagine, note
- `components` - Componenti con tipo, marca, km montati
- `consumables` - Materiali di consumo con soglia km e stato
- `activities` - Attivita' importate da GPX con metriche complete
