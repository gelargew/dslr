// Database migration utilities for Turso
import { photoDatabase } from './turso-client';

export async function runMigrationFromMain() {
  try {
    console.log('🔄 Starting database migration...');

    // Initialize the database connection
    await photoDatabase.initialize();

    // Create photos table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        gcs_url TEXT,
        thumbnail_url TEXT,
        original_photo_id TEXT,
        frame_template_id TEXT,
        frame_text TEXT,
        text_settings TEXT,
        overlays TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `;

    await (photoDatabase as any).client.execute(createTableSQL);
    console.log('✅ Photos table created/verified');

    // Add indexes for better performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_photos_original_id ON photos(original_photo_id)',
    ];

    for (const query of indexQueries) {
      await (photoDatabase as any).client.execute(query);
    }

    console.log('✅ Database indexes created/verified');
    console.log('🎉 Migration completed successfully');

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}
