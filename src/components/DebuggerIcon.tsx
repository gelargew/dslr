import React from 'react';
import { Bug } from 'lucide-react';

interface DebuggerIconProps {
  onClick: () => void;
  isDebuggerVisible: boolean;
}

export const DebuggerIcon: React.FC<DebuggerIconProps> = ({ onClick, isDebuggerVisible }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-all duration-300 z-40 ${
        isDebuggerVisible
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
      title={isDebuggerVisible ? 'Hide debugger' : 'Show debugger'}
    >
      <Bug
        size={20}
        className={`transition-transform duration-200 ${
          isDebuggerVisible ? 'text-white' : 'text-gray-300'
        }`}
      />
    </button>
  );
};
