#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

// ── tokyonight 테마 ─────────────────────────────────────────────
const T = {
  bg: '#1a1b27', bar: '#16161e', border: '#292e42',
  accent: '#7aa2f7', text: '#c0caf5', dim: '#565f89',
  green: '#28c840',
  dot: ['#ff5f57', '#febc2e', '#28c840'],
};
const FONT = "'Segoe UI', Ubuntu, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

// ── 프로젝트 데이터 (여기를 수정하면 카드가 바뀝니다) ────────────
const PROJECTS = [
  {
    id: 'blog',
    name: 'bak-libra26.github.io',
    description: '터미널 스타일 기술 블로그 + 포트폴리오',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Vanilla CSS', 'Cloudflare Pages'],
    features: [
      '마크다운 기반 SSG로 613편 콘텐츠 + 9개 핸드북 시리즈 관리',
      'Cloudflare Pages + OpenNext 조합으로 엣지 배포 최적화',
      'CSS Variables 5개 테마 시스템 + 터미널 UI로 개발자 경험 극대화',
    ],
    status: { text: 'drwxr-xr-x  [active]  2025 ~', color: T.green },
  },
  {
    id: 'insightskorea',
    name: 'insights-korea',
    description: '영문 한국 문화 매거진 + AI 콘텐츠 파이프라인',
    stack: ['Next.js 16', 'React 19', 'Supabase', 'next-intl', 'GitHub Actions'],
    features: [
      'Admin 페이지에서 Grok API로 주요 토픽 수집 + 초안/번역 자동 생성',
      'GitHub Actions로 발행/미발행 요청 처리 + Discord Bot 알림 연동',
      'Supabase + next-intl 다국어(EN/KO/JA) 지원',
    ],
    status: { text: 'drwx------  [private]  2025 ~', color: T.dim },
  },
];

// ── 배지 너비 추정 ──────────────────────────────────────────────
function measureBadge(text) {
  const charWidth = 7.2; // 11px 폰트 기준 대략적 문자 폭
  return text.length * charWidth + 16;
}

// ── SVG 생성 ────────────────────────────────────────────────────
function generateProjectSVG(project) {
  const W = 850;

  // Stack 배지
  const badgeY = 78;
  let bx = 30;
  const badges = project.stack.map(tag => {
    const w = measureBadge(tag);
    const svg = `
    <rect x="${bx}" y="${badgeY}" width="${w}" height="22" rx="4" fill="${T.border}" />
    <text x="${bx + w / 2}" y="${badgeY + 15}" fill="${T.text}" font-family="${MONO}" font-size="11" text-anchor="middle">${tag}</text>`;
    bx += w + 6;
    return svg;
  }).join('');

  // Features
  const featureY0 = 122;
  const featureGap = 24;
  const features = project.features.map((f, i) => {
    const y = featureY0 + i * featureGap;
    const delay = (150 + i * 80) / 1000;
    return `<g style="animation: fadeIn 0.4s ${delay}s ease forwards; opacity: 0">
      <text x="42" y="${y}" fill="${T.dim}" font-family="${MONO}" font-size="13">▸</text>
      <text x="60" y="${y}" fill="${T.text}" font-family="${FONT}" font-size="13">${f}</text>
    </g>`;
  }).join('\n  ');

  // Status
  const statusY = featureY0 + project.features.length * featureGap + 18;
  const H = statusY + 18;

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
  <text x="78" y="22" fill="${T.dim}" font-family="${MONO}" font-size="13">${project.name}</text>
  <line x1="1" y1="35" x2="${W - 1}" y2="35" stroke="${T.border}" />

  <!-- Description -->
  <g style="animation: fadeIn 0.3s 0.05s ease forwards; opacity: 0">
    <text x="30" y="60" fill="${T.accent}" font-family="${FONT}" font-size="15" font-weight="bold">${project.description}</text>
  </g>

  <!-- Stack badges -->
  <g style="animation: fadeIn 0.3s 0.1s ease forwards; opacity: 0">
    ${badges}
  </g>

  <!-- Features -->
  ${features}

  <!-- Status -->
  <g style="animation: fadeIn 0.3s 0.5s ease forwards; opacity: 0">
    <text x="30" y="${statusY}" fill="${project.status.color}" font-family="${MONO}" font-size="12">${project.status.text}</text>
  </g>
</svg>`;
}

// ── 실행 ────────────────────────────────────────────────────────
const dir = 'assets';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

for (const project of PROJECTS) {
  const output = `${dir}/project-${project.id}.svg`;
  writeFileSync(output, generateProjectSVG(project).trim());
  console.log(`✓ ${output}`);
}
