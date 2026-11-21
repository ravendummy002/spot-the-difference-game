// Everything the player sees: the frame, the two pictures, the found
// markers, the timer and score, and the title / clear / over / win screens.
// Reads the state, draws on the canvas, and never changes the state.
import {
  BAD,
  DIM_INK,
  GOLD,
  GOOD,
  INK,
  MARK_RADIUS,
  PANEL_EDGE,
  PANEL_H,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_W,
  PANEL_Y,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { diffCount, getSet } from './differences.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_SET_CLEAR, SCREEN_TITLE, SCREEN_WIN } from './state.js';
import { drawScene } from './scenes.js';

function panelFrame(ctx, x) {
  ctx.fillStyle = PANEL_EDGE;
  ctx.fillRect(x - 5, PANEL_Y - 5, PANEL_W + 10, PANEL_H + 10);
  ctx.fillStyle = '#0c0a18';
  ctx.fillRect(x, PANEL_Y, PANEL_W, PANEL_H);
}

function drawPanel(ctx, setIndex, variant, x) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, PANEL_Y, PANEL_W, PANEL_H);
  ctx.clip();
  ctx.translate(x, PANEL_Y);
  drawScene(ctx, setIndex, variant);
  ctx.restore();
}

/** A gold ring with a tick on a found difference, on both pictures. */
function drawFoundMark(ctx, x, y, pulse) {
  const r = MARK_RADIUS + (pulse ? Math.sin(performance.now() / 160) * 2 : 0);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#fff4e0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.lineTo(x - 3, y + 7);
  ctx.lineTo(x + 10, y - 7);
  ctx.stroke();
}

function drawWrongMark(ctx, x, y) {
  ctx.strokeStyle = BAD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 11);
  ctx.lineTo(x + 11, y + 11);
  ctx.moveTo(x + 11, y - 11);
  ctx.lineTo(x - 11, y + 11);
  ctx.stroke();
}

function drawHintMark(ctx, x, y, now, until) {
  const left = Math.max(0, until - now);
  const phase = (left % 500) / 500;
  ctx.strokeStyle = '#7ddc8a';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, MARK_RADIUS + 4 + phase * 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function text(ctx, str, x, y, size, fill, align = 'left', weight = 'bold') {
  ctx.fillStyle = fill;
  ctx.font = `${weight} ${size}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = '#2c2148';
  ctx.fillRect(0, 64, VIEW_W, 3);
  text(ctx, 'THREE EVENINGS', 40, 24, 24, INK);
  text(ctx, 'spot the difference', 40, 48, 13, DIM_INK, 'left', 'normal');
  const set = getSet(state.setIndex);
  text(ctx, set.name, 640, 24, 18, INK, 'center');
  text(ctx, set.scene, 640, 48, 12, DIM_INK, 'center', 'normal');
  text(ctx, `SCORE ${state.score}`, 1240, 24, 18, GOLD, 'right');
  const found = state.found.size;
  const total = diffCount(state.setIndex);
  text(ctx, `FOUND ${found} / ${total}`, 1240, 48, 14, found === total ? GOOD : INK, 'right');
}

function drawTimer(ctx, state) {
  const set = getSet(state.setIndex);
  const frac = Math.max(0, state.secondsLeft / set.seconds);
  const x = 90;
  const y = 76;
  const w = 1110;
  const h = 12;
  ctx.fillStyle = '#2c2148';
  ctx.fillRect(x, y, w, h);
  const col = frac > 0.5 ? GOOD : frac > 0.25 ? GOLD : BAD;
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w * frac, h);
  text(ctx, formatTime(state.secondsLeft), 1240, 82, 14, col, 'right');
  text(ctx, 'TIME', 40, 82, 12, DIM_INK, 'left', 'normal');
}

function drawBottomBar(ctx, state) {
  const y = 540;
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(0, y, VIEW_W, VIEW_H - y);
  ctx.fillStyle = '#2c2148';
  ctx.fillRect(0, y, VIEW_W, 3);
  // The found list: every difference, named once it is found.
  const set = getSet(state.setIndex);
  text(ctx, 'FOUND SO FAR', 40, y + 28, 13, DIM_INK);
  let fx = 40;
  let fy = y + 58;
  for (let i = 0; i < set.diffs.length; i += 1) {
    const label = state.found.has(i) ? `✓ ${set.diffs[i].label}` : '· · ·';
    const w = ctx.measureText(label).width + 24;
    if (fx + w > 900) {
      fx = 40;
      fy += 30;
    }
    ctx.fillStyle = state.found.has(i) ? '#2c4a2e' : '#241c3d';
    ctx.fillRect(fx, fy - 13, w, 26);
    text(ctx, label, fx + 12, fy, 13, state.found.has(i) ? GOOD : DIM_INK, 'left', 'normal');
    fx += w + 10;
  }
  // Hint button and the keys that drive the game.
  ctx.fillStyle = state.hintsLeft > 0 ? '#3d2f5e' : '#241c3d';
  ctx.fillRect(960, y + 30, 120, 44);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(960, y + 30, 120, 44);
  text(ctx, `HINT  (${state.hintsLeft})  [H]`, 1020, y + 53, 15, state.hintsLeft > 0 ? GOLD : DIM_INK, 'center');
  text(ctx, 'Click a difference on either picture · wrong click −5s', 960, y + 104, 13, DIM_INK, 'left', 'normal');
  text(ctx, 'H hint · M sound · R restart set · Enter next', 960, y + 128, 13, DIM_INK, 'left', 'normal');
  if (state.message && state.now < state.messageUntil) {
    text(ctx, state.message, 640, y + 150, 16, state.message.startsWith('Not') ? BAD : GOOD, 'center');
  }
  // Set progress dots.
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < state.setIndex ? GOLD : i === state.setIndex ? INK : '#3a2f55';
    ctx.beginPath();
    ctx.arc(620 + i * 26, y + 28, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'SETS', 600, y + 28, 12, DIM_INK, 'right', 'normal');
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(12, 10, 24, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function panelCard(ctx, title, lines, foot) {
  const w = 720;
  const h = 120 + lines.length * 34;
  const x = (VIEW_W - w) / 2;
  const y = (VIEW_H - h) / 2;
  ctx.fillStyle = '#1d1533';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  text(ctx, title, VIEW_W / 2, y + 44, 30, GOLD, 'center');
  lines.forEach((line, i) => {
    text(ctx, line, VIEW_W / 2, y + 92 + i * 34, 17, INK, 'center', 'normal');
  });
  text(ctx, foot, VIEW_W / 2, y + h - 32, 14, DIM_INK, 'center', 'normal');
}

function drawTitle(ctx, state) {
  panelFrame(ctx, PANEL_LEFT_X);
  panelFrame(ctx, PANEL_RIGHT_X);
  drawPanel(ctx, 0, 0, PANEL_LEFT_X);
  drawPanel(ctx, 0, 1, PANEL_RIGHT_X);
  dim(ctx);
  panelCard(
    ctx,
    'THREE EVENINGS',
    [
      'Two pictures. One hides the differences. Find them all.',
      'Harbour Dawn · Lantern Market · Moonlit Garden — 30 differences, 3 sets.',
      'Click a difference on either picture. Wrong clicks cost 5 seconds.',
    ],
    'Press ENTER or click anywhere to start  ·  H hint  ·  M sound',
  );
}

function drawSetClear(ctx, state) {
  panelCard(
    ctx,
    'SET COMPLETE!',
    [
      `${getSet(state.setIndex).name} — all ${diffCount(state.setIndex)} differences found.`,
      `Time bonus +${state.setBonus}  ·  Score ${state.score}`,
      state.setIndex + 1 < 3 ? `Next up: ${getSet(state.setIndex + 1).name}` : '',
    ].filter(Boolean),
    'Press ENTER or click to continue',
  );
}

function drawOver(ctx, state) {
  panelCard(
    ctx,
    'TIME RAN OUT',
    [
      `${getSet(state.setIndex).name} — you found ${state.found.size} of ${diffCount(state.setIndex)} differences.`,
      `Score ${state.score}  ·  Total found ${state.totalFound} of 30`,
    ],
    'Press ENTER or click to retry this set  ·  R restarts',
  );
}

function drawWin(ctx, state) {
  panelCard(
    ctx,
    'YOU FOUND THEM ALL!',
    [
      'All 30 differences across three evenings — harbour, market and garden.',
      `Final score ${state.score}  (time bonus +${state.finalBonus} on the last set)`,
      'Thanks for playing Three Evenings.',
    ],
    'Press ENTER or click to play again',
  );
}

/** Draw the whole frame for the current state. */
export function render(ctx, state) {
  ctx.fillStyle = '#141021';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawTopBar(ctx, state);
  if (state.screen === SCREEN_TITLE) {
    drawTitle(ctx, state);
    return;
  }
  drawTimer(ctx, state);
  panelFrame(ctx, PANEL_LEFT_X);
  panelFrame(ctx, PANEL_RIGHT_X);
  drawPanel(ctx, state.setIndex, 0, PANEL_LEFT_X);
  drawPanel(ctx, state.setIndex, 1, PANEL_RIGHT_X);
  text(ctx, 'ORIGINAL', PANEL_LEFT_X + PANEL_W / 2, PANEL_Y + PANEL_H + 18, 13, DIM_INK, 'center', 'normal');
  text(ctx, 'FIND THE DIFFERENCES', PANEL_RIGHT_X + PANEL_W / 2, PANEL_Y + PANEL_H + 18, 13, DIM_INK, 'center', 'normal');
  // The centre column: how many differences are still hiding.
  const left = diffCount(state.setIndex) - state.found.size;
  text(ctx, String(left), 640, 300, 44, GOLD, 'center');
  text(ctx, 'LEFT', 640, 330, 13, DIM_INK, 'center', 'normal');
  text(ctx, 'TO FIND', 640, 348, 13, DIM_INK, 'center', 'normal');
  // Markers on both pictures.
  const set = getSet(state.setIndex);
  for (const i of state.foundOrder) {
    const d = set.diffs[i];
    drawFoundMark(ctx, PANEL_LEFT_X + d.x, PANEL_Y + d.y, false);
    drawFoundMark(ctx, PANEL_RIGHT_X + d.x, PANEL_Y + d.y, false);
  }
  if (state.wrongAt && state.now < state.wrongUntil) {
    drawWrongMark(ctx, PANEL_LEFT_X + state.wrongAt.x, PANEL_Y + state.wrongAt.y);
    drawWrongMark(ctx, PANEL_RIGHT_X + state.wrongAt.x, PANEL_Y + state.wrongAt.y);
  }
  if (state.hintIndex >= 0 && state.now < state.hintUntil) {
    const d = set.diffs[state.hintIndex];
    drawHintMark(ctx, PANEL_LEFT_X + d.x, PANEL_Y + d.y, state.now, state.hintUntil);
    drawHintMark(ctx, PANEL_RIGHT_X + d.x, PANEL_Y + d.y, state.now, state.hintUntil);
  }
  drawBottomBar(ctx, state);
  if (state.screen === SCREEN_SET_CLEAR) drawSetClear(ctx, state);
  else if (state.screen === SCREEN_OVER) drawOver(ctx, state);
  else if (state.screen === SCREEN_WIN) drawWin(ctx, state);
}
