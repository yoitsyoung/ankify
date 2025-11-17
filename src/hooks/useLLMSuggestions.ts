import { useState, useEffect } from 'react';
import { generateCardSuggestions } from '../services/llm-agent';
import type { CardSuggestion, Context } from '../types';

export function useLLMSuggestions(
  clipboardText: string,
  context: Context | null
) {
  console.log('[useLLMSuggestions] Hook called with:', {
    clipboardTextLength: clipboardText?.length,
    clipboardTextPreview: clipboardText?.substring(0, 50),
    hasContext: !!context,
    contextAppName: context?.app_name
  });

  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useLLMSuggestions] useEffect Triggered with clipboard:', {
      length: clipboardText?.length,
      preview: clipboardText?.substring(0, 50),
      context: context?.app_name
    });

    if (!clipboardText || clipboardText.length < 10) {
      console.log('[useLLMSuggestions] Clipboard too short, skipping');
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('[useLLMSuggestions] Calling generateCardSuggestions...');

    generateCardSuggestions({
      clipboardText,
      context: context
        ? {
            url: context.url || undefined,
            appName: context.app_name,
            timestamp: context.timestamp,
          }
        : undefined,
    })
      .then((response) => {
        console.log('[useLLMSuggestions] Success response:', response);
        console.log('[useLLMSuggestions] Suggestions array:', response.suggestions);
        console.log('[useLLMSuggestions] Setting suggestions state with', response.suggestions.length, 'items');
        setSuggestions(response.suggestions);
        console.log('[useLLMSuggestions] State should be updated now');
      })
      .catch((err) => {
        console.error('[useLLMSuggestions] Error:', err);
        setError(err.message);
        setSuggestions([]);
      })
      .finally(() => {
        console.log('[useLLMSuggestions] Finally block - setting loading to false');
        setLoading(false);
      });
  }, [clipboardText, context?.url, context?.app_name]);

  return { suggestions, loading, error };
}
