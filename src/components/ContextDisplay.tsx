import { useState } from 'react';
import type { Context } from '../types';

interface ContextDisplayProps {
  context: Context | null;
}

export function ContextDisplay({ context }: ContextDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!context) return null;

  return (
    <div className="border-t border-gray-200 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full text-left"
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span className="font-medium">Context</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 text-sm">
          {context.clipboard && (
            <div>
              <span className="text-gray-500">Clipboard:</span>
              <div className="text-gray-900 bg-gray-50 p-2 rounded mt-1 max-h-20 overflow-y-auto text-xs font-mono">
                {context.clipboard}
              </div>
            </div>
          )}

          {context.app_name && (
            <div>
              <span className="text-gray-500">Source:</span>
              <span className="ml-2 text-gray-900">{context.app_name}</span>
            </div>
          )}

          {context.url && (
            <div>
              <span className="text-gray-500">URL:</span>
              <div className="ml-2 text-blue-600 text-xs break-all">
                {context.url}
              </div>
            </div>
          )}

          {context.timestamp && (
            <div>
              <span className="text-gray-500">Time:</span>
              <span className="ml-2 text-gray-900">
                {new Date(context.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
