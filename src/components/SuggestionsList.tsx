import { useState } from 'react';
import type { CardSuggestion } from '../types';

interface SuggestionsListProps {
  suggestions: CardSuggestion[];
  loading: boolean;
  error: string | null;
  onSelect: (suggestion: CardSuggestion) => void;
}

export function SuggestionsList({
  suggestions,
  loading,
  error,
  onSelect,
}: SuggestionsListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  console.log('[SuggestionsList] Render:', {
    loading,
    error,
    suggestionsCount: suggestions.length,
    suggestions
  });

  if (loading) {
    return (
      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-900">
          <div className="animate-spin h-4 w-4 border-2 border-blue-900 border-t-transparent rounded-full"></div>
          <span>Generating AI suggestions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="text-red-900 text-sm">
          <span className="font-medium">AI Error:</span> {error}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 text-left hover:bg-green-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
          <span className="font-medium text-green-900">
            AI Suggestions ({suggestions.length})
          </span>
        </div>
        <span className="text-xs text-green-700">Click to use</span>
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left border border-green-300 bg-white hover:bg-green-100 rounded p-3 transition-colors group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  <span className="text-xs font-mono bg-green-200 text-green-900 px-2 py-1 rounded">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                  <span className="ml-2 text-gray-500 group-hover:text-green-700">
                    Cmd+{index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1">
                    {suggestion.front}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.back}
                  </div>
                  {suggestion.reasoning && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      {suggestion.reasoning}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
