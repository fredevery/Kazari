#!/usr/bin/env node
/*
 * Seed GitHub Projects (v2) and Issues from .project/prompts frontmatter.
 * - Issues are created/updated via REST
 * - A Projects v2 board named "Kazari Roadmap" is ensured via GraphQL
 * - Each issue is added to the project and its Status field set based on frontmatter
 */

// 1
const fs = require('fs');
const path = require('path');

const OWNER_REPO = process.env.GITHUB_REPOSITORY || 'fredevery/Kazari';
const [OWNER, REPO] = OWNER_REPO.split('/');
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!TOKEN) {
  console.error('Missing GITHUB_TOKEN/GH_TOKEN');
  process.exit(1);
}

const REST = 'https://api.github.com';
const GRAPHQL = 'https://api.github.com/graphql';
const PROJECT_TITLE = process.env.KAZARI_PROJECT_TITLE || 'Kazari Roadmap';
const PROJECT_ID_OVERRIDE = process.env.KAZARI_PROJECT_ID || '';

async function ghRest(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${url} -> ${res.status}: ${text}`);
  }
  return res.json();
}

async function ghGql(query, variables) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    const msg = json.errors.map(e => e.message).join('; ');
    throw new Error(`GraphQL error: ${msg}`);
  }
  return json.data;
}

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
      if (rest === '""' || rest === "''" || rest === '') fm[key] = '';
      else if (rest === 'true' || rest === 'false') fm[key] = rest === 'true';
      else if (!isNaN(Number(rest))) fm[key] = Number(rest);
      else fm[key] = rest.replace(/^"|"$/g, '');
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

function areaFromId(id) {
  const prefix = (id || '').split('-')[0].toLowerCase();
  switch (prefix) {
    case 'ipc': return 'area:ipc';
    case 'win': return 'area:window';
    case 'main': return 'area:main';
    case 'preload': return 'area:preload';
    case 'ui': return 'area:ui';
    case 'ts': return 'area:types';
    case 'sec': return 'area:security';
    case 'test': return 'area:test';
    case 'build': return 'area:build';
    case 'perf': return 'area:performance';
    case 'log': return 'area:logging';
    case 'cust': return 'area:customization';
    case 'analytics': return 'area:analytics';
    case 'integ': return 'area:integration';
    case 'update': return 'area:update';
    case 'quality': return 'area:quality';
    case 'ci': return 'area:ci';
    default: return 'area:general';
  }
}

function columnForStatus(status) {
  const s = (status || '').toLowerCase();
  if (s === 'now') return 'Now';
  if (s === 'next') return 'Backlog';
  if (s === 'planned') return 'Backlog';
  if (s === 'in-progress') return 'In progress';
  if (s === 'review') return 'Review';
  if (s === 'blocked') return 'Blocked';
  if (s === 'done') return 'Done';
  return 'Backlog';
}

// ------------------- Projects v2 helpers (GraphQL) -------------------
async function getOwnerNode() {
  // Try resolving as a User first.
  const qUser = `query($login:String!){ user(login:$login){ id login } }`;
  let data = null;
  try {
    data = await ghGql(qUser, { login: OWNER });
  } catch (_) {
    data = null;
  }
  if (data && data.user && data.user.id) return { type: 'user', id: data.user.id };

  // Fallback to Organization; some tokens may not have org visibility.
  const qOrg = `query($login:String!){ organization(login:$login){ id login } }`;
  try {
    data = await ghGql(qOrg, { login: OWNER });
  } catch (_) {
    data = null;
  }
  if (data && data.organization && data.organization.id) return { type: 'org', id: data.organization.id };

  throw new Error(`Owner not found or not accessible for ${OWNER}`);
}

async function findOrCreateProjectV2(ownerId) {
  if (PROJECT_ID_OVERRIDE) return PROJECT_ID_OVERRIDE;
  const query = `query($ownerId:ID!){ node(id:$ownerId){ ... on User { projectsV2(first:50){ nodes{ id title } } } ... on Organization { projectsV2(first:50){ nodes{ id title } } } } }`;
  const data = await ghGql(query, { ownerId });
  const nodes = (data && data.node && data.node.projectsV2 && data.node.projectsV2.nodes) ? data.node.projectsV2.nodes : [];
  let project = nodes.find(p => p.title === PROJECT_TITLE);
  if (!project) {
    const create = `mutation($ownerId:ID!,$title:String!){ createProjectV2(input:{ownerId:$ownerId,title:$title}){ projectV2{ id title } } }`;
    try {
      const created = await ghGql(create, { ownerId, title: PROJECT_TITLE });
      project = created.createProjectV2.projectV2;
    } catch (e) {
      throw new Error(`Failed to create Projects v2 '${PROJECT_TITLE}'. If this is a user-owned repo, GITHUB_TOKEN may lack permission to create user projects. Set KAZARI_PROJECT_ID to an existing project, or run with a PAT. Original: ${e.message || e}`);
    }
  }
  return project.id;
}

async function ensureStatusField(projectId) {
  const q = `query($projectId:ID!){
    node(id:$projectId){
      ... on ProjectV2 {
        fields(first:50){
          nodes{
            __typename
            ... on ProjectV2Field {
              id
              name
              dataType
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              dataType
              options { id name }
            }
          }
        }
      }
    }
  }`;
  const data = await ghGql(q, { projectId });
  const fields = (((data||{}).node||{}).fields||{}).nodes || [];
  let statusField = fields.find(f => f && f.name === 'Status' && (f.dataType === 'SINGLE_SELECT' || f.__typename === 'ProjectV2SingleSelectField'));
  if (!statusField) {
    const createField = `mutation($projectId:ID!){ createProjectV2Field(input:{projectId:$projectId, name:"Status", dataType:SINGLE_SELECT}){ projectV2Field{ id name } } }`;
    const created = await ghGql(createField, { projectId });
    statusField = created.createProjectV2Field.projectV2Field;
  }
  const desired = ['Backlog', 'Now', 'In progress', 'Review', 'Blocked', 'Done'];
  // Re-fetch to get options on the field itself
  const ref = await ghGql(q, { projectId });
  const fList = ((((ref||{}).node||{}).fields||{}).nodes||[]);
  const fld = fList.find(f => f && f.name === 'Status');
  const current = ((fld && fld.options) ? fld.options : []).map(o => o.name);
  const needUpdate = desired.some(d => !current.includes(d)) || current.some(c => !desired.includes(c));
  if (needUpdate) {
    const update = `mutation($projectId:ID!,$fieldId:ID!,$name:String!,$options:[ProjectV2SingleSelectFieldOptionInput!]!){ updateProjectV2SingleSelectField(input:{projectId:$projectId, fieldId:$fieldId, name:$name, options:$options}){ projectV2SingleSelectField{ id } } }`;
    await ghGql(update, {
      projectId,
      fieldId: fld.id,
      name: 'Status',
      options: desired.map((n, i) => ({ name: n, colorId: (i % 15) + 1 }))
    });
  }
  const ref2 = await ghGql(q, { projectId });
  const fList2 = ((((ref2||{}).node||{}).fields||{}).nodes||[]);
  const fld2 = fList2.find(f => f && f.name === 'Status');
  const optionMap = Object.fromEntries(((fld2 && fld2.options) ? fld2.options : []).map(o => [o.name, o.id]));
  return { fieldId: fld2.id, optionMap };
}

async function addOrGetProjectItem(projectId, issueNodeId, issueNumber) {
  const add = `mutation($projectId:ID!,$contentId:ID!){ addProjectV2ItemById(input:{projectId:$projectId, contentId:$contentId}){ item{ id } } }`;
  try {
    const res = await ghGql(add, { projectId, contentId: issueNodeId });
    return res.addProjectV2ItemById.item.id;
  } catch (e) {
    // Already exists, search by issue number
    const q = `query($projectId:ID!){ node(id:$projectId){ ... on ProjectV2 { items(first:100){ nodes{ id content{ __typename ... on Issue { id number } } } } } } }`;
    const data = await ghGql(q, { projectId });
    const node = data.node.items.nodes.find(n => n.content && n.content.number === issueNumber);
    if (!node) throw e;
    return node.id;
  }
}

async function setStatus(projectId, itemId, fieldId, statusName, optionMap) {
  const optionId = optionMap[statusName] || optionMap['Backlog'];
  const mut = `mutation($projectId:ID!,$itemId:ID!,$fieldId:ID!,$optionId:String!){ updateProjectV2ItemFieldValue(input:{ projectId:$projectId, itemId:$itemId, fieldId:$fieldId, value:{ singleSelectOptionId:$optionId } }){ projectV2Item{ id } } }`;
  await ghGql(mut, { projectId, itemId, fieldId, optionId });
}

// ------------------- Issues (REST) -------------------
async function listAllIssues() {
  const issues = [];
  let page = 1;
  while (true) {
    const batch = await ghRest(`${REST}/repos/${OWNER}/${REPO}/issues?state=all&per_page=100&page=${page}`);
    if (!batch.length) break;
    issues.push(...batch.filter(i => !i.pull_request));
    page++;
  }
  return issues;
}

function issueBody(item, fileRel) {
  const link = `https://github.com/${OWNER}/${REPO}/blob/${process.env.GITHUB_REF_NAME || 'rewrite'}/${fileRel}`;
  const ac = Array.isArray(item.acceptanceCriteria) ? item.acceptanceCriteria : [];
  const tests = Array.isArray(item.tests) ? item.tests : [];
  return [
    `Roadmap ID: ${item.id}`,
    `Prompt: ${link}`,
    '',
    'Acceptance Criteria:',
    ...ac.map(a => `- [ ] ${a}`),
    '',
    tests.length ? 'Tests:' : '',
    ...tests.map(t => `- ${t}`)
  ].filter(Boolean).join('\n');
}

async function ensureIssue(item, file) {
  const all = await listAllIssues();
  const title = `[${item.id}] ${item.title || ''}`.trim();
  let issue = all.find(i => i.title === title);
  const labels = Array.from(new Set(['roadmap', `status:${(item.status || 'planned').toLowerCase()}`, `owner:${(item.owner || 'core').toLowerCase()}`, areaFromId(item.id)]));
  const body = issueBody(item, file);
  if (!issue) {
    issue = await ghRest(`${REST}/repos/${OWNER}/${REPO}/issues`, 'POST', { title, body, labels });
  } else {
    await ghRest(`${REST}/repos/${OWNER}/${REPO}/issues/${issue.number}`, 'PATCH', { body, labels });
  }
  return issue;
}

async function run() {
  const root = process.cwd();
  const promptsDir = path.join(root, '.project', 'prompts');
  const files = walk(promptsDir).filter(p => !/\/completed\//.test(p));
  const items = files.map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const { fm } = parseFrontmatter(content);
    return { ...fm, file: path.relative(root, file) };
  }).filter(i => i && i.id);

  // Ensure Projects v2 and Status field
  const ownerNode = await getOwnerNode();
  const projectId = await findOrCreateProjectV2(ownerNode.id);
  const { fieldId, optionMap } = await ensureStatusField(projectId);

  for (const it of items) {
    const issue = await ensureIssue(it, it.file);
    // Fetch issue node id
    const issueNodeQ = `query($owner:String!,$repo:String!,$number:Int!){ repository(owner:$owner,name:$repo){ issue(number:$number){ id number } } }`;
    const issueNode = await ghGql(issueNodeQ, { owner: OWNER, repo: REPO, number: issue.number });
    const issueId = issueNode.repository.issue.id;
    const itemId = await addOrGetProjectItem(projectId, issueId, issue.number);
    const desired = columnForStatus(it.status);
    await setStatus(projectId, itemId, fieldId, desired, optionMap);
  }

  console.log(`Synced ${items.length} items into Projects v2 and issues.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
