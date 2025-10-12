import React, { useState, useEffect } from 'react';

interface TroubleshootingPanelProps {
  onClose: () => void;
}

export default function TroubleshootingPanel({ onClose }: TroubleshootingPanelProps) {
  const [cameraStatus, setCameraStatus] = useState<string>('Testing...');
  const [databaseStatus, setDatabaseStatus] = useState<string>('Testing...');

  useEffect(() => {
    testCamera();
    testDatabase();
  }, []);

  const testCamera = async () => {
    try {
      if (window.cameraAPI) {
        const result = await window.cameraAPI.getPermissions();
        setCameraStatus(result.success ? 'Camera API available' : 'Camera API failed');
      } else {
        setCameraStatus('Camera API not available');
      }
    } catch (error) {
      setCameraStatus(`Camera error: ${error.message}`);
    }
  };

  const testDatabase = async () => {
    try {
      if (window.photoDatabase) {
        const result = await window.photoDatabase.testConnection();
        setDatabaseStatus(result.success && result.connected ? 'Database connected' : `Database failed: ${result.error}`);
      } else {
        setDatabaseStatus('Database API not available');
      }
    } catch (error) {
      setDatabaseStatus(`Database error: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Troubleshooting</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Camera Status</h3>
            <p className="text-sm text-gray-600">{cameraStatus}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Database Status</h3>
            <p className="text-sm text-gray-600">{databaseStatus}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <h3 className="font-medium text-blue-800 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Make sure you have an internet connection for database access</li>
              <li>• Allow camera permissions when prompted</li>
              <li>• Try restarting the application</li>
              <li>• Check Windows Privacy Settings for camera access</li>
            </ul>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={testCamera}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Camera
            </button>
            <button
              onClick={testDatabase}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






