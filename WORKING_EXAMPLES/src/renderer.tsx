import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// TypeScript declarations for the exposed API
declare global {
  interface Window {
    electronAPI: {
      capture: () => Promise<{ success: boolean; message?: string; error?: string }>;
      checkDccStatus: () => Promise<{ connected: boolean; message?: string; error?: string }>;
      onNewImage: (callback: (data: { original: string; processed: string }) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    dccConfig: {
      liveViewUrl: string;
      photoUrl: string;
      baseUrl: string;
      captureUrl: string;
    };
  }
}

function App() {
  const [status, setStatus] = React.useState('Initializing...');
  const [capturing, setCapturing] = React.useState(false);
  const [dccConnected, setDccConnected] = React.useState(false);
  const [lastImage, setLastImage] = React.useState<string | null>(null);
  const [liveViewKey, setLiveViewKey] = React.useState(Date.now());

  // Check DigiCamControl status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await window.electronAPI.checkDccStatus();
        setDccConnected(result.connected);
        setStatus(result.connected ? result.message || 'Connected' : result.error || 'Not connected');
      } catch (error) {
        setStatus('Failed to check status');
        setDccConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for new images
  React.useEffect(() => {
    const handleNewImage = (data: { original: string; processed: string }) => {
      setLastImage(data.processed);
      setStatus('Image captured and processed!');
      setCapturing(false);
    };

    window.electronAPI.onNewImage(handleNewImage);

    return () => {
      window.electronAPI.removeAllListeners('new-image');
    };
  }, []);

  const handleCapture = async () => {
    if (!dccConnected) {
      setStatus('DigiCamControl not connected');
      return;
    }

    setCapturing(true);
    setStatus('Capturing...');

    try {
      const result = await window.electronAPI.capture();
      if (result.success) {
        setStatus('Capture initiated, waiting for image...');
        // Refresh live view after capture
        setTimeout(() => setLiveViewKey(Date.now()), 2000);
      } else {
        setStatus(`Capture failed: ${result.error}`);
        setCapturing(false);
      }
    } catch (error) {
      setStatus('Capture failed');
      setCapturing(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>📸 Photobooth Desktop App</h1>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: dccConnected ? '#4CAF50' : '#f44336'
          }} />
          <span style={{ color: '#666', fontSize: '14px' }}>
            {dccConnected ? 'DigiCamControl Connected' : 'DigiCamControl Not Connected'}
          </span>
        </div>
        <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>Status: {status}</p>
      </header>

      <main>
        {/* Live View */}
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Live View</h2>
          {dccConnected ? (
            <img
              src={`${window.dccConfig.liveViewUrl}?t=${liveViewKey}`}
              alt="Live View"
              style={{
                width: '800px',
                maxWidth: '100%',
                height: '500px',
                objectFit: 'cover',
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#000'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxpdmUgVmlldyBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
              }}
            />
          ) : (
            <div style={{
              width: '800px',
              maxWidth: '100%',
              height: '500px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              backgroundColor: '#333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px'
            }}>
              Please start DigiCamControl and enable WebServer plugin
            </div>
          )}
        </section>

        {/* Capture Button */}
        <section style={{ marginBottom: '30px' }}>
          <button
            onClick={handleCapture}
            disabled={!dccConnected || capturing}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: capturing ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: capturing ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s',
              minWidth: '150px'
            }}
          >
            {capturing ? '⏳ Capturing...' : '📸 Capture'}
          </button>
        </section>

        {/* Last Captured Image */}
        {lastImage && (
          <section>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>Last Captured Image</h2>
            <img
              src={`${window.dccConfig.photoUrl}${lastImage}`}
              alt="Last captured"
              style={{
                width: '600px',
                maxWidth: '100%',
                height: '400px',
                objectFit: 'contain',
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            />
            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
              Access photos at: <a href={`http://localhost:3001/photos/`} target="_blank" style={{ color: '#2196F3' }}>http://localhost:3001/photos/</a>
            </p>
          </section>
        )}
      </main>

      <footer style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #ddd' }}>
        <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>
          Make sure DigiCamControl is running with WebServer plugin enabled (Port 5513)
        </p>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}
