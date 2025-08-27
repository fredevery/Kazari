/*
 * Roadmap status generator
 * Scans .project/prompts for frontmatter, aggregates statuses, and emits docs/roadmap/status.{md,json}.
 */
import fs from 'fs';
import path from 'path';

interface Frontmatter {
  id?: string;
  title?: string;
  status?: string;
  owner?: string;
  issue?: string;
  pr?: string;
  acceptanceCriteria?: string[];
  tests?: string[];
  lastUpdated?: string;
}

interface Item extends Frontmatter {
  file: string;
}

function parseFrontmatter(content: string): { fm: Frontmatter; body: string } {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { fm: {}, body: content };
  const lines = fmMatch[1].split(/\r?\n/);
  const fm: Frontmatter = {};
  let currentKey: keyof Frontmatter | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^[a-zA-Z][a-zA-Z0-9_-]*:\s*(.*)$/.test(line)) {
      const [, rest] = line.split(/:\s*/, 2);
      const key = line.split(':', 1)[0] as keyof Frontmatter;
      currentKey = key;
      if (rest === '""' || rest === "''" || rest === '') {
        (fm as any)[key] = '';
      } else if (rest === 'true' || rest === 'false') {
        (fm as any)[key] = rest === 'true';
      } else if (!isNaN(Number(rest))) {
        (fm as any)[key] = Number(rest);
      } else {
        (fm as any)[key] = rest.replace(/^"|"$/g, '');
      }
    } else if (/^-\s+/.test(line) && currentKey) {
      // array item
      const val = line.replace(/^-\s+/, '');
      const arr = ((fm as any)[currentKey] as string[]) || [];
      arr.push(val);
      (fm as any)[currentKey] = arr;
    }
  }
  return { fm, body: fmMatch[2] };
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && p.endsWith('.md')) out.push(p);
  }
  return out;
}

function main() {
  const root = process.cwd();
  const promptsDir = path.join(root, '.project', 'prompts');
  const docsDir = path.join(root, 'docs', 'roadmap');
  fs.mkdirSync(docsDir, { recursive: true });

  const files = walk(promptsDir).filter(p => !/\/completed\//.test(p));
  const items: Item[] = files.map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const { fm } = parseFrontmatter(content);
    return { ...fm, file: path.relative(root, file) };
  }).filter(i => !!i.id);

  const byStatus: Record<string, Item[]> = {};
  for (const item of items) {
    const status = (item.status || 'planned').toLowerCase();
    (byStatus[status] ||= []).push(item);
  }

  // JSON output
  const jsonPath = path.join(docsDir, 'status.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2));

  // Markdown output
  const mdLines: string[] = [];
  mdLines.push('# Roadmap Status');
  mdLines.push('');
  mdLines.push(`Generated: ${new Date().toISOString()}`);
  mdLines.push('');
  const statuses = Object.keys(byStatus).sort();
  for (const st of statuses) {
    mdLines.push(`## ${st} (${byStatus[st].length})`);
    mdLines.push('');
    for (const i of byStatus[st]) {
      mdLines.push(`- ${i.id} — ${i.title || ''}`.trim());
      mdLines.push(`  - file: ${i.file}`);
      if (i.issue) mdLines.push(`  - issue: ${i.issue}`);
      if (i.pr) mdLines.push(`  - pr: ${i.pr}`);
      if (i.acceptanceCriteria && i.acceptanceCriteria.length) {
        mdLines.push('  - acceptance:');
        for (const a of i.acceptanceCriteria) mdLines.push(`    - ${a}`);
      }
      if (i.tests && i.tests.length) {
        mdLines.push('  - tests:');
        for (const t of i.tests) mdLines.push(`    - ${t}`);
      }
      if (i.lastUpdated) mdLines.push(`  - updated: ${i.lastUpdated}`);
    }
    mdLines.push('');
  }
  const mdPath = path.join(docsDir, 'status.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'));

  // eslint-disable-next-line no-console
  console.log(`Wrote ${mdPath} and ${jsonPath}`);
}

main();
