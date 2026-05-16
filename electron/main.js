const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const isDev = process.env.NODE_ENV === 'development';

// Paths initialized after app is ready
let userDataPath;
let dbPath;
let imagesDir;
let db;

function initPaths() {
  userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'bike-garage.db');
  imagesDir = path.join(userDataPath, 'images');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
}

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

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const winOptions = {
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'default'
  };
  // Add icon only if it exists (optional asset)
  if (fs.existsSync(iconPath)) {
    winOptions.icon = iconPath;
  }
  const win = new BrowserWindow(winOptions);

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  initPaths();
  initDB();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ===== IPC HANDLERS =====

// BIKES
ipcMain.handle('bikes:getAll', () => db.prepare('SELECT * FROM bikes ORDER BY name').all());
ipcMain.handle('bikes:get', (_, id) => db.prepare('SELECT * FROM bikes WHERE id=?').get(id));
ipcMain.handle('bikes:create', (_, data) => {
  const r = db.prepare('INSERT INTO bikes (name,brand,model,year,color,description,image_path) VALUES (?,?,?,?,?,?,?)').run(data.name,data.brand,data.model,data.year,data.color,data.description,data.image_path);
  return r.lastInsertRowid;
});
ipcMain.handle('bikes:update', (_, id, data) => {
  db.prepare('UPDATE bikes SET name=?,brand=?,model=?,year=?,color=?,description=?,image_path=? WHERE id=?').run(data.name,data.brand,data.model,data.year,data.color,data.description,data.image_path,id);
});
ipcMain.handle('bikes:delete', (_, id) => db.prepare('DELETE FROM bikes WHERE id=?').run(id));
ipcMain.handle('bikes:updateKm', (_, id) => {
  const result = db.prepare('SELECT COALESCE(SUM(distance_km),0) as total FROM activities WHERE bike_id=?').get(id);
  db.prepare('UPDATE bikes SET total_km=? WHERE id=?').run(result.total, id);
});

// COMPONENTS
ipcMain.handle('components:getAll', (_, bikeId) => {
  if (bikeId) return db.prepare('SELECT * FROM components WHERE bike_id=? ORDER BY installed_date DESC').all(bikeId);
  return db.prepare('SELECT c.*, b.name as bike_name FROM components c LEFT JOIN bikes b ON c.bike_id=b.id ORDER BY c.installed_date DESC').all();
});
ipcMain.handle('components:create', (_, data) => {
  const r = db.prepare('INSERT INTO components (bike_id,name,brand,model,category,installed_date,installed_km,max_km,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(data.bike_id,data.name,data.brand,data.model,data.category,data.installed_date,data.installed_km,data.max_km,data.notes);
  return r.lastInsertRowid;
});
ipcMain.handle('components:update', (_, id, data) => {
  db.prepare('UPDATE components SET bike_id=?,name=?,brand=?,model=?,category=?,installed_date=?,installed_km=?,max_km=?,notes=?,retired=? WHERE id=?').run(data.bike_id,data.name,data.brand,data.model,data.category,data.installed_date,data.installed_km,data.max_km,data.notes,data.retired,id);
});
ipcMain.handle('components:delete', (_, id) => db.prepare('DELETE FROM components WHERE id=?').run(id));

// CONSUMABLES
ipcMain.handle('consumables:getAll', (_, bikeId) => {
  if (bikeId) return db.prepare('SELECT * FROM consumables WHERE bike_id=? ORDER BY purchase_date DESC').all(bikeId);
  return db.prepare('SELECT c.*, b.name as bike_name FROM consumables c LEFT JOIN bikes b ON c.bike_id=b.id ORDER BY c.purchase_date DESC').all();
});
ipcMain.handle('consumables:create', (_, data) => {
  const r = db.prepare('INSERT INTO consumables (bike_id,name,category,brand,quantity,unit,purchase_date,price,notes) VALUES (?,?,?,?,?,?,?,?,?)').run(data.bike_id,data.name,data.category,data.brand,data.quantity,data.unit,data.purchase_date,data.price,data.notes);
  return r.lastInsertRowid;
});
ipcMain.handle('consumables:update', (_, id, data) => {
  db.prepare('UPDATE consumables SET bike_id=?,name=?,category=?,brand=?,quantity=?,unit=?,purchase_date=?,price=?,notes=?,used=? WHERE id=?').run(data.bike_id,data.name,data.category,data.brand,data.quantity,data.unit,data.purchase_date,data.price,data.notes,data.used,id);
});
ipcMain.handle('consumables:delete', (_, id) => db.prepare('DELETE FROM consumables WHERE id=?').run(id));

// ACTIVITIES
ipcMain.handle('activities:getAll', (_, bikeId) => {
  if (bikeId) return db.prepare('SELECT * FROM activities WHERE bike_id=? ORDER BY date DESC').all(bikeId);
  return db.prepare('SELECT a.*, b.name as bike_name FROM activities a LEFT JOIN bikes b ON a.bike_id=b.id ORDER BY a.date DESC').all();
});
ipcMain.handle('activities:get', (_, id) => db.prepare('SELECT * FROM activities WHERE id=?').get(id));
ipcMain.handle('activities:create', (_, data) => {
  const r = db.prepare('INSERT INTO activities (bike_id,name,date,distance_km,duration_sec,elevation_m,avg_hr,max_hr,avg_watts,max_watts,avg_speed,max_speed,gpx_data,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(data.bike_id,data.name,data.date,data.distance_km,data.duration_sec,data.elevation_m,data.avg_hr,data.max_hr,data.avg_watts,data.max_watts,data.avg_speed,data.max_speed,data.gpx_data,data.notes);
  return r.lastInsertRowid;
});
ipcMain.handle('activities:update', (_, id, data) => {
  db.prepare('UPDATE activities SET bike_id=?,name=?,date=?,distance_km=?,duration_sec=?,elevation_m=?,avg_hr=?,max_hr=?,avg_watts=?,max_watts=?,avg_speed=?,max_speed=?,gpx_data=?,notes=? WHERE id=?').run(data.bike_id,data.name,data.date,data.distance_km,data.duration_sec,data.elevation_m,data.avg_hr,data.max_hr,data.avg_watts,data.max_watts,data.avg_speed,data.max_speed,data.gpx_data,data.notes,id);
});
ipcMain.handle('activities:delete', (_, id) => db.prepare('DELETE FROM activities WHERE id=?').run(id));
ipcMain.handle('activities:stats', (_, bikeId) => {
  const q = bikeId ? 'WHERE bike_id=?' : 'WHERE 1=1';
  const args = bikeId ? [bikeId] : [];
  return db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(distance_km),0) as total_km, COALESCE(AVG(distance_km),0) as avg_km, COALESCE(SUM(elevation_m),0) as total_elev, COALESCE(AVG(avg_hr),0) as avg_hr, COALESCE(AVG(avg_watts),0) as avg_watts FROM activities ${q}`).get(...args);
});

// FILE DIALOG
ipcMain.handle('dialog:openFile', async (_, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || [{ name: 'All Files', extensions: ['*'] }]
  });
  return result.canceled ? null : result.filePaths[0];
});
ipcMain.handle('dialog:openImage', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','webp','gif'] }]
  });
  if (result.canceled) return null;
  const srcPath = result.filePaths[0];
  const ext = path.extname(srcPath);
  const destName = `bike_${Date.now()}${ext}`;
  const destPath = path.join(imagesDir, destName);
  fs.copyFileSync(srcPath, destPath);
  return destPath;
});
ipcMain.handle('fs:readFile', (_, filePath) => fs.readFileSync(filePath, 'utf8'));
ipcMain.handle('fs:imageToBase64', (_, imgPath) => {
  if (!imgPath || !fs.existsSync(imgPath)) return null;
  const ext = path.extname(imgPath).replace('.','');
  const data = fs.readFileSync(imgPath).toString('base64');
  return `data:image/${ext};base64,${data}`;
});
