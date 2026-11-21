// The screenshot scenes behind ?shot=start|play|market|end. Each one plays
// the real rules forward from a fresh game for a fixed, deterministic script,
// so the frame is what a real game looks like and the same shot always gives
// the same frame. The timer is frozen in shot mode: the screenshots show a
// moment, not a countdown.
import { SCREEN_PLAY, SCREEN_SET_CLEAR, SCREEN_WIN, clickAt, startGame, startSet } from './state.js';
import { getSet } from './differences.js';

/** Click the first `count` differences of the current set, in order. */
function findSome(state, count) {
  const diffs = getSet(state.setIndex).diffs;
  for (let i = 0; i < count && i < diffs.length; i += 1) {
    clickAt(state, diffs[i].x, diffs[i].y);
  }
}

/**
 * Set `state` to the named scene and return the screen to draw. Names:
 * start (title), play (set 1, four found, some still hidden), market
 * (set 2, six found, the clock low), end (all three sets won).
 */
export function stageShot(name, state) {
  if (name === 'play') {
    startGame(state);
    findSome(state, 4);
    state.secondsLeft = 127;
    state.screen = SCREEN_PLAY;
    state.message = 'Found: Lighthouse lamp! +100';
    state.messageUntil = Infinity;
    return SCREEN_PLAY;
  }
  if (name === 'market') {
    startGame(state);
    startSet(state, 1);
    findSome(state, 6);
    state.secondsLeft = 53;
    state.screen = SCREEN_PLAY;
    state.hintIndex = 1;
    state.hintUntil = 2600;
    state.now = 0;
    state.message = 'Hint: look near the market cat…';
    state.messageUntil = Infinity;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    startGame(state);
    for (let set = 0; set < 3; set += 1) {
      startSet(state, set);
      const diffs = getSet(set).diffs;
      for (let i = 0; i < diffs.length; i += 1) clickAt(state, diffs[i].x, diffs[i].y);
      if (state.screen === SCREEN_SET_CLEAR) startSet(state, set + 1);
    }
    state.screen = SCREEN_WIN;
    state.message = '';
    return SCREEN_WIN;
  }
  // Anything else is the title screen.
  return 'title';
}
