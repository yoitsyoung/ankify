export interface Context {
  clipboard: string;
  app_name: string;
  url: string | null;
  timestamp: string;
}

export interface CardSuggestion {
  front: string;
  back: string;
  confidence: number;
  reasoning?: string;
}

export interface LLMGenerateRequest {
  clipboardText: string;
  context?: {
    url?: string;
    appName?: string;
    timestamp?: string;
  };
}

export interface LLMGenerateResponse {
  suggestions: CardSuggestion[];
  processingTimeMs: number;
  rawText: string;
}

export interface AnkiNote {
  deckName: string;
  modelName: string;
  fields: {
    Front: string;
    Back: string;
  };
  tags?: string[];
  options?: {
    allowDuplicate?: boolean;
    duplicateScope?: 'deck' | 'collection';
  };
}

export interface AnkiConnectResponse<T> {
  result: T;
  error: string | null;
}
