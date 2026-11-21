// Three Evenings — entry point. Sizes the canvas to the window, maps clicks
// back to the fixed logical view, runs the clock and the render loop, and
// wires the keyboard. With ?shot=start|play|market|end in the URL it stages
// one frozen screenshot scene instead of playing.
import { PANEL_H, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_W, PANEL_Y, VIEW_H, VIEW_W } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_SET_CLEAR, SCREEN_TITLE, SCREEN_WIN, advance, clickAt, newGame, startGame, tick, useHint } from './state.js';
import { render } from './render.js';
import { playFound, playHint, playWin, playWrong } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotMode = shotName !== null;

const state = newGame();
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let lastNow = performance.now();

/** Fit the fixed logical view into the window, letterboxed and centred. */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  scale = Math.min(w / VIEW_W, h / VIEW_H);
  offsetX = (w - VIEW_W * scale) / 2;
  offsetY = (h - VIEW_H * scale) / 2;
}

function announce() {
  const set = state.setIndex + 1;
  statusEl.textContent =
    state.screen === SCREEN_PLAY
      ? `Set ${set}: found ${state.found.size} differences, ${Math.ceil(state.secondsLeft)} seconds left, score ${state.score}.`
      : state.screen === SCREEN_TITLE
        ? 'Three Evenings, a spot the difference game. Press Enter to start.'
        : state.screen === SCREEN_WIN
          ? `You found them all! Final score ${state.score}.`
          : state.screen === SCREEN_OVER
            ? 'Time ran out.'
            : 'Set complete.';
}

/** Convert a window click to logical view coordinates. */
function toView(clientX, clientY) {
  return { x: (clientX - offsetX) / scale, y: (clientY - offsetY) / scale };
}

/**
 * Which picture, if any, a logical point lands in: 0 for the original on
 * the left, 1 for the altered one on the right, -1 for outside both.
 * Returns the panel-local coordinates too, for the click itself.
 */
function panelAt(vx, vy) {
  if (vy < PANEL_Y || vy > PANEL_Y + PANEL_H) return { panel: -1, px: 0, py: 0 };
  if (vx >= PANEL_LEFT_X && vx <= PANEL_LEFT_X + PANEL_W) {
    return { panel: 0, px: vx - PANEL_LEFT_X, py: vy - PANEL_Y };
  }
  if (vx >= PANEL_RIGHT_X && vx <= PANEL_RIGHT_X + PANEL_W) {
    return { panel: 1, px: vx - PANEL_RIGHT_X, py: vy - PANEL_Y };
  }
  return { panel: -1, px: 0, py: 0 };
}

function handleClick(clientX, clientY) {
  const { x, y } = toView(clientX, clientY);
  if (state.screen === SCREEN_TITLE || state.screen === SCREEN_SET_CLEAR || state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) {
    if (state.screen === SCREEN_TITLE) startGame(state);
    else advance(state);
    if (state.screen === SCREEN_PLAY) playWin(state.muted);
    announce();
    return;
  }
  if (state.screen !== SCREEN_PLAY) return;
  // The hint button lives in the bottom bar.
  if (x >= 960 && x <= 1080 && y >= 570 && y <= 614) {
    if (useHint(state) !== null) playHint(state.muted);
    announce();
    return;
  }
  const { panel, px, py } = panelAt(x, y);
  if (panel === -1) return;
  const result = clickAt(state, px, py);
  if (result === 'found') playFound(state.muted);
  else if (result === 'wrong') playWrong(state.muted);
  if (state.screen === SCREEN_WIN || state.screen === SCREEN_SET_CLEAR) playWin(state.muted);
  announce();
}

function handleKey(event) {
  const key = event.key.toLowerCase();
  if (key === 'enter' || key === ' ') {
    event.preventDefault();
    if (state.screen === SCREEN_TITLE) startGame(state);
    else advance(state);
    announce();
    return;
  }
  if (key === 'h') {
    if (useHint(state) !== null) playHint(state.muted);
    announce();
    return;
  }
  if (key === 'm') {
    state.muted = !state.muted;
    state.message = state.muted ? 'Sound off.' : 'Sound on.';
    state.messageUntil = state.now + 1200;
    announce();
    return;
  }
  if (key === 'r' && state.screen === SCREEN_PLAY) {
    startGame(state);
    state.setIndex = 0;
    announce();
  }
}

function frame(now) {
  const dt = Math.min(0.1, (now - lastNow) / 1000);
  lastNow = now;
  if (!shotMode) {
    state.now = now;
    tick(state, dt);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  render(ctx, state);
  if (!shotMode) requestAnimationFrame(frame);
}

// A small handle for automated play-testing: the real game never uses it.
window.__game = {
  state,
  clickAt: (px, py) => clickAt(state, px, py),
  useHint: () => useHint(state),
  start: () => startGame(state),
  advance: () => advance(state),
  panelAt,
};

resize();
window.addEventListener('resize', resize);
canvas.addEventListener('pointerdown', (event) => handleClick(event.clientX, event.clientY));
window.addEventListener('keydown', handleKey);
if (shotMode) {
  state.now = 0;
  stageShot(shotName, state);
  lastNow = performance.now();
  frame(performance.now());
  document.title = `Three Evenings — shot ${shotName}`;
} else {
  announce();
  requestAnimationFrame(frame);
}
