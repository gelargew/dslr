// Import dynamically to avoid bundling issues in renderer
let createClient: any;
let TURSO_CONFIG: any;

// Dynamic imports to work around Vite bundling issues
async function initializeClient() {
  if (!createClient) {
    const libsql = await import('@libsql/client');
    createClient = libsql.createClient;

    const config = await import('../../../turso.config');
    TURSO_CONFIG = config.TURSO_CONFIG;
  }
}

// Ensure this is only used in main process
if (process.type !== 'renderer') {
  initializeClient().catch(console.error);
}

export interface PhotoRecord {
  id: string;
  filename: string;
  gcs_url?: string;
  thumbnail_url?: string;
  original_photo_id?: string;
  frame_template_id?: string;
  frame_text?: string;
  text_settings?: any;
  overlays?: any;
  created_at: string;
  updated_at: string;
}

export class PhotoDatabase {
  private client: any = null;

  async initialize() {
    await initializeClient();
    if (!this.client && createClient && TURSO_CONFIG) {
      this.client = createClient({
        url: TURSO_CONFIG.url,
        authToken: TURSO_CONFIG.authToken,
      });
      console.log('🔌 Turso client initialized');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      const result = await this.client.execute('SELECT 1 as test');
      console.log('✅ Turso connection successful:', result.rows);
      return true;
    } catch (error) {
      console.error('❌ Turso connection failed:', error);
      return false;
    }
  }

    async savePhoto(data: Omit<PhotoRecord, 'id' | 'created_at' | 'updated_at'>): Promise<PhotoRecord> {
    await this.initialize();
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    console.log('💾 Saving photo to Turso:', { id, filename: data.filename });

    try {
      const result = await this.client.execute({
        sql: `INSERT INTO photos
              (id, filename, gcs_url, thumbnail_url, original_photo_id,
               frame_template_id, frame_text, text_settings, overlays, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id,
          data.filename,
          data.gcs_url || null,
          data.thumbnail_url || null,
          data.original_photo_id || null,
          data.frame_template_id || null,
          data.frame_text || null,
          data.text_settings ? JSON.stringify(data.text_settings) : null,
          data.overlays ? JSON.stringify(data.overlays) : null,
          timestamp,
          timestamp
        ]
      });

      console.log('✅ Photo saved successfully. Result:', result);
    } catch (error) {
      console.error('❌ Failed to save photo to Turso:', error);
      throw error;
    }

    return {
      id,
      created_at: timestamp,
      updated_at: timestamp,
      ...data
    };
  }

  async getRecentPhotos(limit = 50): Promise<PhotoRecord[]> {
    await this.initialize();
    console.log('📖 Fetching recent photos from Turso...');

    const result = await this.client.execute({
      sql: 'SELECT * FROM photos ORDER BY created_at DESC LIMIT ?',
      args: [limit]
    });

    console.log(`✅ Found ${result.rows.length} photos`);

    return result.rows.map(row => ({
      id: row.id as string,
      filename: row.filename as string,
      gcs_url: row.gcs_url as string,
      thumbnail_url: row.thumbnail_url as string,
      original_photo_id: row.original_photo_id as string,
      frame_template_id: row.frame_template_id as string,
      frame_text: row.frame_text as string,
      text_settings: row.text_settings ? JSON.parse(row.text_settings as string) : null,
      overlays: row.overlays ? JSON.parse(row.overlays as string) : null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }));
  }

    async deletePhoto(id: string): Promise<void> {
    await this.initialize();
    console.log('🗑️ Deleting photo:', id);

    await this.client.execute({
      sql: 'DELETE FROM photos WHERE id = ?',
      args: [id]
    });

    console.log('✅ Photo deleted successfully');
  }

  async getPhotoCount(): Promise<number> {
    await this.initialize();
    const result = await this.client.execute('SELECT COUNT(*) as count FROM photos');
    return result.rows[0].count as number;
  }
}

// Export singleton instance
export const photoDatabase = new PhotoDatabase();
