import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SuggestionsList } from './SuggestionsList';
import { ContextDisplay } from './ContextDisplay';
import { useLLMSuggestions } from '../hooks/useLLMSuggestions';
import { addNoteToAnki, checkAnkiConnect } from '../services/anki';
import type { Context, CardSuggestion } from '../types';

export function CardForm() {
  const [context, setContext] = useState<Context | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [deckName, setDeckName] = useState('Ankify Your Life');
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [ankiConnected, setAnkiConnected] = useState(false);

  console.log('[CardForm] Rendering with context:', {
    hasContext: !!context,
    clipboardLength: context?.clipboard?.length,
    clipboardPreview: context?.clipboard?.substring(0, 50)
  });

  const { suggestions, loading, error } = useLLMSuggestions(
    context?.clipboard || '',
    context
  );

  // Load context when component mounts
  useEffect(() => {
    console.log('[CardForm] Component mounted, loading context...');
    loadContext();
    checkAnkiConnection();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        handleCancel();
      }

      // Cmd/Ctrl+Enter to submit
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }

      // Cmd/Ctrl+1/2/3 for suggestions
      if ((e.metaKey || e.ctrlKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (suggestions[index]) {
          handleUseSuggestion(suggestions[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, front, back]);

  async function loadContext() {
    try {
      console.log('[CardForm] Calling get_context_macos...');
      const ctx = await invoke<Context>('get_context_macos');
      console.log('[CardForm] Context loaded:', {
        clipboard_length: ctx.clipboard?.length,
        app_name: ctx.app_name,
        url: ctx.url,
        clipboard_preview: ctx.clipboard?.substring(0, 50)
      });
      setContext(ctx);
    } catch (error) {
      console.error('[CardForm] Failed to load context:', error);
    }
  }

  async function checkAnkiConnection() {
    const connected = await checkAnkiConnect();
    setAnkiConnected(connected);
  }

  const handleUseSuggestion = useCallback((suggestion: CardSuggestion) => {
    setFront(suggestion.front);
    setBack(suggestion.back);
    setErrors({});
  }, []);

  const validate = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};

    if (!front.trim()) {
      newErrors.front = 'Front side cannot be empty';
    }

    if (!back.trim()) {
      newErrors.back = 'Back side cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!ankiConnected) {
      setSubmitMessage({
        type: 'error',
        text: 'Cannot connect to Anki. Please ensure Anki is running with AnkiConnect installed.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Build tags from context
      const tags = ['ankify'];
      if (context?.app_name) {
        tags.push(`source:${context.app_name.replace(/\s+/g, '-')}`);
      }
      if (context?.url) {
        const domain = new URL(context.url).hostname;
        tags.push(`url:${domain.replace(/\./g, '-')}`);
      }

      await addNoteToAnki({
        deckName,
        modelName: 'Basic',
        fields: {
          Front: front,
          Back: back,
        },
        tags,
        options: {
          allowDuplicate: false,
          duplicateScope: 'deck',
        },
      });

      setSubmitMessage({
        type: 'success',
        text: 'Card added to Anki successfully!',
      });

      // Clear form after 1 second and close window
      setTimeout(() => {
        setFront('');
        setBack('');
        handleCancel();
      }, 1000);
    } catch (error: any) {
      setSubmitMessage({
        type: 'error',
        text: error.message || 'Failed to add card to Anki',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      await invoke('hide_window');
      // Reset form
      setTimeout(() => {
        setFront('');
        setBack('');
        setErrors({});
        setSubmitMessage(null);
      }, 200);
    } catch (error) {
      console.error('Failed to hide window:', error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-black bg-opacity-20">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Custom title bar */}
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex justify-between items-center cursor-move"
          data-tauri-drag-region
        >
          <h1 className="text-white font-semibold text-lg">Ankify Your Life</h1>
          <button
            onClick={handleCancel}
            className="text-white hover:text-red-200 transition-colors"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Anki connection status */}
          {!ankiConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-900">
              ⚠️ Anki not detected. Please start Anki with AnkiConnect installed.
            </div>
          )}

          {/* AI Suggestions */}
          <SuggestionsList
            suggestions={suggestions}
            loading={loading}
            error={error}
            onSelect={handleUseSuggestion}
          />

          {/* Front field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Front (Question)
            </label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.front ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Enter the question..."
              autoFocus={suggestions.length === 0}
            />
            {errors.front && (
              <p className="text-red-500 text-sm mt-1">{errors.front}</p>
            )}
          </div>

          {/* Back field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Back (Answer)
            </label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.back ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Enter the answer..."
            />
            {errors.back && (
              <p className="text-red-500 text-sm mt-1">{errors.back}</p>
            )}
          </div>

          {/* Deck selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deck
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Default"
            />
          </div>

          {/* Context display */}
          <ContextDisplay context={context} />

          {/* Submit message */}
          {submitMessage && (
            <div
              className={`p-3 rounded-lg ${
                submitMessage.type === 'success'
                  ? 'bg-green-50 text-green-900 border border-green-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !ankiConnected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add to Anki (⌘↵)'}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel (Esc)
            </button>
          </div>

          {/* Keyboard hints */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>⌘+Enter: Submit • Esc: Close • ⌘+1/2/3: Use suggestion</div>
          </div>
        </div>
      </div>
    </div>
  );
}
