#!/usr/bin/env node

// Simple migration script for Turso database
const { createClient } = require('@libsql/client');

const TURSO_CONFIG = {
  url: 'libsql://photobooth-db-gelargew.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTU3MjMzNTMsImlkIjoiOTc0ODc3MzYtMmNmYy00Y2FkLWE2NDAtMDc1MDc5MjU2ZDhlIiwicmlkIjoiMGEwZDkwMDItY2M1OS00OGUzLWJlMWYtMzAzMWY3YzQxNmZmIn0._l8uj1A6CYRA2iMMdNbtagBuoxCWCADpRsOjT1eXIoF18wAN7YR5Npv-UN9cQwFvQERvbqr8NQPiewYZlhswCA',
};

async function migrate() {
  console.log('🔄 Starting Turso migration...');

  try {
    const client = createClient({
      url: TURSO_CONFIG.url,
      authToken: TURSO_CONFIG.authToken,
    });

    // Drop existing table
    console.log('🗑️ Dropping existing photos table...');
    await client.execute({
      sql: 'DROP TABLE IF EXISTS photos'
    });

    // Create new table
    console.log('🏗️ Creating photos table...');
    await client.execute({
      sql: `CREATE TABLE photos (
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
      )`
    });

    // Create indexes
    console.log('📊 Creating indexes...');
    await client.execute({
      sql: 'CREATE INDEX idx_photos_created_at ON photos(created_at)'
    });

    await client.execute({
      sql: 'CREATE INDEX idx_photos_gcs_url ON photos(gcs_url)'
    });

    console.log('✅ Migration completed successfully!');
    console.log('🎉 Your database is ready to receive photos!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
