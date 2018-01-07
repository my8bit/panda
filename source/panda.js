// title:   8 Bit Panda
// author:  Bruno Oliveira
// js port: my8bit
// desc:    A panda platformer
// script:  js
// saveid:  eightbitpandajs

// WARNING: this file must be kept under
// 64kB (TIC-80 limit)!
// Floor division:
// a//b === Math.floor(a / b)
// !equal
// m~=M.PLAY === m !=== M.PLAY
// // bit.brshift(n, bits) (clr >> 8)

const NAME = '8-BIT PANDA';
const C = 8;
const ROWS = 17;
const COLS = 30;
const SCRW = 240;
const SCRH = 136;

// Jump sequence (delta y at each frame)
const JUMP_DY = [
  -3, -3, -3, -3,
  -2, -2, -2, -2,
  -1, -1,
   0,  0,  0,  0, 0
];

// Swimming seq (implemented as a "jump")
const SWIM_JUMP_DY = [
  -2, -2, -1, -1, -1, -1, 0, 0, 0, 0, 0
];
const RESURF_DY = [
  -3, -3, -2, -2, -1, -1, 0, 0, 0, 0, 0
];

// attack sequence (1=preparing,
// 2=attack,3=recovery)
const ATK_SEQ = [1, 1, 1, 1, 2, 3, 3, 3];

// die sequence (dx,dy)
const DIE_SEQ = [
  [-1,-1],[-2,-2],[-3,-3],[-4,-4],
  [-5,-5],[-6,-5],[-7,-4],[-8,-3],[-8, -2],
  [-8, 1],[-8, 3],[-8, 5],[-8, 9],[-8, 13],
  [-8,17],[-8,21],[-8,26],[-8,32],[-8, 39]
];

// display x coords in which
// to keep the player (for scrolling)
const SX_MIN = 50;
const SX_MAX = 70;

// entity/tile solidity
const SOL = {
 NOT : 0, // !solid
 HALF: 1, // only when going down,
          // allows movement upward.
 FULL: 2  // fully solid
};

const FIRE = {
 // duration of fire powerup
 DUR: 1000,
 // time between successive fires.
 INTERVAL: 20,
 // offset from player pos
 OFFY: 2,
 OFFX: 7,
 OFFX_FLIP: -2,
 OFFX_PLANE: 14,
 OFFY_PLANE: 8,
 // projectile collision rect
 COLL: {x: 0, y: 0, w: 3, h: 3}
};

// Tiles
// 0: empty
// 1-79: static solid blocks
// 80-127: decorative
// 128-239: entities
// 240-255: special markers
const T = {
 EMPTY: 0,
 // Platform that's only solid when
 // going down, but allows upward move
 HPLAF: 4,

 SURF: 16,
 WATER: 32,
 WFALL: 48,

 TARMAC: 52, // (Where plane can land).

 // Sprite id above which tiles are
 // non-solid decorative elements
 FIRST_DECO: 80,

 // Level-end gate components
 GATE_L: 110,GATE_R: 111,
 GATE_L2: 142,GATE_R: 143,

 //Tile id above which tiles are
 //representative of entities, !bg
 FIRST_ENT: 128,

 //Tile id above which tiles have special
 //meanings
 FIRST_META: 240,

 // Number markers (used for level
 // packing && annotations).
 META_NUM_0: 240,
   // followed by nums 1-9.

 // A/B markers (entity-specific meaning)
 META_A: 254,
 META_B: 255
};

// Autocomplete of tiles patterns.
// Auto filled when top left map tile
// is present.
// TODO:
const TPAT = {
 '85': [w = 2, h = 2],
 '87': [w = 2, h = 2],
 '94': [w = 2, h = 2],
 '89': [w = 2, h = 2]
};

// Solidity of tiles (overrides)
const TSOL = {};
TSOL[T.EMPTY] = SOL.NOT;
TSOL[T.HPLAF] = SOL.HALF;
TSOL[T.SURF]  = SOL.NOT;
TSOL[T.WATER] =  SOL.NOT;
TSOL[T.WFALL] =  SOL.NOT;

// Animated tiles
const TANIM = {};
TANIM[T.SURF] = [T.SURF, 332];
TANIM[T.WFALL] = [
  T.WFALL, 333, 334, 335
];


// sprites
const S = {
 PLR: {  // player sprites
  STAND: 257,
  WALK1: 258,
  WALK2: 259,
  JUMP: 273,
  SWING: 276,
  SWING_C: 260,
  HIT: 277,
  HIT_C: 278,
  DIE: 274,
  SWIM1: 267,SWIM2: 268,
  // overlays for fire powerup
  FIRE_BAMBOO: 262, // bamboo powerup
  FIRE_F: 265,  // suit, front
  FIRE_P: 266,  // suit, profile
  FIRE_S: 284,  // suit, swimming
  // overlays for super panda powerup
  SUPER_F: 281, // suit, front
  SUPER_P: 282, // suit, profile
  SUPER_S: 283 // suit, swimming
 },
 EN: {  // enemy sprites
  A: 176,
  B: 177,
  DEMON: 178,
  DEMON_THROW: 293,
  SLIME: 180,
  BAT: 181,
  HSLIME: 182, // hidden slime
  DASHER: 183,
  VBAT: 184,
  SDEMON: 185, // snow demon
  SDEMON_THROW: 300,
  PDEMON: 188,  // plasma demon
  PDEMON_THROW: 317,
  FISH: 189,
  FISH2: 190
 },
 // crumbling block
 CRUMBLE: 193,CRUMBLE_2: 304,CRUMBLE_3: 305,
 FIREBALL: 179,
 FIRE_1: 263,FIRE_2: 264,
 LIFT: 192,
 PFIRE: 263, // player fire (bamboo)
 FIRE_PWUP: 129,
 // background mountains
 BGMNT: {DIAG: 496,FULL: 497},
 SCRIM: 498, // also 499,500
 SPIKE: 194,
 CHEST: 195,CHEST_OPEN: 311,
 // timed platform (opens && closes)
 TPLAF: 196, TPLAF_HALF: 312, TPLAF_OFF: 313,
 SUPER_PWUP: 130,
 SIGN: 197,
 SNOWBALL: 186,
 FLAG: 198,
 FLAG_T: 326,  // flag after taken
 ICICLE: 187,   // icicle while hanging
 ICICLE_F: 303, // icicle falling
 PLANE: 132,  // plane (item)
 AVIATOR: 336, // aviator sprite (3x2)
 AVIATOR_PROP_1: 339, // propeller anim
 AVIATOR_PROP_2: 340, // propeller anim
 PLASMA: 279,  // plasma ball
 SICICLE: 199,   // stone-themed icicle,
                // while hanging
 SICICLE_F: 319, // stone-themed icicle,
                // while falling
 FUEL: 200,      // fuel item
 IC_FUEL: 332,   // icon for HUD
 TINY_NUM_00: 480, // "00" sprite
 TINY_NUM_50: 481, // "50" sprite
 TINY_NUM_R1: 482, // 1-10, right aligned
 // food items
 FOOD: {
  LEAF: 128,
  A: 133, B: 134, C: 135, D: 136
 },

 SURF1: 332,SURF2: 333, // water surface fx

 // world map tiles
 WLD: {
  // tiles that player can walk on
  ROADS: [13, 14, 15, 30, 31, 46, 47],
  // level tiles
  LVL1: 61, LVL2: 62, LVL3: 63,
  LVLF: 79, // finale level
  // "cleared level" tile
  LVLC: 463
 },

 // Special EIDs that don't correspond to
 // sprites. ID must be > 512
 POP: 600 // entity that dies immediately
          // with a particle effect
};

// Sprite numbers also function as entity
// IDs. For readability we write S.FOO
// when it's a sprite but EID.FOO when
// it identifies an entity type.
const EID = S;

// anims for each entity ID
const ANIM = {};
ANIM[EID.EN.A] = [S.EN.A, 290];
ANIM[EID.EN.B] = [S.EN.B, 291];
ANIM[EID.EN.DEMON] = [S.EN.DEMON,292];
ANIM[EID.EN.SLIME] = [S.EN.SLIME,295];
ANIM[EID.EN.BAT] = [S.EN.BAT,296];
ANIM[EID.FIREBALL] = [S.FIREBALL,294];
ANIM[EID.FOOD.LEAF] = [S.FOOD.LEAF,288,289];
ANIM[EID.PFIRE] = [S.PFIRE,264];
ANIM[EID.FIRE_PWUP] = [S.FIRE_PWUP,306,307];
ANIM[EID.EN.HSLIME] = [S.EN.HSLIME,297];
ANIM[EID.SPIKE] = [S.SPIKE,308];
ANIM[EID.CHEST] = [S.CHEST,309,310];
ANIM[EID.EN.DASHER] = [S.EN.DASHER,314];
ANIM[EID.EN.VBAT] = [S.EN.VBAT,298];
ANIM[EID.SUPER_PWUP] = [S.SUPER_PWUP,320,321];
ANIM[EID.EN.SDEMON] = [S.EN.SDEMON,299];
ANIM[EID.SNOWBALL] = [S.SNOWBALL,301];
ANIM[EID.FOOD.D] = [S.FOOD.D,322,323,324];
ANIM[EID.FLAG] = [S.FLAG,325];
ANIM[EID.ICICLE] = [S.ICICLE,302];
ANIM[EID.SICICLE] = [S.SICICLE,318];
ANIM[EID.PLANE] = [S.PLANE,327,328,329];
ANIM[EID.EN.PDEMON] = [S.EN.PDEMON,316];
ANIM[EID.PLASMA] = [S.PLASMA,280];
ANIM[EID.FUEL] = [S.FUEL,330,331];
ANIM[EID.EN.FISH] = [S.EN.FISH,368];
ANIM[EID.EN.FISH2] = [S.EN.FISH2,369];


const PLANE = {
 START_FUEL: 2000,
 MAX_FUEL  : 4000,
 FUEL_INC  : 1000,
 FUEL_BAR_W: 50
};

// Modes
const M = {
 BOOT: 0,
 TITLE: 1,    // title screen
 TUT: 2,      // instructions
 RESTORE: 3,  // prompting to restore game
 WLD: 4,      // world map
 PREROLL: 5,  // "LEVEL X-Y" banner
 PLAY: 6,
 DYING: 7,    // die anim
 EOL: 8,      // } of level
 GAMEOVER: 9,
 WIN: 10     // beat entire game
};

// collider rects
const CR = {
 PLR: {x: 2,y: 0,w: 4,h: 8},
 AVIATOR: {x: -6,y: 2,w: 18,h: 10},
 // default
 DFLT: {x: 2,y: 0,w: 4,h: 8},
 FULL: {x: 0,y: 0,w: 8,h: 8},
 // small projectiles
 BALL: {x: 2,y: 2,w: 3,h: 3},
 // just top rows
 TOP: {x: 0,y: 0,w: 8,h: 2},
 // player attack
 ATK: {x: 6,y: 0,w: 7,h: 8},
 // what value to use for x instead if
 // player is flipped (facing left)
 ATK_FLIP_X: -5,
 FOOD: {x: 1,y: 1,w: 6,h: 6}
};

// max dist entity to update it
const ENT_MAX_DIST = 220;

// EIDs to always update regardless of
// distance.
const ALWAYS_UPDATED_EIDS = [];
// lifts need to always be updated for
// position determinism.
ALWAYS_UPDATED_EIDS[EID.LIFT] = true;

// player damage types
const DMG = {
 MELEE:0,      // melee attack
 FIRE:1,       // fire from fire powerup
 PLANE_FIRE:2 // fire from plane
};

// default palette
const PAL = {
 '0' : 0x000000,  '1': 0x402434,
 '2' : 0x30346d,  '3': 0x4a4a4a,
 '4' : 0x854c30,  '5': 0x346524,
 '6' : 0xd04648,  '7': 0x757161,
 '8' : 0x34446d,  '9': 0xd27d2c,
 '10': 0x8595a1, '11': 0x6daa2c,
 '12': 0x1ce68d, '13': 0x6dc2ca,
 '14': 0xdad45e, '15': 0xdeeed6
};

// music tracks
const BGM = {
  A: 0, B: 1, EOL: 2, C: 3,
  WLD: 4, TITLE: 5, FINAL: 6, WIN: 7
};

// bgm for each mode (except M.PLAY, which
// is special)
const BGMM = {};
BGMM[M.TITLE] = BGM.TITLE;
BGMM[M.WLD] = BGM.WLD;
BGMM[M.EOL] = BGM.EOL;
BGMM[M.WIN] = BGM.WIN;

// map data is organized in pages.
// Each page is 30x17. TIC80 has 64 map
// pages laid out as an 8x8 grid. We
// number them in reading order, so 0
// is top left, 63 is bottom right.

// Level info.
// Levels in the cart are packed
// (RLE compressed). When a level is loaded,
// it gets unpacked to the top 8 map pages
// (0,0-239,16).
//  palor: palette overrides
//  pkstart: map page where packed
//    level starts.
//  pklen: length of level. Entire level
//    must be on same page row, can't
//    span multiple page rows.

const LVL = [
 {
  name: '1-1',bg: 2,
  palor: {},
  pkstart: 8,pklen: 3,
  mus: BGM.A
 },
 {
  name: '1-2',bg: 0,
  palor: {'8': 0x102428},
  pkstart: 11,pklen: 2,
  mus: BGM.B
 },
 {
  name:'1-3',bg:2,
  pkstart:13,pklen:3,
  mus:BGM.C,
  save:true
 },
 {
  name:'2-1',bg:1,
  palor:{'8':0x553838},
  pkstart:16,pklen:3,
  mus:BGM.A
 },
 {
  name:'2-2',bg:0,
  palor:{'8':0x553838},
  pkstart:19,pklen:2,
  snow:{clr:2},
  mus:BGM.B
 },
 {
  name:'2-3',bg:1,
  palor:{'8':0x553838},
  pkstart:21,pklen:3,
  mus:BGM.C,
  save:true
 },
 {
  name:'3-1',bg:2,
  palor:{'8':0x7171ae},
  pkstart:24,pklen:3,
  snow:{clr:10},
  mus:BGM.A
 },
 {
  name:'3-2',bg:0,
  palor:{'8':0x3c3c50},
  pkstart:27,pklen:2,
  snow:{clr:10},
  mus:BGM.B
 },
 {
  name:'3-3',bg:2,
  palor:{'8':0x7171ae},
  pkstart:29,pklen:3,
  mus:BGM.C,
  save:true
 },
 {
  name:'4-1',bg:2,
  palor:{'2':0x443c14,'8':0x504410},
  pkstart:32,pklen:3,
  mus:BGM.A
 },
 {
  name:'4-2',bg:2,
  palor:{'2':0x443c14,'8':0x504410},
  pkstart:35,pklen:2,
  mus:BGM.B
 },
 {
  name:'4-3',bg:2,
  palor:{'2':0x443c14,'8':0x504410},
  pkstart:37,pklen:3,
  mus:BGM.C,
  save:true
 },
 {
  name:'5-1',bg:1,
  palor:{'8':0x553838},
  pkstart:40,pklen:3,
  mus:BGM.A
 },
 {
  name:'5-2',bg:1,
  palor:{'8':0x553838},
  pkstart:43,pklen:2,
  mus:BGM.B
 },
 {
  name:'5-3',bg:1,
  palor:{'8':0x553838},
  pkstart:45,pklen:3,
  mus:BGM.C,
  save:true
 },
 {
  name:'6-1',bg:0,
  palor:{'8':0x303030},
  pkstart:48,pklen:3,
  mus:BGM.FINAL,
  snow:{clr:8}
 },
 {
  name:'6-2',bg:0,
  palor:{'8':0x303030},
  pkstart:51,pklen:5,
  mus:BGM.FINAL,
  snow:{clr:8}
 }
];

// length of unpacked level, in cols
// 240 means the top 8 map pages
const LVL_LEN = 240;

// sound specs
const SND = {
 KILL: {sfxid: 62,note: 30,dur: 5},
 JUMP: {sfxid: 61,note: 30,dur: 4},
 SWIM: {sfxid: 61,note: 50,dur: 3},
 ATTACK: {sfxid: 62,note: 40,dur: 4},
 POINT: {sfxid: 60,note: 60,dur: 5,speed: 3},
 DIE: {sfxid: 63,note: 18,dur: 20,speed: -1},
 HURT: {sfxid: 63,note: 'C-4',dur: 4},
 PWUP: {sfxid: 60,note: 45,dur: 15,speed: -2},
 ONEUP: {sfxid: 60,note: 40,dur: 60,speed: -3},
 PLANE: {sfxid: 59,note: 'C-4',dur: 70,speed: -3},
 OPEN: {sfxid: 62,note: 'C-3',dur: 4,speed: -2}
};

// world map consts
const WLD = {
 // foreground tile page
 FPAGE: 61,
 // background tile page
 BPAGE: 62
};

// WLD point of interest types
const POI = {
 LVL: 0
};

// settings
const Sett = {
 snd: true,
 mus: true
};

// game state
const Game = {
 // mode
 m: M.BOOT,
 // ticks since mode start
 t: 0,
 // current level# we're playing
 lvlNo: 0,
 lvl: null,  // shortcut to LVL[lvlNo]
 // scroll offset in current level
 scr: 0,
 // auto-generated background mountains
 bgmnt: null,
 // snow flakes (x,y pairs). These don't
 // change, we just shift when rendering.
 snow: null,
 // highest level cleared by player,
 // -1 if no level cleared
 topLvl: -1
};

// world map state
const Wld = {
 // points of interest (levels, etc)
 pois: [],
 // savegame start pos (maps start level
 // to col,row)
 spos: [],
 plr: {
  // start pos
  x0: -1, y0: -1,
  // player pos, in pixels !row/col
  x: 0, y: 0,
  // player move dir, if moving. Will move
  // until plr arrives at next cell
  dx: 0, dy: 0,
  // last move dir
  ldx: 0, ldy: 0,
  // true iff player facing left
  flipped: false
 }
};

// player
// TODO:
// There are deep copy mutation
let Plr = {}; // deep-copied from PLR_INIT_STATE
const PLR_INIT_STATE = {
 lives: 3,
 x: 0,y: 0, // current pos
 dx: 0,dy: 0, // last movement
 flipped: false, // if true, is facing left
 jmp: 0, // 0: !jumping, otherwise
        // it's the cur jump frame
 jmpSeq: JUMP_DY, // set during jump
 grounded: false,
 swim: false,
 // true if plr is near surface of water
 surf: false,
 // attack state. 0: !attacking,
 // >0 indexes into ATK_SEQ
 atk: 0,
 // die animation frame, 0: !dying
 // indexes into DIE_SEQ
 dying: 0,
 // nudge (movement resulting from
 // collisions)
 nudgeX: 0,nudgeY: 0,
 // if >0, has fire bamboo powerup
 // && this is the countdown to }
 firePwup: 0,
 // if >0 player has fired bamboo.
 // This is ticks until player can fire
 // again.
 fireCd: 0,
 // if >0, is invulnerable for this
 // many ticks, 0 if !invulnerable
 invuln: 0,
 // if true, has the super panda powerup
 super: false,
 // if !:  0, player is being dragged
 // horizontally (forced to move in that
 // direction // >0 is right, <0 is left)
 // The abs value is how many frames
 // this lasts for.
 drag: 0,
 // the sign message (index) the player
 // is currently reading.
 signMsg: 0,
 // sign cycle counter: 1 when just
 // starting to read sign, increases.
 // when player stops reading sign,
 // decreases back to 0.
 signC: 0,
 // respawn pos, 0,0 if unset
 respX: -1,respY: -1,
 // if >0, the player is on the plane
 // && this is the fuel left (ticks).
 plane: 0,
 // current score
 score: 0,
 // for performance, we keep the
 // stringified score ready for display
 scoreDisp: {text: null,value: -1},
 // time (Game.t) when score last changed
 scoreMt: -999,
 // if >0, player is blocked from moving
 // for that many frames.
 locked: 0
};

// max cycle counter for signs
const SIGN_C_MAX = 10;

// sign texts.
const SIGN_MSGS = {
 '0': {
  l1: 'Green bamboo protects',
  l2: 'against one enemy attack.'
 },
 '1': {
  l1: 'Yellow bamboo allows you to throw',
  l2: 'bamboo shoots (limited time).'
 },
 '2': {
  l1: 'Pick up leaves and food to get',
  l2: 'points. 10,000 extra life.'
 },
 '4': {
  l1: 'Bon voyage!',
  l2: 'Don\'t run out of fuel.'
 }
};

// entities
const Ents = [];

// particles
const Parts = [];

// score toasts
const Toasts = [];

// animated tiles, for quick lookup
// indexed by COLUMN.
// Tanims[c] is a list of integers
// indicating rows of animated tiles.
const Tanims = [];

function SetMode(m) {
  Game.m = m;
  Game.t = 0;
  if (
    m !== M.PLAY &&
    m !== M.DYING &&
    m !== M.EOL
  ) {
    ResetPal();
  }
  UpdateMus();
}

function UpdateMus() {
 if (Game.m === M.PLAY) {
  PlayMus(Game.lvl.mus);
 } else {
  PlayMus(BGMM[Game.m] || -1);
 }
}

function TIC() {
 CheckDbgMenu();
 if (Plr.dbg) {
  DbgTic();
  return;
 }
 Game.t = Game.t + 1;
 TICF[Game.m]();
}

function CheckDbgMenu() {
  if (btn(1) && btn(0)) {
    Plr.dbg = true;
    return;
  }
  if (!btn(6)) {
    Game.dbgkc = 0;
    return;
  }
  if (btnp(0)) {
    Game.dbgkc = 10 + (Game.dbgkc || 0);
  }
  if (btnp(1)) {
    Game.dbgkc = 1 + (Game.dbgkc || 0);
  }
  if (Game.dbgkc === 42) {
    Plr.dbg = true;
  }
}

function Boot() {
 ResetPal();
 WldInit();
 SetMode(M.TITLE);
}

// restores default palette with
// the given overrides.
function ResetPal(palor) {
  for (var c = 0; c < 15; c++ ) {
    var clr = PAL[c];
    if (palor && palor[c]) {
      clr = palor[c];
    }
    poke(0x3fc0 + c * 3 + 0, (clr >> 16) & 255);
    poke(0x3fc0 + c * 3 + 1, (clr >> 8) & 255);
    poke(0x3fc0 + c * 3 + 2, clr & 255);
  }
}

function TitleTic() {
 ResetPal();
 cls(2);
 var m = MapPageStart(63);
 map(m.c, m.r, 30, 17, 0, 0, 0);
 spr(S.PLR.WALK1 + (Math.floor(time() / 128)) % 2,16,104,0);
 rect(0, 0, 240, 24, 5);
 print(NAME, 88, 10);
 rect(0, 24, 240, 1, 15);
 rect(0, 26, 240, 1, 5);
 rect(0, SCRH - 8,SCRW,8,0);
 print('github.com/btco/panda',60,SCRH - 7,7);

 if ((Math.floor(time() / 512)) % 2 > 0) {
  print('- PRESS \'Z\' TO START -', 65, 84, 15);
 }
 RendSpotFx(Math.floor(COLS / 2), Math.floor(ROWS / 2), Game.t);
 if (btnp(4)) {
  SetMode(M.RESTORE);
 }
}

function RestoreTic() {
 var saveLvl = pmem(0) || 0;

 if (saveLvl < 1) {
  StartGame(1);
  return;
 }

 Game.restoreSel = Game.restoreSel || 0;

 cls(0);
 var X = 40;
 var Y1 = 30;
 var Y2 = 60;
 print('CONTINUE (LEVEL ' + LVL[saveLvl].name + ')', X, Y1);
 print('START NEW GAME', X, Y2);
 spr(S.PLR.STAND, X - 20, Iif(Game.restoreSel > 0,Y2,Y1));
 if (btnp(0) || btnp(1)) {
  Game.restoreSel = Iif(Game.restoreSel > 0,0,1);
 } else if (btnp(4)) {
  StartGame(Game.restoreSel > 0 && 1 || saveLvl);
 }
}

function TutTic() {
 cls(0);
 if (Game.tutdone) {
  StartLvl(0);
  return;
 }
 var p = MapPageStart(56);
 map(p.c,p.r,COLS,ROWS);

 print('CONTROLS',100,10);
 print('JUMP',56,55);
 print('ATTACK',72,90);
 print('MOVE',160,50);
 print('10,000 PTS = EXTRA LIFE',60,110,3);

 if (Game.t > 150 && 0 == (Math.floor(Game.t / 16) % 2)) {
   print('- Press Z to continue -',60,130);
 }

 if (Game.t > 150 && btnp(4)) {
  Game.tutdone = true;
  StartLvl(0);
 }
}

function WldTic() {
 WldUpdate();
 WldRend();
}

function PrerollTic() {
 cls(0);
 print('LEVEL ' + Game.lvl.name, 100, 40);
 spr(S.PLR.STAND, 105, 60);
 print('X ' + Plr.lives, 125, 60);
 if (Game.t > 60) {
  SetMode(M.PLAY);
 }
}

function PlayTic() {
  if (Plr.dbgFly) {
    UpdateDbgFly();
  } else {
    UpdatePlr();
    UpdateEnts();
    UpdateParts();
    DetectColl();
    ApplyNudge();
    CheckEndLvl();
  }
  AdjustScroll();
  Rend();
  if (Game.m === M.PLAY) {
    RendSpotFx(
      Math.floor((Plr.x - Game.scr) / C),
      Math.floor(Plr.y / C),
      Game.t
    );
  }
}

function EolTic() {
 if (Game.t > 160) {
  AdvanceLvl();
  return;
 }
 Rend();
 print('LEVEL CLEAR', 85, 20);
}

function DyingTic() {
 Plr.dying = Plr.dying + 1;

 if (Game.t > 100) {
  if (Plr.lives > 1) {
   Plr.lives = Plr.lives - 1;
   SetMode(M.WLD);
  } else {
   SetMode(M.GAMEOVER);
  }
 } else {
  Rend();
 }
}

function GameOverTic() {
 cls(0);
 print('GAME OVER!',92,50);
 if (Game.t > 150) {
  SetMode(M.TITLE);
 }
}

function WinTic() {
 cls(0);
 Game.scr = 0;
 var m = MapPageStart(57);
 map(m.c, m.r,
   Math.min(30,Math.floor((Game.t - 300) / 8)),17,0,0,0);
 print('THE END!',100,
   Math.max(20,SCRH - Math.floor(Game.t / 2)));
 print('Thanks for playing!',70,
   Math.max(30,120 + SCRH - Math.floor(Game.t / 2)));

 if (Game.t % 100 === 0) {
  SpawnParts(
    PFX.FW,
    Rnd(40,SCRW - 40),
    Rnd(40,SCRH - 40),
    Rnd(2,15));
 }

 UpdateParts();
 RendParts();

 if (Game.t > 1200 && btnp(4)) {
  SetMode(M.TITLE);
 }
}

const TICF = {};
TICF[M.BOOT] = Boot;
TICF[M.TITLE] = TitleTic;
TICF[M.TUT] = TutTic;
TICF[M.RESTORE] = RestoreTic;
TICF[M.WLD] = WldTic;
TICF[M.PREROLL] = PrerollTic;
TICF[M.PLAY] = PlayTic;
TICF[M.DYING] =  DyingTic;
TICF[M.GAMEOVER] = GameOverTic;
TICF[M.EOL] = EolTic;
TICF[M.WIN] = WinTic;


function StartGame(startLvlNo) {
 Game.topLvl = startLvlNo - 1;
 // Plr.reset();
 Plr = DeepCopy(PLR_INIT_STATE);
 // put player at the right start pos
 var sp = Wld.spos[startLvlNo] ||
   {x: Wld.plr.x0,
    y: Wld.plr.y0};
 Wld.plr.x = sp.x;
 Wld.plr.y = sp.y;
 SetMode(M.WLD);
}

function StartLvl(lvlNo) {
 var oldLvlNo = Game.lvlNo;
 Game.lvlNo = lvlNo;
 Game.lvl = LVL[lvlNo];
 Game.scr = 0;
 var old = Plr;
 Plr = DeepCopy(PLR_INIT_STATE);

 // preserve lives, score
 Plr.lives = old.lives;
 Plr.score = old.score;
 Plr.super = old.super;
 if (oldLvlNo == lvlNo) {
  Plr.respX = old.respX;
  Plr.respY = old.respY;
 }
 SetMode(M.PREROLL);
 Ents.length = 0;
 Parts.length = 0;
 Toasts.length = 0;
 Tanims.length = 0;
 UnpackLvl(lvlNo,UMODE.GAME);
 GenBgMnt();
 GenSnow();
 ResetPal(Game.lvl.palor);
 AdjustRespawnPos();
}

function AdjustRespawnPos() {
  if (Plr.respX < 0) {
    return;
  }
  for (var i = 0; i < Ents.length; i++) {
    var e = Ents[i];
    if (e.eid == EID.FLAG && e.x < Plr.respX) {
     EntRepl(e,EID.FLAG_T);
    }
  };

  Plr.x = Plr.respX;
  Plr.y = Plr.respY;
}

// generates background mountains.
function GenBgMnt() {
 var MAX_Y = 12;
 var MIN_Y = 2;
 // min/max countdown to change direction:
 var MIN_CD = 2;
 var MAX_CD = 6;
 Game.bgmnt = [];
 RndSeed(Game.lvlNo);
 var y = Rnd(MIN_Y, MAX_Y);
 var dy = 1;
 var cd = Rnd(MIN_CD, MAX_CD);
 for (var i = 0; i < LVL_LEN; i++) {
  Ins(Game.bgmnt, {y: y, dy: dy});
  cd = cd - 1;
  if (cd <= 0 || (y + dy) < MIN_Y || (y + dy) > MAX_Y) {
   // keep same y but change direction
   cd = Rnd(MIN_CD,MAX_CD);
   dy = -dy;
  } else {
   y = y + dy;
  }
 }
 RndSeed(time());
}

function GenSnow() {
 if (!Game.lvl.snow) {
  Game.snow = null;
  return;
 }
 Game.snow = [];
 for (var r = 0; r < ROWS - 1; r = r + 2) {
  for (var c = 0; c < COLS - 1; r = r + 2) {
   Ins(Game.snow,{
    x: c * C + Rnd(-8,8),
    y: r * C + Rnd(-8,8)
   });
  }
 }
}

// Whether player is on solid ground.
function IsOnGround() {
 return !CanMove(Plr.x,Plr.y + 1, Plr.y);
}

// Get level tile at given point
function LvlTileAtPt(x, y) {
  return LvlTile(Math.floor(x / C), Math.floor(y / C));
};

// Get level tile.
function LvlTile(c, r) {
  if (c < 0  || c >= LVL_LEN) {
    return 0;
  }
  if (r < 0) {
   return 0;
  }
  // bottom-most tile repeats infinitely
  // below (to allow player to swim
  // when bottom tile is water).
  if (r >= ROWS) {
   r = ROWS - 1;
  }
  return mget(c, r);
}

function SetLvlTile(c,r,t) {
 if (c < 0 || c >= LVL_LEN) { return false; }
 if (r < 0 || r >= ROWS) { return false; }
 mset(c,r,t);
}

function UpdatePlr() {
 var oldx = Plr.x;
 var oldy = Plr.y;

 Plr.plane = Max(Plr.plane - 1,0);
 Plr.fireCd = Max(Plr.fireCd - 1,0);
 Plr.firePwup = Max(Plr.firePwup - 1,0);
 Plr.invuln = Max(Plr.invuln - 1,0);
 Plr.drag = Iif2(
  Plr.drag > 0, Plr.drag - 1,
  Plr.drag < 0, Plr.drag + 1, 0
  );
 Plr.signC = Max(Plr.signC - 1,0);
 Plr.locked = Max(Plr.locked - 1,0);
 UpdateSwimState();

 var swimmod = Plr.swim && Game.t % 2 || 0;

 if (Plr.plane == 0 && Plr.jmp == 0 &&
   !IsOnGround()) {
  // fall
  Plr.y = Plr.y + 1 - swimmod;
 }

 // check if player fell into pit
 if (Plr.y > SCRH + 8) {
  StartDying();
  return;
 }

 // horizontal movement
 var dx = 0;
 var dy = 0;
 var wantLeft = Plr.locked == 0 &&
   Iif(Plr.drag == 0,btn(2),Plr.drag < 0);
 var wantRight = Plr.locked == 0 &&
   Iif(Plr.drag == 0,btn(3),Plr.drag > 0);
 var wantJmp = Plr.locked == 0 &&
   Plr.plane == 0 && btnp(4) && Plr.drag == 0;
 var wantAtk = Plr.locked == 0 &&
   btnp(5) && Plr.drag == 0;

 if (wantLeft) {
  dx = -1 + swimmod;
  // plane doesn't flip
  Plr.flipped = true;
 } else if (wantRight) {
  dx = 1 - swimmod;
  Plr.flipped = false;
 }

 // vertical movement (plane only)
 dy = dy + Iif2(Plr.plane > 0 && btn(0) &&
   Plr.y > 8,-1,
   Plr.plane > 0 && btn(1) &&
   Plr.y < SCRH - 16,1,0);

 // is player flipped (facing left?)
 Plr.flipped = Iif3(
   Plr.plane > 0,false,btn(2),true,
   btn(3),false,Plr.flipped);

 TryMoveBy(dx,dy);

 Plr.grounded = Plr.plane == 0 && IsOnGround();
 // .(Plr.grounded);
 var canJmp = Plr.grounded || Plr.swim;
 // jump
 if (wantJmp && canJmp) {
  Plr.jmp = 1;
  Plr.jmpSeq = Plr.surf &&
    RESURF_DY ||
    (Plr.swim && SWIM_JUMP_DY ||
    JUMP_DY);
  Snd(Plr.surf && SND.JUMP ||
    Plr.swim && SND.SWIM || SND.JUMP);
  // TODO play swim snd if swim
 }
 // TODO: fix jump
 if (Plr.jmp >= Plr.jmpSeq.length) {
  // end jump
  Plr.jmp = 0;
 } else if (Plr.jmp > 0) {
  var ok = TryMoveBy(0, Plr.jmpSeq[Plr.jmp]);
  // if blocked, cancel jump
  Plr.jmp = ok && Plr.jmp + 1 || 0;
 }

 // attack
 if (Plr.atk == 0) {
  if (wantAtk) {
   // start attack sequence
   if (Plr.plane == 0) { Plr.atk = 1; }
   Snd(SND.ATTACK);
   TryFire();
  }
 } else if (Plr.atk >= ATK_SEQ.length) {
  // } of attack sequence
  Plr.atk = 0;
 } else {
  // advance attack sequence
  Plr.atk = Plr.atk + 1;
 }

 // check plane landing
 if (Plr.plane > 0) { CheckTarmac(); }

 Plr.dx = Plr.x - oldx;
 Plr.dy = Plr.y - oldy;
}

function IsWater(t) {
 return t == T.WATER || t == T.SURF ||
   t == T.WFALL;
}

function UpdateSwimState() {
 var wtop = IsWater(
   LvlTileAtPt(Plr.x + 4,Plr.y + 1));
 var wbottom = IsWater(
   LvlTileAtPt(Plr.x + 4,Plr.y + 7));
 var wtop2 = IsWater(
   LvlTileAtPt(Plr.x + 4,Plr.y - 8));
 Plr.swim = wtop && wbottom;
 // is plr near surface?
 Plr.surf = wbottom && !wtop2;
}

function UpdateDbgFly() {
 var d = Iif(btn(4),5,1);
 if (btn(0)) { Plr.y = Plr.y - d; }
 if (btn(1)) { Plr.y = Plr.y + d; }
 if (btn(2)) { Plr.x = Plr.x - d; }
 if (btn(3)) { Plr.x = Plr.x + d; }
 if (btn(5)) { Plr.dbgFly = false; }
}

function TryFire() {
 if (Plr.firePwup < 1 && Plr.plane == 0) {
  return;
 }
 if (Plr.fireCd > 0) { return; }
 Plr.fireCd = FIRE.INTERVAL;
 var x = Plr.x;
 if (Plr.plane == 0) {
  x = x + (Plr.flipped &&
    FIRE.OFFX_FLIP || FIRE.OFFX);
 }else{
  // end of plane
  x = x + FIRE.OFFX_PLANE;
 }
 var y = Plr.y + Iif(Plr.plane > 0,
   FIRE.OFFY_PLANE,FIRE.OFFY);
 var e = EntAdd(EID.PFIRE,x,y);
 e.moveDx = Plr.plane > 0 && 2 ||
   (Plr.flipped && -1 || 1);
 e.ttl = Plr.plane > 0 && Math.floor(e.ttl / 2) || e.ttl;
}

function ApplyNudge() {
 Plr.y = Plr.y + Plr.nudgeY;
 Plr.x = Plr.x + Plr.nudgeX;
 Plr.nudgeX = 0;
 Plr.nudgeY = 0;
}

function TryMoveBy(dx, dy) {
 if (CanMove(Plr.x + dx, Plr.y + dy, Plr.y)) {
  Plr.x += dx;
  Plr.y += dy;
  return true;
 }
 return false;
}

function GetPlrCr() {
 return Iif(Plr.plane > 0,CR.AVIATOR,CR.PLR);
}

// Check if plr can move to given pos.
function CanMove(x,y,py) {
 var dy = y - py;
 var pcr = GetPlrCr();
 var r = CanMoveEx(x, y, pcr, dy);
 if (!r) {
  return false;
 }

 // check if would bump into solid ent
 var pr = RectXLate(pcr, x, y);
 for (var i = 0; i < Ents.length; i++) {
  var e = Ents[i];

  var effSolid = (e.sol == SOL.FULL) ||
   (e.sol == SOL.HALF && dy > 0 &&
   Plr.y + 5 < e.y); // (HACK)
   if (effSolid) {
     var er = RectXLate(e.coll, e.x, e.y);
     if (RectIsct(pr, er)) {
      return false;
     }
    }
 };
 return true;
}

function EntCanMove(e,x,y) {
 return CanMoveEx(x, y, e.coll, y - e.y);
}

function GetTileSol(t) {
 var s = TSOL[t];
 // see if an override is present.
 if (s !== undefined) { return s; }
 // default:
 return Iif(t >= T.FIRST_DECO,SOL.NOT,SOL.FULL);
}

// x,y: candidate pos; cr: collision rect
// dy: y direction of movement
function CanMoveEx(x,y,cr,dy) {
 var x1 = x + cr.x;
 var y1 = y + cr.y;
 var x2 = x1 + cr.w - 1;
 var y2 = y1 + cr.h - 1;
 // check all tiles touched by the rect
 var startC = Math.floor(x1 / C);
 var endC = Math.floor(x2 / C);
 var startR = Math.floor(y1 / C);
 var endR = Math.floor(y2 / C);
 for (var c = startC; c <= endC; c++) {
  for (var r = startR; r <= endR; r++) {
   var sol = GetTileSol(LvlTile(c,r));
   if (sol === SOL.FULL) {
     return false;
   }
  }
 }

 // special case: check for half-solidity
 // tiles. Only solid when standing on
 // top of them (y2%C==0) && going
 // down (dy>0).
 var sA = GetTileSol(LvlTileAtPt(x1,y2));
 var sB = GetTileSol(LvlTileAtPt(x2,y2));
 if (dy > 0 && (sA == SOL.HALF ||
    sB == SOL.HALF) &&
    y2 % C == 0) { return false; }

 return true;
}

function EntWouldFall(e,x) {
 return EntCanMove(e,x,e.y + 1);
}

// check if player landed plane on tarmac
function CheckTarmac() {
 var pr = RectXLate(
   CR.AVIATOR,Plr.x,Plr.y);
 var bottom = pr.y + pr.h + 1;
 var t1 = LvlTileAtPt(pr.x,bottom);
 var t2 = LvlTileAtPt(pr.x + pr.w,bottom);
 if (t1 == T.TARMAC && t2 == T.TARMAC) {
  // landed
  Plr.plane = 0;
  SpawnParts(PFX.POP,Plr.x + 4,Plr.y,14);
  // TODO: more vfx, sfx
 }
}

function AdjustScroll() {
 var dispx = Plr.x - Game.scr;
 if (dispx > SX_MAX) {
  Game.scr = Plr.x - SX_MAX;
 } else if (dispx < SX_MIN) {
  Game.scr = Plr.x - SX_MIN;
 }
}

function AddToast(points,x,y) {
 var rem = points % 100;
 if (points > 1000 || (rem !== 50 && rem !== 0)) {
  return;
 }
 var sp2 = rem == 50 && S.TINY_NUM_50 ||
   S.TINY_NUM_00;
 var sp1 = points >= 100 &&
   (S.TINY_NUM_R1 - 1 + Math.floor(points / 100)) || 0;
 Ins(Toasts,{
    x: Iif(points >= 100,x - 8,x - 12),
    y: y,ttl:40,sp1:sp1,sp2:sp2});
}

// tx,ty: position where to show toast
// (optional)
function AddScore(points,tx,ty) {
 var old = Plr.score;
 Plr.score = Plr.score + points;
 Plr.scoreMt = Game.t;
 if (Math.floor(old / 10000) < Math.floor(Plr.score / 10000)){
  Snd(SND.ONEUP);
  Plr.lives = Plr.lives + 1;
  // TODO: vfx
 }else{
  Snd(SND.POINT);
 }
 if (tx && ty) {
  AddToast(points,tx,ty);
 }
}

function StartDying() {
 SetMode(M.DYING);
 Snd(SND.DIE);
 Plr.dying = 1; // start die anim
 Plr.super = false;
 Plr.firePwup = 0;
 Plr.plane = 0;
}

function EntAdd(newEid, newX, newY) {
 var e = {
  eid: newEid,
  x: newX,
  y: newY
 };

 Ins(Ents, e);
 EntInit(e);
 return e;
}

function EntInit(e) {
 // check if we have an animation for it
 if (ANIM[e.eid]) {
  e.anim = ANIM[e.eid];
  e.sprite = e.anim[0];
 } else {
  // default to static sprite image
  e.sprite = e.eid;
 }
 // whether ent sprite is flipped
 e.flipped = false;
 // collider rect
 e.coll = CR.DFLT;
 // solidity (defaults to !solid)
 e.sol = SOL.NOT;
 // EBT entry
 var ebte = EBT[e.eid];
 // behaviors
 e.beh = ebte && ebte.beh || [];
 // copy initial behavior data to entity
  for (var i = 0; i < e.beh.length; i++) {
    var b = e.beh[i];
    ShallowMerge(e, b.data);
  };
 // overlay the entity-defined data.
 if (ebte && ebte.data) {
  ShallowMerge(e, ebte.data);
 }
 // call the entity init funcs
 for (var i = 0; i < e.beh.length; i++) {
  var b = e.beh[i];
  if (b.init) { b.init(e); }
 };
}

function EntRepl(e,eid,data) {
 e.dead = true;
 var newE = EntAdd(eid,e.x,e.y);
 if (data) {
  ShallowMerge(newE,data);
 }
}

function EntHasBeh(e, soughtBeh) {
 for (var i = 0; i < e.beh.length; i++) {
    var b = e.beh[i];
    if (b == soughtBeh) { return true; }
 };
 return false;
}

function EntAddBeh(e,beh) {
  if (EntHasBeh(e,beh)) { return; }
  // note: can't mutate the original
  // e.beh because it's a shared ref.
  e.beh = DeepCopy(e.beh);
  ShallowMerge(e,beh.data,true);
  Ins(e.beh,beh);
}

function UpdateEnts() {
  // iterate backwards so we can delete
  var len = Ents.length - 1;
  for (var i = len; i >= 0; i--) {
    var e = Ents[i];
    UpdateEnt(e);
    if (e.dead) {
      // delete
      Rem(Ents, i);
    }
  }
}

function UpdateEnt(e) {
  if (!ALWAYS_UPDATED_EIDS[e.eid] &&
    Abs(e.x - Plr.x) > ENT_MAX_DIST) {
    // too far, don't update
    return;
  }
  // update anim frame
  if (e.anim) {
    e.sprite = e.anim[Math.floor(time() / 128) % e.anim.length];
  }
  // run update behaviors
  for (var i = 0; i < e.beh.length; i++) {
    var b = e.beh[i];
    if (b.update) { b.update(e); }
  };
}

function GetEntAt(x,y) {
 for (var i = 0; i < Ents.length; i++) {
  var e = Ents[i];
  if (e.x == x && e.y == y) { return e; }
 }
 return null;
}

// detect collisions
function DetectColl() {
 // player rect
 var pr = RectXLate(GetPlrCr(),
  Plr.x,Plr.y);

 // attack rect
 var ar = null;
 if (ATK_SEQ[Plr.atk] === 2) {
  // player is attacking, so check if
  // entity was hit by attack
  ar = RectXLate(CR.ATK,Plr.x,Plr.y);
  if (Plr.flipped) {
   ar.x = Plr.x + CR.ATK_FLIP_X;
  }
 }
 for(var i = 0; i < Ents.length; i++) {
  var e = Ents[i];
  var er = RectXLate(e.coll,e.x,e.y);
  if (RectIsct(pr,er)) {
   // collision between player && ent
   HandlePlrColl(e);
  } else if (ar && RectIsct(ar,er)) {
   // ent hit by player attack
   HandleDamage(e,DMG.MELEE);
  }
 };
}

function CheckEndLvl() {
 var t = LvlTileAtPt(
   Plr.x + Math.floor(C / 2),
   Plr.y + Math.floor(C / 2)
 );
 if (t == T.GATE_L || t == T.GATE_R ||
     t == T.GATE_L2 || t == T.GATE_R2) {
  EndLvl();
 }
}

function EndLvl() {
 Game.topLvl = Max(Game.topLvl, Game.lvlNo);
 SetMode(M.EOL);
}

function AdvanceLvl() {
 // save game if we should
 if (Game.lvl.save) {
  pmem(0,Max(pmem(0) || 0,
    Game.lvlNo + 1));
 }
 if (Game.lvlNo >= LVL.length) {
  // end of game.
  SetMode(M.WIN);
 } else {
  // go back to map.
  SetMode(M.WLD);
 }
}

// handle collision w/ given ent
function HandlePlrColl(e) {
  for(var i = 0; i < e.beh.length; i++){
    var b = e.beh[i];
    if (b.coll){
      b.coll(e);
    }
    // TODO: break
    if (e.dead) { break; }
  };
}

function HandleDamage(e, dtype) {
 for(var i = 0; i < e.beh.length; i++){
 //for _,b in pairs(e.beh) {
  var b = e.beh[i];
  if (b.dmg) { b.dmg(e,dtype); }
  if (e.dead) {
   SpawnParts(PFX.POP,e.x + 4,e.y + 4,e.clr);
   Snd(SND.KILL);
   break;
  }
 }
}

function HandlePlrHurt() {
 if (Plr.invuln > 0 ){ return; }
 if ((Plr.plane == 0) && Plr.super) {
  Snd(SND.HURT);
  Plr.super = false;
  Plr.invuln = 100;
  Plr.drag = Iif(Plr.dx >= 0,-10,10);
  Plr.jmp = 0;
 } else {
  StartDying();
 }
}

function Snd(spec) {
 if (!Sett.snd) { return; }
 sfx(spec.sfxid,spec.note,spec.dur,
   0,spec.vol || 15,spec.speed || 0);
}

function PlayMus(musid) {
 if (Sett.mus || musid == -1) {
  music(musid);
 }
}

/////////////////////////
// PARTICLES
/////////////////////////

// possible effects
const PFX = {
 POP:{
  rad:4,
  count:15,
  speed:4,
  fall:true,
  ttl:15
 },
 FW:{ // fireworks
  rad:3,
  count:40,
  speed:1,
  fall:false,
  ttl:100
 }
};

// fx=one of the effects in PFX
// cx,cy=center, clr=the color
function SpawnParts(fx,cx,cy,clr) {
 for (var i = 0; i < fx.count; i++) {
  var r = Rnd01() * fx.rad;
  var phi = Rnd01() * Math.PI * 2;
  var part = {
   x: cx + r * Cos(phi),
   y: cy + r * Sin(phi),
   vx: fx.speed * Cos(phi),
   vy: fx.speed * Sin(phi),
   fall: fx.fall,
   ttl: fx.ttl,
   age: 0,
   clr: clr
  };
  Ins(Parts,part);
 }
}

function UpdateParts() {
 // iterate backwards so we can delete
 for (var i = Parts.length - 1; i > 0; i--) {
  var p = Parts[i];
  p.age = p.age + 1;
  if (p.age >= p.ttl) {
   // delete
   Rem(Parts, i);
  } else {
   p.x = p.x + p.vx;
   p.y = p.y + p.vy + (p.fall && Math.floor(p.age / 2) || 0);
  }
 }
}

function RendParts() {
  for (var i = 0; i < Parts.length; i++) {
    var p = Parts[i];
    pix(p.x - Game.scr,p.y,p.clr);
  };
 }

///////////////////////////
// WLD MAP
///////////////////////////
// convert "World W-L" into index
function Wl(w, l) {
  return (w - 1) * 3 + l;
}

// Init world (runs once at start of app).
function WldInit() {
 for (var r = 0; r < ROWS - 1; r++) {
  for (var c = 0; c < COLS - 1; c++) {
   var t = WldFgTile(c,r);
   var lval = WldLvlVal(t);
   if (t === T.META_A) {
     // player start pos
     Wld.plr.x0 = c * C;
     Wld.plr.y0 = (r - 1) * C;
   } else if (t === T.META_B) {
      var mv = WldGetTag(c,r);
      // savegame start pos
      Wld.spos[Wl(mv,1)] = {
        x: c * C,
        y: (r - 1) * C
      };
   } else if (lval > 0) {
      var mv = WldGetTag(c,r);
      // It's a level tile.
      var poi = {
        c: c,
        r: r,
        t: POI.LVL,
        lvl: Wl(mv, lval)
      };
    Ins(Wld.pois, poi);
   }
  }
 }
}

// Looks around tc,tr for a numeric tag.
function WldGetTag(tc,tr) {
 for (var r = tr - 1; r <= tr + 1; r++) {
  for (var c = tc - 1; c <= tc + 1; c++) {
   var mv = MetaVal(WldFgTile(c,r), 0);
   if (mv > 0) {
    return mv;
   }
  }
 }
 trace('No WLD tag @' + tc + ',' + tr);
 return 0;
}

// Returns the value (1, 2, 3) of a WLD
// level tile.
function WldLvlVal(t) {
 return Iif4(
   t === S.WLD.LVLF, 1,
   t === S.WLD.LVL1, 1,
   t === S.WLD.LVL2, 2,
   t === S.WLD.LVL3, 3, 0);
}

function WldFgTile(c,r) {
 return MapPageTile(WLD.FPAGE, c, r);
}

function WldBgTile(c,r) {
 return MapPageTile(WLD.BPAGE, c, r);
}

function WldPoiAt(c,r) {
  return Wld.pois.filter(poi => {
      // TODO: find es7
      return (poi.c === c && poi.r === r);
  })[0] || null;
}

function WldHasRoadAt(c,r) {
  var t = WldFgTile(c,r);
  return S.WLD.ROADS.indexOf(t) !== -1;
};

function WldUpdate() {
 var p = Wld.plr;  // shorthand

 if (p.dx !== 0 || p.dy !== 0) {
  // Just move.
  p.x = p.x + p.dx;
  p.y = p.y + p.dy;
  if (p.x % C == 0 && p.y % C == 0) {
   // reached destination.
   p.ldx = p.dx;
   p.ldy = p.dy;
   p.dx = 0;
   p.dy = 0;
  }
  return;
 }

 if (btn(0)) { WldTryMove(0,-1); }
 if (btn(1)) { WldTryMove(0,1); }
 if (btn(2)) { WldTryMove(-1,0); }
 if (btn(3)) { WldTryMove(1,0); }

 Wld.plr.flipped = Iif(
   Iif(Wld.plr.flipped,btn(3),btn(2)),
  !Wld.plr.flipped,
   Wld.plr.flipped); // wtf

 if (btnp(4)) {
  var poi = WldPoiAt(
    Math.floor(p.x / C),
    Math.floor(p.y / C)
  );
  if (poi && poi.lvl > Game.topLvl) {
   if (poi.lvl === 1) {
    SetMode(M.TUT);
   } else {
    StartLvl(poi.lvl);
   }
  }
 }
}

function WldTryMove(dx,dy) {
 var p = Wld.plr;  // shorthand

 // if we are in locked POI, we can only
 // come back the way we came.
  var poi = WldPoiAt(
    Math.floor(p.x / C),
    Math.floor(p.y / C)
  );

  if (!Plr.dbgFly && poi &&
    poi.lvl > Game.topLvl &&
    (dx !== -p.ldx || dy !== -p.ldy)
  ) {
    return;
  }

  var tc = Math.floor(p.x / C) + dx;
  var tr = Math.floor(p.y / C) + dy;
trace('WldHasRoadAt(tc,tr) =' + WldPoiAt(tc,tr));
trace('WldPoiAt(tc,tr) =' + WldPoiAt(tc,tr));
 if (WldHasRoadAt(tc,tr) || WldPoiAt(tc,tr)) {
  // Destination is a road || level.
  // Move is valid.
  p.dx = dx;
  p.dy = dy;
  return;
 }
}

function WldFgRemapFunc(t) {
 return t < T.FIRST_META && t || 0;
}

function WldRend() {
 if (Game.m !== M.WLD) {
  return;
 }
 cls(2);
 rect(0,SCRH - 8,SCRW,8,0);
 var fp = MapPageStart(WLD.FPAGE);
 var bp = MapPageStart(WLD.BPAGE);
 // render map bg
 map(bp.c,bp.r,COLS,ROWS,0,0,0,1);
 // render map fg, excluding markers
 map(fp.c,fp.r,COLS,ROWS,0,0,0,1,
   WldFgRemapFunc);

 // render the "off" version of level
 // tiles on top of cleared levels.
 for (var i = 0; i < Wld.pois.length; i++) {
  var poi = Wld.pois[i];
  if (poi.lvl <= Game.topLvl) {
   spr(S.WLD.LVLC, poi.c * C, poi.r * C, 0);
  }
 };

 print('SELECT LEVEL TO PLAY', 70,10);
 print('= MOVE',34,SCRH - 6);
 print('= ENTER LEVEL',98,SCRH - 6);

 RendSpotFx(
  Math.floor(Wld.plr.x / C),
  Math.floor(Wld.plr.y / C),
  Game.t
 );
 if (0 === (Math.floor(Game.t / 16)) % 2) {
  rectb(
    Wld.plr.x - 3,
    Wld.plr.y - 3, 13, 13, 15);
 }
 spr(
  S.PLR.STAND,
  Wld.plr.x,
  Wld.plr.y,
  0,1,
  Wld.plr.flipped && 1 || 0);
 RendHud();
}

///////////////////////
// LEVEL UNPACKING
///////////////////////
// unpack modes
const UMODE = {
 GAME: 0, // unpack for gameplay
 EDIT: 1 // unpack for editing
};

function MapPageStart(pageNo) {
  return {
    c: (pageNo - Math.floor(pageNo / 8) * 8) * 30,
    r: Math.floor(pageNo / 8) * 17
  };
}

function MapPageTile(pageNo, c, r, newVal) {
  var pstart = MapPageStart(pageNo);
  if (newVal) {
    mset(c + pstart.c,r + pstart.r,newVal);
  }
 return mget(c + pstart.c,r + pstart.r);
}

// Unpacked level is written to top 8
// map pages (cells 0,0-239,16).
function UnpackLvl(lvlNo,mode) {
  var lvl = LVL[lvlNo];
  var start = MapPageStart(lvl.pkstart);
  var offc = start.c;
  var offr = start.r;
  var len = lvl.pklen * 30;
  var endc = FindLvlEndCol(offc,offr,len);

  MapClear(0,0,LVL_LEN,ROWS);

  // next output col
  var outc = 0;
  // for each col in packed map

  for (var c = offc; c < endc; c++) {
    var cmd = mget(c,offr);
    var copies = MetaVal(cmd,1);
    // create that many copies of this col
    for (var i = 0; i < copies; i++) {
      CreateCol(c, outc, offr, mode == UMODE.GAME);
      // advance output col
      outc++;// = outc + 1;
      if (outc >= LVL_LEN) {
        trace('ERROR: level too long: ' + lvlNo);
        return;
      }
    }
  }

 // if in gameplay, expand patterns &&
 // remove special markers
 // (first META_A is player start pos)
 if (mode == UMODE.GAME) {
  // TODO: optimize
  for (var c = 0; c < LVL_LEN - 1; c++) {
   for (var r = 0; r < ROWS - 1; r++) {
    var t = mget(c,r);
    var tpat = TPAT[t];
    if (tpat) {
      ExpandTpat(tpat,c,r);
    }
    if (Plr.x === 0 && Plr.y === 0 &&
          t === T.META_A) {
     // player start position.
     Plr.x = c * C;
     Plr.y = r * C;
    }
    if (t >= T.FIRST_META) {
     mset(c,r,0);
    }
   }
  }
  if (Plr.x == 0 && Plr.y == 0) {
   trace('*** start pos UNSET L' + lvlNo);
  }
  FillWater();
  SetUpTanims();
 }
}

// expand tile pattern at c,r
function ExpandTpat(tpat,c,r) {
 var s = mget(c,r);
 for (var i = 0; i <= tpat.w - 1; i++) {
  for (var j = 0; j <= tpat.h - 1; j++) {
   mset(c + i, r + j, s + j * 16 + i);
  }
 }
}

// Sets up tile animations.
function SetUpTanims() {
 for (var c = 0;c < LVL_LEN - 1; c++) {
  for (var r = 0; r < ROWS - 1; r++) {
   var t = mget(c,r);
   if (TANIM[t]) {
    TanimAdd(c,r);
   }
  }
 }
}

function FindLvlEndCol(c0,r0,len) {
 // iterate backwards until we find a
 // non-empty col.

 for (var c = c0 + len - 1 ; c >= c0; c--) {
  for (var r = r0; r <= r0 + ROWS - 1; r++) {
   if (mget(c,r) > 0) {
    //rightmost non empty col
    return c;
   }
  }
 }
 return c0;
}

function FillWater() {
 // We fill downward from surface tiles,
 // Downward && upward from water tiles.
 var surfs = [];  // surface tiles
 var waters = []; // water tiles
 for (var c = LVL_LEN - 1; c >= 0; c--) {
  for (var r = ROWS - 1; r >= 0; r--) {
   if (mget(c,r) == T.SURF) {
    Ins(surfs,{c: c,r: r});
   } else if (mget(c,r) === T.WATER ){
    Ins(waters,{c: c,r: r});
   }
  }
 }

 for (var i = 0; i < surfs.length; i++) {
  var s = surfs[i];
  // fill water below this tile
  FillWaterAt(s.c,s.r,1);
 };
 for (var i = 0; i < waters.length; i++) {
  var s = waters[i];
  // fill water above && below this tile
  FillWaterAt(s.c,s.r,-1);
  FillWaterAt(s.c,s.r,1);
 };
}

// Fill water starting (but !including)
// given tile, in the given direction
// (1:down, -1:up)
function FillWaterAt(c,r0,dir) {
 var from = r0 + dir;
 var to = Iif(dir > 0, ROWS - 1, 0);
 for (var r = from; r < to; r += dir) {
  if (mget(c,r) == T.EMPTY) {
   mset(c,r,T.WATER);
  } else {
   return;
  }
 }
}

function TanimAdd(c,r) {
 if (Tanims[c]) {
  Ins(Tanims[c],r);
 } else {
  Tanims[c] = [r];
 }
}

// pack lvl from 0,0-239,16 to the packed
// level area of the indicated level
function PackLvl(lvlNo) {
 var lvl = LVL[lvlNo];
 var start = MapPageStart(lvl.pkstart);
 var outc = start.c;
 var outr = start.r;
 var len = lvl.pklen * 30;

 var endc = FindLvlEndCol(0,0,LVL_LEN);

 // pack
 var reps = 0;
 MapClear(outc,outr,len,ROWS);
 for (var c = 0; c < endc; c++) {
  if (c > 0 && MapColsEqual(c,c - 1,0) && reps < 12) {
   // increment repeat marker on prev col
   var m = mget(outc - 1,outr);
   m = Iif(m == 0,T.META_NUM_0 + 2,m + 1);
   mset(outc - 1,outr,m);
   reps = reps + 1;
  } else {
   reps = 1;
   // copy col to packed level
   MapCopy(c,0,outc,outr,1,ROWS);
   outc = outc + 1;
   if (outc >= start.c + len) {
    trace('Capacity exceeded.');
    return false;
   }
  }
 }
 trace('packed ' + (endc + 1) + ' -> ' +
  (outc + 1 - start.c));
 return true;
}

// Create map col (dstc,0)-(dstc,ROWS-1)
// from source col located at
// (srcc,offr)-(srcc,offr+ROWS-1).
// if ie, instantiates entities.
function CreateCol(srcc,dstc,offr,ie) {
 // copy entire column first
 MapCopy(srcc,offr,dstc,0,1,ROWS);
 mset(dstc,0,T.EMPTY); // top cell is empty
 if (!ie) { return; }
 // instantiate entities

 for (var r = 0; r < ROWS - 1; r++) {
  var t = mget(dstc, r);
  if (t >= T.FIRST_ENT && EBT[t]) {
   // entity tile: create entity
   mset(dstc, r, T.EMPTY);
   EntAdd(t, dstc * C, r * C);
  }
 }
}

/////////////////////////////
// RENDERING
/////////////////////////////

function Rend() {
  RendBg();
  if (Game.snow) { RendSnow(); }
  RendMap();
  RendTanims();
  RendEnts();
  RendToasts();
  if (Game.m === M.EOL) { RendScrim(); }
  RendPlr();
  RendParts();
  RendHud();
  RendSign();
}

function RendBg() {
 var END_R = ROWS;
 cls(Game.lvl.bg);
 var offset = Math.floor(Game.scr / 2) + 50;
 // If i is a col# of mountains (starting
 // at index 1), { its screen pos
 // sx=(i-1)*C-off
 // Solving for i, i=1+(sx+off)/C
 // so at the left of screen, sx=0, we
 // have i=1+off/C
 var startI = Max(1,1 + Math.floor(offset / C));
 var endI = Min(startI + COLS, Game.bgmnt.length);
 for (var i = startI; i <= endI; i++) {
  var sx = (i - 1) * C - offset;
  var part = Game.bgmnt[i];
  for (var r = part.y; r <= END_R; r++) {
   var spid = Iif(r == part.y,
    S.BGMNT.DIAG,S.BGMNT.FULL);
    spr(spid,(i - 1) * C - offset,r * C,0,1,
    Iif(part.dy > 0,1,0));
  }
 }
}

function RendSnow() {
 var dx = -Game.scr;
 var dy = Math.floor(Game.t / 2);
 // for _,p in pairs(Game.snow) {
for (var i = 0; i < Game.snow.length; i++) {
  var p = Game.snow[i];

  var sx = ((p.x + dx) % SCRW + SCRW) % SCRW;
  var sy = ((p.y + dy) % SCRH + SCRH) % SCRH;
  pix(sx,sy,Game.lvl.snow.clr);
 };
}

function RendToasts() {
 for (var i = Toasts.length - 1; i >= 0; i--) {
  var t = Toasts[i];
  t.ttl = t.ttl - 1;
  if (t.ttl <= 0) {
   // Toasts[i] = Toasts[Toasts.length - 1]; // TODO: ???
   Rem(Toasts, i);
  } else {
   t.y = t.y - 1;
   spr(t.sp1,t.x - Game.scr,t.y,0);
   spr(t.sp2,t.x - Game.scr + C,t.y,0);
  }
 }
}

function RendMap() {
 // col c is rendered at
 //   sx=-Game.scr+c*C
 // Setting sx=0 && solving for c
 //   c=Game.scr//C
 var c = Math.floor(Game.scr / C);
 var sx = -Game.scr + c * C;
 var w = Min(COLS + 1, LVL_LEN - c);
 if (c < 0) {
  sx = sx + C * (-c);
  c = 0;
 }
 map(
  // col,row,w,h
  c,0,w,ROWS,
  // sx,sy,colorkey,scale
  sx,0,0,1);
}

function RendPlr() {
 var spid;
 var walking = false;

 if (Plr.plane > 0) {
  RendPlane();
  return;
 }

 if (Plr.dying > 0) {
  spid = S.PLR.DIE;
 } else if (Plr.atk > 0) {
  spid =
    ATK_SEQ[Plr.atk] == 1 && S.PLR.SWING
    || S.PLR.HIT;
 } else if (Plr.grounded) {
  if (btn(2) || btn(3)) {
   spid = S.PLR.WALK1 + time() % 2;
   walking = true;
  } else {
   spid = S.PLR.STAND;
  }
 } else if (Plr.swim) {
  spid = S.PLR.SWIM1 + Math.floor(Game.t / 4) % 2;
 } else {
  spid = S.PLR.JUMP;
 }

 var sx = Plr.x - Game.scr;
 var sy = Plr.y;
 var flip = Plr.flipped && 1 || 0;

 // apply dying animation
 if (spid === S.PLR.DIE) {
   if (Plr.dying < DIE_SEQ.length) {
    sx = sx + DIE_SEQ[Plr.dying][0];
    sy = sy + DIE_SEQ[Plr.dying][1];
   } else {
    sx = -1000;
    sy = -1000;
   }
  }

 // if invulnerable, blink
 if (Plr.invuln > 0 &&
    0 == Math.floor(Game.t / 4) % 2) { return; }

 spr(spid,sx,sy,0,1,flip);

 // extra sprite for attack states
 if (spid == S.PLR.SWING) {
  spr(S.PLR.SWING_C,sx,sy - C,0,1,flip);
 } else if (spid == S.PLR.HIT) {
  spr(S.PLR.HIT_C,
    sx + (Plr.flipped && -C || C),
    sy,0,1,flip);
 }

 // draw super panda overlay if player
 // has the super panda powerup
 if (Plr.super ){
  var osp = Iif3(Plr.atk > 0,S.PLR.SUPER_F,
   Plr.swim && !Plr.grounded,
   S.PLR.SUPER_S,
   walking,S.PLR.SUPER_P,S.PLR.SUPER_F);
  spr(osp,sx,Plr.y,0,1,flip);
 }

 // draw overlays (blinking bamboo &&
 // yellow body) if powerup
 if (spid !== S.PLR.SWING && Plr.firePwup > 0
    && Math.floor(time() / 128) % 2 == 0 ){
  spr(S.PLR.FIRE_BAMBOO,sx,Plr.y,0,1,flip);
 }
 if (Plr.firePwup > 100 ||
     1 == Math.floor(Plr.firePwup / 16) % 2) {
  var osp = Iif3(Plr.atk > 0,S.PLR.FIRE_F,
   Plr.swim && !Plr.grounded,
   S.PLR.FIRE_S,
   walking,S.PLR.FIRE_P,S.PLR.FIRE_F);
  spr(osp,sx,Plr.y,0,1,flip);
 }

 // if just respawned, highlight player
 if (Game.m == M.PLAY && Plr.dying == 0 &&
    Plr.respX >= 0 && Game.t < 100 &&
    Math.floor(Game.t / 8) % 2 == 0) {
  rectb(Plr.x - Game.scr - 2,Plr.y - 2,
    C + 4,C + 4,15);
 }
}

function RendPlane() {
 var ybias = Math.floor(Game.t / 8) % 2 == 0 && 1 || 0;

 var sx = Plr.x - Game.scr;
 spr(S.AVIATOR,
   sx - C,Plr.y + ybias,0,1,0,0,3,2);
 var spid = Math.floor(Game.t / 4) % 2 == 0 &&
   S.AVIATOR_PROP_1 || S.AVIATOR_PROP_2;
 spr(spid,sx + C,
   Plr.y + ybias + 4,0);
}

function RendHud() {
 rect(0,0,SCRW,C,3);

 if (Plr.scoreDisp.value !== Plr.score) {
  Plr.scoreDisp.value = Plr.score;
  Plr.scoreDisp.text = Lpad(Plr.score,6);
 }

 var clr = 15;

 print(Plr.scoreDisp.text,192,1,clr,true);
 print((Game.m === M.WLD &&
   'WORLD MAP' ||
   ('LEVEL ' + Game.lvl.name)),95,1,7);
 spr(S.PLR.STAND,5,0,0);
 print('x ' + Plr.lives,16,1);

 if (Plr.plane > 0) {
  var barw = PLANE.FUEL_BAR_W;
  var lx = 120 - Math.floor(barw / 2);
  var y = 8;
  var clr = (
    Plr.plane < 800 &&
    (Math.floor(Game.t / 16)) % 2 === 0)
    && 6 || 14;
  var clrLo = (clr === 14 && 4 || clr);
  print('E',lx - 7,y,clr);
  print('F',lx + barw + 1,y,14);
  rectb(lx,y,barw,6,clrLo);
  var bw = Plr.plane *
    Math.floor((PLANE.FUEL_BAR_W - 2) / PLANE.MAX_FUEL);
  rect(lx + 1,y + 1,Max(bw,1),4,clr);
  pix(lx + Math.floor(barw / 4),y + 4,clrLo);
  pix(lx + Math.floor(barw / 2),y + 4,clrLo);
  pix(lx + Math.floor(barw / 2),y + 3,clrLo);
  pix(lx + 3 * Math.floor(barw / 4),y + 4,clrLo);
 }
}

function RendEnts() {
 for (var i = 0; i < Ents.length; i++) {
  var e = Ents[i];
  var sx = e.x - Game.scr;
  if (sx > -C && sx < SCRW) {
   spr(e.sprite,sx,e.y,0,1,
     (e.flipped && 1) || 0);
  }
 };
}

function RendScrim(sp) {
 var spid = sp || Iif3(Game.t > 45,0,
  Game.t > 30, S.SCRIM + 2,
  Game.t > 15, S.SCRIM + 1,
  S.SCRIM);
 for (var r = 0; r <= ROWS - 1; r++) {
  for (var c = 0; c <= COLS - 1; c++) {
   spr(spid, c * C,r * C,15);
  }
 }
}

// Render spotlight effect.
// fc,fr: cell at center of effect
// t: clock (ticks)
function RendSpotFx(fc,fr,t) {
 var rad = Max(0,Math.floor(t / 2) - 2); // radius
 if (rad > COLS){
  return;
 }
 for (var r = 0; r <= ROWS - 1; r++) {
  for (var c = 0; c <= COLS - 1; c++) {
   var d = Max(Abs(fc - c), Abs(fr - r));
   var sa = d - rad;  // scrim amount
   var spid = Iif2(sa <= 0, -1, sa <= 3,S.SCRIM + sa - 1, 0);
   if (spid >= 0) {
    spr(spid, c * C, r * C, 15);
   }
  }
 }
}

function RendSign() {
  if (0 == Plr.signC) { return; }
  var w = Plr.signC * 20;
  var h = Plr.signC * 3;
  var x = Math.floor(SCRW / 2) - Math.floor(w / 2);
  var y = Math.floor(SCRH / 2) - Math.floor(h / 2) - 20;
  var s = SIGN_MSGS[Plr.signMsg];
  rect(x, y , w, h, 15);
  if (Plr.signC == SIGN_C_MAX) {
    print(s.l1,x + 6,y + 8,0);
    print(s.l2,x + 6,y + 8 + C,0);
  }
}

// Rend tile animations
function RendTanims() {
  var c0 = Max(0, Math.floor(Game.scr / C));
  var cf = c0 + COLS;
  for (var c = c0; c < cf; c++) {
    var anims = Tanims[c];
    if (anims) {
      for (var i = 0; i < anims.length; i++) {
        var r = anims[i];

        var tanim = TANIM[mget(c,r)];
        if (tanim) {
          var spid = tanim[1 + Math.floor((Game.t / 16)) % tanim.length];
          spr(spid, c * C - Game.scr, r * C);
        }
      }
    }
  }
}

////////////////////////////////////
// ENTITY BEHAVIORS
////////////////////////////////////

// move hit modes: what happens when
// entity hits something solid.
const MOVE_HIT = {
 NONE: 0,
 STOP: 1,
 BOUNCE: 2,
 DIE: 3
};

// aim mode
const AIM = {
 NONE: 0,   // just shoot in natural
           // direction of projectile
 HORIZ: 1,  // adjust horizontal vel to
           // go towards player
 VERT: 2,   // adjust vertical vel to go
           // towards player
 FULL: 3   // adjust horiz/vert to aim
           // at player
};

// moves horizontally
// moveDen: every how many ticks to move
// moveDx: how much to move
// moveHitMode: what to { on wall hit
// noFall: if true, flip instead of falling
function BehMove(e) {
 if (e.moveT > 0) { e.moveT = e.moveT - 1; }
 if (e.moveT == 0) { return; }
 if (e.moveWaitPlr > 0) {
  if (Abs(Plr.x - e.x) > e.moveWaitPlr) {
   return;
  } else{ e.moveWaitPlr = 0; }
 }
 e.moveNum = e.moveNum + 1;
 if (e.moveNum < e.moveDen) { return; }
 e.moveNum = 0;

 if (e.noFall &&
    EntWouldFall(e,e.x + e.moveDx)) {
  // flip rather than fall
  e.moveDx = -e.moveDx;
  e.flipped = e.moveDx > 0;
 } else if (e.moveHitMode == MOVE_HIT.NONE ||
     EntCanMove(e,e.x + e.moveDx,e.y)) {
  e.x = e.x + (e.moveDx || 0);
  e.y = e.y + (e.moveDy || 0);
 } else if (e.moveHitMode == MOVE_HIT.BOUNCE) {
  e.moveDx = -(e.moveDx || 0);
  e.flipped = e.moveDx > 0;
 } else if (e.moveHitMode == MOVE_HIT.DIE) {
  e.dead = true;
 }
}

// Moves up/down.
// e.yamp: amplitude
function BehUpDownInit(e) {
 e.maxy = e.y;
 e.miny = e.maxy - e.yamp;
}

function BehUpDown(e) {
 e.ynum = e.ynum + 1;
 if (e.ynum < e.yden) { return; }
 e.ynum = 0;
 e.y = e.y + e.dy;
 if (e.y <= e.miny) { e.dy = 1; }
 if (e.y >= e.maxy) { e.dy = -1; }
}

function BehFacePlr(e) {
 e.flipped = Plr.x > e.x;
 if (e.moveDx) {
  e.moveDx = Abs(e.moveDx) *
   (e.flipped && 1 || -1);
 }
}

// automatically flips movement
// flipDen: every how many ticks to flip
function BehFlip(e) {
 e.flipNum = e.flipNum + 1;
 if (e.flipNum < e.flipDen) { return; }
 e.flipNum = 0;
 e.flipped = !e.flipped;
 e.moveDx = (e.moveDx && -e.moveDx || 0);
}

function BehJump(e) {
 if (e.jmp == 0) {
  e.jmpNum = e.jmpNum + 1;
  if (e.jmpNum < e.jmpDen ||
      !e.grounded) { return; }
  e.jmpNum = 0;
  e.jmp = 1;
 } else {
  // continue jump
  e.jmp = e.jmp + 1;
  if (e.jmp > JUMP_DY.length) {
   // end jump
   e.jmp = 0;
  } else {
   var dy = JUMP_DY[e.jmp];
   if (EntCanMove(e,e.x,e.y + dy)) {
    e.y = e.y + dy;
   } else {
    e.jmp = 0;
   }
  }
 }
}

function BehFall(e) {
 e.grounded = !EntCanMove(e,e.x,e.y + 1);
 if (!e.grounded && e.jmp == 0) {
  e.y = e.y + 1;
 }
}

function BehTakeDmg(e,dtype){
 if (!ArrayContains(e.dtypes,dtype)) {
  return;
 }
 e.hp = e.hp - 1;
 if (e.hp > 0) { return; }
 e.dead = true;
 // drop loot?
 var roll = Rnd(0,99);
 // give bonus probability to starting
 // levels (decrease roll value)
 roll = Max(Iif2(Game.lvlNo < 2,roll - 50,
   Game.lvlNo < 4,roll - 25,roll),0);
 if (roll < e.lootp) {
  var i = Rnd(1, e.loot.length);
  i = Min(Max(i,1),e.loot.length);
  var l = EntAdd(e.loot[i],e.x,e.y - 4);
  EntAddBeh(l,BE.MOVE);
  ShallowMerge(l,{moveDy: -1,moveDx: 0,
    moveDen: 1,moveT: 8});
 }
}

function BehPoints(e){
 e.dead = true;
 AddScore(e.value || 50,e.x + 4,e.y - 4);
}

function BehHurt(e) {
 HandlePlrHurt();
}

function BehLiftInit(e) {
 // lift top && bottom y:
 var a = C * FetchTile(
   T.META_A, Math.floor(e.x / C));
 var b = C * FetchTile(
   T.META_B,Math.floor(e.x / C));
 if (a > b) {
  e.boty = a;
  e.topy = b;
  e.dir = 1;
 }else{
  e.topy = a;
  e.boty = b;
  e.dir = -1;
 }
 e.coll = CR.FULL;
}

function BehLift(e) {
 e.liftNum = e.liftNum + 1;
 if (e.liftNum < e.liftDen) { return; }
 e.liftNum = 0;
 e.y = e.y + e.dir;
 if (e.dir > 0 && e.y > e.boty ||
    e.dir < 0 && e.y < e.topy) {
  e.dir = -e.dir;
 }
}

function BehLiftColl(e) {
 // Lift hit player. Just nudge the player
 Plr.nudgeY = Iif(e.y > Plr.y,-1,1);
}

function BehShootInit(e) {
 e.shootNum = Rnd(0,e.shootDen - 1);
}

function BehShoot(e) {
 e.shootNum = e.shootNum + 1;
 if (e.shootNum < 30) {
  e.sprite = e.shootSpr || e.sprite;
 }
 if (e.shootNum < e.shootDen) { return; }
 e.shootNum = 0;
 var shot = EntAdd(
   e.shootEid || EID.FIREBALL,e.x,e.y);
 e.sprite = e.shootSpr || e.sprite;
 shot.moveDx =
   Iif(shot.moveDx == false,0,shot.moveDx);
 shot.moveDy =
   Iif(shot.moveDy == false,0,shot.moveDy);

 if (e.aim == AIM.HORIZ) {
  shot.moveDx = (Plr.x > e.x && 1 || -1) *
   Abs(shot.moveDx);
 } else if (e.aim == AIM.VERT) {
  shot.moveDy = (Plr.y > e.y && 1 || -1) *
   Abs(shot.moveDy);
 } else if (e.aim == AIM.FULL) {
  var tx = Plr.x - shot.x;
  var ty = Plr.y - shot.y;
  var mag = Math.sqrt(tx * tx + ty * ty);
  var spd = Math.sqrt(
    shot.moveDx * shot.moveDx +
    shot.moveDy * shot.moveDy);
  shot.moveDx = Math.floor(0.5 + tx * spd / mag);
  shot.moveDy = Math.floor(0.5 + ty * spd / mag);
  if (shot.moveDx == 0 && shot.moveDy == 0) {
   shot.moveDx = -1;
  }
 }
}

function BehCrumble(e) {
 if (!e.crumbling) {
  // check if player on tile
  if (Plr.x < e.x - 8) { return; }
  if (Plr.x > e.x + 8) { return; }
  // check if player is standing on it
  var pr = RectXLate(
    GetPlrCr(),Plr.x,Plr.y);
  var er = RectXLate(e.coll,e.x,e.y - 1);
  e.crumbling = RectIsct(pr,er);
 }

 if (e.crumbling) {
  // count down to destruction
  e.cd = e.cd - 1;
  e.sprite = Iif(e.cd > 66,S.CRUMBLE,
    Iif(e.cd > 33,S.CRUMBLE_2,S.CRUMBLE_3));
  if (e.cd < 0) { e.dead = true; }
 }
}

function BehTtl(e) {
 e.ttl = e.ttl - 1;
 if (e.ttl <= 0) { e.dead = true; }
}

function BehDmgEnemy(e) {
 var fr = RectXLate(FIRE.COLL,e.x,e.y);
 for (var i = 0; i < Ents.length; i++) {
  var ent = Ents[i];
  var er = RectXLate(ent.coll,ent.x,ent.y);
  if (e !== ent && RectIsct(fr,er) &&
      EntHasBeh(ent,BE.VULN)) {
   // ent hit by player fire
   HandleDamage(ent,Plr.plane > 0 &&
     DMG.PLANE_FIRE || DMG.FIRE);
   e.dead = true;
  }
 };
}

function BehGrantFirePwupColl(e) {
 Plr.firePwup = FIRE.DUR;
 e.dead = true;
 Snd(SND.PWUP);
}

function BehGrantSuperPwupColl(e) {
 Plr.super = true;
 e.dead = true;
 Snd(SND.PWUP);
}

function BehReplace(e) {
 var d = Abs(e.x - Plr.x);
 if (d < e.replDist) {
  EntRepl(e,e.replEid,e.replData);
 }
}

function BehChestInit(e) {
 // ent on top of chest is the contents
 var etop = GetEntAt(e.x,e.y - C);
 if (etop) {
  e.cont = etop.eid;
  etop.dead = true;
 } else {
  e.cont = S.FOOD.LEAF;
 }
 // check multiplier
 e.mul = MetaVal(
  mget(Math.floor(e.x / C) ,Math.floor(e.y / C) - 2, 1));
 e.open = false;
}
function BehChestDmg(e) {
 if (e.open) { return; }
 SpawnParts(PFX.POP,e.x + 4,e.y + 4,14);
 Snd(SND.OPEN);
 e.anim = null;
 e.sprite = S.CHEST_OPEN;
 e.open = true;
 var by = e.y - C;
 var ty = e.y - 2 * C;
 var lx = e.x - C;
 var cx = e.x;
 var rx = e.x + C;
 var c = e.cont;
 EntAdd(c,cx,by);
 if (e.mul > 1) { EntAdd(c,cx,ty); }
 if (e.mul > 2) { EntAdd(c,lx,by); }
 if (e.mul > 3) { EntAdd(c,rx,by); }
 if (e.mul > 4) { EntAdd(c,lx,ty); }
 if (e.mul > 5) { EntAdd(c,rx,ty); }
}

function BehTplafInit(e) {
 e.phase = MetaVal(FetchEntTag(e),0);
}

function BehTplaf(e) {
 var UNIT = 40;     // in ticks
 var PHASE_LEN = 3; // in units
 var uclk = e.phase + Math.floor(Game.t / UNIT);
 var open = (Math.floor(uclk / PHASE_LEN) % 2 == 0);
 var tclk = e.phase * UNIT + Game.t;
 e.sprite = Iif2(
  (tclk % (UNIT * PHASE_LEN) <= 6),
  S.TPLAF_HALF,open,S.TPLAF,S.TPLAF_OFF);
 e.sol = Iif(open,SOL.HALF,SOL.NOT);
}

function BehDashInit(e) {
 assert(EntHasBeh(e, BE.MOVE));
 e.origAnim = e.anim;
 e.origMoveDen = e.moveDen;
}

function BehDash(e) {
 var dashing = e.cdd < e.ddur;
 e.cdd = (e.cdd + 1) % e.cdur;
 if (dashing) {
  e.anim = e.dashAnim || e.origAnim;
  e.moveDen = e.origMoveDen;
 } else {
  e.anim = e.origAnim;
  e.moveDen = 99999; // don't move
 }
}

function BehSignInit(e) {
 e.msg = MetaVal(FetchEntTag(e),0);
}

function BehSignColl(e) {
 Plr.signMsg = e.msg;
 // if starting to read sign, lock player
 // for a short while
 if (Plr.signC == 0) {
  Plr.locked = 100;
 }
 // increase cycle counter by 2 because
 // it gets decreased by 1 every frame
 Plr.signC = Min(Plr.signC + 2,
   SIGN_C_MAX);
}

function BehOneUp(e) {
 e.dead = true;
 Plr.lives = Plr.lives + 1;
 Snd(SND.ONEUP);
}

function BehFlag(e) {
 var rx = e.x + C;
 if (Plr.respX < rx) {
  Plr.respX = rx;
  Plr.respY = e.y;
 }
 Snd(SND.PWUP);
 EntRepl(e,EID.FLAG_T);
}

function BehReplOnGnd(e) {
 if (e.grounded) {
  EntRepl(e,e.replEid,e.replData);
 }
}

function BehPop(e) {
 e.dead = true;
 SpawnParts(PFX.POP,e.x + 4,e.y + 4,e.clr);
}

function BehBoardPlane(e) {
 e.dead = true;
 Plr.plane = PLANE.START_FUEL;
 Plr.y = e.y - 3 * C;
 Snd(SND.PLANE);
}

function BehFuel(e) {
 e.dead = true;
 Plr.plane = Plr.plane + PLANE.FUEL_INC;
 Snd(SND.PWUP);
}

//
// ENTITY BEHAVIORS
//
const BE = {
 MOVE: {
  data: {
   // move denominator (moves every
   // this many frames)
   moveDen: 5,
   moveNum: 0, // numerator, counts up
   // 1=moving right, -1=moving left
   moveDx: -1,
   moveDy: 0,
   moveHitMode: MOVE_HIT.BOUNCE,
   // if >0, waits until player is less
   // than this dist away to start motion
   moveWaitPlr: 0,
   // if >=0, how many ticks to move
   // for (after that, stop).
   moveT: -1
  },
  update: BehMove
 },
 FALL: {
  data: {grounded: false,jmp: 0},
  update: BehFall
 },
 FLIP: {
  data: {flipNum: 0,flipDen: 20},
  update: BehFlip
 },
 FACEPLR: {update: BehFacePlr},
 JUMP: {
  data: {jmp: 0,jmpNum: 0,jmpDen: 50},
  update: BehJump
 },
 VULN: { // can be damaged by player
  data: {
    hp: 1,
     // damage types that can hurt this.
     dtypes: [
      DMG.MELEE,
      DMG.FIRE,
      DMG.PLANE_FIRE
     ],
     // loot drop probability (0-100)
     lootp: 0,
     // possible loot to drop (EIDs)
   loot: [EID.FOOD.A]
  },
  dmg: BehTakeDmg
 },
 SHOOT: {
  data: {shootNum: 0,shootDen: 100,
   aim: AIM.NONE},
  init: BehShootInit,
  update: BehShoot
 },
 UPDOWN: {
  // yamp is amplitude of y movement
  data: {yamp: 16,dy: -1,yden: 3,ynum: 0},
  init: BehUpDownInit,
  update: BehUpDown
 },
 POINTS: {
  data: {value: 50},
  coll: BehPoints
 },
 HURT: { // can hurt player
  coll: BehHurt
 },
 LIFT: {
  data: {liftNum: 0,liftDen: 3},
  init: BehLiftInit,
  update: BehLift,
  coll: BehLiftColl
 },
 CRUMBLE: {
  // cd: countdown to crumble
  data: {cd: 50,coll: CR.FULL,crumbling: false},
  update: BehCrumble
 },
 TTL: {  // time to live (auto destroy)
  data: {ttl: 150},
  update: BehTtl
 },
 DMG_ENEMY: { // damage enemies
  update: BehDmgEnemy
 },
 GRANT_FIRE: {
  coll: BehGrantFirePwupColl
 },
 REPLACE: {
 // replaces by another ent when plr near
 // replDist: distance from player
 // replEid: EID to replace by
  data: {replDist: 50,replEid: EID.LEAF},
  update: BehReplace
 },
 CHEST: {
  init: BehChestInit,
  dmg: BehChestDmg
 },
 TPLAF: {
  init: BehTplafInit,
  update: BehTplaf
 },
 DASH: {
  data: {
   ddur: 20, // dash duration
   cdur: 60, // full cycle duration
   cdd: 0 // cycle counter
  },
  init: BehDashInit,
  update: BehDash
 },
 GRANT_SUPER: {
  coll: BehGrantSuperPwupColl
 },
 SIGN: {
  init: BehSignInit,
  coll: BehSignColl
 },
 ONEUP: {coll: BehOneUp},
 FLAG: {coll: BehFlag},
 REPL_ON_GND: {
  // replace EID when grounded
  // replData // extra data to add to
  data: {replEid: EID.LEAF},
  update: BehReplOnGnd
 },
 POP: {update: BehPop},
 PLANE: {coll: BehBoardPlane},
 FUEL: {coll: BehFuel}
};

//
// ENTITY BEHAVIOR TABLE
//
const EBT = {};
 EBT[EID.EN.SLIME] = {
  data: {
    hp:1,moveDen:3,clr:11,noFall:true,
    lootp:20,loot:[EID.FOOD.A]
  },
  beh:[BE.MOVE,BE.FALL,BE.VULN,BE.HURT]
 };

 EBT[EID.EN.HSLIME] = {
  data: {replDist: 50,replEid: EID.EN.SLIME},
  beh: [BE.REPLACE]
 };

 EBT[EID.EN.A] = {
  data: {
    hp: 1,moveDen: 5,clr: 14,flipDen: 120,
    lootp: 30,
    loot: [EID.FOOD.A,EID.FOOD.B]
  },
  beh: [BE.MOVE,BE.JUMP,BE.FALL,BE.VULN,
   BE.HURT,BE.FLIP]
 };

 EBT[EID.EN.B] = {
  data: {
    hp: 1,moveDen: 5,clr: 13,
    lootp: 30,
    loot: [EID.FOOD.A,EID.FOOD.B,
      EID.FOOD.C]
  },
  beh: [BE.JUMP,BE.FALL,BE.VULN,BE.HURT,
    BE.FACEPLR]
 };

 EBT[EID.EN.DEMON] = {
  data: {hp: 1,moveDen: 5,clr: 7,
   aim: AIM.HORIZ,
   shootEid: EID.FIREBALL,
   shootSpr: S.EN.DEMON_THROW,
   lootp: 60,
   loot: [EID.FOOD.C,EID.FOOD.D]},
  beh: [BE.JUMP,BE.FALL,BE.SHOOT,
   BE.HURT,BE.FACEPLR,BE.VULN]
 };

 EBT[EID.EN.SDEMON] = {
  data: {hp: 1,moveDen: 5,clr: 7,
   flipDen: 50,
   shootEid: EID.SNOWBALL,
   shootSpr: S.EN.SDEMON_THROW,
   aim: AIM.HORIZ,
   lootp: 75,
   loot: [EID.FOOD.C,EID.FOOD.D]},
  beh: [BE.JUMP,BE.FALL,BE.SHOOT,
   BE.MOVE,BE.FLIP,BE.VULN,BE.HURT]
 };

 EBT[EID.EN.PDEMON] = {
  data: {hp: 1,clr: 11,flipDen: 50,
   shootEid: EID.PLASMA,
   shootSpr: S.EN.PDEMON_THROW,
   aim: AIM.FULL,
   lootp: 80,
   loot: [EID.FOOD.D]},
  beh: [BE.JUMP,BE.FALL,BE.SHOOT,
   BE.FLIP,BE.VULN,BE.HURT]
 },

 EBT[EID.EN.BAT] = {
  data: {hp: 1,moveDen: 2,clr: 9,flipDen: 60,
    lootp: 40,
    loot: [EID.FOOD.A,EID.FOOD.B]},
  beh: [BE.MOVE,BE.FLIP,BE.VULN,BE.HURT]
 },

 EBT[EID.EN.FISH] = {
  data: {
    hp: 1,moveDen: 3,clr: 9,flipDen: 120,
    lootp: 40,
    loot: [EID.FOOD.A,EID.FOOD.B]
  },
  beh:[BE.MOVE,BE.FLIP,BE.VULN,
   BE.HURT]
 },

 EBT[EID.EN.FISH2] = {
  data: {hp: 1,clr: 12,moveDen: 1,
   lootp: 60,
   loot: [EID.FOOD.B,EID.FOOD.C]},
  beh: [BE.MOVE,BE.DASH,BE.VULN,BE.HURT]
 };

 EBT[EID.FIREBALL] = {
  data: {hp: 1,moveDen: 2,clr: 7,
    coll: CR.BALL,
    moveHitMode: MOVE_HIT.DIE},
  beh: [BE.MOVE,BE.HURT,BE.TTL]
 },

 EBT[EID.PLASMA] = {
  data: {hp: 1,moveDen: 2,clr: 7,
    moveDx: 2,
    coll: CR.BALL,
    moveHitMode: MOVE_HIT.NONE},
  beh: [BE.MOVE,BE.HURT,BE.TTL]
 },

 EBT[EID.SNOWBALL] = {
  data:{hp:1,moveDen:1,clr:15,
    coll:CR.BALL,
    moveHitMode:MOVE_HIT.DIE},
  beh: [BE.MOVE,BE.FALL,BE.VULN,BE.HURT]
 },

 EBT[EID.LIFT] = {
  data:{sol:SOL.FULL},
  beh: [BE.LIFT]
 },

 EBT[EID.CRUMBLE] = {
  data:{
   sol: SOL.FULL,clr: 14,
   // only take melee && plane fire dmg
   dtypes: [DMG.MELEE,DMG.PLANE_FIRE]
  },
  beh: [BE.CRUMBLE,BE.VULN]
 },

 EBT[EID.PFIRE] = {
  data: {
   moveDx: 1,moveDen: 1,ttl: 80,
   moveHitMode: MOVE_HIT.DIE,
   coll: FIRE.COLL
  },
  beh: [BE.MOVE,BE.TTL,BE.DMG_ENEMY]
 },

 EBT[EID.FIRE_PWUP] = {
  beh: [BE.GRANT_FIRE]
 },

 EBT[EID.SPIKE] = {
  data: {coll: CR.FULL},
  beh: [BE.HURT]
 };

 EBT[EID.CHEST] = {
  data: {coll: CR.FULL,
   sol: SOL.FULL},
  beh: [BE.CHEST]
 };

 EBT[EID.TPLAF] = {
  data: {sol: SOL.HALF,
   coll: CR.TOP},
  beh: [BE.TPLAF]
 };

 EBT[EID.EN.DASHER] = {
  data: {hp: 1,clr: 12,moveDen: 1,noFall: true,
   dashAnim: [S.EN.DASHER,315],
   lootp: 60,
   loot: [EID.FOOD.B,EID.FOOD.C]},
  beh: [BE.MOVE,BE.DASH,BE.VULN,BE.HURT]
 };

 EBT[EID.EN.VBAT] = {
  data: {hp: 1,clr: 14,yden: 2,
    lootp: 40,
    loot: [EID.FOOD.B,EID.FOOD.C]},
  beh: [BE.UPDOWN,BE.VULN,BE.HURT]
 };

 EBT[EID.SUPER_PWUP] = {beh: [BE.GRANT_SUPER]};
 EBT[EID.SIGN] = {beh: [BE.SIGN]};
 EBT[EID.FLAG] = {beh: [BE.FLAG]};

 EBT[EID.ICICLE] = {
  data: {replEid: EID.ICICLE_F,replDist: 8},
  beh: [BE.REPLACE]
 };

 EBT[EID.ICICLE_F] = {
  data: {replEid: EID.POP,replData: {clr: 15}},
  beh: [BE.FALL,BE.HURT,BE.REPL_ON_GND]
 };

 EBT[EID.SICICLE] = {
  data: {replEid: EID.SICICLE_F,replDist: 8},
  beh: [BE.REPLACE]
 };

 EBT[EID.SICICLE_F] = {
  data: {replEid: EID.POP,replData: {clr: 14}},
  beh: [BE.FALL,BE.HURT,BE.REPL_ON_GND]
 };

 EBT[EID.POP] = {beh:[BE.POP]};
 EBT[EID.PLANE] = {beh:[BE.PLANE]};
 EBT[EID.FUEL] = {beh:[BE.FUEL]};

 EBT[EID.FOOD.LEAF] = {
   data: {value:50,coll: CR.FOOD},
   beh: [BE.POINTS]};
 EBT[EID.FOOD.A] = {
   data: {value:100,coll: CR.FOOD},
   beh: [BE.POINTS]};
 EBT[EID.FOOD.B] = {
   data: {value:200,coll: CR.FOOD},
   beh: [BE.POINTS]};
 EBT[EID.FOOD.C] = {
   data: {value:500,coll: CR.FOOD},
   beh: [BE.POINTS]};
 EBT[EID.FOOD.D] = {
   data: {value:1000,coll: CR.FOOD},
   beh: [BE.POINTS]};

///////////////////////
// DEBUG MENU
///////////////////////
function DbgTic() {
 if (Plr.dbgResp) {
  cls(1);
  print(Plr.dbgResp);
  if (btnp(4)) {
   Plr.dbgResp = null;
  }
  return;
 }

 Game.dbglvl = Game.dbglvl || 1;

 if (btnp(3)) {
  Game.dbglvl = Iif(Game.dbglvl + 1 > LVL.length,1,Game.dbglvl + 1);
 } else if (btnp(2)) {
  Game.dbglvl = Iif(Game.dbglvl > 1,Game.dbglvl - 1,LVL.length);
 }

 var menu = [
  {t: '(Close)',f: DbgClose},
  {t: 'Warp to test lvl',f: DbgWarpTest},
  {t: 'Warp to L' + Game.dbglvl,f: DbgWarp},
  {t: '} lvl',f: DbgEndLvl},
  {t: 'Grant super pwup',f: DbgSuper},
  {t: 'Fly mode ' +
    Iif(Plr.dbgFly,'OFF','ON'),f: DbgFly},
  {t: 'Invuln mode ' +
    Iif(Plr.invuln && Plr.invuln > 0,
        'OFF','ON'),
    f: DbgInvuln},
  {t: 'Unpack L' + Game.dbglvl,f: DbgUnpack},
  {t: 'Pack L' + Game.dbglvl,f: DbgPack},
  {t: 'Clear PMEM',f: DbgPmem},
  {t: 'Win the game',f: DbgWin},
  {t: 'Lose the game',f: DbgLose}
 ];
 cls(5);
 print('DEBUG');

 rect(110,0,140,16,11);
 print('DBG LVL:',120,4,3);
 print(LVL[Game.dbglvl].name,170,4);

 Plr.dbgSel = Plr.dbgSel || 0;
 menu.forEach((el, i) => {
  print(el.t,10,10 + i * 10,
   Plr.dbgSel == i && 15 || 0);
 });
 if (btnp(0)) {
  Plr.dbgSel = Iif(Plr.dbgSel > 1,
   Plr.dbgSel - 1,menu.length);
 } else if (btnp(1)) {
  Plr.dbgSel = Iif(Plr.dbgSel < menu.length,
   Plr.dbgSel + 1,1);
 } else if (btnp(4)) {
  // trace('Plr.dbgSel = ' + Plr.dbgSel);
  // trace('menu[Plr.dbgSel] = ' + JSON.stringify(menu[Plr.dbgSel]));
  menu[Plr.dbgSel].f();
 }
}

function DbgClose() {
  Plr.dbg = false;
}

function DbgSuper() {
  Plr.super = true;
}

function DbgEndLvl() {
 EndLvl();
 Plr.dbg = false;
}

function DbgPmem() {pmem(0,0);}

function DbgWarp() {
 StartLvl(Game.dbglvl);
}

function DbgWarpNext() {
 StartLvl(Game.lvlNo + 1);
}

function DbgWarpTest() {
  trace('LVL.length = ' + LVL.length);
  StartLvl(LVL.length - 1);
}

function DbgUnpack() {
 UnpackLvl(Game.dbglvl, UMODE.EDIT);
 sync();
 Plr.dbgResp = 'Unpacked & synced L' + Game.dbglvl;
}

function DbgPack() {
 var succ = PackLvl(Game.dbglvl);
 //MapClear(0,0,LVL_LEN,ROWS)
 sync();
 Plr.dbgResp = Iif(succ,
   'Packed & synced L' + Game.dbglvl,
   '** ERROR packing L' + Game.dbglvl);
}

function DbgFly() {
 Plr.dbgFly = !Plr.dbgFly;
 Plr.dbgResp = 'Fly mode ' + Iif(Plr.dbgFly,
  'ON','OFF');
}

function DbgInvuln() {
 Plr.invuln = Iif(Plr.invuln > 0,0,9999999);
 Plr.dbgResp = 'Invuln mode ' + Iif(
  Plr.invuln > 0,'ON','OFF');
}

function DbgWin() {
 SetMode(M.WIN);
 Plr.dbg = false;
}

function DbgLose() {
 SetMode(M.GAMEOVER);
 Plr.dbg = false;
}

////////////////////////
// UTILITIES
////////////////////////
function Iif(cond,t,f) {
  if (cond) {
    return t;
  } else {
    return f;
  }
}

function Iif2(cond,t,cond2,t2,f2) {
  if (cond){
    return t;
  }
 return Iif(cond2,t2,f2);
}

function Iif3(cond,t,cond2,t2,cond3,t3,f3) {
  if (cond) {
    return t;
  }
  return Iif2(cond2, t2,cond3,t3,f3);
}

function Iif4(
  cond,  t,
  cond2, t2,
  cond3, t3,
  cond4, t4, f4
  ) {
  if (cond) {
    return t;
  }
 return Iif3(cond2,t2,cond3,t3,cond4,t4,f4);
}

function ArrayContains(a,val) {
  for (var i = 0; i < a.length; i++) {
    var el = a[i];
    if (el == val) { return true; }
   };
 return false;
}

function Lpad(value, width) {
 var s = value + '';
 while (s.length < width) {
  s = '0' + s;
 }
 return s;
}

function RectXLate(r,dx,dy) {
 return {x: r.x + dx,y: r.y + dy,w: r.w,h: r.h};
}

// rects have x,y,w,h
function RectIsct(r1,r2) {
 return r1.x + r1.w > r2.x &&
        r2.x + r2.w > r1.x &&
        r1.y + r1.h > r2.y &&
        r2.y + r2.h > r1.y;
}

function DeepCopy(t) {
 var j = JSON.stringify(t);
 // trace(j);
 return JSON.parse(j);
}

// if preserve, fields that already exist
// in the target won't be overwritten
function ShallowMerge(target, src, preserve) {
 if (!src) {
  return;
 }
 Object.keys(src).forEach((key, idx) => {
  var value = src[key];
  if (!preserve || target[key] === undefined) {
   target[key] = DeepCopy(value);
  }
 });
}

function MapCopy(sc, sr, dc, dr, w, h) {
 for (var r = 0; r <= h - 1; r++) {
  for (var c = 0; c <= w - 1; c++) {
   mset(dc + c, dr + r, mget(sc + c, sr + r));
  }
 }
}

function MapClear(dc,dr,w,h) {
 for (var r = 0; r <= h - 1; r++) {
  for (var c = 0; c <= w - 1; c++) {
   mset(dc + c,dr + r,0);
  }
 }
}

function MapColsEqual(c1,c2,r) {
 for (var i = 0; i < ROWS - 1; i++) {
  if (mget(c1,r + i) !== mget(c2,r + i)) {
   return false;
  }
 }
 return true;
}

function MetaVal(t, deflt) {
 return Iif(
    t >= T.META_NUM_0 &&
    t <= T.META_NUM_0 + 12,
    t -  T.META_NUM_0,
    deflt
  );
}

// finds marker m on column c of level
// return row of marker, -1 if !found
function FetchTile(m,c,nowarn) {
 for (var r = 0; r < ROWS - 1; r++) {
  if (LvlTile(c,r) == m) {
   // TODO: if (erase) { SetLvlTile(c,r,0); }
   return r;
  }
 }
 if (!nowarn) {
  trace('Marker !found ' + m + ' @' + c);
 }
 return -1;
}

// Gets the entity's "tag marker",
// that is the marker tile that's sitting
// just above it. Also erases it.
// If no marker found, returns 0
function FetchEntTag(e) {
 var t = mget(Math.floor(e.x / C), Math.floor(e.y / C) - 1);
 if (t >= T.FIRST_META) {
  mset(Math.floor(e.x / C) ,Math.floor(e.y / C) - 1, 0);
  return t;
 } else {
  return 0;
 }
}

const Max = (x, y) => Math.max(x, y);
const Min = (x, y) => Math.min(x, y);
const Abs = (x, y) => Math.abs(x, y);
const Rnd = (min, max) => Math.random() * (max - min) + min;
const Rnd01 = () => Math.random();
const RndSeed = s => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
};
const Ins = (array, element) => array.push(element);
const Rem = (array, position) => array.splice(position, 1);
const Sin = (a) => Math.sin(a);
const Cos = (a) => Math.cos(a);
