import React, { useState, useEffect } from 'react';

interface Photo {
  id: string;
  filename: string;
  frame_text?: string;
  created_at: string;
}

export default function TursoTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoCount, setPhotoCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [gcsStatus, setGcsStatus] = useState<string>('Testing...');

  useEffect(() => {
    testConnection();
    testGCSConnection();
    loadPhotos();
    getPhotoCount();
  }, []);

  const testConnection = async () => {
    try {
      const result = await window.photoDatabase.testConnection();
      if (result.success && result.connected) {
        setConnectionStatus('✅ Connected to Turso!');
      } else {
        setConnectionStatus('❌ Connection failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setConnectionStatus('❌ Error: ' + error.message);
    }
  };

  const loadPhotos = async () => {
    try {
      const result = await window.photoDatabase.getPhotos(10);
      if (result.success) {
        setPhotos(result.photos || []);
      } else {
        console.error('Failed to load photos:', result.error);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const getPhotoCount = async () => {
    try {
      const result = await window.photoDatabase.getPhotoCount();
      if (result.success) {
        setPhotoCount(result.count || 0);
      }
    } catch (error) {
      console.error('Error getting photo count:', error);
    }
  };

  const runMigration = async () => {
    setLoading(true);
    try {
      console.log('🔄 Running database migration...');
      const result = await window.photoDatabase.runMigration();
      if (result.success) {
        setConnectionStatus('✅ Migration completed successfully!');
        // Reload data after migration
        await testConnection();
        await loadPhotos();
        await getPhotoCount();
      } else {
        setConnectionStatus('❌ Migration failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setConnectionStatus('❌ Migration error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testGCSConnection = async () => {
    try {
      const result = await window.gcsStorage.testConnection();
      if (result.success && result.connected) {
        setGcsStatus('✅ Connected to Google Cloud Storage!');
      } else {
        setGcsStatus('❌ GCS Connection failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      setGcsStatus('❌ GCS Error: ' + error.message);
    }
  };

  const saveTestPhoto = async () => {
    setLoading(true);
    try {
      const testPhoto = {
        filename: `test-electron-${Date.now()}.jpg`,
        gcs_url: 'https://example.com/test-electron.jpg',
        frame_template_id: 'spotify',
        frame_text: `Hello from Electron! ${new Date().toLocaleTimeString()}`,
        text_settings: { fontSize: 24, color: '#00ff00' },
        overlays: [{ id: 'star', position: { x: 150, y: 250 } }]
      };

      const result = await window.photoDatabase.savePhoto(testPhoto);

      if (result.success) {
        console.log('✅ Test photo saved:', result.photo);
        // Refresh the lists
        await loadPhotos();
        await getPhotoCount();
      } else {
        console.error('❌ Failed to save photo:', result.error);
      }
    } catch (error) {
      console.error('Error saving test photo:', error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          🗄️ Turso Database Test
        </h1>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Connection Status</h2>
          <p className="text-lg font-mono text-gray-700 dark:text-gray-300 mb-2">{connectionStatus}</p>
          <p className="text-lg font-mono text-gray-700 dark:text-gray-300">{gcsStatus}</p>
        </div>

        {/* Photo Count */}
        <div className="mb-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-900">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Database Stats</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            📊 Total Photos: <strong>{photoCount}</strong>
          </p>
        </div>

        {/* Test Actions */}
        <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Test Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Test Turso
            </button>
            <button
              onClick={testGCSConnection}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            >
              ☁️ Test GCS
            </button>
            <button
              onClick={saveTestPhoto}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '⏳ Saving...' : '💾 Save Test Photo'}
            </button>
            <button
              onClick={loadPhotos}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              📸 Refresh Photos
            </button>
            <button
              onClick={runMigration}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '⏳ Migrating...' : '🔄 Run Migration'}
            </button>
          </div>
        </div>

        {/* Recent Photos */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Photos ({photos.length})
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
            {photos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No photos found</p>
            ) : (
              photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{photo.filename}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "{photo.frame_text}" • {new Date(photo.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{photo.id.slice(0, 8)}...</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🧪 Test Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>Check that Turso shows "✅ Connected to Turso!"</li>
            <li>Check that GCS shows "✅ Connected to Google Cloud Storage!"</li>
            <li>Click "Save Test Photo" to add a new record</li>
            <li>Verify the photo count increases</li>
            <li>Check the recent photos list updates</li>
            <li>Open browser dev tools to see detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
