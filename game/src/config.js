// Shared constants for Three Evenings, a spot the difference game.
// The game draws everything on one canvas at a fixed logical size and
// scales it to the window, so a click always maps back to the same spot.
export const VIEW_W = 1280;
export const VIEW_H = 800;
export const PANEL_W = 560;
export const PANEL_H = 420;
export const PANEL_Y = 96;
export const PANEL_LEFT_X = 40;
export const PANEL_RIGHT_X = 680;
export const PANEL_GAP_X = PANEL_RIGHT_X - (PANEL_LEFT_X + PANEL_W);

// How close a click must land to a difference, in panel pixels.
export const CLICK_RADIUS = 26;
export const MARK_RADIUS = 24;
// A wrong click costs five seconds; a hint costs one of three per set.
export const WRONG_CLICK_SECONDS = 5;
export const HINTS_PER_SET = 3;
export const HINT_PULSE_MS = 2600;
export const WRONG_MARK_MS = 700;
export const FOUND_POINTS = 100;
export const SET_CLEAR_BONUS_PER_SECOND = 5;
export const FINAL_BONUS_PER_SECOND = 10;

// Colours for the frame around the two pictures.
export const INK = '#f7ead7';
export const DIM_INK = '#b8a88f';
export const GOLD = '#ffc94d';
export const GOOD = '#7ddc8a';
export const BAD = '#ff6b6b';
export const PANEL_EDGE = '#3a2f55';
