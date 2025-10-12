// Modal context bridge for renderer process
import { contextBridge, ipcRenderer } from 'electron';
import { MODAL_CHANNELS } from './modal-channels';

export function exposeModalContext() {
  try {
    console.log('🎭 Exposing modal context to renderer...');
    contextBridge.exposeInMainWorld('modalAPI', {
      openConfig: () => {
        console.log('📡 Modal openConfig called from renderer');
        return ipcRenderer.invoke(MODAL_CHANNELS.OPEN_CONFIG);
      },
      closeConfig: () => {
        console.log('📡 Modal closeConfig called from renderer');
        return ipcRenderer.invoke(MODAL_CHANNELS.CLOSE_CONFIG);
      },
    });
    console.log('✅ Modal context exposed successfully');
  } catch (error) {
    console.error('❌ Failed to expose modal context:', error);
  }
}