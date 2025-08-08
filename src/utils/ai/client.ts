
import { env } from '../../config/env';
import OpenAI from 'openai';
let client: OpenAI | null = null;
export function getOpenAI() {
  if (!env.openAI.apiKey) throw new Error('OPENAI_API_KEY not set');
  if (!client) client = new OpenAI({ apiKey: env.openAI.apiKey });
  return client;
}
