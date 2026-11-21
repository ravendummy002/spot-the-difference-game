// Tiny synthesised sounds, made with the Web Audio API: no sound files,
// no network, just a few oscillator notes. Every sound is a no-op while
// the game is muted or before the player has interacted with the page.
let audioCtx = null;

function ctx() {
  if (audioCtx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function note(ac, freq, at, dur, type, vol) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** Play a short phrase: an array of [frequency, delaySeconds, duration]. */
export function playPhrase(muted, phrase, type = 'sine', vol = 0.12) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const now = ac.currentTime;
  for (const [freq, delay, dur] of phrase) note(ac, freq, now + delay, dur, type, vol);
}

/** A bright two-note chime for finding a difference. */
export function playFound(muted) {
  playPhrase(muted, [[880, 0, 0.14], [1318, 0.09, 0.22]], 'sine', 0.14);
}

/** A low buzz for a wrong click. */
export function playWrong(muted) {
  playPhrase(muted, [[160, 0, 0.18]], 'sawtooth', 0.05);
}

/** A soft ping when a hint lights up. */
export function playHint(muted) {
  playPhrase(muted, [[1174, 0, 0.12]], 'triangle', 0.1);
}

/** A little arpeggio for clearing a set or winning the game. */
export function playWin(muted) {
  playPhrase(muted, [[523, 0, 0.16], [659, 0.12, 0.16], [784, 0.24, 0.16], [1046, 0.36, 0.3]], 'sine', 0.13);
}
