const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  // Bikes
  bikes: {
    getAll: () => invoke('bikes:getAll'),
    get: (id) => invoke('bikes:get', id),
    create: (data) => invoke('bikes:create', data),
    update: (id, data) => invoke('bikes:update', id, data),
    delete: (id) => invoke('bikes:delete', id),
    updateKm: (id) => invoke('bikes:updateKm', id),
  },
  // Components
  components: {
    getAll: (bikeId) => invoke('components:getAll', bikeId),
    create: (data) => invoke('components:create', data),
    update: (id, data) => invoke('components:update', id, data),
    delete: (id) => invoke('components:delete', id),
  },
  // Consumables
  consumables: {
    getAll: (bikeId) => invoke('consumables:getAll', bikeId),
    create: (data) => invoke('consumables:create', data),
    update: (id, data) => invoke('consumables:update', id, data),
    delete: (id) => invoke('consumables:delete', id),
  },
  // Activities
  activities: {
    getAll: (bikeId) => invoke('activities:getAll', bikeId),
    get: (id) => invoke('activities:get', id),
    create: (data) => invoke('activities:create', data),
    update: (id, data) => invoke('activities:update', id, data),
    delete: (id) => invoke('activities:delete', id),
    stats: (bikeId) => invoke('activities:stats', bikeId),
  },
  // File system
  dialog: {
    openFile: (filters) => invoke('dialog:openFile', filters),
    openImage: () => invoke('dialog:openImage'),
  },
  fs: {
    readFile: (path) => invoke('fs:readFile', path),
    imageToBase64: (path) => invoke('fs:imageToBase64', path),
  },
});
