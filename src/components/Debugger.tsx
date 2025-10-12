import React, { useState, useRef, useEffect } from 'react';
import { Terminal, X, Minimize2, Maximize2, Server, Monitor } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  source: 'server' | 'client';
}

interface DebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const Debugger: React.FC<DebuggerProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeTab, setActiveTab] = useState<'server' | 'client'>('server');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  // Listen for log messages from main process
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const { electronAPI } = window as any;

      const handleLogMessage = (logEntry: LogEntry) => {
        setLogs(prev => [...prev.slice(-999), logEntry]); // Keep only last 1000 entries
      };

      electronAPI.onLogMessage(handleLogMessage);

      return () => {
        electronAPI.removeAllListeners('log-message');
      };
    }
  }, []);

  // Capture client-side logs
  useEffect(() => {
    const originalConsole = { ...console };

    const logToDebugger = (level: 'info' | 'error' | 'warn' | 'debug', args: any[]) => {
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        level,
        message: args.join(' '),
        source: 'client'
      };

      setLogs(prev => [...prev.slice(-999), logEntry]);
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      logToDebugger('info', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      logToDebugger('info', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      logToDebugger('warn', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      logToDebugger('error', args);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      logToDebugger('debug', args);
    };

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'debug': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  if (!isVisible) return null;

  const filteredLogs = logs.filter(log => log.source === activeTab);
  const serverLogsCount = logs.filter(log => log.source === 'server').length;
  const clientLogsCount = logs.filter(log => log.source === 'client').length;

  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 text-gray-100 font-mono text-sm border border-gray-700 rounded-lg shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-[480px] h-80'
    }`}>
      {/* Header */}
      <div className="p-3 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-green-400" />
            <span className="font-semibold">Debugger Console</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={clearLogs}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              title="Clear logs"
            >
              Clear
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Close debugger"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!isMinimized && (
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('server')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'server'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Server size={12} />
              Server ({serverLogsCount})
            </button>
            <button
              onClick={() => setActiveTab('client')}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === 'client'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Monitor size={12} />
              Client ({clientLogsCount})
            </button>
          </div>
        )}
      </div>

      {/* Logs Container */}
      {!isMinimized && (
        <div
          ref={logsContainerRef}
          className="h-full p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          onScroll={handleScroll}
        >
          {filteredLogs.length === 0 ? (
            <div className="text-gray-500 italic text-center py-4">
              No {activeTab} logs yet...
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="mb-1 leading-relaxed">
                <span className="text-gray-500 text-xs mr-2">
                  {log.timestamp}
                </span>
                <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className={`ml-1 text-xs px-1 rounded ${log.source === 'server' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'}`}>
                  {log.source}
                </span>
                <span className="ml-2 text-gray-200 whitespace-pre-wrap">
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}

      {/* Auto-scroll indicator */}
      {!isMinimized && !autoScroll && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setAutoScroll(true)}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Scroll to bottom
          </button>
        </div>
      )}
    </div>
  );
};
