import Anthropic from '@anthropic-ai/sdk';
import type {
  CardSuggestion,
  LLMGenerateRequest,
  LLMGenerateResponse
} from '../types';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true, // For development; in production, use a backend
});

const SYSTEM_PROMPT = `You are an expert at creating high-quality Anki flashcards. Your task is to analyze text and generate effective question-answer pairs that follow best practices for spaced repetition learning.

Guidelines:
1. Create atomic cards - each card should test ONE concept
2. Questions should be clear and unambiguous
3. Answers should be concise (1-3 sentences max)
4. Vary question types (what, why, how, when, etc.)
5. Focus on understanding, not rote memorization
6. Rank suggestions by confidence (how good the card is)

Return ONLY a JSON object with this structure:
{
  "suggestions": [
    {
      "front": "Question here?",
      "back": "Answer here",
      "confidence": 0.95,
      "reasoning": "Why this is a good card"
    }
  ]
}`;

export async function generateCardSuggestions(
  request: LLMGenerateRequest
): Promise<LLMGenerateResponse> {
  const startTime = performance.now();

  console.log('[llm-agent] generateCardSuggestions called');
  console.log('[llm-agent] API Key present:', !!ANTHROPIC_API_KEY);
  console.log('[llm-agent] API Key starts with:', ANTHROPIC_API_KEY?.substring(0, 20));

  try {
    // Validate input
    if (!request.clipboardText || request.clipboardText.length < 10) {
      console.log('[llm-agent] Input too short, returning empty');
      return {
        suggestions: [],
        processingTimeMs: 0,
        rawText: request.clipboardText,
      };
    }

    // Build context string
    let contextStr = '';
    if (request.context?.url) {
      contextStr += `\nSource URL: ${request.context.url}`;
    }
    if (request.context?.appName) {
      contextStr += `\nSource App: ${request.context.appName}`;
    }

    const userPrompt = `Generate 2-4 Anki flashcards from this text:

${request.clipboardText}
${contextStr}

Return suggestions as JSON only.`;

    // Call Anthropic API
    console.log('[llm-agent] Calling Anthropic API...');
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    console.log('[llm-agent] API response received:', response.content[0].type);
    const endTime = performance.now();

    // Parse response
    const textContent = response.content[0];
    if (textContent.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    console.log('[llm-agent] Raw response text:', textContent.text);

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    console.log('[llm-agent] Cleaned JSON text:', jsonText);

    const parsed = JSON.parse(jsonText);
    console.log('[llm-agent] Parsed object:', parsed);
    console.log('[llm-agent] Parsed suggestions:', parsed.suggestions?.length, parsed.suggestions);

    return {
      suggestions: parsed.suggestions || [],
      processingTimeMs: Math.round(endTime - startTime),
      rawText: request.clipboardText,
    };
  } catch (error) {
    console.error('[llm-agent] ERROR:', error);
    if (error instanceof Error) {
      console.error('[llm-agent] Error message:', error.message);
      console.error('[llm-agent] Error stack:', error.stack);
    }
    const endTime = performance.now();

    return {
      suggestions: [],
      processingTimeMs: Math.round(endTime - startTime),
      rawText: request.clipboardText,
    };
  }
}
