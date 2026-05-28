/**
 * Application constants and configuration
 */

export const APP_INFO = {
  name: 'Bike Garage',
  version: '1.0.0',
  description: 'App desktop per gestire bici, componenti, consumabili e attività GPX',
};

export const ROUTES = {
  DASHBOARD: '/',
  BIKES: '/bikes',
  BIKE_DETAIL: '/bikes/:id',
  COMPONENTS: '/components',
  CONSUMABLES: '/consumables',
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',
};

export const CATEGORIES = {
  COMPONENTS: [
    'Trasmissione',
    'Freni',
    'Ruote',
    'Sospensioni',
    'Cockpit',
    'Sellino',
    'Altro',
  ],
  CONSUMABLES: [
    'Lubrificanti',
    'Copertoni',
    'Camera d\'aria',
    'Pastiglie freni',
    'Catena',
    'Cassetta',
    'Accessori',
  ],
};

export const UNITS = {
  DISTANCE: 'km',
  ELEVATION: 'm',
  SPEED: 'km/h',
  POWER: 'W',
  HEART_RATE: 'bpm',
  DURATION: 'sec',
};

export const STORAGE_KEYS = {
  THEME: 'bike-garage-theme',
  PREFERENCES: 'bike-garage-preferences',
};

export const IPC_CHANNELS = {
  BIKES: {
    GET_ALL: 'bikes:getAll',
    GET: 'bikes:get',
    CREATE: 'bikes:create',
    UPDATE: 'bikes:update',
    DELETE: 'bikes:delete',
    UPDATE_KM: 'bikes:updateKm',
  },
  COMPONENTS: {
    GET_ALL: 'components:getAll',
    CREATE: 'components:create',
    UPDATE: 'components:update',
    DELETE: 'components:delete',
  },
  CONSUMABLES: {
    GET_ALL: 'consumables:getAll',
    CREATE: 'consumables:create',
    UPDATE: 'consumables:update',
    DELETE: 'consumables:delete',
  },
  ACTIVITIES: {
    GET_ALL: 'activities:getAll',
    GET: 'activities:get',
    CREATE: 'activities:create',
    UPDATE: 'activities:update',
    DELETE: 'activities:delete',
    STATS: 'activities:stats',
  },
  DIALOG: {
    OPEN_FILE: 'dialog:openFile',
    OPEN_IMAGE: 'dialog:openImage',
  },
  FS: {
    READ_FILE: 'fs:readFile',
    IMAGE_TO_BASE64: 'fs:imageToBase64',
  },
};

export const UI_CONFIG = {
  SIDEBAR_WIDTH: 220,
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
};
