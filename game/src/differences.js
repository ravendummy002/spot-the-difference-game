// The three picture sets and the differences hidden in each one.
import { CLICK_RADIUS } from './config.js';
// A difference is a spot in panel coordinates (560 x 420), a radius for
// accepting clicks, and the short label shown once it is found. The left
// picture is the original; the right picture is the same scene with every
// difference applied. Coordinates are shared by scenes.js, which draws the
// altered version of each spot on the right panel only.
export const SETS = [
  {
    id: 'harbour',
    name: 'Set 1 · Harbour Dawn',
    scene: 'A fishing harbour wakes up: sun, gulls, boats and a lighthouse.',
    seconds: 180,
    diffs: [
      { x: 470, y: 70, r: 34, label: 'Sun rays' },
      { x: 250, y: 42, r: 30, label: 'Middle cloud' },
      { x: 330, y: 78, r: 16, label: 'Third gull' },
      { x: 505, y: 176, r: 20, label: 'Lighthouse lamp' },
      { x: 176, y: 252, r: 18, label: 'Boat flag' },
      { x: 84, y: 330, r: 26, label: 'Top crate' },
      { x: 428, y: 348, r: 18, label: 'Buoy' },
      { x: 214, y: 296, r: 18, label: 'Jumping fish' },
    ],
  },
  {
    id: 'market',
    name: 'Set 2 · Lantern Market',
    scene: 'A night market under paper lanterns: stalls, a cat and the moon.',
    seconds: 150,
    diffs: [
      { x: 210, y: 62, r: 20, label: 'Lantern colour' },
      { x: 300, y: 336, r: 22, label: 'Market cat' },
      { x: 446, y: 184, r: 24, label: 'Stall sign' },
      { x: 128, y: 258, r: 16, label: 'Missing apple' },
      { x: 522, y: 296, r: 20, label: 'Balloon' },
      { x: 446, y: 138, r: 20, label: 'Vendor hat' },
      { x: 116, y: 168, r: 22, label: 'Awning stripe' },
      { x: 62, y: 92, r: 18, label: 'Lit window' },
      { x: 486, y: 62, r: 26, label: 'Moon shape' },
      { x: 196, y: 58, r: 12, label: 'Small star' },
    ],
  },
  {
    id: 'garden',
    name: 'Set 3 · Moonlit Garden',
    scene: 'A quiet garden pond at night: koi, a frog, fireflies and a bridge.',
    seconds: 120,
    diffs: [
      { x: 330, y: 348, r: 20, label: 'Third koi' },
      { x: 196, y: 362, r: 18, label: 'Frog' },
      { x: 252, y: 148, r: 12, label: 'Firefly' },
      { x: 118, y: 384, r: 14, label: 'Tulip colour' },
      { x: 482, y: 252, r: 16, label: 'Stone lantern flame' },
      { x: 288, y: 268, r: 16, label: 'Bridge plank' },
      { x: 162, y: 300, r: 14, label: 'Butterfly' },
      { x: 96, y: 210, r: 22, label: 'Willow branch' },
      { x: 92, y: 72, r: 26, label: 'Moon crater' },
      { x: 148, y: 336, r: 14, label: 'Stepping stone' },
      { x: 448, y: 116, r: 14, label: 'Pagoda window' },
      { x: 372, y: 384, r: 16, label: 'Lily pad' },
    ],
  },
];

/** The set object for an index, wrapping never happens: there are three. */
export function getSet(index) {
  return SETS[index];
}

/** How many differences a set hides. */
export function diffCount(setIndex) {
  return SETS[setIndex].diffs.length;
}

/**
 * The first unfound difference within CLICK_RADIUS of a panel point, or
 * null. The same spot counts on either panel, so a click on the left or
 * the right picture finds the same difference.
 */
export function diffAt(setIndex, px, py, found) {
  const diffs = SETS[setIndex].diffs;
  for (let i = 0; i < diffs.length; i += 1) {
    if (found.has(i)) continue;
    const d = diffs[i];
    const dx = px - d.x;
    const dy = py - d.y;
    if (dx * dx + dy * dy <= CLICK_RADIUS * CLICK_RADIUS) return i;
  }
  return null;
}

/** Pick a random unfound difference index, or null when none is left. */
export function randomUnfound(setIndex, found) {
  const left = [];
  const diffs = SETS[setIndex].diffs;
  for (let i = 0; i < diffs.length; i += 1) {
    if (!found.has(i)) left.push(i);
  }
  if (left.length === 0) return null;
  return left[Math.floor(Math.random() * left.length)];
}
