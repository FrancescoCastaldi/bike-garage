/**
 * Electron Main Process
 * Manages application lifecycle, database, and IPC handlers
 */

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Environment configuration
const isDev = process.env.NODE_ENV === 'development';

// Application paths
let userDataPath;
let dbPath;
let imagesDir;
let db;

/**
 * Initialize application directories
 */
function initPaths() {
  userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'bike-garage.db');
  imagesDir = path.join(userDataPath, 'images');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
}

/**
 * Initialize SQLite database with schema
 */
function initDB() {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS bikes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      year INTEGER,
      color TEXT,
      description TEXT,
      image_path TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      total_km REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bike_id INTEGER,
      name TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      category TEXT,
      installed_date TEXT,
      installed_km REAL DEFAULT 0,
      max_km REAL,
      notes TEXT,
      retired INTEGER DEFAULT 0,
      FOREIGN KEY (bike_id) REFERENCES bikes(id)
    );
    CREATE TABLE IF NOT EXISTS consumables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bike_id INTEGER,
      name TEXT NOT NULL,
      category TEXT,
      brand TEXT,
      quantity REAL DEFAULT 1,
      unit TEXT DEFAULT 'pz',
      purchase_date TEXT,
      price REAL,
      notes TEXT,
      used INTEGER DEFAULT 0,
      FOREIGN KEY (bike_id) REFERENCES bikes(id)
    );
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bike_id INTEGER,
      name TEXT NOT NULL,
      date TEXT,
      distance_km REAL,
      duration_sec INTEGER,
      elevation_m REAL,
      avg_hr INTEGER,
      max_hr INTEGER,
      avg_watts REAL,
      max_watts REAL,
      avg_speed REAL,
      max_speed REAL,
      gpx_data TEXT,
      notes TEXT,
      FOREIGN KEY (bike_id) REFERENCES bikes(id)
    );
  `);
}

/**
 * Create main application window
 */
function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  
  const winOptions = {
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'ipc/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
  };
  
  // Add icon only if it exists
  if (fs.existsSync(iconPath)) {
    winOptions.icon = iconPath;
  }
  
  const win = new BrowserWindow(winOptions);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Application lifecycle
app.whenReady().then(() => {
  initPaths();
  initDB();
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Export database for use in other modules
module.exports = { db };
