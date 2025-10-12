import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DigicamproConfig } from '@/config/camera-config';
import { X, TestTube, Save, RotateCcw } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: DigicamproConfig;
}

interface ConfigErrors {
  liveFeedUrl?: string;
  captureUrl?: string;
  refreshRate?: string;
  timeout?: string;
  retryAttempts?: string;
  general?: string;
}

export default function ConfigModal({ isOpen, onClose, initialConfig }: ConfigModalProps) {
  const [config, setConfig] = useState<DigicamproConfig>(
    initialConfig || {
      liveFeedUrl: 'http://192.168.1.100:8080/live.jpg',
      captureUrl: 'http://192.168.1.100:8080/capture',
      refreshRate: 20,
      timeout: 5000,
      retryAttempts: 3,
    }
  );

  const [errors, setErrors] = useState<ConfigErrors>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && initialConfig) {
      setConfig(initialConfig);
      setErrors({});
      setTestResult(null);
    }
  }, [isOpen, initialConfig]);

  // Validate configuration
  const validateConfig = (cfg: DigicamproConfig): ConfigErrors => {
    const newErrors: ConfigErrors = {};

    // Live feed URL validation
    if (!cfg.liveFeedUrl.trim()) {
      newErrors.liveFeedUrl = 'Live feed URL is required';
    } else {
      try {
        const url = new URL(cfg.liveFeedUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.liveFeedUrl = 'URL must use HTTP or HTTPS protocol';
        }
      } catch {
        newErrors.liveFeedUrl = 'Invalid URL format';
      }
    }

    // Capture URL validation
    if (!cfg.captureUrl.trim()) {
      newErrors.captureUrl = 'Capture URL is required';
    } else {
      try {
        const url = new URL(cfg.captureUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.captureUrl = 'URL must use HTTP or HTTPS protocol';
        }
      } catch {
        newErrors.captureUrl = 'Invalid URL format';
      }
    }

    // Refresh rate validation
    if (cfg.refreshRate < 1 || cfg.refreshRate > 60) {
      newErrors.refreshRate = 'Refresh rate must be between 1 and 60 fps';
    }

    // Timeout validation
    if (cfg.timeout < 1000 || cfg.timeout > 30000) {
      newErrors.timeout = 'Timeout must be between 1000 and 30000 milliseconds';
    }

    // Retry attempts validation
    if (cfg.retryAttempts < 0 || cfg.retryAttempts > 10) {
      newErrors.retryAttempts = 'Retry attempts must be between 0 and 10';
    }

    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (field: keyof DigicamproConfig, value: string | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (errors[field as keyof ConfigErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Test connection
  const handleTestConnection = async () => {
    const validationErrors = validateConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      if (!window.cameraAPI?.testConnection) {
        throw new Error('Camera API not available');
      }

      const result = await window.cameraAPI.testConnection(config);

      setTestResult({
        success: result.success,
        message: result.success
          ? 'Connection successful!'
          : 'Connection failed',
        details: result.success
          ? `Live feed: ${result.liveFeedReachable ? '✅' : '❌'}, Capture: ${result.captureReachable ? '✅' : '❌'}`
          : result.error,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        details: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save configuration
  const handleSave = async () => {
    const validationErrors = validateConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    try {
      if (!window.configAPI?.saveConfig) {
        throw new Error('Config API not available');
      }

      const result = await window.configAPI.saveConfig(config);

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Configuration saved successfully!',
        });

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to save configuration');
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to save configuration',
        details: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    setConfig({
      liveFeedUrl: 'http://192.168.1.100:8080/live.jpg',
      captureUrl: 'http://192.168.1.100:8080/capture',
      refreshRate: 20,
      timeout: 5000,
      retryAttempts: 3,
    });
    setErrors({});
    setTestResult(null);
  };

  // Close modal
  const handleClose = () => {
    if (!isSaving && !isTesting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Camera Configuration</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSaving || isTesting}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Live Feed URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Live Feed URL
            </label>
            <input
              type="text"
              value={config.liveFeedUrl}
              onChange={(e) => handleInputChange('liveFeedUrl', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.liveFeedUrl ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="http://192.168.1.100:8080/live.jpg"
            />
            {errors.liveFeedUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.liveFeedUrl}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              URL to the live feed image (usually a JPEG that updates frequently)
            </p>
          </div>

          {/* Capture URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Capture URL
            </label>
            <input
              type="text"
              value={config.captureUrl}
              onChange={(e) => handleInputChange('captureUrl', e.target.value)}
              className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.captureUrl ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="http://192.168.1.100:8080/capture"
            />
            {errors.captureUrl && (
              <p className="mt-1 text-sm text-red-400">{errors.captureUrl}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              URL endpoint for capturing photos (usually a POST request)
            </p>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Refresh Rate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Refresh Rate (fps)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={config.refreshRate}
                onChange={(e) => handleInputChange('refreshRate', parseInt(e.target.value) || 20)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.refreshRate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.refreshRate && (
                <p className="mt-1 text-sm text-red-400">{errors.refreshRate}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">20 = 20fps (50ms)</p>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Timeout (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="30000"
                step="1000"
                value={config.timeout}
                onChange={(e) => handleInputChange('timeout', parseInt(e.target.value) || 5000)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.timeout ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.timeout && (
                <p className="mt-1 text-sm text-red-400">{errors.timeout}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Request timeout</p>
            </div>

            {/* Retry Attempts */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={config.retryAttempts}
                onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value) || 3)}
                className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.retryAttempts ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.retryAttempts && (
                <p className="mt-1 text-sm text-red-400">{errors.retryAttempts}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">0 = no retries</p>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-md ${
              testResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
            }`}>
              <p className={`font-medium ${
                testResult.success ? 'text-green-300' : 'text-red-300'
              }`}>
                {testResult.message}
              </p>
              {testResult.details && (
                <p className={`text-sm mt-1 ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {testResult.details}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving || isTesting}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isSaving || isTesting}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving || isTesting}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isTesting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}