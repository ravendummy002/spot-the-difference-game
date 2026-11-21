// The game's state: which screen is up, which set is being played, what has
// been found, how much time is left and the score. Pure logic, no drawing:
// render.js reads this and main.js drives it.
import {
  FOUND_POINTS,
  HINTS_PER_SET,
  HINT_PULSE_MS,
  SET_CLEAR_BONUS_PER_SECOND,
  FINAL_BONUS_PER_SECOND,
  WRONG_CLICK_SECONDS,
  WRONG_MARK_MS,
} from './config.js';
import { diffAt, diffCount, getSet, randomUnfound } from './differences.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_SET_CLEAR = 'setClear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

/** A fresh game, sitting on the title screen. */
export function newGame() {
  return {
    screen: SCREEN_TITLE,
    setIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    secondsLeft: getSet(0).seconds,
    hintsLeft: HINTS_PER_SET,
    hintIndex: -1,
    hintUntil: 0,
    wrongAt: null,
    wrongUntil: 0,
    muted: false,
    message: '',
    messageUntil: 0,
    setBonus: 0,
    finalBonus: 0,
    totalFound: 0,
    now: 0,
  };
}

/** Start (or restart) a set from its first difference. */
export function startSet(state, setIndex) {
  state.setIndex = setIndex;
  state.found = new Set();
  state.foundOrder = [];
  state.secondsLeft = getSet(setIndex).seconds;
  state.hintsLeft = HINTS_PER_SET;
  state.hintIndex = -1;
  state.hintUntil = 0;
  state.wrongAt = null;
  state.screen = SCREEN_PLAY;
  state.message = '';
}

/** Begin a whole new game from the title screen. */
export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.setBonus = 0;
  state.finalBonus = 0;
  startSet(state, 0);
}

/**
 * Advance the clock by dt seconds. Only the play screen ticks: the timer is
 * the time pressure, and it stops the moment a set is cleared or lost.
 */
export function tick(state, dt) {
  if (state.screen !== SCREEN_PLAY) return;
  state.secondsLeft -= dt;
  if (state.secondsLeft <= 0) {
    state.secondsLeft = 0;
    state.screen = SCREEN_OVER;
    state.message = 'Time ran out.';
  }
}

/**
 * Handle a click at panel coordinates (px, py) on either picture.
 * Returns 'found', 'wrong' or 'none' (a click outside both pictures).
 * Finding a difference scores, rings it on both pictures and may clear
 * the set; a wrong click costs five seconds and flashes a red cross.
 */
export function clickAt(state, px, py) {
  if (state.screen !== SCREEN_PLAY) return 'none';
  const hit = diffAt(state.setIndex, px, py, state.found);
  if (hit === null) {
    state.secondsLeft = Math.max(0, state.secondsLeft - WRONG_CLICK_SECONDS);
    state.wrongAt = { x: px, y: py };
    state.wrongUntil = state.now + WRONG_MARK_MS;
    state.message = `Not a difference — minus ${WRONG_CLICK_SECONDS}s!`;
    state.messageUntil = state.now + 1500;
    if (state.secondsLeft <= 0) {
      state.secondsLeft = 0;
      state.screen = SCREEN_OVER;
    }
    return 'wrong';
  }
  state.found.add(hit);
  state.foundOrder.push(hit);
  state.totalFound += 1;
  state.score += FOUND_POINTS;
  const label = getSet(state.setIndex).diffs[hit].label;
  state.message = `Found: ${label}! +${FOUND_POINTS}`;
  state.messageUntil = state.now + 1500;
  if (state.found.size === diffCount(state.setIndex)) {
    const bonus = Math.round(state.secondsLeft) * SET_CLEAR_BONUS_PER_SECOND;
    state.setBonus = bonus;
    state.score += bonus;
    if (state.setIndex + 1 < 3) {
      state.screen = SCREEN_SET_CLEAR;
    } else {
      state.finalBonus = Math.round(state.secondsLeft) * FINAL_BONUS_PER_SECOND;
      state.score += state.finalBonus;
      state.screen = SCREEN_WIN;
    }
  }
  return 'found';
}

/**
 * Spend a hint: a pulsing ring appears over a random difference that is
 * still hidden. Returns the index it points at, or null when there are no
 * hints left or nothing left to find.
 */
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return null;
  if (state.hintsLeft <= 0) {
    state.message = 'No hints left in this set.';
    state.messageUntil = state.now + 1500;
    return null;
  }
  const index = randomUnfound(state.setIndex, state.found);
  if (index === null) return null;
  state.hintsLeft -= 1;
  state.hintIndex = index;
  state.hintUntil = state.now + HINT_PULSE_MS;
  state.message = `Hint: look near the ${getSet(state.setIndex).diffs[index].label.toLowerCase()}…`;
  state.messageUntil = state.now + HINT_PULSE_MS;
  return index;
}

/** Move on after a cleared set, or restart after losing. */
export function advance(state) {
  if (state.screen === SCREEN_SET_CLEAR) {
    startSet(state, state.setIndex + 1);
  } else if (state.screen === SCREEN_OVER) {
    startSet(state, state.setIndex);
  } else if (state.screen === SCREEN_WIN || state.screen === SCREEN_TITLE) {
    startGame(state);
  }
}
