#!/usr/bin/env node
/*
 * Roadmap status generator (Node CJS)
 */
const fs = require('fs');
const path = require('path');

function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) return { fm: {}, body: content };
  const lines = fmMatch[1].split(/\r?\n/);
  const fm = {};
  let currentKey = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const kv = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const rest = kv[2];
      currentKey = key;
      if (rest === '""' || rest === "''" || rest === '') {
        fm[key] = '';
      } else if (rest === 'true' || rest === 'false') {
        fm[key] = rest === 'true';
      } else if (!isNaN(Number(rest))) {
        fm[key] = Number(rest);
      } else {
        fm[key] = rest.replace(/^"|"$/g, '');
      }
    } else if (/^-\s+/.test(line) && currentKey) {
      const val = line.replace(/^-\s+/, '');
      fm[currentKey] = Array.isArray(fm[currentKey]) ? fm[currentKey] : [];
      fm[currentKey].push(val);
    }
  }
  return { fm, body: fmMatch[2] };
}

function walk(dir) {
  const out = [];
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
  const items = files.map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const { fm } = parseFrontmatter(content);
    return { ...fm, file: path.relative(root, file) };
  }).filter(i => i && i.id);

  const byStatus = {};
  for (const item of items) {
    const status = (item.status || 'planned').toLowerCase();
    byStatus[status] = byStatus[status] || [];
    byStatus[status].push(item);
  }

  const jsonPath = path.join(docsDir, 'status.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2));

  const md = [];
  md.push('# Roadmap Status');
  md.push('');
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push('');
  for (const st of Object.keys(byStatus).sort()) {
    md.push(`## ${st} (${byStatus[st].length})`);
    md.push('');
    for (const i of byStatus[st]) {
      md.push(`- ${i.id} — ${i.title || ''}`.trim());
      md.push(`  - file: ${i.file}`);
      if (i.issue) md.push(`  - issue: ${i.issue}`);
      if (i.pr) md.push(`  - pr: ${i.pr}`);
      if (Array.isArray(i.acceptanceCriteria) && i.acceptanceCriteria.length) {
        md.push('  - acceptance:');
        for (const a of i.acceptanceCriteria) md.push(`    - ${a}`);
      }
      if (Array.isArray(i.tests) && i.tests.length) {
        md.push('  - tests:');
        for (const t of i.tests) md.push(`    - ${t}`);
      }
      if (i.lastUpdated) md.push(`  - updated: ${i.lastUpdated}`);
    }
    md.push('');
  }
  const mdPath = path.join(docsDir, 'status.md');
  fs.writeFileSync(mdPath, md.join('\n'));

  console.log(`Wrote ${mdPath} and ${jsonPath}`);
}

main();
