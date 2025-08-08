import type { Page } from 'playwright';
import { getOpenAI } from './client';
import { env } from '../../config/env';

export async function healSelector(page: Page, failingSelector: string): Promise<string | null> {
  const html = await page.content();
  const client = getOpenAI();
  const resp = await client.chat.completions.create({
    model: env.openAI.model,
    messages: [
      { role: 'system', content: 'You suggest robust selectors for Playwright given HTML. Prefer role, label, placeholder, text.' },
      { role: 'user', content: `Selector failed: ${failingSelector}\nHTML:\n${html.slice(0, 80_000)}` }
    ],
    temperature: 0.1,
  });
  const suggestion = resp.choices[0].message?.content?.trim();
  return suggestion || null;
}
