/*globals IMAGES,HEXGRID,HexAttr,UTILS,PLAYER,MAPS,ASTAR,NPC,ComputerAction,MoveActorAction,MissileAction,MeleeAction,GameOverAction,DIFFUSION3,Dashboard,modeEnum*/
/*export NOISY.modeEnum */

/*
 * Control Scheme
 *
 * mode select
 *   mouse highlights cell with green border
 *
 * mode action
 *   mouse highlights cell (target) with red border and all cells from source
 *calculateActorView
 * mouse click
 *    mode select -> mode action
 *    mode action -> mode select
 *
 */

var NOISY = NOISY || {};

var GAMEMODE_PLAY = 'PLAY';
var GAMEMODE_GAMEOVER = 'GAMEOVER';
NOISY.gameMode = GAMEMODE_PLAY;

var TURN_PLAYER = 'PLAYER';
var TURN_COMPUTER = 'COMPUTER';
NOISY.turn = TURN_PLAYER;
NOISY.turnElement = {};

// Set by loadMap() function
NOISY.currentMap = {};

NOISY.dashboard = new Dashboard();

NOISY.mode = modeEnum.ACTION;

// The cell the user has selected
NOISY.userSelectedCell = null;

// In SELECT mode this highlights when player is under mouse
// In ACTION mode this highlights when npc is under mouse
NOISY.selectableActorCell = null;

// Selected Player (only in ACTION mode)
NOISY.selPlayer = null;

NOISY.selPlayerView = {
   // Cells that can be moved to (reachable) with current action points
   reachableCells: [],

   // Cells that are targetable with current weoponary
   targetableCells: [],

   // Subset of reachable cells selected as the movePath
   // head is source, tail is target
   pathCells: []
};

NOISY.viewport = {
   x : 0,
   y : 0
};

NOISY.players = [];

NOISY.npcs = [];

// The action that is in progress (see actions.js)
NOISY.action = null;

// background animations
NOISY.animations = [];

// Map keypresses to actions
NOISY.keymap = {
   65 : 'left',         // 'a'
   68 : 'right',        // 'd'
   87 : 'up',           // 'w'
   83 : 'down',         // 's'
   82 : 'reset',        // 'r'
   66 : 'init',         // 'b'
   67 : 'spread'        // 'c'
};

// Holds the keys currently pressed
NOISY.keydown = {};

// true for show overlays, such as tile ids
NOISY.isShowOverlay = false;

// Controls whether canvas grid is redrawn
NOISY.isRedrawGrid = true;

//
// Return: boolean true for user input is allowed
NOISY.userInputAllowed = function() {
   "use strict";
   return NOISY.action === null && NOISY.turn === TURN_PLAYER;
};

// Convert event coords to a cell
// Return: cell | null
NOISY.coordsToCell = function (canvas, e) {
   "use strict";

   // NOTE: may need to consider this http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642

   // e.clientX, e.clientY in local (DOM content) coords (Browser Window 0,0 is top left)
   // e.screenX, e.screenY in global (screen) coords

   var canvasOffset = UTILS.realPosition(canvas),
      x = e.clientX - canvasOffset.x - NOISY.viewport.x,
      y = e.clientY - canvasOffset.y - NOISY.viewport.y;

   return NOISY.hexgrid.selectHex({x:x, y:y});
};

// New Move Input from User (e.g. mouse)
// Calculate state based upon the given cell
//
// Params
// Cell: the cell under the mouse. May be null
// Boolean skipCheck: leave undefined to perform the input check or set to true to skip
NOISY.handleMoveInput = function (cell, skipCheck) {
   "use strict";

   if (skipCheck === undefined && !NOISY.userInputAllowed()) {
      return;
   }

   if (cell !== null) {

      if (cell.getAttr(HexAttr.WALL) === true) {
         NOISY.userSelectedCell = null;
         NOISY.dashboard.clearActor();
      } else {
         NOISY.userSelectedCell = cell;
         if (cell.getAttr(HexAttr.ACTOR) !== undefined) {
            NOISY.dashboard.setActor(NOISY.userSelectedCell.getAttr(HexAttr.ACTOR));
         } else {
            NOISY.dashboard.clearActor();
         }
      }

      if (NOISY.mode === modeEnum.ACTION) {

         if (cell.getAttr(HexAttr.ACTOR) === undefined &&
             cell.getAttr(HexAttr.WALL) !== true &&
             NOISY.selPlayerView.reachableCells.has(cell.getId())) {

            NOISY.selPlayerView.pathCells = new ASTAR(NOISY.hexgrid)
               .findPath(NOISY.selPlayer.getCell(), cell);
         } else {
            NOISY.selPlayerView.pathCells = [];
         }

         NOISY.selectableActorCell = NOISY.selPlayerView.targetableCells.includes(cell) ? cell : null;

      } else {

         NOISY.selectableActorCell = NOISY.players.some(function (p) {
            return p.getCurAP() > 0 && p.getCell() === cell;
         }) ? cell : null;
      }
   } else {
      NOISY.userSelectedCell = null;
      NOISY.selectableActorCell = null;
      NOISY.dashboard.clearActor();
   }
};

// Set reachable and targetable cells based upon the given actor
NOISY.calculateActorView = function (actor) {
   "use strict";
   var cell = actor.getCell(),
      view = {};

   view.reachableCells = new ASTAR(NOISY.hexgrid)
      .findReachableCells(cell, actor.getCurAP());

   view.targetableCells = new ASTAR(NOISY.hexgrid)
      .findTargetableCells(cell, NOISY.npcs, actor.getMissileRange());

   view.pathCells = [];

   return view;
};

// Paramters
// Cell cell - the cell where the click occurred, may be NULL
NOISY.handleClickInput = function (cell) {
   "use strict";

   if (!NOISY.userInputAllowed()) {
      return;
   }

   if (cell === null) {
      NOISY.endActionMode();
      return;
   }

   if (NOISY.mode === modeEnum.SELECT) {

      if (NOISY.selectableActorCell !== null) {
         NOISY.selPlayer = NOISY.selectableActorCell.getAttr(HexAttr.ACTOR);
         NOISY.mode = modeEnum.ACTION;
         NOISY.dashboard.setMode(NOISY.mode);
         NOISY.selPlayerView = NOISY.calculateActorView(NOISY.selPlayer);
      }

   } else {
      // action

      if (NOISY.selPlayerView.targetableCells.some(function(c) {
         return c === cell;
      })) {

         if (NOISY.hexgrid.areNeighbours(cell, NOISY.selPlayer.getCell())) {
            NOISY.action = new MeleeAction(NOISY.selPlayer, cell.getAttr(HexAttr.ACTOR))
               .setCallback(NOISY.endPlayerAction);
         } else {
            NOISY.action = new MissileAction(NOISY.selPlayer, cell.getAttr(HexAttr.ACTOR))
               .setCallback(NOISY.endPlayerAction);
         }
      } else if (NOISY.selPlayerView.reachableCells.has(cell.getId())) {

         NOISY.action = new MoveActorAction(
            NOISY.selPlayer, NOISY.selPlayerView.pathCells)
               .setCallback(NOISY.endPlayerAction);

         NOISY.selPlayerView = null;
      } else {
         // anything else just cancel
         NOISY.endActionMode();
      }
   }
};

// End ACTION mode and switch to SELECT
NOISY.endActionMode = function () {
   "use strict";

   NOISY.mode = modeEnum.SELECT;
   NOISY.dashboard.setMode(NOISY.mode);

   NOISY.userSelectedCell = null;

   NOISY.selPlayer = null;
   NOISY.selPlayerView = {};

   NOISY.targetCell = null;
};

NOISY.start = function() {
   "use strict";

   NOISY.animations = [];
   document.getElementById("startButton").setAttribute("hidden", "true");
   document.getElementById("turnButton").removeAttribute("hidden");
   NOISY.resetMap();
};

NOISY.gameOver = function() {
   "use strict";

   NOISY.gameMode = GAMEMODE_GAMEOVER;
   //TODO need to get these from canvas
   NOISY.animations.push(new GameOverAction(600, 400));
   document.getElementById("startButton").removeAttribute("hidden");
   document.getElementById("turnButton").setAttribute("hidden", "true");
};

// Called on UI
NOISY.endTurn = function () {
   "use strict";

   NOISY.turn = NOISY.turn === TURN_PLAYER ? TURN_COMPUTER : TURN_PLAYER;

   if (NOISY.turn === TURN_PLAYER) {

      NOISY.players.forEach(function (p) {
         p.newTurn();
      });
      NOISY.action = null;

   } else {
      // Start of computer turn, clean up any unfinished player actions
      NOISY.endActionMode();
      NOISY.npcs.forEach(function (p) {
         p.newTurn();
      });

      NOISY.action = new ComputerAction(NOISY.npcs);
   }
};

// Called from UI to select a different map
NOISY.selectMap = function (event) {
   "use strict";
   var mapName = event.target.value;

   console.log('Changing map to ' + mapName);

   NOISY.loadMap(MAPS[mapName]);
};

// Called from UI to reset the current map
NOISY.resetMap = function () {
   "use strict";
   NOISY.loadMap(NOISY.currentMap);
};

// Called after every action initiated by the user on the player
NOISY.endPlayerAction = function () {
   "use strict";

   if (NOISY.selPlayer.getCurAP() <= 0) {
      // Player has no more APs, so cancel action
      NOISY.endActionMode();
      NOISY.handleMoveInput(NOISY.userSelectedCell);
   } else {

      NOISY.selPlayerView = NOISY.calculateActorView(NOISY.selPlayer);

      if (NOISY.userSelectedCell === NOISY.selPlayer.getCell()) {
         // this means the player moved, so recalculate the reachable
         // cells and targets
         NOISY.handleMoveInput(NOISY.selPlayer.getCell());
      } else {
         // skip the allowed user input check
         NOISY.handleMoveInput(NOISY.userSelectedCell, true);
      }

      NOISY.selectableActorCell = null;
   }
};

NOISY.deadActor = function(actor) {
   "use strict";

   NOISY.corpses.push(actor.makeCorpse());

   actor.getCell().clearAttr(HexAttr.ACTOR);

   if (actor.isPlayer()) {
      NOISY.players = NOISY.players.filter(function (n) {
         return n !== actor;
      });

      if (NOISY.players.length === 0) {
         NOISY.gameOver();
      }
   } else {

      NOISY.npcs = NOISY.npcs.filter(function (n) {
         return n !== actor;
      });
   }

   NOISY.diffusionMap.diffuse('player');
};

NOISY.update = function (interval) {
   "use strict";
   var velocity = 5;

   // -------------------------------------------------------------------------
   // scroll the viewport

   if (NOISY.keydown.up === true) {
      NOISY.viewport.y += velocity;
      NOISY.isRedrawGrid = true;

   } else if (NOISY.keydown.down === true) {
      NOISY.viewport.y -= velocity;
      NOISY.isRedrawGrid = true;
   }

   if (NOISY.keydown.left === true) {
      NOISY.viewport.x += velocity;
      NOISY.isRedrawGrid = true;

   } else if (NOISY.keydown.right === true) {
      NOISY.viewport.x -= velocity;
      NOISY.isRedrawGrid = true;
   }

   // update whose turn it iss
   if (NOISY.turnElement.innerHTML !== NOISY.turn) {
      NOISY.turnElement.innerHTML = NOISY.turn;
   }

   // -------------------------------------------------------------------------
   //  action

   if (NOISY.action !== null) {
      NOISY.action = NOISY.action.update(interval);
   }

   NOISY.animations = NOISY.animations.filter(function(a) {
      return a.update(interval);
   });

   // -------------------------------------------------------------------------
   //  player

//   NOISY.players.forEach(function (p) {
//      p.update(interval);
//   });

   // -------------------------------------------------------------------------
   // Misc

   // TODO need to control when endTurn is called
   if (NOISY.keydown.space === true) {
      NOISY.endTurn();
   }

   if (NOISY.keydown.reset === true) {
      NOISY.resetMap();
   }

   if (NOISY.keydown.spread === true) {
      NOISY.diffusionMap.diffuse('player');
      NOISY.keydown.spread = false;
   }

};

// ----------------------------------------------------------------------------
// Render a target graphic depending on whether the mouse is over the cell
//
function renderTarget (ctx, targetableCells, userSelectedCell) {
   "use strict";

   var targettedCell, point;
   ctx.save();

   targetableCells.forEach(function (c) {

      targettedCell = c === userSelectedCell;

      ctx.lineWidth = targettedCell ? 3 : 2;
      ctx.strokeStyle = targettedCell ? '#f00000' : '#b00000';

      point = c.getAttr(HexAttr.CENTER);

      ctx.beginPath();
      ctx.arc(point.x, point.y, 18, 0, 2 * Math.PI);
      ctx.moveTo(point.x - 23, point.y);
      ctx.lineTo(point.x - 13, point.y);
      ctx.moveTo(point.x + 23, point.y);
      ctx.lineTo(point.x + 13, point.y);
      ctx.moveTo(point.x, point.y - 23);
      ctx.lineTo(point.x, point.y - 13);
      ctx.moveTo(point.x, point.y + 23);
      ctx.lineTo(point.x, point.y + 13);
      ctx.stroke();
   });

   ctx.restore();
}

NOISY.renderBackground = function (canvas2 /*, interval*/) {
   "use strict";
   var ctx2 = canvas2.getContext("2d");

   // Set with a clean slate
   ctx2.fillStyle = '#555555';
   ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

   // set viewport to current position
   ctx2.translate(NOISY.viewport.x, NOISY.viewport.y);

   NOISY.hexgrid.render(ctx2);

   ctx2.setTransform(1, 0, 0, 1, 0, 0);

};

NOISY.renderMain = function (canvas /*, interval*/) {
   "use strict";

   var ctx,
    mouseOverColour = '#00ff00',
    selectableColour = '#ff0040';

   // if ctx is null then canvas is not supported
   ctx = canvas.getContext("2d");

   // Set with a clean slate
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   // set viewport to current position
   ctx.translate(NOISY.viewport.x, NOISY.viewport.y);

   NOISY.corpses.forEach(function (c) {
      c.render(ctx, NOISY.images);
   });

   NOISY.npcs.forEach(function (n) {
      n.render(ctx, NOISY.images);
   });

   if (NOISY.mode === modeEnum.SELECT) {

      // mouse over cell
      if (NOISY.userSelectedCell !== null) {
         // old - 36
         NOISY.hexgrid.highlightHex(
            ctx,
            NOISY.userSelectedCell,
            NOISY.userSelectedCell === NOISY.selectableActorCell ? selectableColour : mouseOverColour);
      }

   } else { //MODE_ACTION

      // selected player stays selected in Action Mode
      // old - 36
      NOISY.hexgrid.highlightHex(
         ctx,
         NOISY.selPlayer.getCell(),
         selectableColour);

      if (NOISY.userSelectedCell !== null && NOISY.userSelectedCell !== NOISY.selPlayer.getCell()) {
         // old - 36
         NOISY.hexgrid.highlightHex(
            ctx,
            NOISY.userSelectedCell,
            mouseOverColour);
      }

      if (NOISY.selPlayerView !== null) {

         // Reachable Cells
         NOISY.selPlayerView.reachableCells.forEach(function (c) {
            NOISY.hexgrid.highlightHex(ctx, c, '#ffffff', 28, 2);
         });

         // Currently selected path in the reachable Cells
         NOISY.selPlayerView.pathCells.forEach(function (c) {
            NOISY.hexgrid.drawHex(ctx, c, '#ffffff', 10);
         });

         // Targetable cells
         renderTarget(ctx, NOISY.selPlayerView.targetableCells, NOISY.userSelectedCell);
      }
   }

   // draw player (on top of any overlays)
   NOISY.players.forEach(function (p) {
      p.render(ctx, NOISY.images);
   });


   // -------------------------------------------------------------------------
   //  action

   if (NOISY.action !== null) {
      NOISY.action.render(ctx);
   }

   // -------------------------------------------------------------------------
   //  animations

   NOISY.animations.forEach(function(a) {
      a.render(ctx);
   });

   ctx.setTransform(1, 0, 0, 1, 0, 0);
};

NOISY.loadMap = function (map) {
   "use strict";

   NOISY.endActionMode();

   NOISY.currentMap = map;

   NOISY.players = [];

   NOISY.npcs = [];

   NOISY.corpses = [];

   NOISY.hexgrid.init(
      { x:0, y:0 },
      map);

   // new diffusion map for the level
   // before Players and NPCs (goals) are set
   NOISY.diffusionMap = new DIFFUSION3(NOISY.hexgrid);
   NOISY.diffusionMap.init(['player']);

   map.dwarf.forEach(function (d) {
      NOISY.players.push(new PLAYER(NOISY.hexgrid.getHex(d)));
   });

   map.goblin.forEach(function (info) {
      NOISY.npcs.push(new NPC(info));
   });

   // Initial diffusion
   NOISY.diffusionMap.diffuse('player');
};

NOISY.run = function () {
   "use strict";

   var now,
      dt = 0,
      last = window.performance.now(),
      step = 1 / 60,
      canvasDiv,
      canvasBackground,
      canvasMain,
      canvasDashboard;

   NOISY.images = new IMAGES();
   NOISY.images.load("player", "../images/dwarf.png");
   NOISY.images.load("dead-player", "../images/dead-dwarf.png");
   NOISY.images.load("goblin", "../images/goblin1.png");
   NOISY.images.load("dead-goblin", "../images/dead-goblin1.png");

   canvasDiv = document.getElementById("canvas-div");
   canvasBackground = document.getElementById("canvas-background");
   canvasMain = document.getElementById("canvas-main");

   canvasDiv.width = 600;
   canvasDiv.height = 400;

   canvasMain.width = canvasBackground.width = canvasDiv.width;
   canvasMain.height = canvasBackground.height = canvasDiv.height;

   canvasDashboard = document.getElementById("canvas-dashboard");
   canvasDashboard.width = 600;
   canvasDashboard.height = 20;

   NOISY.turnElement = document.getElementById("turn");

   NOISY.hexgrid = new HEXGRID();

   NOISY.loadMap(MAPS.one);

   // Track the mouse
   // Only call after setup globals
   canvasMain.addEventListener("mousemove", function (e) {
      NOISY.handleMoveInput(NOISY.coordsToCell(canvasMain, e));
   });

   // Track clicks
   canvasMain.addEventListener("click", function (/* e */) {
      // assume click comes on the same cell mouse was over
      NOISY.handleClickInput(NOISY.userSelectedCell);
   });

   // Canvas can not get focus so can not listen for keypresses
   window.addEventListener("keydown", function (e) {
      NOISY.keydown[NOISY.keymap[e.keyCode]] = true;
   });

   // Canvas can not get focus so can not listen for keypresses
   window.addEventListener("keyup", function (e) {
      NOISY.keydown[NOISY.keymap[e.keyCode]] = false;
   });

   // Canvas can not get focus so can not listen for keypresses
   window.addEventListener("keypress", function (e) {
      switch (e.keyCode) {
         case 32 :   // space
            NOISY.endTurn();
            break;

         case 110 :  // 'n'
            NOISY.isShowOverlay = !NOISY.isShowOverlay;
            NOISY.hexgrid.setShowIds(NOISY.isShowOverlay);
            break;

         default:
            break;
      }
   });

   function frame() {
      now = window.performance.now();

      // If browser looses focus then dt will become very large
      // when focus is resumed; so cap dt at 1.0 secs
      dt = dt + Math.min(1, (now - last) / 1000);

      while (dt > step) {
         dt = dt - step;

         // increment by a fixed step
         NOISY.update(step);
      }

      // pass remainder into render for smoothing (interpolation)
      // (at this point dt < step)

      if (NOISY.isRedrawGrid) {
         NOISY.renderBackground(canvasBackground, dt);
         NOISY.isRedrawGrid = false;
      }

      NOISY.renderMain(canvasMain, dt);

      NOISY.dashboard.render(canvasDashboard);

      last = now;

      window.requestAnimationFrame(frame);
   }

   // Wait for images to load, then start game
   function loading() {
      if (NOISY.images.isReady()) {
         window.requestAnimationFrame(frame);
      } else {
         window.requestAnimationFrame(loading);
      }
   }

   window.requestAnimationFrame(loading);
};

NOISY.run();
