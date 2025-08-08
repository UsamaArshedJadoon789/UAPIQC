
import fs from 'node:fs';
import path from 'node:path';
import { getOpenAI } from './client';
import { env } from '../../config/env';

export async function triageReport(reportDir = 'playwright-report', outFile = 'playwright-report-summary.md') {
  const client = getOpenAI();
  const entries: string[] = [];
  function walk(dir: string) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) walk(p);
      else if (p.endsWith('.json') || p.endsWith('.txt') || p.endsWith('.html')) {
        if (stat.size < 200_000) {
          try { entries.push(`FILE:${p}\n` + fs.readFileSync(p, 'utf-8')); } catch {}
        }
      }
    }
  }
  if (!fs.existsSync(reportDir)) throw new Error(`Report dir not found: ${reportDir}`);
  walk(reportDir);

  const prompt = `You are assisting with E2E test failure triage.
Given these report fragments, group failures by root cause, identify flaky tests, and propose fixes or selector updates.
Return GitHub-flavored markdown with sections: Summary, Groups, Suspected Flakes, Next Actions.`;

  const resp = await client.chat.completions.create({
    model: env.openAI.model,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: entries.slice(0, 20).join('\n\n----\n\n') }
    ],
    temperature: 0.2,
  });

  const md = resp.choices[0].message?.content || '';
  fs.writeFileSync(outFile, md, 'utf-8');
  return outFile;
}
