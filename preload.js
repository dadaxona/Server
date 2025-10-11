const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  get: () => ipcRenderer.invoke('get'),
  create: (data) => ipcRenderer.invoke('create', data),
  update: (data) => ipcRenderer.invoke('update', data),
  destroy: (data) => ipcRenderer.invoke('destroy', data),

  start: (data) => ipcRenderer.invoke('start', data),
  stop: (data) => ipcRenderer.invoke('stop', data)
})
