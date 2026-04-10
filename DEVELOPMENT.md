# Bike Garage - Guida allo Sviluppo

## Descrizione

Bike Garage è un'applicazione desktop Electron + React per la gestione completa delle tue bici:

- 🚲 **Gestione bici** - Aggiungi piu' bici con immagini, marca, modello, note
- 🔧 **Componenti** - Traccia tutti i componenti montati (catena, cassetta, freni, ecc.) con km percorsi
- 🗂️ **Consumabili** - Monitora l'usura dei materiali con soglie km e barre di progresso
- ⚡ **Attività GPX** - Importa file .gpx con parsing automatico di distanza, elevazione, HR, watt
- 📊 **Dashboard** - Statistiche aggregate e grafici
- 💾 **Storage locale** - Database SQLite locale, nessun cloud

## Requisiti

- **Node.js** v18+ (raccomandato: v20 LTS)
- **npm** v9+
- **Windows 10/11** (l'app è ottimizzata per Windows)

## Setup Iniziale

### 1. Clona il repository

```bash
git clone https://github.com/FrancescoCastaldi/bike-garage.git
cd bike-garage
```

### 2. Installa le dipendenze

```bash
npm install
```

Questo installerà:
- Electron (framework desktop)
- React + Vite (UI e build system)
- better-sqlite3 (database locale)
- recharts (grafici)
- leaflet (mappe)
- react-router-dom (routing)

### 3. Avvia in modalità sviluppo

```bash
npm run dev
```

Questo avvierà:
1. Vite dev server su `http://localhost:5173`
2. Electron in development mode con hot reload
3. DevTools aperti automaticamente

L'app si riavvia automaticamente quando modifichi i file.

## Struttura del Progetto

```
bike-garage/
├── electron/
│   ├── main.js        # Main process Electron + SQLite DB + IPC handlers
│   └── preload.js     # Context bridge sicuro (renderer <-> main)
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx       # Dashboard con statistiche e grafici
│   │   ├── Bikes.jsx           # Lista bici con grid view
│   │   ├── BikeDetail.jsx      # Dettaglio singola bici
│   │   ├── Components.jsx      # Gestione componenti
│   │   ├── Consumables.jsx     # Gestione consumabili
│   │   └── Activities.jsx      # Import GPX e lista attività
│   ├── utils/
│   │   └── gpxParser.js        # Parser GPX con calcolo Haversine
│   ├── App.jsx                  # App principale con routing e sidebar
│   ├── main.jsx                 # Entry point React
│   └── index.css                # Stili globali (dark theme)
├── index.html                   # HTML template
├── vite.config.js               # Configurazione Vite
├── package.json
└── README.md
```

## Database Schema

Il database SQLite locale (`bike-garage.db`) contiene 4 tabelle:

### `bikes`
- `id` - Primary key
- `name` - Nome bici (required)
- `brand`, `model`, `year`, `color` - Dettagli
- `description` - Note
- `image_path` - Path locale immagine
- `total_km` - Km totali (auto-calcolato da activities)

### `components`
- `id` - Primary key
- `bike_id` - Foreign key -> bikes
- `name`, `brand`, `model`, `category` - Dettagli componente
- `installed_date`, `installed_km` - Data/km installazione
- `max_km` - Soglia km consigliata
- `retired` - Flag ritiro (0/1)

### `consumables`
- `id` - Primary key
- `bike_id` - Foreign key -> bikes
- `name`, `category`, `brand` - Dettagli
- `quantity`, `unit` - Quantità (es. 2 pz, 1 bottiglia)
- `purchase_date`, `price` - Acquisto
- `used` - Flag usato (0/1)

### `activities`
- `id` - Primary key
- `bike_id` - Foreign key -> bikes
- `name`, `date` - Nome attività e data
- `distance_km`, `duration_sec` - Distanza e durata
- `elevation_m` - Dislivello
- `avg_hr`, `max_hr` - Frequenza cardiaca
- `avg_watts`, `max_watts` - Potenza
- `avg_speed`, `max_speed` - Velocità
- `gpx_data` - Contenuto GPX raw (opzionale)

## API IPC (Electron)

Tutti gli handler IPC sono definiti in `electron/main.js`:

### Bikes
- `bikes:getAll` - Recupera tutte le bici
- `bikes:get(id)` - Recupera singola bici
- `bikes:create(data)` - Crea nuova bici
- `bikes:update(id, data)` - Aggiorna bici
- `bikes:delete(id)` - Elimina bici
- `bikes:updateKm(id)` - Ricalcola km totali da activities

### Components
- `components:getAll(bikeId?)` - Lista componenti (opzionalmente filtrati per bici)
- `components:create(data)` - Crea componente
- `components:update(id, data)` - Aggiorna componente
- `components:delete(id)` - Elimina componente

### Consumables
- `consumables:getAll(bikeId?)` - Lista consumabili
- `consumables:create(data)` - Crea consumabile
- `consumables:update(id, data)` - Aggiorna consumabile
- `consumables:delete(id)` - Elimina consumabile

### Activities
- `activities:getAll(bikeId?)` - Lista attività
- `activities:get(id)` - Dettaglio attività
- `activities:create(data)` - Crea attività
- `activities:update(id, data)` - Aggiorna attività
- `activities:delete(id)` - Elimina attività
- `activities:stats(bikeId?)` - Statistiche aggregate

### File Dialogs
- `dialog:openFile(filters)` - Apri dialog per selezionare file
- `dialog:openImage()` - Apri dialog per immagini + copia in userdata
- `fs:readFile(path)` - Leggi contenuto file
- `fs:imageToBase64(path)` - Converti immagine in base64

## Build per Produzione

### Build app

```bash
npm run build
```

Genera:
- `dist/` - Build Vite ottimizzato
- App Electron pronta per packaging

### Crea eseguibile Windows

```bash
npm run dist
```

Crea eseguibile `.exe` nella cartella `dist/` usando electron-builder.

## Debugging

### DevTools

In development mode, DevTools si aprono automaticamente. Puoi:
- Ispezionare DOM
- Console per log React
- Network tab per IPC calls
- Application > Local Storage/SQLite

### Log Database

Il database si trova in:
```
%APPDATA%/bike-garage/bike-garage.db
```

Puoi aprirlo con DB Browser for SQLite o simili.

### Log Electron

I log del main process appaiono nel terminale dove hai eseguito `npm run dev`.

## Troubleshooting

### Problema: `better-sqlite3` non compila

**Soluzione**: Installa build tools Windows:
```bash
npm install --global windows-build-tools
npm rebuild better-sqlite3
```

### Problema: L'app non si avvia

**Soluzione**: Elimina `node_modules` e reinstalla:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: Hot reload non funziona

**Soluzione**: Riavvia `npm run dev`. Se persiste, verifica che Vite sia su porta 5173.

## Prossimi Sviluppi (Future Features)

- [ ] Export dati in CSV/JSON
- [ ] Backup automatico database
- [ ] Integrazione Strava API
- [ ] Supporto file .FIT oltre a GPX
- [ ] Grafici avanzati con filtri temporali
- [ ] Notifiche manutenzione componenti
- [ ] Multi-lingua (EN/IT)
- [ ] Tema chiaro/scuro selezionabile

## Licenza

MIT License - Vedi LICENSE file

## Autore

FrancescoCastaldi - [GitHub](https://github.com/FrancescoCastaldi)
