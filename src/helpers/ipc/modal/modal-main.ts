// Modal IPC handlers for main process
import { ipcMain } from 'electron';
import { MODAL_CHANNELS } from './modal-channels';

export function registerModalHandlers() {
  console.log('🔌 Registering modal IPC handlers...');

  // These are just pass-through channels since the modal state is managed in renderer
  ipcMain.handle(MODAL_CHANNELS.OPEN_CONFIG, async () => {
    console.log('📡 Open config modal requested');
    return { success: true };
  });

  ipcMain.handle(MODAL_CHANNELS.CLOSE_CONFIG, async () => {
    console.log('📡 Close config modal requested');
    return { success: true };
  });

  console.log('✅ Modal IPC handlers registered');
}