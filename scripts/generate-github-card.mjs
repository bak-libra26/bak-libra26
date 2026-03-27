#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const USERNAME = 'bak-libra26';
const OUTPUT = 'assets/github-card.svg';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

// ── tokyonight 테마 ─────────────────────────────────────────────
const T = {
  bg: '#1a1b27', bar: '#16161e', border: '#292e42',
  accent: '#7aa2f7', text: '#c0caf5', dim: '#565f89',
  green: '#28c840', purple: '#bb9af7',
  dot: ['#ff5f57', '#febc2e', '#28c840'],
};
const FONT = "'Segoe UI', Ubuntu, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

// ── GitHub API 호출 ─────────────────────────────────────────────
async function fetchStats() {
  const headers = { 'User-Agent': 'bak-libra26-profile-card/1.0' };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  // REST API: 기본 정보
  const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
  if (!userRes.ok) throw new Error(`GitHub API: ${userRes.status}`);
  const user = await userRes.json();

  // REST API: 레포 목록 → 총 스타
  const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers });
  const repos = await reposRes.json();
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

  // GraphQL: 기여 데이터 (토큰 있을 때)
  let contributions = null;
  let currentStreak = 0;
  let longestStreak = 0;

  if (GITHUB_TOKEN) {
    try {
      const gqlRes = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {
            user(login: "${USERNAME}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks { contributionDays { contributionCount date } }
                }
              }
            }
          }`,
        }),
      });
      const gql = await gqlRes.json();
      const cal = gql?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal) {
        contributions = cal.totalContributions;
        const days = cal.weeks.flatMap(w => w.contributionDays).sort((a, b) => a.date.localeCompare(b.date));

        // Current streak (오늘부터 역순)
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].contributionCount > 0) currentStreak++;
          else if (currentStreak > 0) break;
        }

        // Longest streak
        let temp = 0;
        for (const day of days) {
          if (day.contributionCount > 0) { temp++; longestStreak = Math.max(longestStreak, temp); }
          else temp = 0;
        }
      }
    } catch { /* GraphQL 실패 시 REST 데이터만 사용 */ }
  }

  return {
    repos: user.public_repos,
    stars: totalStars,
    followers: user.followers,
    since: new Date(user.created_at).getFullYear(),
    contributions,
    currentStreak,
    longestStreak,
  };
}

// ── SVG 생성 ────────────────────────────────────────────────────
function generateSVG(stats) {
  const W = 850, H = 195;
  const hasContribs = stats.contributions !== null;

  // 왼쪽 영역: 기여 숫자 or 레포 숫자
  const bigNumber = hasContribs ? stats.contributions.toLocaleString() : stats.repos.toLocaleString();
  const bigLabel = hasContribs ? 'contributions' : 'public repos';
  const bigSub = hasContribs ? `${stats.since} — present` : `since ${stats.since}`;

  // 오른쪽 stats
  const rightStats = hasContribs
    ? [
        ['Repos', stats.repos.toLocaleString()],
        ['Stars', stats.stars.toLocaleString()],
        ['Streak', `${stats.currentStreak}d`],
        ['Best', `${stats.longestStreak}d`],
      ]
    : [
        ['Stars', stats.stars.toLocaleString()],
        ['Followers', stats.followers.toLocaleString()],
        ['Since', stats.since.toString()],
      ];

  const statRows = rightStats.map(([label, value], i) => {
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

  <!-- Card -->
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="4.5" fill="${T.bg}" stroke="${T.border}" />

  <!-- Title bar -->
  <rect x="1" y="1" width="${W - 2}" height="34" rx="4" fill="${T.bar}" />
  <rect x="1" y="27" width="${W - 2}" height="8" fill="${T.bar}" />
  <circle cx="20" cy="18" r="5.5" fill="${T.dot[0]}" />
  <circle cx="38" cy="18" r="5.5" fill="${T.dot[1]}" />
  <circle cx="56" cy="18" r="5.5" fill="${T.dot[2]}" />
  <text x="78" y="22" fill="${T.dim}" font-family="${MONO}" font-size="13">github</text>
  <line x1="1" y1="35" x2="${W - 1}" y2="35" stroke="${T.border}" />

  <!-- Big number -->
  <g style="animation: fadeIn 0.4s 0.1s ease forwards; opacity: 0">
    <text x="38" y="88" fill="${T.accent}" font-family="${FONT}" font-size="36" font-weight="bold">${bigNumber}</text>
    <text x="38" y="110" fill="${T.dim}" font-family="${FONT}" font-size="13">${bigLabel}</text>
    <text x="38" y="130" fill="${T.dim}" font-family="${MONO}" font-size="12">${bigSub}</text>
  </g>

  <!-- Separator -->
  <line x1="470" y1="48" x2="470" y2="${H - 15}" stroke="${T.border}" />

  <!-- Stats -->
  ${statRows}
</svg>`;
}

// ── 실행 ────────────────────────────────────────────────────────
async function main() {
  const stats = await fetchStats();

  const dir = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(OUTPUT, generateSVG(stats).trim());

  console.log(`✓ ${OUTPUT}`);
  console.log(`  Repos ${stats.repos} | Stars ${stats.stars} | Contributions ${stats.contributions ?? 'N/A (add GH_TOKEN for this)'}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
