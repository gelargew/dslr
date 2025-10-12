import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import { WATCH_DIR } from '@/constants/digicam';

export function registerFileHandlers() {
  // Read local file and return as base64
  ipcMain.handle('file:read-local-file', async (event, filePath: string) => {
    try {
      console.log('📖 Reading local file:', filePath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error('❌ File not found:', filePath);
        return { success: false, error: 'File not found' };
      }

      // Read file as buffer
      const fileBuffer = fs.readFileSync(filePath);

      // Convert to base64
      const base64 = fileBuffer.toString('base64');

      console.log('✅ Successfully read file:', filePath);
      return { success: true, data: base64 };
    } catch (error: any) {
      console.error('❌ Error reading file:', error);
      return { success: false, error: error.message };
    }
  });

  // Check if file exists
  ipcMain.handle('file:exists', async (event, filePath: string) => {
    try {
      const exists = fs.existsSync(filePath);
      return { success: true, exists };
    } catch (error: any) {
      console.error('❌ Error checking file existence:', error);
      return { success: false, exists: false, error: error.message };
    }
  });

  // Get full path for a photo in the Session1 directory
  ipcMain.handle('file:get-photo-path', async (event, filename: string) => {
    try {
      const photoPath = path.join(WATCH_DIR, filename);
      console.log('📁 Photo path resolved to:', photoPath);
      return { success: true, path: photoPath };
    } catch (error: any) {
      console.error('❌ Error resolving photo path:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('✅ File IPC handlers registered');
}