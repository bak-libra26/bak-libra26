// ── 카드 공통 테마 + 헬퍼 ─────────────────────────────────────
// 모든 카드 스크립트에서 import해서 사용

export const T = {
  bg: '#0d1117', bar: '#161b22', border: '#30363d',
  accent: '#7aa2f7', text: '#c9d1d9', dim: '#484f58',
  green: '#28c840', purple: '#bb9af7',
};

export const FONT = "'Segoe UI', Ubuntu, sans-serif";
export const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

// Linux CLI 스타일 타이틀바 생성
export function titleBar(W, title) {
  return `
  <!-- Title bar -->
  <rect x="1" y="1" width="${W - 2}" height="34" rx="4" fill="${T.bar}" />
  <rect x="1" y="27" width="${W - 2}" height="8" fill="${T.bar}" />
  <text x="16" y="22" fill="${T.dim}" font-family="${MONO}" font-size="13">${title}</text>
  <!-- Window controls ─ □ × -->
  <text x="${W - 68}" y="22" fill="${T.dim}" font-family="${MONO}" font-size="14">─</text>
  <text x="${W - 44}" y="22" fill="${T.dim}" font-family="${MONO}" font-size="14">□</text>
  <text x="${W - 22}" y="22" fill="${T.dim}" font-family="${MONO}" font-size="14">×</text>
  <line x1="1" y1="35" x2="${W - 1}" y2="35" stroke="${T.border}" />`;
}

// 카드 외곽 (고정 배경색)
export function cardFrame(W, H) {
  return `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="4.5" fill="${T.bg}" stroke="${T.border}" />`;
}
