// Configuration context bridge for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { CONFIG_CHANNELS } from './config-channels';

export function exposeConfigContext() {
  try {
    console.log('⚙️ Exposing configuration context to renderer...');
    contextBridge.exposeInMainWorld('configAPI', {
      getConfig: () => {
        console.log('📡 Config get called from renderer');
        return ipcRenderer.invoke(CONFIG_CHANNELS.GET_CONFIG);
      },
      saveConfig: (config) => {
        console.log('📡 Config save called from renderer');
        return ipcRenderer.invoke(CONFIG_CHANNELS.SAVE_CONFIG, config);
      },
      resetConfig: () => {
        console.log('📡 Config reset called from renderer');
        return ipcRenderer.invoke(CONFIG_CHANNELS.RESET_CONFIG);
      },
    });
    console.log('✅ Configuration context exposed successfully');
  } catch (error) {
    console.error('❌ Failed to expose configuration context:', error);
  }
}