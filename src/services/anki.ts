import axios from 'axios';
import type { AnkiNote, AnkiConnectResponse } from '../types';

const ANKI_CONNECT_URL = 'http://localhost:8765';

async function invoke<T>(action: string, params?: any): Promise<T> {
  try {
    const response = await axios.post<AnkiConnectResponse<T>>(
      ANKI_CONNECT_URL,
      {
        action,
        version: 6,
        params: params || {},
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.result;
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      throw new Error(
        'Cannot connect to Anki. Please ensure Anki is running and AnkiConnect is installed.'
      );
    }
    throw error;
  }
}

export async function checkAnkiConnect(): Promise<boolean> {
  try {
    const version = await invoke<number>('version');
    return version === 6;
  } catch {
    return false;
  }
}

export async function getDeckNames(): Promise<string[]> {
  return invoke<string[]>('deckNames');
}

export async function getModelNames(): Promise<string[]> {
  return invoke<string[]>('modelNames');
}

export async function addNoteToAnki(note: AnkiNote): Promise<number> {
  return invoke<number>('addNote', { note });
}

export async function findDuplicateNotes(
  deckName: string,
  front: string
): Promise<number[]> {
  return invoke<number[]>('findNotes', {
    query: `deck:"${deckName}" front:"${front}"`,
  });
}
