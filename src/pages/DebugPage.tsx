import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import FrameDebugger from "@/components/photobooth/FrameDebugger";

export default function DebugPage() {
  const navigate = useNavigate();

  const testImagePaths = [
    '/assets/frames/frame-spotify.png',
    '/assets/frames/frame-instagram.png',
    '/assets/frames/frame-spotify.svg',
    '/assets/frames/frame-instagram.svg',
  ];

  const openImageInNewTab = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 Photobooth Debug Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Debug and test frame loading issues
          </p>
          <Button onClick={() => navigate({ to: "/" })} className="mt-4">
            ← Back to Photobooth
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Path Tests */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              📁 Direct Image Access Test
            </h2>
            <div className="space-y-3">
              {testImagePaths.map((path) => (
                <div key={path} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {path}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openImageInNewTab(path)}
                    className="ml-2"
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
              <p className="font-medium">How to test:</p>
              <ol className="mt-1 space-y-1">
                <li>1. Click "Test" to open each image in a new tab</li>
                <li>2. If you get 404 errors, the paths are wrong</li>
                <li>3. If images load, the paths are correct</li>
              </ol>
            </div>
          </div>

          {/* Image Preview Tests */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              🖼️ Image Preview Test
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {testImagePaths.map((path) => (
                <div key={path} className="text-center">
                  <div className="text-xs mb-2 text-gray-600 dark:text-gray-400">
                    {path.split('/').pop()}
                  </div>
                  <img
                    src={path}
                    alt={path}
                    className="w-full h-24 object-contain border border-gray-300 dark:border-gray-600 rounded"
                    onLoad={() => console.log('✅ Image loaded:', path)}
                    onError={(e) => {
                      console.error('❌ Image failed:', path);
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.alt = '❌ Failed to load';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Frame Debugger */}
        <div className="mt-6">
          <FrameDebugger />
        </div>

        {/* Console Logs */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📝 Debug Instructions
          </h2>
          <div className="space-y-4 text-sm">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
              <h3 className="font-medium">Open Developer Tools:</h3>
              <ul className="mt-1 space-y-1">
                <li>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+Shift+I</kbd> (Windows/Linux)</li>
                <li>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Cmd+Option+I</kbd> (Mac)</li>
                <li>• Or right-click → "Inspect" → Console tab</li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
              <h3 className="font-medium">What to look for in Console:</h3>
              <ul className="mt-1 space-y-1">
                <li>• <span className="text-green-600">✅</span> Green checkmarks = images loading successfully</li>
                <li>• <span className="text-red-600">❌</span> Red X marks = images failing to load</li>
                <li>• 404 errors = file paths are incorrect</li>
                <li>• CORS errors = cross-origin issues</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
              <h3 className="font-medium">Common Solutions:</h3>
              <ul className="mt-1 space-y-1">
                <li>• Check that PNG files are in <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded">/public/assets/frames/</code></li>
                <li>• Restart the dev server after adding files</li>
                <li>• Verify file names match exactly (case-sensitive)</li>
                <li>• Clear browser cache (Ctrl+F5)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
