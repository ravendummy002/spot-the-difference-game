// The three pictures, drawn with code. Every scene is drawn twice: once as
// the original (variant 0, the left picture) and once with every difference
// applied (variant 1, the right picture). The base drawing is identical in
// both; each difference is one small branch, so the two pictures match
// everywhere except the spots differences.js names. Panel space is 560 x 420.
import { PANEL_W, PANEL_H } from './config.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s) {
  ctx.fillStyle = '#fff4e0';
  ellipse(ctx, x, y, 26 * s, 13 * s, '#fff4e0');
  ellipse(ctx, x - 18 * s, y + 5 * s, 17 * s, 10 * s, '#fff4e0');
  ellipse(ctx, x + 19 * s, y + 5 * s, 18 * s, 10 * s, '#fff4e0');
}

function gull(ctx, x, y) {
  ctx.strokeStyle = '#33415e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 9, y);
  ctx.quadraticCurveTo(x - 4, y - 7, x, y);
  ctx.quadraticCurveTo(x + 4, y - 7, x + 9, y);
  ctx.stroke();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function lantern(ctx, x, y, colour) {
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x, y - 8);
  ctx.stroke();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, 13, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(x - 3, y - 4, 6, 8);
  ctx.fillStyle = '#8a5a2e';
  ctx.fillRect(x - 5, y - 19, 10, 4);
  ctx.fillRect(x - 5, y + 15, 10, 4);
}

// ---------------------------------------------------------------- harbour
function drawHarbour(ctx, right) {
  // Dawn sky and sea.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#ffcf99');
  sky.addColorStop(0.6, '#ffd9a8');
  sky.addColorStop(1, '#ffe9c9');
  rect(ctx, 0, 0, PANEL_W, 260, '#000');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 260);
  const sea = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  sea.addColorStop(0, '#3d8fb5');
  sea.addColorStop(1, '#1d5a80');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, PANEL_W, PANEL_H - 250);
  // Distant green headland.
  poly(ctx, [[0, 250], [120, 208], [260, 244], [380, 214], [560, 250], [560, 262], [0, 262]], '#4d7a5a');

  // The sun: rays on the left picture, a plain disc on the right.
  if (!right) {
    ctx.strokeStyle = '#ff9d2e';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(470 + Math.cos(a) * 42, 70 + Math.sin(a) * 42);
      ctx.lineTo(470 + Math.cos(a) * 56, 70 + Math.sin(a) * 56);
      ctx.stroke();
    }
  }
  circle(ctx, 470, 70, 34, right ? '#ffe066' : '#ff9d2e');
  circle(ctx, 470, 70, 24, right ? '#fff3b0' : '#ffb84d');

  // Clouds: the middle one only flies on the left.
  cloud(ctx, 110, 55, 1);
  if (!right) cloud(ctx, 250, 42, 0.85);
  cloud(ctx, 380, 70, 0.9);
  // Gulls: the third one only flies on the left.
  gull(ctx, 296, 96);
  gull(ctx, 262, 112);
  if (!right) gull(ctx, 330, 78);

  // Wooden pier and crates at the bottom left.
  rect(ctx, 0, 352, 190, 68, '#7a5a3a');
  ctx.fillStyle = '#8a6a44';
  for (let x = 6; x < 190; x += 24) ctx.fillRect(x, 352, 3, 68);
  rect(ctx, 0, 352, 190, 8, '#9a7a52');
  rect(ctx, 48, 322, 34, 30, '#b08954');
  rect(ctx, 86, 322, 34, 30, '#b08954');
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 322, 34, 30);
  ctx.strokeRect(86, 322, 34, 30);
  // The top crate only sits there on the left.
  if (!right) {
    rect(ctx, 67, 292, 34, 30, '#c49a62');
    ctx.strokeRect(67, 292, 34, 30);
  }

  // A little sailing boat with a flag.
  poly(ctx, [[150, 300], [210, 300], [196, 322], [164, 322]], '#8a4a2e');
  rect(ctx, 178, 258, 4, 44, '#5a3a28');
  poly(ctx, [[182, 262], [182, 296], [206, 296]], '#fff4e0');
  poly(ctx, [[178, 262], [178, 296], [156, 296]], '#ffd76a');
  rect(ctx, 178, 244, 3, 16, '#5a3a28');
  poly(ctx, [[181, 244], [200, 250], [181, 256]], right ? '#2e8b8b' : '#d94f3d');
  // A second, smaller boat further out.
  poly(ctx, [[330, 322], [376, 322], [366, 338], [342, 338]], '#6b3f26');
  poly(ctx, [[352, 296], [352, 322], [370, 322]], '#fff4e0');

  // The jumping fish: an arc above the water, left picture only.
  if (!right) {
    ctx.strokeStyle = '#e8f4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(214, 300, 12, Math.PI, 0);
    ctx.stroke();
    poly(ctx, [[202, 296], [196, 290], [204, 288]], '#e8f4ff');
    ellipse(ctx, 214, 308, 14, 4, '#cfe8f5');
  }

  // The buoy: striped and floating on the left, gone on the right.
  if (!right) {
    circle(ctx, 428, 348, 12, '#d94f3d');
    ctx.fillStyle = '#fff4e0';
    ctx.fillRect(417, 344, 22, 7);
    rect(ctx, 426, 332, 4, 6, '#5a3a28');
  }

  // The lighthouse on the right: lit lamp on the left, dark on the right.
  rect(ctx, 488, 196, 34, 106, '#f2ead8');
  rect(ctx, 488, 224, 34, 12, '#d94f3d');
  rect(ctx, 488, 258, 34, 12, '#d94f3d');
  poly(ctx, [[484, 196], [526, 196], [518, 168], [492, 168]], '#33415e');
  rect(ctx, 494, 168, 22, 12, right ? '#33415e' : '#ffe066');
  if (!right) {
    circle(ctx, 505, 174, 26, 'rgba(255, 224, 102, 0.25)');
    ctx.fillStyle = 'rgba(255, 224, 102, 0.35)';
    poly(ctx, [[494, 174], [440, 158], [440, 190]], 'rgba(255, 224, 102, 0.35)');
  }

  // Gentle wave lines on the sea.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 280, 60], [300, 360, 70], [440, 392, 60], [120, 392, 50]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 6, wx + wl, wy);
    ctx.stroke();
  }
}

// ----------------------------------------------------------------- market
function drawMarket(ctx, right) {
  // Night sky, street and the buildings behind the stalls.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#141c3a');
  sky.addColorStop(1, '#2c3a6b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 300);
  rect(ctx, 0, 300, PANEL_W, 120, '#3a2f2b');
  rect(ctx, 0, 300, PANEL_W, 8, '#57453c');
  // Back buildings.
  rect(ctx, 20, 130, 110, 170, '#232c52');
  rect(ctx, 430, 110, 110, 190, '#232c52');
  // One window lit on the left, dark on the right.
  rect(ctx, 52, 82, 20, 24, right ? '#1a2340' : '#ffd76a');
  rect(ctx, 470, 140, 20, 24, '#1a2340');
  ctx.strokeStyle = '#141c3a';
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 82, 20, 24);
  ctx.strokeRect(470, 140, 20, 24);

  // Stars, one of them only on the left; the moon, full or crescent.
  star(ctx, 150, 48, 7, '#ffe9a8');
  star(ctx, 300, 36, 6, '#ffe9a8');
  star(ctx, 380, 90, 5, '#ffe9a8');
  if (!right) star(ctx, 196, 58, 6, '#ffe9a8');
  circle(ctx, 486, 62, 24, '#fff3c4');
  if (right) circle(ctx, 494, 56, 20, '#2c3a6b');
  circle(ctx, 478, 56, 4, '#e8d28a');
  circle(ctx, 492, 70, 3, '#e8d28a');

  // A string of paper lanterns across the top.
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 36);
  ctx.lineTo(550, 36);
  ctx.stroke();
  const lanternCols = ['#ff5a4e', '#ffb84d', '#ff5a4e', '#7ddc8a', '#ff5a4e', '#ffb84d', '#ff5a4e'];
  const lanternXs = [70, 140, 210, 280, 350, 420, 490];
  for (let i = 0; i < lanternXs.length; i += 1) {
    // The third lantern is red on the left and green on the right.
    const col = i === 2 && right ? '#7ddc8a' : lanternCols[i];
    lantern(ctx, lanternXs[i], 62, col);
  }

  // Left stall: striped awning and a basket of apples.
  rect(ctx, 30, 190, 170, 90, '#6b4a2e');
  rect(ctx, 30, 190, 170, 10, '#8a6a44');
  for (let i = 0; i < 5; i += 1) {
    // The middle awning stripe is red on the left, cream on the right.
    const col = i === 2 && right ? '#fff4e0' : i % 2 === 0 ? '#d94f3d' : '#fff4e0';
    rect(ctx, 30 + i * 34, 150, 34, 40, col);
  }
  rect(ctx, 30, 150, 170, 6, '#8a4a2e');
  // Basket of apples: five on the left, four on the right.
  ellipse(ctx, 116, 268, 52, 14, '#8a5a2e');
  const apples = [[84, 258], [104, 250], [128, 258], [148, 250], [116, 244]];
  for (let i = 0; i < apples.length; i += 1) {
    if (right && i === 2) continue;
    circle(ctx, apples[i][0], apples[i][1], 9, '#e84a3d');
    circle(ctx, apples[i][0] - 3, apples[i][1] - 3, 3, '#ff8a7a');
  }

  // Right stall with its sign: a moon on the left, a star on the right.
  rect(ctx, 370, 190, 160, 90, '#2e5a4e');
  rect(ctx, 370, 190, 160, 10, '#4a7a68');
  for (let i = 0; i < 5; i += 1) {
    rect(ctx, 370 + i * 32, 150, 32, 40, i % 2 === 0 ? '#2e8b8b' : '#fff4e0');
  }
  rect(ctx, 370, 150, 160, 6, '#1d4a3e');
  rect(ctx, 420, 168, 52, 32, '#3a2f2b');
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 2;
  ctx.strokeRect(420, 168, 52, 32);
  if (!right) {
    circle(ctx, 446, 184, 9, '#ffd76a');
    circle(ctx, 450, 181, 7, '#3a2f2b');
  } else {
    star(ctx, 446, 184, 10, '#ffd76a');
  }

  // The vendor behind the right stall: straw hat or flat cap.
  circle(ctx, 446, 128, 12, '#f2c9a0');
  if (!right) {
    ellipse(ctx, 446, 122, 22, 7, '#e8c96a');
    ellipse(ctx, 446, 116, 11, 8, '#e8c96a');
  } else {
    ellipse(ctx, 446, 120, 15, 6, '#33415e');
    rect(ctx, 432, 118, 28, 5, '#33415e');
  }
  rect(ctx, 428, 140, 36, 50, '#7a4a8a');

  // The market cat, sitting on a crate, left picture only.
  if (!right) {
    rect(ctx, 278, 348, 44, 18, '#8a6a44');
    ellipse(ctx, 300, 336, 16, 13, '#3a3a4a');
    circle(ctx, 300, 320, 10, '#3a3a4a');
    poly(ctx, [[292, 314], [294, 304], [300, 312]], '#3a3a4a');
    poly(ctx, [[308, 314], [306, 304], [300, 312]], '#3a3a4a');
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(314, 344);
    ctx.quadraticCurveTo(326, 338, 322, 326);
    ctx.stroke();
  }

  // Balloons tied to the right stall: three on the left, two on the right.
  const balloons = [[505, 296, '#ff5a4e'], [522, 288, '#7ddc8a'], [539, 296, '#5aa8ff']];
  for (let i = 0; i < balloons.length; i += 1) {
    if (right && i === 1) continue;
    const [bx, by, bc] = balloons[i];
    ctx.strokeStyle = '#b8a88f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, by + 14);
    ctx.lineTo(bx - 6, 330);
    ctx.stroke();
    ellipse(ctx, bx, by, 10, 13, bc);
  }

  // Cobblestones on the street.
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = 316; y < 416; y += 22) {
    for (let x = (y % 44 === 0 ? 8 : 22); x < PANEL_W; x += 30) {
      ctx.beginPath();
      ctx.ellipse(x, y, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ----------------------------------------------------------------- garden
function drawGarden(ctx, right) {
  // Deep night sky and the pond that fills the lower half.
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#0e1430');
  sky.addColorStop(1, '#24356b');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 260);
  const pond = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  pond.addColorStop(0, '#2e7d8b');
  pond.addColorStop(1, '#1d5a6b');
  ctx.fillStyle = pond;
  ctx.fillRect(0, 250, PANEL_W, PANEL_H - 250);
  rect(ctx, 0, 248, PANEL_W, 6, '#3f8a6b');

  // The moon: cratered on the left, plain on the right.
  circle(ctx, 92, 72, 26, '#fdf6d8');
  if (!right) {
    circle(ctx, 84, 66, 5, '#e8d8a8');
    circle(ctx, 100, 78, 4, '#e8d8a8');
    circle(ctx, 96, 60, 3, '#e8d8a8');
  }

  // The pagoda silhouette, its one window lit on the left.
  rect(ctx, 420, 120, 60, 140, '#141c3a');
  poly(ctx, [[412, 122], [488, 122], [450, 92]], '#1a2340');
  poly(ctx, [[416, 92], [484, 92], [450, 66]], '#1a2340');
  rect(ctx, 442, 140, 16, 20, right ? '#141c3a' : '#ffd76a');
  rect(ctx, 442, 180, 16, 20, '#141c3a');

  // The willow on the left, one long branch only on the left.
  rect(ctx, 52, 150, 16, 110, '#4a3524');
  ctx.strokeStyle = '#3f8a4b';
  ctx.lineWidth = 3;
  const branches = [[60, 160, 30, 210], [68, 150, 50, 205], [64, 170, 44, 220], [96, 210, 80, 250]];
  for (let i = 0; i < branches.length; i += 1) {
    if (right && i === 3) continue;
    const [bx, by, ex, ey] = branches[i];
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(bx - 14, (by + ey) / 2, ex, ey);
    ctx.stroke();
  }
  ellipse(ctx, 60, 140, 46, 30, '#3f8a4b');
  ellipse(ctx, 96, 150, 34, 24, '#4d9a55');

  // Fireflies drifting over the pond; one only glows on the left.
  const flies = [[180, 120], [252, 148], [320, 110], [280, 180], [210, 200], [360, 150]];
  for (let i = 0; i < flies.length; i += 1) {
    if (right && i === 1) continue;
    circle(ctx, flies[i][0], flies[i][1], 3.5, '#ffe066');
    circle(ctx, flies[i][0], flies[i][1], 8, 'rgba(255, 224, 102, 0.25)');
  }

  // The arched bridge with its planks; one plank missing on the right.
  ctx.strokeStyle = '#6b4a2e';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(280, 330, 130, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.strokeStyle = '#8a6a44';
  ctx.lineWidth = 4;
  for (let i = 0; i < 9; i += 1) {
    const a = Math.PI * 1.18 + (i * Math.PI * 0.64) / 8;
    const px = 280 + Math.cos(a) * 130;
    const py = 330 + Math.sin(a) * 130;
    if (right && i === 4) continue;
    ctx.beginPath();
    ctx.moveTo(px - 8, py - 4);
    ctx.lineTo(px + 8, py - 4);
    ctx.stroke();
  }

  // Stepping stones across the grass; one missing on the right.
  const stones = [[100, 318], [148, 336], [200, 350]];
  for (let i = 0; i < stones.length; i += 1) {
    if (right && i === 1) continue;
    ellipse(ctx, stones[i][0], stones[i][1], 18, 8, '#8a8a7a');
  }

  // Koi in the pond: three on the left, two on the right.
  const koi = [[230, 335, '#ff8a3d'], [330, 348, '#fff4e0'], [395, 365, '#ff5a4e']];
  for (let i = 0; i < koi.length; i += 1) {
    if (right && i === 1) continue;
    const [kx, ky, kc] = koi[i];
    ellipse(ctx, kx, ky, 16, 7, kc);
    poly(ctx, [[kx + 14, ky], [kx + 24, ky - 6], [kx + 24, ky + 6]], kc);
    circle(ctx, kx - 10, ky - 2, 2, '#1a2340');
  }

  // Lily pads: one fewer on the right. The frog sits on one, left only.
  const pads = [[250, 390], [320, 375], [372, 384], [420, 395]];
  for (let i = 0; i < pads.length; i += 1) {
    if (right && i === 2) continue;
    ellipse(ctx, pads[i][0], pads[i][1], 20, 8, '#3f8a4b');
  }
  if (!right) {
    ellipse(ctx, 196, 362, 18, 7, '#3f8a4b');
    circle(ctx, 196, 356, 10, '#7ddc8a');
    circle(ctx, 190, 348, 4, '#7ddc8a');
    circle(ctx, 202, 348, 4, '#7ddc8a');
    circle(ctx, 189, 347, 1.5, '#1a2340');
    circle(ctx, 201, 347, 1.5, '#1a2340');
  }

  // The butterfly over the flower bed, left picture only.
  if (!right) {
    ellipse(ctx, 156, 296, 7, 10, '#c98aff');
    ellipse(ctx, 168, 296, 7, 10, '#c98aff');
    ellipse(ctx, 158, 308, 5, 7, '#a85aff');
    ellipse(ctx, 166, 308, 5, 7, '#a85aff');
    ctx.strokeStyle = '#3a2f55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(162, 292);
    ctx.lineTo(162, 308);
    ctx.stroke();
  }

  // Tulips along the bottom: the middle one red on the left, white on the right.
  const tulips = [[80, 384], [118, 384], [150, 384]];
  for (let i = 0; i < tulips.length; i += 1) {
    const tx = tulips[i][0];
    const ty = tulips[i][1];
    ctx.strokeStyle = '#3f8a4b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, ty + 18);
    ctx.stroke();
    const col = i === 1 && right ? '#fff4e0' : i === 1 ? '#e84a3d' : '#ff8ab0';
    circle(ctx, tx, ty - 4, 8, col);
    poly(ctx, [[tx - 8, ty - 4], [tx, ty - 14], [tx + 8, ty - 4]], col);
  }

  // The stone lantern by the pond: its flame burns on the left only.
  rect(ctx, 474, 268, 16, 30, '#6a6a72');
  rect(ctx, 466, 258, 32, 10, '#7a7a82');
  poly(ctx, [[462, 258], [502, 258], [492, 242], [472, 242]], '#7a7a82');
  if (!right) {
    circle(ctx, 482, 252, 6, '#ffb84d');
    circle(ctx, 482, 252, 12, 'rgba(255, 184, 77, 0.3)');
  } else {
    circle(ctx, 482, 252, 5, '#3a3a44');
  }

  // Pond ripples.
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 320, 50], [430, 330, 60], [300, 400, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 5, wx + wl, wy);
    ctx.stroke();
  }
}

/**
 * Draw set `setIndex` into the current canvas transform, variant 0 for the
 * left picture and 1 for the right picture with the differences applied.
 */
export function drawScene(ctx, setIndex, variant) {
  const right = variant === 1;
  if (setIndex === 0) drawHarbour(ctx, right);
  else if (setIndex === 1) drawMarket(ctx, right);
  else drawGarden(ctx, right);
}
