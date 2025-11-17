import { useState, useEffect } from 'react';
import { generateCardSuggestions } from '../services/llm-agent';
import type { CardSuggestion, Context } from '../types';

export function useLLMSuggestions(
  clipboardText: string,
  context: Context | null
) {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clipboardText || clipboardText.length < 10) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

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
        setSuggestions(response.suggestions);
      })
      .catch((err) => {
        setError(err.message);
        setSuggestions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clipboardText, context?.url, context?.app_name]);

  return { suggestions, loading, error };
}
