#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { T, FONT, MONO, titleBar, cardFrame } from './card-theme.mjs';

const HANDLE = 'bak_libra26';
const OUTPUT = 'assets/solvedac-card.svg';

// ── Tier 정의 (solved.ac tier 0~31) ─────────────────────────────
const TIERS = [
  { name: 'Unrated', color: '#666666' },
  { name: 'Bronze V', color: '#ad5600' },
  { name: 'Bronze IV', color: '#ad5600' },
  { name: 'Bronze III', color: '#ad5600' },
  { name: 'Bronze II', color: '#ad5600' },
  { name: 'Bronze I', color: '#ad5600' },
  { name: 'Silver V', color: '#435f7a' },
  { name: 'Silver IV', color: '#435f7a' },
  { name: 'Silver III', color: '#435f7a' },
  { name: 'Silver II', color: '#435f7a' },
  { name: 'Silver I', color: '#536dfe' },
  { name: 'Gold V', color: '#ec9a00' },
  { name: 'Gold IV', color: '#ec9a00' },
  { name: 'Gold III', color: '#ec9a00' },
  { name: 'Gold II', color: '#ec9a00' },
  { name: 'Gold I', color: '#ec9a00' },
  { name: 'Platinum V', color: '#27e2a4' },
  { name: 'Platinum IV', color: '#27e2a4' },
  { name: 'Platinum III', color: '#27e2a4' },
  { name: 'Platinum II', color: '#27e2a4' },
  { name: 'Platinum I', color: '#27e2a4' },
  { name: 'Diamond V', color: '#00b4fc' },
  { name: 'Diamond IV', color: '#00b4fc' },
  { name: 'Diamond III', color: '#00b4fc' },
  { name: 'Diamond II', color: '#00b4fc' },
  { name: 'Diamond I', color: '#00b4fc' },
  { name: 'Ruby V', color: '#ff0062' },
  { name: 'Ruby IV', color: '#ff0062' },
  { name: 'Ruby III', color: '#ff0062' },
  { name: 'Ruby II', color: '#ff0062' },
  { name: 'Ruby I', color: '#ff0062' },
  { name: 'Master', color: '#b300e0' },
];

// ── SVG 생성 ────────────────────────────────────────────────────
function generateSVG(user) {
  const tier = TIERS[user.tier] || TIERS[0];
  const stats = [
    ['Rating', user.rating.toLocaleString()],
    ['Solved', user.solvedCount.toLocaleString()],
    ['Class', user.class ? `${user.class}` : '—'],
    ['Rank', `#${user.rank.toLocaleString()}`],
  ];

  const W = 850, H = 195;

  const statRows = stats.map(([label, value], i) => {
    const y = 72 + i * 30;
    const delay = (200 + i * 100) / 1000;
    return `
    <g style="animation: fadeIn 0.4s ${delay}s ease forwards; opacity: 0">
      <text x="500" y="${y}" fill="${T.dim}" font-family="${FONT}" font-size="13">${label}</text>
      <text x="815" y="${y}" fill="${T.text}" font-family="${MONO}" font-size="14" text-anchor="end">${value}</text>
    </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <style>
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  </style>

  ${cardFrame(W, H)}
  ${titleBar(W, `bak-libra26@solved.ac:~$ cat profile`)}

  <!-- Tier diamond -->
  <g style="animation: fadeIn 0.4s 0.1s ease forwards; opacity: 0">
    <polygon points="38,62 50,78 38,94 26,78" fill="${tier.color}" />
    <text x="60" y="83" fill="${tier.color}" font-family="${FONT}" font-size="20" font-weight="bold">${tier.name}</text>
    <text x="60" y="106" fill="${T.dim}" font-family="${MONO}" font-size="13">${HANDLE}</text>
  </g>

  <!-- Separator -->
  <line x1="470" y1="48" x2="470" y2="${H - 15}" stroke="${T.border}" />

  <!-- Stats -->
  ${statRows}
</svg>`;
}

// ── 실행 ────────────────────────────────────────────────────────
async function main() {
  const res = await fetch(`https://solved.ac/api/v3/user/show?handle=${HANDLE}`, {
    headers: { 'User-Agent': 'bak-libra26-profile-card/1.0', Accept: 'application/json' },
  });
  if (!res.ok) {
    console.error(`solved.ac API error: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const user = await res.json();

  const dir = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(OUTPUT, generateSVG(user).trim());

  const tier = TIERS[user.tier] || TIERS[0];
  console.log(`✓ ${OUTPUT}`);
  console.log(`  ${tier.name} | Rating ${user.rating} | Solved ${user.solvedCount} | Class ${user.class} | Rank #${user.rank}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
