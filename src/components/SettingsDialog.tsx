import React, { useState, useEffect } from 'react';
import { X, TestTube, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/stores';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  // Read config from Zustand store
  const debuggerEnabled = useConfigStore((state) => state.debugger.enabled);
  const digicamBaseUrl = useConfigStore((state) => state.digicam.baseUrl);
  const appId = useConfigStore((state) => state.app.id);

  // Zustand actions
  const setDebuggerEnabled = useConfigStore((state) => state.setDebuggerEnabled);
  const setDigicamBaseUrl = useConfigStore((state) => state.setDigicamBaseUrl);

  const [tempDebuggerEnabled, setTempDebuggerEnabled] = useState(debuggerEnabled);
  const [tempDigicamUrl, setTempDigicamUrl] = useState(digicamBaseUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Update local state when store changes
  useEffect(() => {
    setTempDebuggerEnabled(debuggerEnabled);
    setTempDigicamUrl(digicamBaseUrl);
  }, [debuggerEnabled, digicamBaseUrl]);

  const handleDebuggerToggle = (enabled: boolean) => {
    setTempDebuggerEnabled(enabled);
    setTestResult(null); // Clear previous test results
  };

  const handleUrlChange = (url: string) => {
    setTempDigicamUrl(url);
    setTestResult(null); // Clear previous test results
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      // Test both the base URL and specific endpoints
      const baseUrl = tempDigicamUrl.replace(/\/$/, ''); // Remove trailing slash

      // Test liveview endpoint
      const liveviewController = new AbortController();
      const liveviewTimeout = setTimeout(() => liveviewController.abort(), 5000);

      const liveviewResponse = await fetch(`${baseUrl}/liveview.jpg`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: liveviewController.signal
      }).finally(() => clearTimeout(liveviewTimeout));

      // Test capture endpoint
      const captureController = new AbortController();
      const captureTimeout = setTimeout(() => captureController.abort(), 5000);

      const captureResponse = await fetch(`${baseUrl}/json/liveview`, {
        method: 'GET',
        signal: captureController.signal
      }).finally(() => clearTimeout(captureTimeout));

      if (captureResponse.ok) {
        setTestResult({
          success: true,
          message: '✅ Connection successful! DigiCamControl is responding.'
        });
      } else {
        setTestResult({
          success: false,
          message: '⚠️ Server responded but may not be fully configured.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    // Validate URL before saving
    try {
      new URL(tempDigicamUrl);

      console.log('💾 SettingsDialog: Saving configuration...', {
        debuggerEnabled: tempDebuggerEnabled,
        digicamUrl: tempDigicamUrl
      });

      // Save to Zustand store
      setDebuggerEnabled(tempDebuggerEnabled);
      console.log('💾 SettingsDialog: Debugger enabled saved');

      setDigicamBaseUrl(tempDigicamUrl);
      console.log('💾 SettingsDialog: DigiCamControl URL saved');

      onClose();

    } catch {
      setTestResult({
        success: false,
        message: '❌ Invalid URL format. Please enter a valid HTTP/HTTPS URL.'
      });
    }
  };

  const handleReset = () => {
    setTempDebuggerEnabled(true);
    setTempDigicamUrl('http://127.0.0.1:5513');
    setTestResult(null);
  };

  const handleCancel = () => {
    setTempDebuggerEnabled(debuggerEnabled);
    setTempDigicamUrl(digicamBaseUrl);
    setTestResult(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">🏠 Textimoni Configuration</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-white hover:bg-white/20"
            >
              <X size={20} />
            </Button>
          </div>

          {/* App ID */}
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <div className="text-sm opacity-90">App ID</div>
            <div className="font-mono text-lg font-bold">{appId}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Debugger Toggle */}
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tempDebuggerEnabled}
                onChange={(e) => handleDebuggerToggle(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium">Enable Debugger Interface</span>
            </label>
            <p className="text-sm text-gray-600 ml-8">
              Show debugger tools and system information panel
            </p>
          </div>

          {/* DigiCamControl URL */}
          <div className="space-y-2">
            <label htmlFor="digicam-url" className="block text-lg font-medium">
              📷 DigiCamControl Web Server URL
            </label>
            <input
              id="digicam-url"
              type="text"
              value={tempDigicamUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="http://127.0.0.1:5513"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600">
              URL for DigiCamControl web server (usually http://127.0.0.1:5513)
            </p>
          </div>

          {/* Test Connection */}
          <div className="space-y-2">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              variant="outline"
              className="w-full"
            >
              <TestTube size={16} className="mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>

            {testResult && (
              <div className={`p-3 rounded-lg text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset to Defaults
          </Button>

          <div className="space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}