#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { T, FONT, MONO, titleBar, cardFrame } from './card-theme.mjs';

// ── 프로젝트 데이터 ─────────────────────────────────────────────
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
    demo: 'https://bak-libra26.co.kr',
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
    demo: 'https://insightskorea.com',
  },
];

function measureBadge(text) {
  return text.length * 7.2 + 16;
}

function generateProjectSVG(project) {
  const W = 850;

  // 프로젝트 이름 + active 배지
  const nameY = 70;
  const nameWidth = project.name.length * 8.5 + 44;
  const badgeW = 50;
  const activeBadge = `
    <rect x="${nameWidth}" y="${nameY - 13}" width="${badgeW}" height="18" rx="9" fill="none" stroke="${T.green}" stroke-width="1" />
    <text x="${nameWidth + badgeW / 2}" y="${nameY - 1}" fill="${T.green}" font-family="${MONO}" font-size="10" text-anchor="middle">active</text>`;

  // 설명
  const descY = nameY + 22;

  // Stack 배지
  const stackY = descY + 18;
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
  const featureY0 = stackY + 40;
  const featureGap = 22;
  const features = project.features.map((f, i) => {
    const y = featureY0 + i * featureGap;
    return `
      <text x="50" y="${y}" fill="${T.dim}" font-family="${MONO}" font-size="12">▸</text>
      <text x="66" y="${y}" fill="${T.text}" font-family="${FONT}" font-size="12.5">${f}</text>`;
  }).join('');

  // Demo footer
  const footerY = featureY0 + project.features.length * featureGap + 16;
  const H = footerY + 40;
  const demoFooter = `
    <line x1="1" y1="${footerY}" x2="${W - 1}" y2="${footerY}" stroke="${T.border}" />
    <rect x="1" y="${footerY}" width="${W - 2}" height="${H - footerY - 1}" rx="0" fill="${T.bar}" />
    <rect x="1" y="${H - 5}" width="${W - 2}" height="4.5" rx="4" fill="${T.bar}" />
    <text x="${W / 2}" y="${footerY + 24}" fill="${T.accent}" font-family="${MONO}" font-size="13" text-anchor="middle">Demo ↗  ${project.demo.replace('https://', '').replace('www.', '')}</text>`;

  return { id: project.id, H, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
  <style>
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  </style>

  ${cardFrame(W, H)}
  ${titleBar(W, `bak-libra26@github:~$ cat ${project.name}/README.md`)}

  <g style="animation: fadeIn 0.4s 0.1s ease forwards; opacity: 0">
    <text x="30" y="${nameY}" fill="${T.accent}" font-family="${MONO}" font-size="14" font-weight="bold">${project.name}</text>
    ${activeBadge}
    <text x="30" y="${descY}" fill="${T.dim}" font-family="${FONT}" font-size="13">${project.description}</text>
    ${stackBadges}
    ${features}
  </g>

  ${demoFooter}
</svg>` };
}

// ── 실행 ────────────────────────────────────────────────────────
const dir = 'assets';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

for (const project of PROJECTS) {
  const { id, svg } = generateProjectSVG(project);
  const output = `${dir}/project-${id}.svg`;
  writeFileSync(output, svg.trim());
  console.log(`✓ ${output}`);
}
