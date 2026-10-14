// Generated from the two geometry scripts in gridfinity_generator_4.html.

// =====================================================================
// Gridfinity parts bin with a stackable lid. Geometry core.
// Pure functions, no DOM. Emits triangle soups ready for STL or WebGL.
//
// Architecture, taken from the reference model:
//   Bin  an ordinary gridfinity bin. Scoop fillet on one wall, sloped
//        label ramp on the opposite wall ending in a shelf with a
//        recessed pad, stacking lip with a snap groove cut into its
//        pocket wall and a rounded tip.
//   Lid  a short gridfinity module. Feet underneath carry a half round
//        snap bead and plug into the bin's lip pocket. A full lip
//        pocket per cell on top, so the stack continues. An optional
//        window over each label pad.
// =====================================================================

const GRID    = 42.0;   // cell pitch
const CLEAR   = 0.5;    // total footprint clearance per cell
const R_OUT   = 4.0;    // outer corner radius at the widest section
const HU      = 7.0;    // height unit
const H_BASE  = 4.75;   // 0.8 + 1.8 + 2.15
const LIP_H   = 4.40;   // stacking lip, 1.9 + 1.8 + 0.7
const POCKET0 = 2.60;   // lip pocket inset at the body top
const POCKET1 = 1.90;   // lip pocket inset through its vertical band
const LIP_A   = 0.70;   // lower chamfer of the lip pocket
const LIP_B   = 1.80;   // vertical band of the lip pocket
const SEAT    = 0.35;   // a foot sits this far below the body top it rests on

const BASE_PROFILE = [
  [0.00, 2.95],
  [0.80, 2.15],
  [2.60, 2.15],
  [4.75, 0.00],
];

// ---------------------------------------------------------------------
// Rounded rectangle rings.
//
// A ring is a rounded rectangle with independent bounds and independent
// corner radii. Every ring at a different inset is an inward offset of
// the same nominal rectangle, which keeps the corner arc centers fixed,
// so rings correspond point for point and lofting between them is
// exact. Two rings built with the same sample counts also correspond,
// which is how annuli between unlike rectangles are stitched.
// ---------------------------------------------------------------------

// radii order: TR, TL, BL, BR
function rrSpec(x0, x1, y0, y1, radii, step, cornerSegs, counts) {
  const [rTR, rTL, rBL, rBR] = radii;
  const s = [];
  const edge = (axis, fix, a0, a1, n) => {
    const len = Math.abs(a1 - a0);
    for (let i = 0; i < n; i++) {
      s.push({ t: 'e', axis, u: i / n, len, s: (i / n) * len, a0, a1 });
    }
  };
  const corner = (cx, cy, r, deg0) => {
    for (let j = 0; j < cornerSegs; j++) {
      s.push({ t: 'c', cx, cy, r0: r, a: (deg0 + (j / cornerSegs) * 90) * Math.PI / 180 });
    }
  };
  const eXp = [y0 + rBR, y1 - rTR];   // +X edge, varies in y
  const eYp = [x1 - rTR, x0 + rTL];   // +Y edge, varies in x
  const eXn = [y1 - rTL, y0 + rBL];   // -X edge, varies in y
  const eYn = [x0 + rBL, x1 - rBR];   // -Y edge, varies in x
  const nX = counts && counts.nX ? counts.nX : Math.max(4, Math.ceil(Math.abs(eXp[1] - eXp[0]) / step));
  const nY = counts && counts.nY ? counts.nY : Math.max(4, Math.ceil(Math.abs(eYp[1] - eYp[0]) / step));

  edge('+X', x1, eXp[0], eXp[1], nX); corner(x1 - rTR, y1 - rTR, rTR, 0);
  edge('+Y', y1, eYp[0], eYp[1], nY); corner(x0 + rTL, y1 - rTL, rTL, 90);
  edge('-X', x0, eXn[0], eXn[1], nX); corner(x0 + rBL, y0 + rBL, rBL, 180);
  edge('-Y', y0, eYn[0], eYn[1], nY); corner(x1 - rBR, y0 + rBR, rBR, 270);
  return { specs: s, x0, x1, y0, y1, radii, nX, nY };
}

function rectSpec(hx, hy, r, step, cornerSegs, counts) {
  return rrSpec(-hx, hx, -hy, hy, [r, r, r, r], step, cornerSegs, counts);
}

function rrPoints(rs, inset, offFn) {
  const sp0 = rs.specs, n = sp0.length, out = new Array(n);
  for (let i = 0; i < n; i++) {
    const sp = sp0[i];
    const off = offFn ? offFn(sp) : 0;
    if (sp.t === 'e') {
      const d = inset - off;
      const v = sp.a0 + sp.u * (sp.a1 - sp.a0);
      if (sp.axis === '+X') out[i] = [rs.x1 - d, v];
      else if (sp.axis === '-X') out[i] = [rs.x0 + d, v];
      else if (sp.axis === '+Y') out[i] = [v, rs.y1 - d];
      else out[i] = [v, rs.y0 + d];
    } else {
      const r = Math.max(0.01, sp.r0 - inset + off);
      out[i] = [sp.cx + r * Math.cos(sp.a), sp.cy + r * Math.sin(sp.a)];
    }
  }
  return out;
}

// Position along the ring's own flat, in world units, used by the run
// functions. Corners report their centre so a run never spills into one.
function spPos(sp) {
  if (sp.t === 'e') {
    const v = sp.a0 + sp.u * (sp.a1 - sp.a0);
    return v;
  }
  return (sp.axis === '+X' || sp.axis === '-X') ? sp.cy : sp.cx;
}
function spAlong(sp) {
  if (sp.t === 'e') return (sp.axis === '+X' || sp.axis === '-X') ? 'y' : 'x';
  return null;
}

// ---------------------------------------------------------------------
// Offset functions
// ---------------------------------------------------------------------

// A run of length `len` centred on every cell centre, on all four flats.
// Corners are excluded outright, which is the relief that lets the flat
// panels bow instead of the whole loop having to stretch.
function runFn(centresX, centresY, len, ramp) {
  return function (sp) {
    if (sp.t !== 'e') return 0;
    const along = (sp.axis === '+X' || sp.axis === '-X') ? 'y' : 'x';
    const list = along === 'y' ? centresY : centresX;
    const p = spPos(sp);
    let best = 0;
    for (let k = 0; k < list.length; k++) {
      const d = len / 2 - Math.abs(p - list[k]);
      if (d <= 0) continue;
      const w = ramp > 0 ? Math.min(1, d / ramp) : 1;
      if (w > best) best = w;
    }
    // stay clear of the corner arcs
    const lo = Math.min(sp.a0, sp.a1), hi = Math.max(sp.a0, sp.a1);
    const m = Math.min(p - lo, hi - p);
    if (m < 0.6) best *= Math.max(0, m / 0.6);
    return best;
  };
}

// Weight that is 1 on the named flat and falls off through the corner
// arcs by the arc's own normal, so a one wall fillet blends round the
// corner instead of stopping dead.
function facesFn(list) {
  const fns = list.map(faceFn);
  return function (sp) {
    let m = 0;
    for (let i = 0; i < fns.length; i++) { const v = fns[i](sp); if (v > m) m = v; }
    return m > 1 ? 1 : m;
  };
}
function scoopFaces(mode) {
  if (mode === 'four') return ['-Y', '+Y', '-X', '+X'];
  if (mode === 'both') return ['-Y', '+Y'];
  return ['-Y'];
}
function faceFn(axis) {
  const dir = { '+X': [1, 0], '-X': [-1, 0], '+Y': [0, 1], '-Y': [0, -1] }[axis];
  return function (sp) {
    if (sp.t === 'e') return sp.axis === axis ? 1 : 0;
    const c = Math.cos(sp.a), s = Math.sin(sp.a);
    const w = c * dir[0] + s * dir[1];
    return w > 0 ? w : 0;
  };
}

// ---------------------------------------------------------------------
// Mesh assembly
// ---------------------------------------------------------------------

function Mesh() { return { tri: [] }; }
function push3(m, a, b, c) { m.tri.push([a, b, c]); }

function stitch(m, L, zL, U, zU, flip) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = [L[i][0], L[i][1], zL], b = [L[j][0], L[j][1], zL];
    const c = [U[j][0], U[j][1], zU], d = [U[i][0], U[i][1], zU];
    if (!flip) { push3(m, a, b, c); push3(m, a, c, d); }
    else { push3(m, a, c, b); push3(m, a, d, c); }
  }
}

// Same as stitch but each ring carries its own per point height.
function stitchZ(m, L, zL, U, zU, flip) {
  const n = L.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const a = [L[i][0], L[i][1], zL[i]], b = [L[j][0], L[j][1], zL[j]];
    const c = [U[j][0], U[j][1], zU[j]], d = [U[i][0], U[i][1], zU[i]];
    if (!flip) { push3(m, a, b, c); push3(m, a, c, d); }
    else { push3(m, a, c, b); push3(m, a, d, c); }
  }
}

function capFan(m, R, z, up) {
  let cx = 0, cy = 0;
  for (let i = 0; i < R.length; i++) { cx += R[i][0]; cy += R[i][1]; }
  cx /= R.length; cy /= R.length;
  for (let i = 0; i < R.length; i++) {
    const j = (i + 1) % R.length;
    const c = [cx, cy, z];
    const a = [R[i][0], R[i][1], z], b = [R[j][0], R[j][1], z];
    if (up) push3(m, c, a, b); else push3(m, c, b, a);
  }
}

// Fan cap onto a plane z = f(x, y). Only valid for convex rings.
function capFanPlane(m, R, zf, up) {
  let cx = 0, cy = 0;
  for (let i = 0; i < R.length; i++) { cx += R[i][0]; cy += R[i][1]; }
  cx /= R.length; cy /= R.length;
  for (let i = 0; i < R.length; i++) {
    const j = (i + 1) % R.length;
    const c = [cx, cy, zf(cx, cy)];
    const a = [R[i][0], R[i][1], zf(R[i][0], R[i][1])];
    const b = [R[j][0], R[j][1], zf(R[j][0], R[j][1])];
    if (up) push3(m, c, a, b); else push3(m, c, b, a);
  }
}

function annulus(m, I, O, z, up) {
  const n = I.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const i0 = [I[i][0], I[i][1], z], i1 = [I[j][0], I[j][1], z];
    const o0 = [O[i][0], O[i][1], z], o1 = [O[j][0], O[j][1], z];
    if (up) { push3(m, i0, o0, o1); push3(m, i0, o1, i1); }
    else { push3(m, i0, o1, o0); push3(m, i0, i1, o1); }
  }
}

function loft(m, rs, levels, flip, mkOff) {
  for (let k = 0; k < levels.length - 1; k++) {
    const A = levels[k], B = levels[k + 1];
    const oA = (A.off||0)+(A.scoop||0), oB = (B.off||0)+(B.scoop||0);
    if (Math.abs(B.z-A.z)<1e-9 && Math.abs(B.inset-A.inset)<1e-9 && Math.abs(oB-oA)<1e-9) continue;
    stitch(m, rrPoints(rs, A.inset, mkOff ? mkOff(A) : null), A.z,
              rrPoints(rs, B.inset, mkOff ? mkOff(B) : null), B.z, flip);
  }
}

// ---------------------------------------------------------------------
// Rounded lip tip
//
// The lip would run out to a knife edge at `apex`. A fillet of radius r
// tangent to the outer vertical face and to the inner 45 degree face
// blunts it. Centre sits at inset r and z = apex - r(1 + sqrt2), so the
// top of the part lands at apex - r*sqrt2.
// ---------------------------------------------------------------------

function tipLevels(apex, r, segs) {
  const zc = apex - r * (1 + Math.SQRT2);
  const out = [];
  segs = Math.max(3, Math.round(segs / 3) * 3);
  for (let i = 0; i <= segs; i++) {
    const th = (i / segs) * (Math.PI * 0.75);   // 0 to 135 degrees
    out.push({ z: zc + r * Math.sin(th), inset: r - r * Math.cos(th) });
  }
  return out;   // starts at (inset 0, zc), ends at (inset r + r/sqrt2, ...)
}
function tipTop(apex, r) { return apex - r * Math.SQRT2; }

// ---------------------------------------------------------------------
// Derived dimensions clamp individual settings. requireValid checks known
// incompatible combinations before builds; arbitrary geometry is not proven valid.
// ---------------------------------------------------------------------

function cellCentres(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push((i - (n - 1) / 2) * GRID);
  return a;
}

function derive(p) {
  const HX = (GRID * p.nx - CLEAR) / 2;
  const HY = (GRID * p.ny - CLEAR) / 2;
  const H  = HU * p.hu;                       // body height
  const apex = H + LIP_H;                     // theoretical lip knife edge
  const lipR = p.lip ? Math.max(0, Math.min(p.lipRound, 1.2)) : 0;
  const lipT = p.lip ? Math.max(0.2, Math.min(p.lipTip, 2.0)) : 0;
  const binTop = !p.lip ? H
               : p.lipTipStyle === 'round' ? tipTop(apex, lipR)
               : p.lipTipStyle === 'flat'  ? apex - lipT : apex;

  const wall = Math.max(0.6, Math.min(p.wall, POCKET0 - 0.4));
  const floorT = Math.max(0.6, p.floorT);
  const floorTop = H_BASE + floorT;

  // bore: straight wall, then a 45 degree flare out to the pocket inset
  const flareEnd = H - wall;
  const flareStart = H - POCKET0;

  // snap. The lid seats SEAT below the body top, so the foot's vertical
  // band lands at H - SEAT + 0.8 .. H - SEAT + 2.6 in bin coordinates.
  const beadR = Math.max(0.2, Math.min(p.beadR, 0.9));
  const beadC = 0.8 + (2.6 - 0.8) / 2;         // 1.7, centre of the foot band
  const grooveZ0 = H - SEAT + (beadC - beadR) - p.grooveClear;
  const grooveZ1 = H - SEAT + (beadC + beadR) + p.grooveClear;
  const grooveInset = Math.max(0.35, POCKET1 - p.grooveDepth);
  const lipWallMin = grooveInset;

  // scoop
  const openX = GRID * p.nx - CLEAR - 2 * wall;
  const openY = GRID * p.ny - CLEAR - 2 * wall;
  const scoop = p.scoop <= 0.05 ? 0 : Math.max(0, Math.min(p.scoop,
      Math.min(openX, openY) - 2, flareStart - floorTop - 1));

  // label
  const padW = p.labelW + 2 * p.labelClear;
  const padH = p.labelH + 2 * p.labelClear;
  const padR = Math.max(0.5, Math.min(p.padR, Math.min(padW, padH) / 2 - 0.2));
  const tabW0 = padW + 2 * p.labelBorder;
  const tabD  = padH + 2 * p.labelBorder;
  const tabW  = Math.min(tabW0, GRID - CLEAR - 2 * POCKET0 - 0.4);
  const zTop  = H - p.tabDrop;                 // shelf top
  const zFace = zTop - p.tabFace;              // bottom of the shelf front face
  const yWallTop = HY - POCKET0;               // wall face at shelf height
  const yInner = yWallTop - tabD;
  const tabOut = HY - wall + 0.4;              // ramp buried this far into the wall
  const drop = (tabOut - yInner);
  let tabAngle = Math.max(30, Math.min(p.tabAngle, 80));
  let zRampWall = zFace - drop * Math.tan(tabAngle * Math.PI / 180);
  if (zRampWall < floorTop + 0.5) {            // steepen so it lands on the floor
    tabAngle = Math.atan((zFace - floorTop - 0.5) / drop) * 180 / Math.PI;
    zRampWall = floorTop + 0.5;
  }

  const labelOn = p.labelMode !== 'off' && p.nx >= 1;
  const cols = [];
  if (labelOn) {
    if (p.labelMode === 'all') for (let i = 0; i < p.nx; i++) cols.push(i);
    else cols.push(Math.max(0, Math.min(p.labelCol - 1, p.nx - 1)));
  }
  // an all columns run merges into one continuous ramp
  const rampW = (p.labelMode === 'all' && p.nx > 1) ? GRID : tabW;

  // lid
  const lidBody = Math.max(POCKET0, p.lidBody);
  const lidApex = H_BASE + lidBody + LIP_H;
  const lidTop = tipTop(lidApex, lipR);
  const lidBodyTop = H_BASE + lidBody;
  const lidChamfer = Math.max(0, Math.min(p.lidChamfer, lidBody - LIP_A - 0.2));
  const lidFloorInset = POCKET0 + lidChamfer;

  // window
  const winLedge = Math.max(0.2, Math.min(p.winLedge, H_BASE - 1.0));
  const winGrow = H_BASE - winLedge;

  return {
    HX, HY, H, apex, binTop, lipR, lipT, wall, floorT, floorTop,
    flareStart, flareEnd, openX, openY, scoop,
    beadR, beadC, grooveZ0, grooveZ1, grooveInset, lipWallMin,
    padW, padH, padR, tabW, tabD, rampW, zTop, zFace, yWallTop, yInner,
    tabOut, tabAngle, zRampWall, labelOn, cols,
    lidBody, lidApex, lidTop, lidBodyTop, lidChamfer, lidFloorInset,
    winLedge, winGrow,
    usableDepth: H - SEAT - floorTop,
    rampDepth: (labelOn ? Math.min(H - SEAT, zRampWall) : H - SEAT) - floorTop,
    footSeg: p.seg * Math.max(1, Math.sqrt(p.nx * p.ny) / 1.5),
    snapDeflect: beadR - (2.15 - POCKET1) - p.stackClear,
    grooveWall: grooveInset,
    cx: cellCentres(p.nx), cy: cellCentres(p.ny),
  };
}

// Solids overlap by design; no Boolean union is performed here. These
// heuristic overlap corrections produce an approximate solid-material
// estimate whose accuracy has not been calibrated against sliced mass.
function rectArea(hx, hy, r) { return 4 * hx * hy - (4 - Math.PI) * r * r; }

function overlapBin(p, d) {
  const fh = (GRID - CLEAR) / 2;
  let v = p.nx * p.ny * rectArea(fh - 0.2, fh - 0.2, R_OUT - 0.2) * 0.60;
  if (d.labelOn) {
    const ov = d.tabOut - (d.HY - d.wall);
    const yMid = d.HY - d.wall + ov / 2;
    const hMid = d.zTop - (d.zFace - (yMid - d.yInner) * Math.tan(d.tabAngle * Math.PI / 180));
    v += d.cols.length * Math.max(0, ov) * d.rampW * Math.max(0, hMid);
  }
  return v;
}

function overlapLid(p, d) {
  let v = (rectArea(d.HX - 0.35, d.HY - 0.35, R_OUT - 0.35)
         - rectArea(d.HX - d.lidFloorInset, d.HY - d.lidFloorInset, Math.max(0.1, R_OUT - d.lidFloorInset))) * 0.30;
  const rw = 0.5 + 2 * d.lidFloorInset;
  let area = 0;
  const prof = [[H_BASE - 0.30, 0.25 + d.lidFloorInset], [H_BASE, 0.25 + d.lidFloorInset],
                [H_BASE + d.lidChamfer, 0.25 + POCKET0], [d.lidBodyTop, 0.25 + POCKET0],
                [d.lidBodyTop + LIP_A, 0.25 + POCKET1], [d.lidBodyTop + LIP_A + LIP_B, 0.25 + POCKET1],
                [d.lidTop, 0.25 + d.lipR * Math.SQRT2]];
  for (let i = 0; i < prof.length - 1; i++) area += (prof[i][1] + prof[i + 1][1]) * (prof[i + 1][0] - prof[i][0]);
  const nrib = (p.nx - 1) * (2 * d.HY - 0.4) + (p.ny - 1) * (2 * d.HX - 0.4);
  v += nrib * rw * 0.30;
  v += ((p.nx - 1) * 2 + (p.ny - 1) * 2) * area * (d.lidFloorInset + 0.2);
  return v;
}

// ---------------------------------------------------------------------
// Slotted tray. A gridfinity bin whose cavity is filled with a run of
// parallel ribs, so it holds tubes, cartridges or blades on edge. The
// slots run front to back and are distributed across the width; a
// half round finger cut across the middle lets you get under one, and
// each slot can carry a raised label on the front border.
// ---------------------------------------------------------------------

function deriveTray(p) {
  const nx = p.trayDir === 'x' ? p.ny : p.nx;
  const ny = p.trayDir === 'x' ? p.nx : p.ny;
  const HX = (GRID * nx - CLEAR) / 2;
  const HY = (GRID * ny - CLEAR) / 2;
  const H = HU * p.hu;
  const apex = H + LIP_H;
  const lipR = p.lip ? Math.max(0, Math.min(p.lipRound, 1.2)) : 0;
  const lipT = p.lip ? Math.max(0.2, Math.min(p.lipTip, 2.0)) : 0;
  const binTop = !p.lip ? H
               : p.lipTipStyle === 'round' ? tipTop(apex, lipR)
               : p.lipTipStyle === 'flat'  ? apex - lipT : apex;

  const wall = Math.max(0.6, Math.min(p.wall, POCKET0 - 0.4));
  const floorTop = H_BASE + Math.max(0.6, p.floorT);

  const side = Math.max(wall, Math.min(p.sideBorder, HX - 6));
  const front = Math.max(wall, Math.min(p.frontBorder, HY - 6));
  const back = Math.max(wall, Math.min(p.backBorder, HY - front - 4));
  const xs0 = -HX + side, xs1 = HX - side;
  const yFront = -HY + front, yBack = HY - back;
  const avail = xs1 - xs0;

  const slotW = Math.max(1.0, Math.min(p.slotW, avail));
  const nMax = Math.max(1, Math.floor((avail + 0.001) / slotW));
  const nSlots = Math.max(1, Math.min(Math.round(p.slots), nMax));
  const ribW = nSlots > 1 ? (avail - nSlots * slotW) / (nSlots - 1) : 0;
  const pitch = slotW + ribW;

  const ribTop = H;
  const chamfer = nSlots > 1
    ? Math.max(0, Math.min(p.ribChamfer, (ribW - 0.4) / 2, ribTop - floorTop - 0.6))
    : 0;
  const chamferStart = ribTop - chamfer;

  // cradle: a circular trough in the bottom of every slot, tangent to
  // the floor, so a round barrel beds down instead of rattling in a
  // square channel.
  const round = p.slotBottom === 'round';
  const cradR = round ? Math.max(slotW / 2, Math.min(p.cradleR > 0.01 ? p.cradleR : slotW / 2, 20 * slotW)) : 0;
  const cradZ = floorTop + cradR;
  const cradTop = round ? cradZ - Math.sqrt(Math.max(0, cradR * cradR - slotW * slotW / 4)) : floorTop;
  const cradDepth = round ? cradTop - floorTop : 0;

  const cutR = Math.max(0, Math.min(p.cutR, avail / 2, (yBack - yFront) / 2 - 0.5));
  const cutY = Math.max(yFront + cutR + 0.5, Math.min(p.cutY, yBack - cutR - 0.5));
  const cutWeb = Math.max(0.4, Math.min(p.cutWeb, ribTop - floorTop - 1.0));
  const cutZ = floorTop + cutWeb + cutR;
  const cutOn = p.cut && cutR > 0.5 && cutZ - cutR > floorTop + 0.2;

  const slots = [];
  for (let i = 0; i < nSlots; i++) slots.push({ x0: xs0 + i * pitch, x1: xs0 + i * pitch + slotW });

  return {
    nx, ny, HX, HY, H, apex, binTop, lipR, lipT, wall, floorTop,
    side, front, back, xs0, xs1, yFront, yBack, avail,
    slotW, nSlots, nMax, ribW, pitch, slots,
    ribTop, chamfer, chamferStart,
    round, cradR, cradZ, cradTop, cradDepth,
    cutR, cutY, cutWeb, cutZ, cutOn,
    depth: ribTop - floorTop,
    cutDepth: cutOn ? ribTop - (cutZ - cutR) : 0,
    cx: cellCentres(nx), cy: cellCentres(ny),
  };
}

function overlapTray(p, d) {
  const fh = (GRID - CLEAR) / 2;
  let v = d.nx * d.ny * rectArea(fh - 0.2, fh - 0.2, R_OUT - 0.2) * 0.60;
  const per = 2 * (2 * d.HX - 2 * (d.wall - 0.2)) + 2 * (2 * d.HY - 2 * (d.wall - 0.2));
  v += per * 0.2 * (d.ribTop - d.floorTop);
  v += (rectArea(d.HX - d.wall + 0.2, d.HY - d.wall + 0.2, R_OUT) - (d.xs1 - d.xs0) * (d.yBack - d.yFront)) * 0.2;
  if (d.cutOn) v += Math.max(0, d.nSlots - 1) * d.ribW * (d.yBack - d.yFront) * (d.cutZ - d.cutR - d.floorTop + 0.2);
  return v;
}

function warningsTray(p) {
  const d = deriveTray(p);
  const w = [];
  if (d.nSlots > 1 && d.ribW < 2 * p.lineW) w.push('Ribs come out ' + d.ribW.toFixed(2) + ' mm, thinner than two extrusion widths. Use fewer slots or a narrower slot.');
  if (d.nSlots > 1 && d.ribW > d.slotW) w.push('Ribs are wider than the slots. That is a lot of wasted width.');
  if (p.slots > d.nMax) w.push('Only ' + d.nMax + ' slots of that width fit. The count has been trimmed.');
  if (d.side < p.sideBorder - 0.01 || d.front < p.frontBorder - 0.01) w.push('Borders trimmed to fit the footprint.');
  if (d.depth < 3) w.push('Slots are only ' + d.depth.toFixed(1) + ' mm deep. Add height units or thin the floor.');
  if (p.trayText && d.front < p.textH + 0.4) w.push('Front border is too narrow for ' + p.textH.toFixed(1) + ' mm labels. Widen it or shrink the text.');
  if (d.cutOn && d.cutR > (d.yBack - d.yFront) / 2 - 0.51) w.push('Finger cut trimmed to fit between the borders.');
  if (d.round && d.cradDepth > d.depth - 1.0) w.push('Cradle is deeper than the slot. Add height units or use a larger cradle radius.');
  if (d.round && p.cradleR > 0.01 && p.cradleR < d.slotW / 2 - 0.01) w.push('Cradle radius raised to ' + d.cradR.toFixed(1) + ' mm, half the slot width, since a smaller arc cannot span the slot.');
  if (p.wall < 2 * p.lineW) w.push('Bin wall is thinner than two extrusion widths.');
  return w;
}

function warnings(p) {
  const d = derive(p);
  const w = [];
  if (d.flareStart <= d.floorTop + 2) w.push('Bin is too short for this floor thickness. Add height units.');
  if (d.labelOn && d.yInner < -d.HY + POCKET0 + 2) w.push('Label is deeper than the bin. Reduce the label height or the border.');
  if (d.labelOn && d.zRampWall <= d.floorTop + 0.6) w.push('Label ramp reaches the floor and has been steepened to ' + d.tabAngle.toFixed(0) + ' degrees.');
  if (d.labelOn && d.tabW < d.padW + 2 * p.labelBorder - 0.01) w.push('Label is wider than one cell and has been trimmed.');
  if (p.snap && d.snapDeflect <= 0.1) w.push('Snap deflection is only ' + d.snapDeflect.toFixed(2) + ' mm. The estimated grip is low; check a printed pair.');
  if (p.snap && d.snapDeflect > 0.85) w.push('Snap deflection is ' + d.snapDeflect.toFixed(2) + ' mm. The estimated click may be stiff; check a printed pair.');
  if (d.grooveWall < 1.2 * p.lineW) w.push('Groove leaves only ' + d.grooveWall.toFixed(2) + ' mm of lip wall, thinner than the nozzle prints cleanly.');
  if (d.scoop < p.scoop - 0.01 && p.scoop > 0.05) w.push('Scoop radius reduced to ' + d.scoop.toFixed(1) + ' mm to fit the bin.');
  if (p.wall < 2 * p.lineW) w.push('Bin wall is thinner than two extrusion widths.');
  if (p.beadLen > GRID - CLEAR - 2 * R_OUT - 4) w.push('Snap bead is too long for the flat and has been shortened.');
  if (p.grooveLen < p.beadLen + 1.5) w.push('Groove is barely longer than the bead. The lid may bind; check a printed pair.');
  return w;
}



// =====================================================================
// Builders assemble overlapping component shells. A slicer may merge or
// repair them, but treatment must be checked in its layer preview. Signed
// volume orients each component; it does not prove consistent winding,
// manifold aggregate topology or absence of intersections.
// =====================================================================

function volumeOf(m) {
  let v = 0;
  for (let k = 0; k < m.tri.length; k++) {
    const t = m.tri[k], a = t[0], b = t[1], c = t[2];
    v += (a[0] * (b[1] * c[2] - b[2] * c[1])
        - a[1] * (b[0] * c[2] - b[2] * c[0])
        + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
  }
  return v;
}

// Build a closed solid into its own mesh, orient it outward, append it.
function solid(dst, fn, tag) {
  const m = Mesh();
  fn(m);
  if (volumeOf(m) < 0) for (let i = 0; i < m.tri.length; i++) { const t = m.tri[i]; const s = t[1]; t[1] = t[2]; t[2] = s; }
  for (let i = 0; i < m.tri.length; i++) dst.tri.push(m.tri[i]);
  return m;
}

function offMaker(runs) {
  // runs: [{key, fn, sign}] evaluated against the level's named amounts
  return function (lv) {
    let any = false;
    for (let i = 0; i < runs.length; i++) if (lv[runs[i].key]) any = true;
    if (!any) return null;
    return function (sp) {
      let v = 0;
      for (let i = 0; i < runs.length; i++) {
        const a = lv[runs[i].key];
        if (a) v += runs[i].sign * a * runs[i].fn(sp);
      }
      return v;
    };
  };
}

// The three ways to finish the knife edge at the top of a stacking lip.
function pushTip(L, apex, style, r, t) {
  if (style === 'round' && r > 0.01) {
    L.push({ z: apex - r * (1 + Math.SQRT2), inset: 0 });
    const tl = tipLevels(apex, r, 9);
    for (let i = 1; i < tl.length; i++) L.push(tl[i]);
  } else if (style === 'flat') {
    L.push({ z: apex - t, inset: 0 });
    L.push({ z: apex - t, inset: t });
  } else {
    L.push({ z: apex, inset: 0 });
  }
}

// 1 on the listed straight edges, 0 everywhere else including corners.
function edgeFn(list) {
  return function (sp) { return sp.t === 'e' && list.indexOf(sp.axis) >= 0 ? 1 : 0; };
}

// A plain rectangle ring, coarsely sampled, for box lofts.
function boxRing(x0, x1, y0, y1) {
  return rrPoints(rrSpec(x0, x1, y0, y1, [0.01, 0.01, 0.01, 0.01], 1e6, 1, { nX: 2, nY: 2 }), 0, null);
}

// ---------------------------------------------------------------------
// Raised text. The string is rasterised on a canvas, the filled pixels
// are packed into maximal rectangles, and each rectangle becomes a box.
// Letter counters fall out for free, which a contour based approach
// would have to triangulate around.
// ---------------------------------------------------------------------

const TEXT_FONT = '"Helvetica Neue",Helvetica,Arial,sans-serif';

function textRects(str, capH) {
  if (typeof document === 'undefined' || !str) return [];
  const S = 72;
  const c = document.createElement('canvas');
  let g = c.getContext('2d');
  g.font = '700 ' + S + 'px ' + TEXT_FONT;
  c.width = Math.max(8, Math.ceil(g.measureText(str).width) + 60);
  c.height = Math.ceil(S * 2.0);
  g = c.getContext('2d');
  g.font = '700 ' + S + 'px ' + TEXT_FONT;
  g.textBaseline = 'alphabetic';
  g.fillStyle = '#000';
  g.fillText(str, 30, S * 1.4);
  const W = c.width, Hh = c.height;
  const img = g.getImageData(0, 0, W, Hh).data;
  const on = new Uint8Array(W * Hh);
  let x0 = W, x1 = -1, y0 = Hh, y1 = -1;
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    if (img[(y * W + x) * 4 + 3] > 128) {
      on[y * W + x] = 1;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (x1 < x0) return [];
  const s = capH / (y1 - y0 + 1);
  const cxp = (x0 + x1 + 1) / 2, cyp = (y0 + y1 + 1) / 2;
  const rects = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!on[y * W + x]) continue;
      let xe = x; while (xe + 1 <= x1 && on[y * W + xe + 1]) xe++;
      let ye = y;
      grow: while (ye + 1 <= y1) {
        for (let k = x; k <= xe; k++) if (!on[(ye + 1) * W + k]) break grow;
        ye++;
      }
      for (let j = y; j <= ye; j++) for (let k = x; k <= xe; k++) on[j * W + k] = 0;
      rects.push([(x - cxp) * s, (xe + 1 - cxp) * s, (cyp - (ye + 1)) * s, (cyp - y) * s]);
      x = xe;
    }
  }
  return rects;
}

function addTextSolid(dst, rects, cx, cy, z0, z1, scale) {
  const e = 0.004;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    const ax = cx + r[0] * scale - e, bx = cx + r[1] * scale + e;
    const ay = cy + r[2] * scale - e, by = cy + r[3] * scale + e;
    solid(dst, m => {
      const lo = boxRing(ax, bx, ay, by);
      stitch(m, lo, z0, lo, z1, false);
      capFan(m, lo, z0, false);
      capFan(m, lo, z1, true);
    }, 'text');
  }
}

// ---------------------------------------------------------------------
// Slotted tray
// ---------------------------------------------------------------------

function buildTray(p) {
  requireValid(p, "tray");
  const d = deriveTray(p);
  const out = Mesh();
  const rs = rectSpec(d.HX, d.HY, R_OUT, p.seg, p.cornerSegs);

  // shell: outer skin, lip, bore, floor
  const L = [];
  L.push({ z: H_BASE - 0.30, inset: 0.35 });
  L.push({ z: H_BASE - 0.05, inset: 0 });
  if (p.lip) {
    pushTip(L, d.apex, p.lipTipStyle, d.lipR, d.lipT);
    L.push({ z: d.H + LIP_A + LIP_B, inset: POCKET1 });
    L.push({ z: d.H + LIP_A, inset: POCKET1 });
    L.push({ z: d.H, inset: POCKET0 });
    L.push({ z: d.H - d.wall, inset: POCKET0 });
    L.push({ z: d.H - POCKET0, inset: d.wall });
  } else {
    L.push({ z: d.H, inset: 0 });
    L.push({ z: d.H, inset: d.wall });
  }
  L.push({ z: d.floorTop, inset: d.wall });
  solid(out, m => {
    loft(m, rs, L, false, null);
    capFan(m, rrPoints(rs, 0.35, null), H_BASE - 0.30, false);
    capFan(m, rrPoints(rs, d.wall, null), d.floorTop, true);
  }, 'tray-shell');

  // feet
  for (let ix = 0; ix < d.nx; ix++) for (let iy = 0; iy < d.ny; iy++) {
    const fh = (GRID - CLEAR) / 2, fx = d.cx[ix], fy = d.cy[iy];
    const frs = rrSpec(fx - fh, fx + fh, fy - fh, fy + fh, [R_OUT, R_OUT, R_OUT, R_OUT], d.footSeg || p.seg, p.cornerSegs);
    const lv = BASE_PROFILE.map(q => ({ z: q[0], inset: q[1] }));
    lv.push({ z: H_BASE + 0.30, inset: 0.30 });
    solid(out, m => {
      for (let k = 0; k < lv.length - 1; k++)
        stitch(m, rrPoints(frs, lv[k].inset, null), lv[k].z, rrPoints(frs, lv[k + 1].inset, null), lv[k + 1].z, false);
      capFan(m, rrPoints(frs, 2.95, null), 0, false);
      capFan(m, rrPoints(frs, 0.30, null), H_BASE + 0.30, true);
    }, 'tray-foot');
  }

  // border frame between the bore and the slot field
  const inner = rrSpec(d.xs0, d.xs1, d.yFront, d.yBack, [0.01, 0.01, 0.01, 0.01], p.seg, p.cornerSegs, { nX: rs.nX, nY: rs.nY });
  const xEdges = edgeFn(['-X', '+X']);
  const ringAt = off => rrPoints(inner, 0, off ? (sp => off * xEdges(sp)) : null);
  const zb = d.floorTop - 0.2;
  const gzf = z => {
    if (!d.round) return 0;
    if (z >= d.cradZ) return 0;
    const t = d.cradZ - z;
    return d.slotW / 2 - Math.min(d.slotW / 2, Math.sqrt(Math.max(0, d.cradR * d.cradR - t * t)));
  };
  const fLev = [];
  if (d.round) {
    const NC = 14;
    for (let i = 0; i <= NC; i++) {
      const z = d.floorTop + (d.cradTop - d.floorTop) * (1 - Math.cos((i / NC) * Math.PI / 2));
      fLev.push({ z, off: -gzf(z) });
    }
    fLev.unshift({ z: zb, off: -gzf(d.floorTop) });
  } else {
    fLev.push({ z: zb, off: 0 });
  }
  fLev.push({ z: d.chamferStart, off: 0 });
  fLev.push({ z: d.ribTop, off: d.chamfer });
  solid(out, m => {
    const O = rrPoints(rs, d.wall - 0.2, null);
    stitch(m, O, zb, O, d.ribTop, false);
    for (let k = 0; k < fLev.length - 1; k++) {
      const A = fLev[k], B = fLev[k + 1];
      if (Math.abs(A.z - B.z) < 1e-9 && Math.abs(A.off - B.off) < 1e-9) continue;
      stitch(m, ringAt(A.off), A.z, ringAt(B.off), B.z, true);
    }
    annulus(m, ringAt(fLev[0].off), O, zb, false);
    annulus(m, ringAt(fLev[fLev.length - 1].off), O, d.ribTop, true);
  }, 'tray-frame');

  // ribs
  const zs = [zb];
  if (d.round) {
    const NC = 14;
    for (let i = 0; i <= NC; i++) zs.push(d.floorTop + (d.cradTop - d.floorTop) * (1 - Math.cos((i / NC) * Math.PI / 2)));
  }
  if (d.cutOn) {
    const N = 14;
    for (let i = 0; i <= N; i++) zs.push(d.cutZ - d.cutR * Math.cos((i / N) * Math.PI / 2));
  }
  zs.push(d.chamferStart, d.ribTop);
  zs.sort((a, b2) => a - b2);
  const fz = z => {
    if (!d.cutOn || z <= d.cutZ - d.cutR) return 0;
    if (z >= d.cutZ) return d.cutR;
    const t = d.cutZ - z;
    return Math.sqrt(Math.max(0, d.cutR * d.cutR - t * t));
  };
  const cz = z => Math.max(0, z - d.chamferStart);
  // how far each slot wall is pushed in by the cradle at height z
  const gz = z => {
    if (!d.round) return 0;
    if (z >= d.cradZ) return 0;
    const t = d.cradZ - z;
    const hw = Math.min(d.slotW / 2, Math.sqrt(Math.max(0, d.cradR * d.cradR - t * t)));
    return d.slotW / 2 - hw;
  };
  for (let i = 0; i + 1 < d.nSlots; i++) {
    const xr0 = d.slots[i].x1, xr1 = d.slots[i + 1].x0;
    if (xr1 - xr0 < 0.05) continue;
    const block = (side) => solid(out, m => {
      let prev = null, pz = 0;
      for (let k = 0; k < zs.length; k++) {
        const z = zs[k], c = cz(z), f = fz(z), g = gz(z);
        const ya = side < 0 ? d.yFront : d.cutY + f + (d.cutOn ? c : 0);
        const yb2 = side < 0 ? d.cutY - f - (d.cutOn ? c : 0) : d.yBack;
        const wid = (xr1 + g - c) - (xr0 - g + c);
        const sh = wid < 0.2 ? (wid - 0.2) / 2 : 0;
        const R = boxRing(xr0 - g + c - sh, xr1 + g - c + sh, ya, yb2);
        if (prev) stitch(m, prev, pz, R, z, false); else capFan(m, R, z, false);
        prev = R; pz = z;
      }
      capFan(m, prev, pz, true);
    }, 'rib');
    block(-1); block(+1);
    if (d.cutOn) solid(out, m => {
      const R = boxRing(xr0, xr1, d.yFront, d.yBack);
      stitch(m, R, zb, R, d.cutZ - d.cutR, false);
      capFan(m, R, zb, false); capFan(m, R, d.cutZ - d.cutR, true);
    }, 'web');
  }

  // raised labels on the front border
  if (p.trayText && p.textD > 0.01) {
    const labels = String(p.labels || '').split(/[,;|]/).map(s => s.trim());
    const cy = (-d.HY + d.yFront) / 2;
    for (let i = 0; i < d.nSlots; i++) {
      const s = labels[i] || '';
      if (!s) continue;
      const rects = textRects(s, p.textH);
      if (!rects.length) continue;
      let w = 0;
      for (const r of rects) { if (r[1] > w) w = r[1]; if (-r[0] > w) w = -r[0]; }
      const maxW = (d.pitch > 0 ? d.pitch : d.slotW) - 0.6;
      const scale = 2 * w > maxW ? maxW / (2 * w) : 1;
      addTextSolid(out, rects, (d.slots[i].x0 + d.slots[i].x1) / 2, cy, d.ribTop, d.ribTop + p.textD, scale);
    }
  }

  if (p.trayDir === 'x') {
    const seen = new Set();
    for (const t of out.tri) for (const v of t) {
      if (seen.has(v)) continue;
      seen.add(v);
      const x = v[0]; v[0] = -v[1]; v[1] = x;
    }
  }
  return out;
}

// ---------------------------------------------------------------------
// Label ramp: a sloped gusset off one wall ending in a shelf with a
// recessed pad. Built as its own closed solid inside the bore.
// ---------------------------------------------------------------------

function labelRects(p, d, col) {
  const cx = d.cx[col];
  const halfR = d.rampW / 2;
  const lim = d.HX - 0.3;
  const rx0 = Math.max(cx - halfR, -lim);
  const rx1 = Math.min(cx + halfR, lim);
  const px0 = Math.max(cx - d.padW / 2, rx0 + p.labelBorder);
  const px1 = Math.min(cx + d.padW / 2, rx1 - p.labelBorder);
  return {
    ramp: [rx0, rx1, d.yInner, d.tabOut],
    pad:  [px0, px1, d.yInner + p.labelBorder, d.yWallTop - p.labelBorder],
  };
}

function buildRamp(dst, p, d, col) {
  const R = labelRects(p, d, col);
  const rr = Math.max(0.4, d.padR + p.labelBorder);
  const padSpec = rrSpec(R.pad[0], R.pad[1], R.pad[2], R.pad[3],
                         [d.padR, d.padR, d.padR, d.padR], p.seg, p.cornerSegs);
  const rampSpec = rrSpec(R.ramp[0], R.ramp[1], R.ramp[2], R.ramp[3],
                          [0.02, 0.02, rr, rr], p.seg, p.cornerSegs,
                          { nX: padSpec.nX, nY: padSpec.nY });
  const padRing = rrPoints(padSpec, 0, null);
  const rampRing = rrPoints(rampSpec, 0, null);
  const tan = Math.tan(d.tabAngle * Math.PI / 180);
  const zf = (x, y) => d.zFace - (y - d.yInner) * tan;
  const zTopArr = rampRing.map(() => d.zTop);
  const zBotArr = rampRing.map(q => zf(q[0], q[1]));
  const padFloor = d.zTop - p.padDepth;

  solid(dst, m => {
    annulus(m, padRing, rampRing, d.zTop, true);
    stitch(m, padRing, padFloor, padRing, d.zTop, true);
    capFan(m, padRing, padFloor, true);
    stitchZ(m, rampRing, zBotArr, rampRing, zTopArr, false);
    capFanPlane(m, rampRing, zf, false);
  }, 'ramp');
}

// ---------------------------------------------------------------------
// Bin
// ---------------------------------------------------------------------

// Final bounded experiment: one conical underside cavity per bin foot.
// Original exterior sides remain untouched; annulus, inward cone and
// downward ceiling cap form the actual connected cavity boundary.
function hollowFootBottom(m, frs, fx, fy) {
  const N=64, mouthRadius=9.3, roofRadius=4.9, roofZ=4.4;
  const circle=radius=>Array.from({length:N},(_,i)=>{
    const angle=2*Math.PI*i/N;
    return [fx+radius*Math.cos(angle),fy+radius*Math.sin(angle)];
  });
  const mouth=circle(mouthRadius), roof=circle(roofRadius);
  // Zip unlike convex rings without splitting existing exterior vertices.
  const ordered=ring=>ring.map(v=>({v,a:Math.atan2(v[1]-fy,v[0]-fx)})).sort((a,b)=>a.a-b.a);
  const inner=ordered(mouth), outer=ordered(rrPoints(frs,2.95,null));
  let i=0,j=0;
  while(i<inner.length || j<outer.length) {
    const I=inner[i%inner.length].v, O=outer[j%outer.length].v;
    const ia=i+1<inner.length ? inner[i+1].a : inner[0].a+2*Math.PI;
    const oa=j+1<outer.length ? outer[j+1].a : outer[0].a+2*Math.PI;
    if(j<outer.length && (i===inner.length || oa<=ia)) {
      const next=outer[(j+1)%outer.length].v;
      push3(m,[...I,0],[...next,0],[...O,0]); j++;
    } else {
      const next=inner[(i+1)%inner.length].v;
      push3(m,[...I,0],[...next,0],[...O,0]); i++;
    }
  }
  stitch(m,mouth,0,roof,roofZ,true);
  capFan(m,roof,roofZ,false);
}

function buildBin(p) {
  requireValid(p, "bin");
  const d = derive(p);
  const out = Mesh();
  const rs = rectSpec(d.HX, d.HY, R_OUT, p.seg, p.cornerSegs);
  const grooveRun = runFn(d.cx, d.cy, p.grooveLen, 0);
  const scoopW = facesFn(scoopFaces(p.scoopWalls));
  const mkOff = offMaker([
    { key: 'off',   fn: grooveRun, sign: +1 },
    { key: 'scoop', fn: scoopW,    sign: -1 },
  ]);

  const insetAt = z => {
    if (z <= d.H) return POCKET0;
    if (z <= d.H + LIP_A) return POCKET0 - (z - d.H) * (POCKET0 - POCKET1) / LIP_A;
    return POCKET1;
  };

  const L = [];
  L.push({ z: H_BASE - 0.30, inset: 0.35 });
  L.push({ z: H_BASE - 0.05, inset: 0 });

  if (p.lip) {
    pushTip(L, d.apex, p.lipTipStyle, d.lipR, d.lipT);
    L.push({ z: d.H + LIP_A + LIP_B, inset: POCKET1 });
    const g0 = Math.max(d.H + 0.05, d.grooveZ0);
    const g1 = Math.min(d.H + LIP_A + LIP_B - 0.05, d.grooveZ1);
    if (p.groove && g1 > g0 + 0.1) {
      L.push({ z: g1, inset: POCKET1, off: 0 });
      L.push({ z: g1, inset: POCKET1, off: p.grooveDepth });
      L.push({ z: g0, inset: POCKET1, off: p.grooveDepth });
      L.push({ z: g0, inset: insetAt(g0), off: 0 });
    }
    if (d.H + LIP_A < g0 || !p.groove) L.push({ z: d.H + LIP_A, inset: POCKET1 });
    L.push({ z: d.H, inset: POCKET0 });
  } else {
    L.push({ z: d.H, inset: 0 });
    L.push({ z: d.H, inset: POCKET0 });
  }

  L.push({ z: d.flareEnd, inset: POCKET0 });
  L.push({ z: d.flareStart, inset: d.wall });
  if (d.scoop > 0.05) {
    const N = 12;
    for (let i = N; i >= 0; i--) {
      const th = (i / N) * Math.PI / 2;
      L.push({ z: d.floorTop + d.scoop * (1 - Math.cos(th)), inset: d.wall, scoop: d.scoop * (1 - Math.sin(th)) });
    }
  } else {
    L.push({ z: d.floorTop, inset: d.wall });
  }
  const last = L[L.length - 1];

  solid(out, m => {
    loft(m, rs, L, false, mkOff);
    capFan(m, rrPoints(rs, 0.35, null), H_BASE - 0.30, false);
    capFan(m, rrPoints(rs, last.inset, mkOff(last)), d.floorTop, true);
  }, 'bin-shell');

  // feet
  for (let ix = 0; ix < p.nx; ix++) {
    for (let iy = 0; iy < p.ny; iy++) {
      const fx = d.cx[ix], fy = d.cy[iy];
      const fh = (GRID - CLEAR) / 2;
      const frs = rrSpec(fx - fh, fx + fh, fy - fh, fy + fh, [R_OUT, R_OUT, R_OUT, R_OUT], d.footSeg, p.cornerSegs);
      const lv = BASE_PROFILE.map(q => ({ z: q[0], inset: q[1] }));
      lv.push({ z: H_BASE + 0.30, inset: 0.30 });
      solid(out, m => {
        for (let k = 0; k < lv.length - 1; k++) {
          stitch(m, rrPoints(frs, lv[k].inset, null), lv[k].z,
                    rrPoints(frs, lv[k + 1].inset, null), lv[k + 1].z, false);
        }
        if (p.hollowFeet) {
          hollowFootBottom(m, frs, fx, fy);
        } else {
          capFan(m, rrPoints(frs, 2.95, null), 0, false);
        }
        capFan(m, rrPoints(frs, 0.30, null), H_BASE + 0.30, true);
      }, 'bin-foot');
    }
  }

  for (let i = 0; i < d.cols.length; i++) buildRamp(out, p, d, d.cols[i]);
  return out;
}

// ---------------------------------------------------------------------
// Lid
// ---------------------------------------------------------------------

function windowSpecs(p, d, col, counts) {
  const R = labelRects(p, d, col);
  const bot = rrSpec(R.pad[0], R.pad[1], R.pad[2], R.pad[3],
                     [d.padR, d.padR, d.padR, d.padR], p.seg, p.cornerSegs, counts);
  const g = d.winGrow;
  const cx = d.cx[col];
  const lo = cx - (GRID - CLEAR) / 2 + d.lidFloorInset;
  const hi = cx + (GRID - CLEAR) / 2 - d.lidFloorInset;
  const yl = -d.HY + d.lidFloorInset, yh = d.HY - d.lidFloorInset;
  const tx0 = Math.max(R.pad[0] - g, lo), tx1 = Math.min(R.pad[1] + g, hi);
  const ty0 = Math.max(R.pad[2] - g, yl), ty1 = Math.min(R.pad[3] + g, yh);
  const tr = Math.max(0.4, d.padR + g);
  const top = rrSpec(tx0, tx1, ty0, ty1, [tr, tr, tr, tr], p.seg, p.cornerSegs, counts);
  return { bot, top };
}

function buildLid(p) {
  requireValid(p, "bin");
  const d = derive(p);
  const out = Mesh();
  const lipR = d.lipR;

  // feet, one solid per cell, with the snap bead and an optional window
  for (let ix = 0; ix < p.nx; ix++) {
    for (let iy = 0; iy < p.ny; iy++) {
      const fx = d.cx[ix], fy = d.cy[iy];
      const fh = (GRID - CLEAR) / 2;
      const frs = rrSpec(fx - fh, fx + fh, fy - fh, fy + fh, [R_OUT, R_OUT, R_OUT, R_OUT], d.footSeg, p.cornerSegs);
      const bead = runFn([fx], [fy], p.beadLen, 0.5);
      const mkOff = offMaker([{ key: 'bead', fn: bead, sign: +1 }]);
      const lv = [{ z: 0, inset: 2.95 }, { z: 0.8, inset: 2.15 }];
      if (p.snap && d.beadR > 0.05) {
        const NB = 12;
        lv.push({ z: d.beadC - d.beadR, inset: 2.15 });
        for (let i = 0; i <= NB; i++) {
          const th = -Math.PI / 2 + (i / NB) * Math.PI;
          lv.push({ z: d.beadC + d.beadR * Math.sin(th), inset: 2.15, bead: d.beadR * Math.cos(th) });
        }
        lv.push({ z: d.beadC + d.beadR, inset: 2.15 });
      }
      lv.push({ z: 2.6, inset: 2.15 });
      lv.push({ z: H_BASE, inset: 0 });
  // Radial mating clearance tapers to zero at the foot shoulder.
  lv.forEach(level => { if (level.z < H_BASE) level.inset += p.stackClear; });

      const hasWin = p.window && d.labelOn && d.cols.indexOf(ix) >= 0 && iy === d.cy.length - 1;
      let wb = null, wt = null;
      if (hasWin) {
        const ws = windowSpecs(p, d, ix, { nX: frs.nX, nY: frs.nY });
        wb = rrPoints(ws.bot, 0, null);
        wt = rrPoints(ws.top, 0, null);
      }

      solid(out, m => {
        for (let k = 0; k < lv.length - 1; k++) {
          const A = lv[k], B = lv[k + 1];
          if (Math.abs(A.z - B.z) < 1e-9 && Math.abs(A.inset - B.inset) < 1e-9 && Math.abs((A.bead || 0) - (B.bead || 0)) < 1e-9) continue;
          stitch(m, rrPoints(frs, A.inset, mkOff(A)), A.z,
                    rrPoints(frs, B.inset, mkOff(B)), B.z, false);
        }
        if (hasWin) {
          annulus(m, wb, rrPoints(frs, 2.95 + p.stackClear, null), 0, false);
          annulus(m, wt, rrPoints(frs, 0, null), H_BASE, true);
          stitch(m, wb, 0, wb, d.winLedge, true);
          stitch(m, wb, d.winLedge, wt, H_BASE, true);
        } else {
          capFan(m, rrPoints(frs, 2.95 + p.stackClear, null), 0, false);
          capFan(m, rrPoints(frs, 0, null), H_BASE, true);
        }
      }, 'lid-foot');
    }
  }

  // perimeter frame
  const rs = rectSpec(d.HX, d.HY, R_OUT, p.seg, p.cornerSegs);
  const F = [];
  F.push({ z: H_BASE - 0.30, inset: 0.35 });
  F.push({ z: H_BASE - 0.05, inset: 0 });
  const zc = d.lidApex - lipR * (1 + Math.SQRT2);
  F.push({ z: zc, inset: 0 });
  const tl = tipLevels(d.lidApex, lipR, 9);
  for (let i = 1; i < tl.length; i++) F.push(tl[i]);
  F.push({ z: d.lidBodyTop + LIP_A + LIP_B, inset: POCKET1 });
  F.push({ z: d.lidBodyTop + LIP_A, inset: POCKET1 });
  F.push({ z: d.lidBodyTop, inset: POCKET0 });
  F.push({ z: H_BASE + d.lidChamfer, inset: POCKET0 });
  F.push({ z: H_BASE, inset: d.lidFloorInset });
  F.push({ z: H_BASE - 0.30, inset: d.lidFloorInset });
  solid(out, m => {
    loft(m, rs, F, false, null);
    annulus(m, rrPoints(rs, d.lidFloorInset, null), rrPoints(rs, 0.35, null), H_BASE - 0.30, false);
  }, 'lid-frame');

  // ribs between cells
  const prof = [
    [H_BASE - 0.30, 0.25 + d.lidFloorInset],
    [H_BASE,        0.25 + d.lidFloorInset],
    [H_BASE + d.lidChamfer, 0.25 + POCKET0],
    [d.lidBodyTop,  0.25 + POCKET0],
    [d.lidBodyTop + LIP_A, 0.25 + POCKET1],
    [d.lidBodyTop + LIP_A + LIP_B, 0.25 + POCKET1],
    [d.lidTop,      0.25 + lipR * Math.SQRT2],
  ];
  const rib = (axis, c, a0, a1) => {
    const poly = [];
    for (let i = 0; i < prof.length; i++) poly.push([c - prof[i][1], prof[i][0]]);
    for (let i = prof.length - 1; i >= 0; i--) poly.push([c + prof[i][1], prof[i][0]]);
    solid(out, m => {
      const P = (u, v) => axis === 'x' ? [u[0], v, u[1]] : [v, u[0], u[1]];
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        push3(m, P(poly[i], a0), P(poly[j], a0), P(poly[j], a1));
        push3(m, P(poly[i], a0), P(poly[j], a1), P(poly[i], a1));
      }
      let mx = 0, mz = 0;
      for (let i = 0; i < poly.length; i++) { mx += poly[i][0]; mz += poly[i][1]; }
      mx /= poly.length; mz /= poly.length;
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        push3(m, P([mx, mz], a0), P(poly[j], a0), P(poly[i], a0));
        push3(m, P([mx, mz], a1), P(poly[i], a1), P(poly[j], a1));
      }
    }, 'rib');
  };
  for (let i = 0; i < p.nx - 1; i++) rib('x', (d.cx[i] + d.cx[i + 1]) / 2, -d.HY + 0.2, d.HY - 0.2);
  for (let i = 0; i < p.ny - 1; i++) rib('y', (d.cy[i] + d.cy[i + 1]) / 2, -d.HX + 0.2, d.HX - 0.2);

  return out;
}

// ---------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------

function clean(m) {
  const out = { tri: [] };
  for (let i = 0; i < m.tri.length; i++) {
    const t = m.tri[i], a = t[0], b = t[1], c = t[2];
    const ux = b[0]-a[0], uy = b[1]-a[1], uz = b[2]-a[2];
    const vx = c[0]-a[0], vy = c[1]-a[1], vz = c[2]-a[2];
    const nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx;
    if (nx*nx + ny*ny + nz*nz > 1e-14) out.tri.push(t);
  }
  return out;
}

function toFloat32(m0) {
  const m = clean(m0);
  const a = new Float32Array(m.tri.length * 9);
  let k = 0;
  for (let i = 0; i < m.tri.length; i++) {
    const t = m.tri[i];
    for (let j = 0; j < 3; j++) { a[k++] = t[j][0]; a[k++] = t[j][1]; a[k++] = t[j][2]; }
  }
  return a;
}

function toSTL(m0, name) {
  const m = clean(m0);
  const n = m.tri.length;
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  const hdr = ('gridfinity lidded bin: ' + name).slice(0, 79);
  for (let i = 0; i < hdr.length; i++) dv.setUint8(i, hdr.charCodeAt(i));
  dv.setUint32(80, n, true);
  let o = 84;
  for (let i = 0; i < n; i++) {
    const t = m.tri[i], a = t[0], b = t[1], c = t[2];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const Ln = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    dv.setFloat32(o, nx / Ln, true); dv.setFloat32(o + 4, ny / Ln, true); dv.setFloat32(o + 8, nz / Ln, true); o += 12;
    for (let j = 0; j < 3; j++) {
      dv.setFloat32(o, t[j][0], true); dv.setFloat32(o + 4, t[j][1], true); dv.setFloat32(o + 8, t[j][2], true); o += 12;
    }
    dv.setUint16(o, 0, true); o += 2;
  }
  return buf;
}


// =====================================================================
// Lens wipe box. A gridfinity module sized around a stack of foil
// sachet wipes, with a scooped front opening and the same snap on
// stackable lid the parts bin uses.
//
// Two things the parts bin does not do:
//   Half cells   the footprint moves in 0.5 U steps, so a pack that
//                needs 2.5 cells does not have to round up to 3. A half
//                cell rides on 21 mm feet, two of which fill one 42 mm
//                baseplate pocket, which is how the reference model
//                does it.
//   Front scoop  the top edge of the front wall dips on a raised cosine
//                that leaves the rim tangentially, so there is no corner
//                to catch a finger and nothing in the cut overhangs.
//                It is built by clamping every loft level's height per
//                point, so the wall, the lip and the rim all stop
//                together at the curve instead of being cut away after
//                the fact.
// =====================================================================

// Feet for an axis that may be a half cell. A half step drops the whole
// axis onto the 21 mm half grid, so the feet stay symmetric about the
// centre and still seat two to a baseplate pocket.
function footAxis(n) {
  const k2 = Math.round(n * 2);
  const half = (k2 % 2) === 1;
  const pitch = half ? GRID / 2 : GRID;
  const k = half ? k2 : k2 / 2;
  const c = [];
  for (let i = 0; i < k; i++) c.push((i - (k - 1) / 2) * pitch);
  return { c, pitch, half, hf: (pitch - CLEAR) / 2 };
}

function deriveWipe(p) {
  const nx = Math.max(1, Math.round(p.wnx * 2) / 2);
  const ny = Math.max(1, Math.round(p.wny * 2) / 2);
  const HX = (GRID * nx - CLEAR) / 2;
  const HY = (GRID * ny - CLEAR) / 2;
  const H  = HU * p.whu;
  const apex = H + LIP_H;
  const lipR = Math.max(0, Math.min(p.lipRound, 1.2));
  const lipT = Math.max(0.2, Math.min(p.lipTip, 2.0));
  const binTop = p.lipTipStyle === 'round' ? tipTop(apex, lipR)
               : p.lipTipStyle === 'flat'  ? apex - lipT : apex;

  const wall = Math.max(0.6, Math.min(p.wall, POCKET0 - 0.4));
  const floorT = Math.max(0.6, p.floorT);
  const floorTop = H_BASE + floorT;
  const flareEnd = H - wall;
  const flareStart = H - POCKET0;

  // snap, identical to the parts bin so one lid recipe covers both
  const beadR = Math.max(0.2, Math.min(p.beadR, 0.9));
  const beadC = 0.8 + (2.6 - 0.8) / 2;
  const grooveZ0 = H - SEAT + (beadC - beadR) - p.grooveClear;
  const grooveZ1 = H - SEAT + (beadC + beadR) + p.grooveClear;
  const grooveInset = Math.max(0.35, POCKET1 - p.grooveDepth);

  const openX = GRID * nx - CLEAR - 2 * wall;
  const openY = GRID * ny - CLEAR - 2 * wall;
  const fillet = p.wFillet <= 0.05 ? 0 : Math.max(0, Math.min(p.wFillet,
      Math.min(openX, openY) / 2 - 1, flareStart - floorTop - 1));

  // front scoop
  const fx = footAxis(nx), fy = footAxis(ny);
  const minLip = 15;                          // total front lip the lid needs
  const notchMaxW = Math.max(4, 2 * HX - 2 * R_OUT - minLip);
  const notchW = Math.max(4, Math.min(p.notchW, notchMaxW));
  // never cut below a retaining lip above the floor, and never so deep
  // that the wall above the pack is gone
  const notchFloor = floorTop + Math.max(1.0, p.notchKeep);
  const notchDrop = Math.max(0, Math.min(p.notchDrop, binTop - notchFloor));
  const notchFlat = Math.max(0, Math.min(p.notchFlat, notchW - 8));
  const notchOn = p.notch && notchDrop > 0.3 && notchW > 4;
  const notchZ = binTop - notchDrop;
  // how much of the stacking lip survives on the front wall
  const lipLeft = 2 * HX - 2 * R_OUT - notchW;

  const lidBody = Math.max(POCKET0, p.lidBody);
  const lidApex = H_BASE + lidBody + LIP_H;
  const lidTop = tipTop(lidApex, lipR);
  const lidBodyTop = H_BASE + lidBody;
  const lidChamfer = Math.max(0, Math.min(p.lidChamfer, lidBody - LIP_A - 0.2));
  const lidFloorInset = POCKET0 + lidChamfer;

  const depth = H - SEAT - floorTop;
  const sheetT = Math.max(0.2, p.sheetT);
  const sheetN = Math.max(1, Math.round(p.sheetN));
  // The stack can be given either way. Everything downstream reads
  // stackNeed, so the two modes are interchangeable.
  const byHeight = p.stackMode === 'height';
  const stackNeed = byHeight ? Math.max(0.5, p.stackH) : sheetN * sheetT;
  const packFits = Math.floor(depth / sheetT);

  // bead cannot be longer than the flat it sits on
  const flatX = 2 * fx.hf - 2 * R_OUT, flatY = 2 * fy.hf - 2 * R_OUT;
  const beadLen = Math.max(3, Math.min(p.beadLen, flatX - 2, flatY - 2));
  const grooveLen = Math.max(beadLen + 1.5, Math.min(p.grooveLen, Math.min(flatX, flatY) - 0.5));

  return {
    nx, ny, HX, HY, H, apex, binTop, lipR, lipT, wall, floorT, floorTop,
    flareStart, flareEnd, openX, openY, fillet,
    beadR, beadC, grooveZ0, grooveZ1, grooveInset, grooveWall: grooveInset,
    beadLen, grooveLen,
    notchOn, notchW, notchFlat, notchDrop, notchZ, notchFloor, notchMaxW, lipLeft,
    lidBody, lidApex, lidTop, lidBodyTop, lidChamfer, lidFloorInset,
    depth, sheetT, sheetN, byHeight, stackNeed, packFits,
    snapDeflect: beadR - (2.15 - POCKET1) - p.stackClear,
    fx, fy,
    footSeg: p.seg * Math.max(1, Math.sqrt(nx * ny) / 1.5),
  };
}

// Height clamp for the front scoop. Returns a function of a ring spec
// sample that gives the ceiling for that point, or Infinity where the
// wall runs full height. The curve is a raised cosine, so it meets the
// rim with zero slope at both ends and bottoms out flat in the middle.
function notchClampFn(d) {
  if (!d.notchOn) return null;
  const half = d.notchW / 2, flat = d.notchFlat / 2;
  const span = Math.max(0.01, half - flat);
  return function (sp) {
    if (sp.t !== 'e' || sp.axis !== '-Y') return Infinity;
    const a = Math.abs(spPos(sp));
    if (a >= half) return Infinity;
    const u = a <= flat ? 0 : (a - flat) / span;
    return d.binTop - d.notchDrop * 0.5 * (1 + Math.cos(Math.PI * u));
  };
}

// Loft with a per point ceiling. Levels above the ceiling collapse onto
// it, which is what turns a stack of flat rings into a wall with a
// curved top edge: the collapsed rings degenerate to zero height and
// their annuli become the flat top of the wall.
function loftClamped(m, rs, levels, flip, mkOff, clamp, capInset) {
  const n = rs.specs.length;
  const cz = clamp ? rs.specs.map(clamp) : null;
  // A point held down by the ceiling also stops moving inward past the
  // wall thickness. Without that cap the lip pocket levels, which run
  // inward to 2.6 and then back out to the wall, would fold over each
  // other once they all collapse onto the same height and leave a pair
  // of coincident faces around nothing. Capped, the collapsed levels
  // run 0 to wall and stop, which is just the wall in section: the flat
  // top of the scooped edge.
  const level = lv => {
    const off = mkOff ? mkOff(lv) : null;
    const R = rrPoints(rs, lv.inset, off);
    if (!cz) return { R, z: R.map(() => lv.z) };
    const cap = Math.min(lv.inset, capInset);
    const Rc = cap < lv.inset - 1e-9 ? rrPoints(rs, cap, off) : R;
    const P = new Array(n), Z = new Array(n);
    for (let i = 0; i < n; i++) {
      const held = lv.z > cz[i] + 1e-9;
      P[i] = held ? Rc[i] : R[i];
      Z[i] = held ? cz[i] : lv.z;
    }
    return { R: P, z: Z };
  };
  const same = (a, b) => {
    for (let i = 0; i < n; i++) {
      if (Math.abs(a.z[i] - b.z[i]) > 1e-9) return false;
      if (Math.abs(a.R[i][0] - b.R[i][0]) > 1e-9 || Math.abs(a.R[i][1] - b.R[i][1]) > 1e-9) return false;
    }
    return true;
  };
  let A = level(levels[0]);
  for (let k = 0; k < levels.length - 1; k++) {
    const B = level(levels[k + 1]);
    if (!same(A, B)) stitchZ(m, A.R, A.z, B.R, B.z, flip);
    A = B;
  }
}

function overlapWipe(p, d) {
  let v = d.fx.c.length * d.fy.c.length *
          rectArea(d.fx.hf - 0.2, d.fy.hf - 0.2, R_OUT - 0.2) * 0.60;
  return v;
}

function warningsWipe(p) {
  const d = deriveWipe(p);
  const w = [];
  if (d.flareStart <= d.floorTop + 2) w.push('Box is too short for this floor thickness. Add height units.');
  if (p.snap && d.snapDeflect <= 0.1) w.push('Snap deflection is only ' + d.snapDeflect.toFixed(2) + ' mm. The estimated grip is low; check a printed pair.');
  if (p.snap && d.snapDeflect > 0.85) w.push('Snap deflection is ' + d.snapDeflect.toFixed(2) + ' mm. The estimated click may be stiff; check a printed pair.');
  if (d.grooveWall < 1.2 * p.lineW) w.push('Groove leaves only ' + d.grooveWall.toFixed(2) + ' mm of lip wall, thinner than the nozzle prints cleanly.');
  if (d.notchOn && d.notchDrop < p.notchDrop - 0.01) w.push('Scoop depth trimmed to ' + d.notchDrop.toFixed(1) + ' mm so it keeps ' + p.notchKeep.toFixed(1) + ' mm of wall above the floor.');
  if (d.notchOn && d.notchW < p.notchW - 0.01) w.push('Scoop width trimmed to ' + d.notchW.toFixed(1) + ' mm to stay off the corner radii.');
  if (d.notchOn && d.lipLeft < 15 - 0.01) w.push('Only ' + d.lipLeft.toFixed(0) + ' mm of front lip left for the lid to grip.');
  if (p.wall < 2 * p.lineW) w.push('Wall is thinner than two extrusion widths.');
  if (!d.byHeight && d.packFits < 1) w.push('Not even one sheet fits. Add height units.');
  if (d.stackNeed > d.depth) w.push('The stack is ' + (d.stackNeed - d.depth).toFixed(1) + ' mm taller than the box is deep. Add height units or thin the floor.');
  if (!wipePackFits(p, {...d, depth: Infinity})) w.push('The sheet is bigger than the floor by ' + Math.max(packOrientation(p).length - Math.max(d.openX,d.openY), packOrientation(p).width - Math.min(d.openX,d.openY)).toFixed(1) + ' mm. Add a half cell or thin the wall.');
  return w;
}

// ---------------------------------------------------------------------
// Lens wipe box and its lid
// ---------------------------------------------------------------------

function wipeFeet(dst, p, d, prof, extra) {
  for (let i = 0; i < d.fx.c.length; i++) {
    for (let j = 0; j < d.fy.c.length; j++) {
      const cx = d.fx.c[i], cy = d.fy.c[j];
      const frs = rrSpec(cx - d.fx.hf, cx + d.fx.hf, cy - d.fy.hf, cy + d.fy.hf,
                         [R_OUT, R_OUT, R_OUT, R_OUT], d.footSeg, p.cornerSegs);
      const mkOff = extra ? extra(cx, cy) : null;
      solid(dst, m => {
        for (let k = 0; k < prof.length - 1; k++) {
          const A = prof[k], B = prof[k + 1];
          if (Math.abs(A.z - B.z) < 1e-9 && Math.abs(A.inset - B.inset) < 1e-9
              && Math.abs((A.bead || 0) - (B.bead || 0)) < 1e-9) continue;
          stitch(m, rrPoints(frs, A.inset, mkOff ? mkOff(A) : null), A.z,
                    rrPoints(frs, B.inset, mkOff ? mkOff(B) : null), B.z, false);
        }
        capFan(m, rrPoints(frs, prof[0].inset, mkOff ? mkOff(prof[0]) : null), prof[0].z, false);
        const L = prof[prof.length - 1];
        capFan(m, rrPoints(frs, L.inset, mkOff ? mkOff(L) : null), L.z, true);
      }, 'wipe-foot');
    }
  }
}

function buildWipeBox(p) {
  requireValid(p, "wipe");
  const d = deriveWipe(p);
  const out = Mesh();
  const rs = rectSpec(d.HX, d.HY, R_OUT, p.seg, p.cornerSegs);
  const clamp = notchClampFn(d);
  const grooveRun0 = runFn(d.fx.c, d.fy.c, d.grooveLen, 0);
  // No groove where the scoop has already taken the lip away. Without
  // this the collapsed lip levels double back on themselves and leave a
  // pair of coincident faces enclosing nothing.
  const gTop = d.grooveZ1;
  const grooveRun = clamp ? (sp => clamp(sp) < gTop + 0.001 ? 0 : grooveRun0(sp)) : grooveRun0;
  const filletW = facesFn(['-Y', '+Y', '-X', '+X']);
  const mkOff = offMaker([
    { key: 'off',    fn: grooveRun, sign: +1 },
    { key: 'fillet', fn: filletW,   sign: -1 },
  ]);

  const insetAt = z => {
    if (z <= d.H) return POCKET0;
    if (z <= d.H + LIP_A) return POCKET0 - (z - d.H) * (POCKET0 - POCKET1) / LIP_A;
    return POCKET1;
  };

  const L = [];
  L.push({ z: H_BASE - 0.30, inset: 0.35 });
  L.push({ z: H_BASE - 0.05, inset: 0 });
  pushTip(L, d.apex, p.lipTipStyle, d.lipR, d.lipT);
  L.push({ z: d.H + LIP_A + LIP_B, inset: POCKET1 });
  const g0 = Math.max(d.H + 0.05, d.grooveZ0);
  const g1 = Math.min(d.H + LIP_A + LIP_B - 0.05, d.grooveZ1);
  if (p.groove && g1 > g0 + 0.1) {
    L.push({ z: g1, inset: POCKET1, off: 0 });
    L.push({ z: g1, inset: POCKET1, off: p.grooveDepth });
    L.push({ z: g0, inset: POCKET1, off: p.grooveDepth });
    L.push({ z: g0, inset: insetAt(g0), off: 0 });
  }
  if (d.H + LIP_A < g0 || !p.groove) L.push({ z: d.H + LIP_A, inset: POCKET1 });
  L.push({ z: d.H, inset: POCKET0 });
  L.push({ z: d.flareEnd, inset: POCKET0 });
  L.push({ z: d.flareStart, inset: d.wall });
  if (d.fillet > 0.05) {
    const N = 12;
    for (let i = N; i >= 0; i--) {
      const th = (i / N) * Math.PI / 2;
      L.push({ z: d.floorTop + d.fillet * (1 - Math.cos(th)), inset: d.wall, fillet: d.fillet * (1 - Math.sin(th)) });
    }
  } else {
    L.push({ z: d.floorTop, inset: d.wall });
  }
  const last = L[L.length - 1];

  solid(out, m => {
    loftClamped(m, rs, L, false, mkOff, clamp, d.wall);
    capFan(m, rrPoints(rs, 0.35, null), H_BASE - 0.30, false);
    capFan(m, rrPoints(rs, last.inset, mkOff(last)), d.floorTop, true);
  }, 'wipe-shell');

  const base = BASE_PROFILE.map(q => ({ z: q[0], inset: q[1] }));
  base.push({ z: H_BASE + 0.30, inset: 0.30 });
  wipeFeet(out, p, d, base, null);
  return out;
}

function buildWipeLid(p) {
  requireValid(p, "wipe");
  const d = deriveWipe(p);
  const out = Mesh();
  const lv = [{ z: 0, inset: 2.95 }, { z: 0.8, inset: 2.15 }];
  if (p.snap && d.beadR > 0.05) {
    const NB = 12;
    lv.push({ z: d.beadC - d.beadR, inset: 2.15 });
    for (let i = 0; i <= NB; i++) {
      const th = -Math.PI / 2 + (i / NB) * Math.PI;
      lv.push({ z: d.beadC + d.beadR * Math.sin(th), inset: 2.15, bead: d.beadR * Math.cos(th) });
    }
    lv.push({ z: d.beadC + d.beadR, inset: 2.15 });
  }
  lv.push({ z: 2.6, inset: 2.15 });
  lv.push({ z: H_BASE, inset: 0 });
  // Radial mating clearance tapers to zero at the foot shoulder.
  lv.forEach(level => { if (level.z < H_BASE) level.inset += p.stackClear; });
  wipeFeet(out, p, d, lv, (cx, cy) => offMaker([
    { key: 'bead', fn: runFn([cx], [cy], d.beadLen, 0.5), sign: +1 },
  ]));

  const rs = rectSpec(d.HX, d.HY, R_OUT, p.seg, p.cornerSegs);
  const F = [];
  F.push({ z: H_BASE - 0.30, inset: 0.35 });
  F.push({ z: H_BASE - 0.05, inset: 0 });
  F.push({ z: d.lidApex - d.lipR * (1 + Math.SQRT2), inset: 0 });
  const tl = tipLevels(d.lidApex, d.lipR, 9);
  for (let i = 1; i < tl.length; i++) F.push(tl[i]);
  F.push({ z: d.lidBodyTop + LIP_A + LIP_B, inset: POCKET1 });
  F.push({ z: d.lidBodyTop + LIP_A, inset: POCKET1 });
  F.push({ z: d.lidBodyTop, inset: POCKET0 });
  F.push({ z: H_BASE + d.lidChamfer, inset: POCKET0 });
  F.push({ z: H_BASE, inset: d.lidFloorInset });
  F.push({ z: H_BASE - 0.30, inset: d.lidFloorInset });
  solid(out, m => {
    loft(m, rs, F, false, null);
    annulus(m, rrPoints(rs, d.lidFloorInset, null), rrPoints(rs, 0.35, null), H_BASE - 0.30, false);
  }, 'wipe-lid-frame');

  const prof = [
    [H_BASE - 0.30, 0.25 + d.lidFloorInset],
    [H_BASE,        0.25 + d.lidFloorInset],
    [H_BASE + d.lidChamfer, 0.25 + POCKET0],
    [d.lidBodyTop,  0.25 + POCKET0],
    [d.lidBodyTop + LIP_A, 0.25 + POCKET1],
    [d.lidBodyTop + LIP_A + LIP_B, 0.25 + POCKET1],
    [d.lidTop,      0.25 + d.lipR * Math.SQRT2],
  ];
  const rib = (axis, c, a0, a1) => {
    const poly = [];
    for (let i = 0; i < prof.length; i++) poly.push([c - prof[i][1], prof[i][0]]);
    for (let i = prof.length - 1; i >= 0; i--) poly.push([c + prof[i][1], prof[i][0]]);
    solid(out, m => {
      const P = (u, v) => axis === 'x' ? [u[0], v, u[1]] : [v, u[0], u[1]];
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        push3(m, P(poly[i], a0), P(poly[j], a0), P(poly[j], a1));
        push3(m, P(poly[i], a0), P(poly[j], a1), P(poly[i], a1));
      }
      let mx = 0, mz = 0;
      for (let i = 0; i < poly.length; i++) { mx += poly[i][0]; mz += poly[i][1]; }
      mx /= poly.length; mz /= poly.length;
      for (let i = 0; i < poly.length; i++) {
        const j = (i + 1) % poly.length;
        push3(m, P([mx, mz], a0), P(poly[j], a0), P(poly[i], a0));
        push3(m, P([mx, mz], a1), P(poly[i], a1), P(poly[j], a1));
      }
    }, 'wipe-lid-rib');
  };
  for (let i = 0; i < d.fx.c.length - 1; i++) rib('x', (d.fx.c[i] + d.fx.c[i + 1]) / 2, -d.HY + 0.2, d.HY - 0.2);
  for (let i = 0; i < d.fy.c.length - 1; i++) rib('y', (d.fy.c[i] + d.fy.c[i + 1]) / 2, -d.HX + 0.2, d.HX - 0.2);
  return out;
}

function overlapWipeLid(p, d) {
  let v = (rectArea(d.HX - 0.35, d.HY - 0.35, R_OUT - 0.35)
         - rectArea(d.HX - d.lidFloorInset, d.HY - d.lidFloorInset, Math.max(0.1, R_OUT - d.lidFloorInset))) * 0.30;
  const rw = 0.5 + 2 * d.lidFloorInset;
  const nrib = (d.fx.c.length - 1) * (2 * d.HY - 0.4) + (d.fy.c.length - 1) * (2 * d.HX - 0.4);
  v += nrib * rw * 0.30;
  return v;
}

// Guard user and direct API parameters before allocating geometry. This is
// an envelope/order check, not a Boolean union or self-intersection proof.
const PARAM_LIMITS = {"nx":[1.0,6.0],"ny":[1.0,6.0],"hu":[2.0,20.0],"wnx":[1.0,6.0],"wny":[1.0,6.0],"whu":[3.0,20.0],"labelCol":[1.0,6.0],"labelH":[3.5,40.0],"labelW":[10.0,240.0],"packL":[20.0,240.0],"packW":[20.0,240.0],"sheetT":[0.3,12.0],"sheetN":[1.0,60.0],"stackH":[2.0,140.0],"notchW":[10.0,200.0],"notchFlat":[0.0,120.0],"notchDrop":[0.0,80.0],"notchKeep":[2.0,40.0],"wFillet":[0.0,12.0],"scoop":[0.0,20.0],"slotW":[1.0,40.0],"slots":[1.0,40.0],"sideBorder":[1.0,20.0],"frontBorder":[1.0,25.0],"backBorder":[1.0,25.0],"cutR":[2.0,30.0],"cutWeb":[0.4,8.0],"cutY":[-60.0,60.0],"textH":[1.5,12.0],"textD":[0.2,2.0],"wall":[0.8,2.2],"floorT":[0.8,6.0],"lipRound":[0.05,1.0],"lipTip":[0.2,2.0],"tabAngle":[35.0,70.0],"tabDrop":[0.0,8.0],"tabFace":[0.6,6.0],"labelBorder":[0.4,4.0],"labelClear":[0.0,1.5],"padDepth":[0.0,1.2],"padR":[0.5,6.0],"winLedge":[0.2,2.0],"beadR":[0.3,0.9],"beadLen":[6.0,28.0],"grooveLen":[8.0,32.0],"grooveDepth":[0.4,1.55],"grooveClear":[0.0,0.4],"stackClear":[0.0,0.4],"lidBody":[2.6,10.0],"lidChamfer":[0.0,2.0],"ribChamfer":[0.0,4.0],"cradleR":[0.0,40.0],"lineW":[0.2,0.9],"seg":[0.2,3.0],"cornerSegs":[3.0,20.0]};
function validateParams(p, mode) {
  const errors = [];
  if (!['bin','tray','wipe'].includes(mode)) errors.push('Unknown model.');
  if (typeof p.hollowFeet !== 'boolean') errors.push('hollowFeet must be true or false.');
  if (p.hollowFeet && mode !== 'bin') errors.push('Experimental hollow feet are supported only for bin bodies. Disable hollow feet or select bin mode.');
  if (typeof p.labels !== 'string' || p.labels.length > 1000) errors.push('Labels must be text of at most 1000 characters.');
  if (!Number.isFinite(p.layerH) || p.layerH < 0.05 || p.layerH > 1) errors.push('layerH must be from 0.05 to 1 mm.');
  for (const [key, values] of Object.entries({labelMode:['off','one','all'], lipTipStyle:['round','flat','sharp'], trayDir:['x','y'], slotBottom:['square','round'], scoopWalls:['one','both','four'], stackMode:['count','height']})) {
    if (!values.includes(p[key])) errors.push('Invalid ' + key + '.');
  }
  for (const [key, range] of Object.entries(PARAM_LIMITS)) {
    if (!Number.isFinite(p[key]) || p[key] < range[0] || p[key] > range[1]) errors.push(key + ' must be a finite number from ' + range[0] + ' to ' + range[1] + '.');
  }
  for (const key of ['nx','ny','hu','whu','cornerSegs','slots','sheetN','labelCol']) {
    if (!Number.isInteger(p[key])) errors.push(key + ' must be a whole number.');
  }
  for (const key of ['wnx','wny']) if (!Number.isInteger(p[key] * 2)) errors.push(key + ' must use half-cell steps.');
  if (errors.length) return errors;
  if (mode === 'tray') {
    const d = deriveTray(p);
    if (d.floorTop + 0.6 >= d.ribTop) errors.push('Tray floor leaves no usable rib height. Add height units or thin the floor.');
    if (d.round && d.cradTop > d.ribTop - 1) errors.push('Round cradle rises above the slot. Add height units, narrow the slot or increase the cradle radius.');
    if (d.nSlots > 1 && d.ribW < 0.4) errors.push('Slots leave less than 0.4 mm between ribs. Reduce the slot count or width.');
  } else {
    const d = mode === 'wipe' ? deriveWipe(p) : derive(p);
    if (d.floorTop + 0.6 >= d.flareStart) errors.push('Floor reaches the lip flare. Add height units or thin the floor.');
    if (mode === 'bin' && d.labelOn) {
      if (d.yInner < -d.HY + POCKET0 || d.zFace <= d.floorTop + 0.5 || d.zRampWall >= d.zFace) errors.push('Label ramp lies outside the usable bin. Add height units or reduce label height, border, drop or face thickness.');
      if (d.padW > d.tabW - 2 * p.labelBorder + 0.01) errors.push('Label pad is wider than its shelf. Reduce label width or border.');
    }
  }
  return errors;
}
function requireValid(p, mode) {
  const errors = validateParams(p, mode);
  if (errors.length) throw new Error(errors.join(' '));
}
function packOrientation(p) { return {length: Math.max(p.packL, p.packW), width: Math.min(p.packL, p.packW)}; }
function wipePackFits(p, d) {
  const pack = packOrientation(p);
  return Math.max(d.openX,d.openY) >= pack.length && Math.min(d.openX,d.openY) >= pack.width && d.depth >= d.stackNeed;
}

const DEFAULTS = {
  nx: 2, ny: 1, hu: 6,
  hollowFeet: false,
  wall: 1.5, floorT: 1.5, scoop: 10.0,
  lip: true, lipRound: 0.5, stackClear: 0.0,
  labelMode: 'one', labelCol: 1,
  labelW: 30, labelH: 12, labelClear: 0.3, labelBorder: 1.0, padR: 2.3, padDepth: 0.2,
  tabDrop: 1.5, tabFace: 2.0, tabAngle: 45,
  window: true, winLedge: 0.4,
  snap: true, groove: true,
  beadR: 0.9, beadLen: 14.0, grooveLen: 17.0, grooveDepth: 0.9, grooveClear: 0.10,
  lidBody: 2.6, lidChamfer: 0.8,
  scoopWalls: 'one', lipTipStyle: 'round', lipTip: 0.6,
  trayDir: 'y', sideBorder: 4.0, frontBorder: 5.0, backBorder: 1.5,
  slotBottom: 'square', cradleR: 0,
  slotW: 8.0, slots: 10, ribChamfer: 1.0,
  cut: true, cutR: 10.0, cutY: 0.0, cutWeb: 1.0,
  trayText: true, textH: 4.4, textD: 0.6,
  labels: '4H, 3H, 2H, H, F, HB, B, 2B, 3B, 4B',
  lineW: 0.42, layerH: 0.2,
  seg: 0.7, cornerSegs: 10,
  wnx: 2.5, wny: 1, whu: 8,
  wFillet: 2.6, notch: true, notchW: 48, notchFlat: 14, notchDrop: 26, notchKeep: 12,
  packL: 100, packW: 38, sheetT: 2.9, sheetN: 15,
  stackMode: 'count', stackH: 43.5,
};


export {DEFAULTS,buildBin,buildLid,derive,clean,toSTL,tipLevels,rrSpec,rrPoints,runFn};
