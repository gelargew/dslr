import React, { useState } from 'react';
import { frameTemplates } from '@/assets/frames/frame-templates';

export default function FrameDebugger() {
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  const testFrameImage = async (frameImage: string) => {
    console.log('🔍 Testing frame image:', frameImage);

    try {
      // Test if image can be loaded
      const img = new Image();

      const result = await new Promise<string>((resolve) => {
        img.onload = () => {
          console.log('✅ Frame image loaded:', frameImage, `${img.width}x${img.height}`);
          resolve(`✅ Loaded (${img.width}x${img.height})`);
        };
        img.onerror = (error) => {
          console.error('❌ Frame image failed:', frameImage, error);
          resolve(`❌ Failed to load`);
        };
        img.src = frameImage;
      });

      setTestResults(prev => ({ ...prev, [frameImage]: result }));
    } catch (error) {
      console.error('❌ Error testing frame:', frameImage, error);
      setTestResults(prev => ({ ...prev, [frameImage]: `❌ Error: ${error}` }));
    }
  };

  const testAllFrames = async () => {
    console.log('🔍 Testing all frame images...');
    setTestResults({});

    for (const frame of frameTemplates) {
      if (frame.frameImage) {
        await testFrameImage(frame.frameImage);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🔧 Frame Image Debugger
      </h3>

      <button
        onClick={testAllFrames}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test All Frame Images
      </button>

      <div className="space-y-2">
        {frameTemplates.map((frame) => (
          <div key={frame.id} className="p-3 bg-white dark:bg-gray-700 rounded">
            <div className="font-medium text-gray-900 dark:text-white">
              {frame.name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Path: {frame.frameImage || 'No frame image'}
            </div>
            <div className="text-sm">
              Uses Image: {frame.style.useFrameImage ? '✅ Yes' : '❌ No'}
            </div>
            {frame.frameImage && (
              <>
                <div className="text-sm">
                  Status: {testResults[frame.frameImage] || '⏳ Not tested'}
                </div>
                <button
                  onClick={() => testFrameImage(frame.frameImage!)}
                  className="mt-2 px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Test This Image
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
        <div className="font-medium">Debug Tips:</div>
        <ul className="mt-1 space-y-1 text-xs">
          <li>• Check browser console for detailed loading logs</li>
          <li>• Frame images should be in `/public/assets/frames/`</li>
          <li>• Try opening frame URLs directly in browser</li>
          <li>• Check network tab for 404 errors</li>
        </ul>
      </div>
    </div>
  );
}
