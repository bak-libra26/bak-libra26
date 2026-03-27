#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { T, FONT, MONO, titleBar, cardFrame } from './card-theme.mjs';

// ── 프로젝트 데이터 (여기를 수정하면 카드가 바뀝니다) ────────────
const PROJECTS = [
  {
    name: 'bak-libra26.github.io',
    description: '터미널 스타일 기술 블로그 + 포트폴리오',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Vanilla CSS', 'Cloudflare Pages'],
    features: [
      '마크다운 기반 SSG로 613편 콘텐츠 + 9개 핸드북 시리즈 관리',
      'Cloudflare Pages + OpenNext 조합으로 엣지 배포 최적화',
      'CSS Variables 5개 테마 시스템 + 터미널 UI로 개발자 경험 극대화',
    ],
    badge: { text: 'active', color: T.green },
  },
  {
    name: 'insights-korea',
    description: '영문 한국 문화 매거진 + AI 콘텐츠 파이프라인',
    stack: ['Next.js 16', 'React 19', 'Supabase', 'next-intl', 'GitHub Actions'],
    features: [
      'Admin 페이지에서 Grok API로 주요 토픽 수집 + 초안/번역 자동 생성',
      'GitHub Actions로 발행/미발행 요청 처리 + Discord Bot 알림 연동',
      'Supabase + next-intl 다국어(EN/KO/JA) 지원',
    ],
    badge: { text: 'private', color: T.dim },
  },
];

const OUTPUT = 'assets/projects.svg';

// ── 배지 너비 추정 ──────────────────────────────────────────────
function measureBadge(text) {
  const charWidth = 7.2;
  return text.length * charWidth + 16;
}

// ── 하나의 프로젝트 블록 렌더링 (y 오프셋 기준) ─────────────────
function renderProject(project, yBase, animDelay) {
  // 프로젝트 이름 + 배지
  const nameY = yBase + 20;
  const nameWidth = project.name.length * 8.5 + 30; // 대략적 이름 텍스트 폭
  const badgeW = project.badge.text.length * 7 + 14;
  const badgeSvg = `
      <rect x="${nameWidth}" y="${nameY - 13}" width="${badgeW}" height="18" rx="9" fill="none" stroke="${project.badge.color}" stroke-width="1" />
      <text x="${nameWidth + badgeW / 2}" y="${nameY - 1}" fill="${project.badge.color}" font-family="${MONO}" font-size="10" text-anchor="middle">${project.badge.text}</text>`;

  // 설명
  const descY = yBase + 42;
  // Stack 배지
  const stackY = yBase + 58;
  let bx = 42;
  const stackBadges = project.stack.map(tag => {
    const w = measureBadge(tag);
    const svg = `
      <rect x="${bx}" y="${stackY}" width="${w}" height="20" rx="3" fill="${T.border}" />
      <text x="${bx + w / 2}" y="${stackY + 14}" fill="${T.text}" font-family="${MONO}" font-size="11" text-anchor="middle">${tag}</text>`;
    bx += w + 5;
    return svg;
  }).join('');

  // Features
  const featureY0 = yBase + 98;
  const featureGap = 22;
  const features = project.features.map((f, i) => {
    const y = featureY0 + i * featureGap;
    return `
      <text x="50" y="${y}" fill="${T.dim}" font-family="${MONO}" font-size="12">▸</text>
      <text x="66" y="${y}" fill="${T.text}" font-family="${FONT}" font-size="12.5">${f}</text>`;
  }).join('');

  const endY = featureY0 + project.features.length * featureGap;

  const d = animDelay;
  return {
    height: endY - yBase,
    svg: `
    <g style="animation: fadeIn 0.4s ${d}s ease forwards; opacity: 0">
      <text x="30" y="${nameY}" fill="${T.accent}" font-family="${MONO}" font-size="14" font-weight="bold">${project.name}</text>
      ${badgeSvg}
      <text x="30" y="${descY}" fill="${T.dim}" font-family="${FONT}" font-size="13">${project.description}</text>
      ${stackBadges}
      ${features}
    </g>`,
  };
}

// ── SVG 생성 ────────────────────────────────────────────────────
function generateSVG() {
  const W = 850;
  const titleBarH = 35;
  const contentStart = titleBarH + 15;
  const projectGap = 40;

  // 프로젝트 블록 렌더링
  let y = contentStart;
  const blocks = [];
  PROJECTS.forEach((project, i) => {
    const block = renderProject(project, y, 0.1 + i * 0.3);
    blocks.push(block);
    y += block.height + projectGap;

    // 프로젝트 사이 구분선 (마지막 제외)
    if (i < PROJECTS.length - 1) {
      blocks.push({
        height: 0,
        svg: `<line x1="30" y1="${y - projectGap / 2}" x2="${W - 30}" y2="${y - projectGap / 2}" stroke="${T.border}" stroke-dasharray="4,4" />`,
      });
    }
  });

  const H = y + 5;

  const projectsSvg = blocks.map(b => b.svg).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <style>
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  </style>

  ${cardFrame(W, H)}
  ${titleBar(W, `bak-libra26@github:~$ ls ~/projects/`)}

  <!-- Projects -->
  ${projectsSvg}
</svg>`;
}

// ── 실행 ────────────────────────────────────────────────────────
const dir = 'assets';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

writeFileSync(OUTPUT, generateSVG().trim());
console.log(`✓ ${OUTPUT}`);
