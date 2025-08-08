
import fs from 'node:fs';
import path from 'node:path';
import { getOpenAI } from './client';
import { env } from '../../config/env';

export async function generateTest(specPrompt: string, outDir = 'src/tests/ai') {
  const client = getOpenAI();
  const sys = `You are a senior SDET. Produce a single Playwright test in TypeScript using @playwright/test.
- Use test.describe and test.
- Prefer getByRole/getByLabel/getByPlaceholder locators.
- Assume BASE_URL is set in Playwright config; do not hardcode URLs.
- No extra commentary.`;

  const user = `Write a test for this scenario on our internal portal:
${specPrompt}
Return ONLY code in a single file named based on the scenario.`;

  const resp = await client.chat.completions.create({
    model: env.openAI.model,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    temperature: 0.2,
  });

  const code = resp.choices[0].message?.content || '';
  if (!code.trim()) throw new Error('Empty response from model');

  const dir = path.resolve(outDir);
  fs.mkdirSync(dir, { recursive: true });
  const fileName = path.join(dir, `ai_${Date.now()}.spec.ts`);
  fs.writeFileSync(fileName, code, 'utf-8');
  return fileName;
}
