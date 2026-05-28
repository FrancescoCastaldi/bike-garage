/**
 * API service for IPC communication with Electron main process
 */
import { IPC_CHANNELS } from '../constants';

const invoke = (channel, ...args) => {
  if (!window.api) {
    console.error('Electron API not available');
    return Promise.reject(new Error('Electron API not available'));
  }
  return window.api[channel](...args);
};

export const bikesAPI = {
  getAll: () => invoke(IPC_CHANNELS.BIKES.GET_ALL),
  get: (id) => invoke(IPC_CHANNELS.BIKES.GET, id),
  create: (data) => invoke(IPC_CHANNELS.BIKES.CREATE, data),
  update: (id, data) => invoke(IPC_CHANNELS.BIKES.UPDATE, id, data),
  delete: (id) => invoke(IPC_CHANNELS.BIKES.DELETE, id),
  updateKm: (id) => invoke(IPC_CHANNELS.BIKES.UPDATE_KM, id),
};

export const componentsAPI = {
  getAll: (bikeId) => invoke(IPC_CHANNELS.COMPONENTS.GET_ALL, bikeId),
  create: (data) => invoke(IPC_CHANNELS.COMPONENTS.CREATE, data),
  update: (id, data) => invoke(IPC_CHANNELS.COMPONENTS.UPDATE, id, data),
  delete: (id) => invoke(IPC_CHANNELS.COMPONENTS.DELETE, id),
};

export const consumablesAPI = {
  getAll: (bikeId) => invoke(IPC_CHANNELS.CONSUMABLES.GET_ALL, bikeId),
  create: (data) => invoke(IPC_CHANNELS.CONSUMABLES.CREATE, data),
  update: (id, data) => invoke(IPC_CHANNELS.CONSUMABLES.UPDATE, id, data),
  delete: (id) => invoke(IPC_CHANNELS.CONSUMABLES.DELETE, id),
};

export const activitiesAPI = {
  getAll: (bikeId) => invoke(IPC_CHANNELS.ACTIVITIES.GET_ALL, bikeId),
  get: (id) => invoke(IPC_CHANNELS.ACTIVITIES.GET, id),
  create: (data) => invoke(IPC_CHANNELS.ACTIVITIES.CREATE, data),
  update: (id, data) => invoke(IPC_CHANNELS.ACTIVITIES.UPDATE, id, data),
  delete: (id) => invoke(IPC_CHANNELS.ACTIVITIES.DELETE, id),
  stats: (bikeId) => invoke(IPC_CHANNELS.ACTIVITIES.STATS, bikeId),
};

export const dialogAPI = {
  openFile: (filters) => invoke(IPC_CHANNELS.DIALOG.OPEN_FILE, filters),
  openImage: () => invoke(IPC_CHANNELS.DIALOG.OPEN_IMAGE),
};

export const fsAPI = {
  readFile: (path) => invoke(IPC_CHANNELS.FS.READ_FILE, path),
  imageToBase64: (path) => invoke(IPC_CHANNELS.FS.IMAGE_TO_BASE64, path),
};

export default {
  bikes: bikesAPI,
  components: componentsAPI,
  consumables: consumablesAPI,
  activities: activitiesAPI,
  dialog: dialogAPI,
  fs: fsAPI,
};
