/*globals IMAGES,HEX,UTILS,PLAYER,MAPS,PATHFINDING,NPC,MoveActorAction*/

/*
 * Control Scheme
 *
 * mode select
 *   mouse highlights cell with green border
 *
 * mode action
 *   mouse highlights cell (target) with red border and all cells from source
 *
 * mouse click
 *    mode select -> mode action
 *    mode action -> mode select
 *
 */

var NOISY = NOISY || {};

var MODE_ACTION = 'a';
var MODE_SELECT = 's';
NOISY.mode = MODE_SELECT;

// always the cell under the mouse
NOISY.mouseOverCell = null;

// In SELECT mode this highlights when player is under mouse
// In ACTION mode this highlights when npc is under mouse
NOISY.selectableCell = null;

// Only used in ACTION mode
// Cells that are marked as reachable in this turn
NOISY.reachableMapCells = null;

// Only used in ACTION mode
// Cells that are targetable in this turn
NOISY.targetableCells = null;

// Only used in ACTION mode
// Subset of reachableCells
// Cells that are marked as the selected path
// head is source, tail is target (which is always the same as mouseOverCell)
NOISY.selectedPathCells = [];

NOISY.viewport = {
   x : 0,
   y : 0
};

NOISY.selectedPlayer = null;
NOISY.players = [];

NOISY.npcs = [];

NOISY.action = null;

// List of events to process
NOISY.event = null;

// Map keypresses to actions
NOISY.keymap = {
   65 : 'left',         // 'a'
   68 : 'right',        // 'd'
   87 : 'up',           // 'w'
   83 : 'down'          // 's'
};

// Holds the keys currently pressed
NOISY.keydown = {};

NOISY.isShowIds = true;

// Convert event coords to a cell
// Return: cell | null
NOISY.coordsToCell = function (canvas, e) {
   "use strict";

   // NOTE: may need to consider this http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element/18053642#18053642

   // e.clientX, e.clientY in local (DOM content) coords (Browser Window 0,0 is top left)
   // e.screenX, e.screenY in global (screen) coords

   var canvasOffset = UTILS.realPosition(canvas),
      x = e.clientX - canvasOffset[0] - NOISY.viewport.x,
      y = e.clientY - canvasOffset[1] - NOISY.viewport.y;

   return NOISY.hexgrid.selectHex(x, y);
};

// Calculate state based upon the given cell
//
// Params
// Cell: the cell under the mouse. May be null
NOISY.calculateMouseMove = function (cell) {
   "use strict";

   if (cell !== null) {
      NOISY.mouseOverCell = cell.isWall() ? null : cell;

      if (NOISY.mode === MODE_ACTION) {

         if (!cell.hasActor() &&
             !cell.isWall() &&
             NOISY.reachableMapCells.has(cell.getHash())) {

            NOISY.selectedPathCells = new PATHFINDING(NOISY.hexgrid)
               .findPath(NOISY.selectedPlayer.getCell(), cell);

         } else {
            NOISY.selectedPathCells = [];
         }

         NOISY.selectableCell = NOISY.targetableCells.includes(cell) ? cell : null;

      } else {

         NOISY.selectableCell = NOISY.players.some(function (p) {
            return p.getCurAP() > 0 && p.getCell() === cell;
         }) ? cell : null;
      }
   } else {
      NOISY.mouseOverCell = null;
      NOISY.selectableCell = null;
   }
};

NOISY.calculatePlayerAction = function () {
   "use strict";

   var cell = NOISY.selectedPlayer.getCell();

   NOISY.reachableMapCells = new PATHFINDING(NOISY.hexgrid)
      .findReachable(cell, NOISY.selectedPlayer.getCurAP());

   NOISY.targetableCells = new PATHFINDING(NOISY.hexgrid)
      .findTargetable(cell, NOISY.npcs, NOISY.selectedPlayer.getWeaponRange());

};

// Called on canvas event listener
NOISY.click = function (/* canvas */) {
   "use strict";

   return function (/* e */) {
      var cell = NOISY.mouseOverCell;

      if (cell !== null) {

         if (NOISY.mode === MODE_SELECT) {

            if (NOISY.selectableCell !== null) {
               NOISY.selectedPlayer = NOISY.selectableCell.getActor();
               NOISY.mode = MODE_ACTION;
               NOISY.calculatePlayerAction();
            }

         } else {
            // action

            if (NOISY.targetableCells.some(function(c) {
               return c === cell;
            })) {
               NOISY.event = {
                  "state": "init",
                  "source": NOISY.selectedPlayer,
                  "target": cell.getActor()
               };
            } else if (cell === NOISY.selectedPlayer) {
               NOISY.cancelSelect();
            } else {
               NOISY.mode = MODE_SELECT;
               NOISY.action = new MoveActorAction(NOISY.selectedPlayer, NOISY.selectedPathCells);
            }
         }

      } else {
         NOISY.cancelSelect();
      }
   };
};

NOISY.cancelSelect = function () {
   "use strict";

   NOISY.mode = MODE_SELECT;

   NOISY.selectedPlayer = null;
   NOISY.selectedPathCells = [];

   NOISY.targetCell = null;
};

NOISY.endTurn = function () {
   "use strict";
   NOISY.players.forEach(function (p) {
      console.log('new turn pressed');
      p.newTurn();
   });
};

//
NOISY.endPlayerAction = function () {
   "use strict";
   console.log('callback for ' + NOISY.selectedPlayer.getCell().getHash());
   NOISY.calculateMouseMove(NOISY.selectedPlayer.getCell());
   NOISY.calculatePlayerAction();
   NOISY.selectableCell = null;
};

NOISY.updateEvent = function (interval, event) {
   "use strict";
   var bulletSpeed = 0.2;

   switch (event.state) {
      case "init" :
         if (NOISY.hexgrid.areNeighbours(event.source.getCell(), event.target.getCell())) {
            event.state = 'melee';
         } else {
            event.state = "travel";
         }
         event.coordsxy = {
            "x": event.source.centerxy.x,
            "y": event.source.centerxy.y
         };
         event.elapsedTime = 0;
         break;

      case "melee":
      case "travel":

         event.elapsedTime += interval;

         if (event.elapsedTime < bulletSpeed) {

            event.coordsxy = {
               "x": UTILS.lerp(
                  event.source.centerxy.x,
                  event.target.centerxy.x,
                  event.elapsedTime / bulletSpeed),
               "y": UTILS.lerp(
                  event.source.centerxy.y,
                  event.target.centerxy.y,
                  event.elapsedTime / bulletSpeed)
            };

         } else {
            event.state = "damage";
         }
         break;

      case "damage":
         if (event.target.applyDamage(event.source.getWeaponDamage()) === false) {
            NOISY.npcs = NOISY.npcs.filter(function (n) {
               return n !== event.target;
            });
            NOISY.endPlayerAction();
         }
         event = null;
         break;
   }

   return event;
};

NOISY.update = function (interval) {
   "use strict";
   var velocity = 5;

   // -------------------------------------------------------------------------
   // scroll the viewport

   if (NOISY.keydown.up === true) {
      NOISY.viewport.y += velocity;

   } else if (NOISY.keydown.down === true) {
      NOISY.viewport.y -= velocity;
   }

   if (NOISY.keydown.left === true) {
      NOISY.viewport.x += velocity;

   } else if (NOISY.keydown.right === true) {
      NOISY.viewport.x -= velocity;
   }

   if (NOISY.action !== null) {
      NOISY.action = NOISY.action.update(interval);
   }

   // -------------------------------------------------------------------------
   // event

   if (NOISY.event !== null) {
      NOISY.event = NOISY.updateEvent(interval, NOISY.event);
   }

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
};

// ----------------------------------------------------------------------------
// Render a target graphic depending on whether the mouse is over the cell
//
function renderTarget (ctx, targetableCells, mouseOverCell) {
   "use strict";

   var targettedCell;
   ctx.save();

   targetableCells.forEach(function (c) {

      targettedCell = c === mouseOverCell;

      ctx.lineWidth = targettedCell ? 3 : 2;
      ctx.strokeStyle = targettedCell ? '#f00000' : '#b00000';

      ctx.beginPath();
      ctx.arc(c.centerxy.x, c.centerxy.y, 18, 0, 2 * Math.PI);
      ctx.moveTo(c.centerxy.x - 23, c.centerxy.y);
      ctx.lineTo(c.centerxy.x - 13, c.centerxy.y);
      ctx.moveTo(c.centerxy.x + 23, c.centerxy.y);
      ctx.lineTo(c.centerxy.x + 13, c.centerxy.y);
      ctx.moveTo(c.centerxy.x, c.centerxy.y - 23);
      ctx.lineTo(c.centerxy.x, c.centerxy.y - 13);
      ctx.moveTo(c.centerxy.x, c.centerxy.y + 23);
      ctx.lineTo(c.centerxy.x, c.centerxy.y + 13);
      ctx.stroke();
   });

   ctx.restore();
}

NOISY.render = function (canvas, dashboard /*, interval*/) {
   "use strict";

   var ctx,
    mouseOverColour = '#00ff00',
    selectableColour = '#ff0040';

   // if ctx is null then canvas is not supported
   ctx = canvas.getContext("2d");

   // Set with a clean slate
   ctx.fillStyle = '#555555';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   // set viewport to current position
   ctx.translate(NOISY.viewport.x, NOISY.viewport.y);

   NOISY.hexgrid.render(ctx);

   // draw player
   NOISY.players.forEach(function (p) {
      p.render(ctx, NOISY.images);
   });

   NOISY.npcs.forEach(function (n) {
      n.render(ctx, NOISY.images);
   });

   if (NOISY.mode === MODE_SELECT) {

      // mouse over cell
      if (NOISY.mouseOverCell !== null) {
         NOISY.hexgrid.drawHexPath(ctx, NOISY.mouseOverCell, 36);

         ctx.strokeStyle = NOISY.mouseOverCell === NOISY.selectableCell ? selectableColour : mouseOverColour;
         ctx.stroke();
      }

   } else { //MODE_ACTION

      // selected player stays selected in Action Mode
      NOISY.hexgrid.drawHexPath(ctx, NOISY.selectedPlayer.getCell(), 36);
      ctx.strokeStyle = selectableColour;
      ctx.stroke();

      if (NOISY.mouseOverCell !== null && NOISY.mouseOverCell !== NOISY.selectedPlayer.getCell()) {
         NOISY.hexgrid.drawHexPath(ctx, NOISY.mouseOverCell, 36);
         ctx.strokeStyle = mouseOverColour;
         ctx.stroke();
      }

      // Reachable Cells

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      NOISY.reachableMapCells.forEach(function (c) {
         NOISY.hexgrid.drawHexPath(ctx, c, 28);
         ctx.stroke();
      });

      // Currently selected path in the reachable Cells

      ctx.fillStyle = '#ffffff';
      NOISY.selectedPathCells.forEach(function (c) {
         NOISY.hexgrid.drawHexPath(ctx, c, 10);
         ctx.fill();
      });

      // Targetable cells
      renderTarget(ctx, NOISY.targetableCells, NOISY.mouseOverCell);
   }

   // Event

   if (NOISY.event !== null) {
      if (NOISY.event.state === "travel") {
         ctx.fillStyle = '#a03a40';
         ctx.fillRect(
            NOISY.event.coordsxy.x - 10,
            NOISY.event.coordsxy.y - 10,
            10,
            10);
      } else {
         // melee
         ctx.save();

         ctx.translate(NOISY.event.coordsxy.x, NOISY.event.coordsxy.y);
         ctx.rotate(Math.PI / 4);

         ctx.fillStyle = '#a03a40';
         ctx.fillRect(-7, -5, 14, 10);
         ctx.fillRect(-2, 5, 5, 15);

         ctx.restore();
      }
   }

   // reset current transformation matrix to the identity matrix
   // (clears the ctx.translate())
   ctx.setTransform(1, 0, 0, 1, 0, 0);

   // --------------------------------------------------------------------
   // dashboard

   ctx = dashboard.getContext("2d");

   ctx.clearRect(0, 0, dashboard.width, dashboard.height);
   ctx.fillStyle = '#7fcabb';
   ctx.fillRect(0, 0, dashboard.width, dashboard.height);

   ctx.fillStyle = '#000000';
   ctx.font = "18px Serif";
   ctx.fillText("Mode:" + (NOISY.mode === MODE_ACTION ? "ACTION" : "SELECT"), 10, 16);

   if (NOISY.mouseOverCell !== null && NOISY.mouseOverCell.hasActor()) {
      ctx.fillText("AP:" + NOISY.mouseOverCell.getActor().getCurAP(), 150, 16);
      ctx.fillText("Health:" + NOISY.mouseOverCell.getActor().getHealth(), 200, 16);
   }
};

NOISY.loadMap = function (map) {
   "use strict";

   NOISY.hexgrid.init(MAPS.one);

   map.dwarf.forEach(function (d) {
      NOISY.players.push(new PLAYER().init(NOISY.hexgrid.getCell(d)));
   });

   map.goblin.forEach(function (g) {
      NOISY.npcs.push(new NPC().init(NOISY.hexgrid.getCell(g)));
   });
};

NOISY.run = function () {
   "use strict";

   var now,
      dt = 0,
      last = window.performance.now(),
      step = 1 / 60,
      canvas,
      dashboard;

   NOISY.images = new IMAGES();
   NOISY.images.load("player", "images/dwarf.png");
   NOISY.images.load("goblin", "images/goblin1.png");

   canvas = document.getElementById("viewport");
   canvas.width = 600;
   canvas.height = 400;

   dashboard = document.getElementById("dashboard");
   dashboard.width = 600;
   dashboard.height = 20;

   NOISY.hexgrid = new HEX();

   NOISY.loadMap(MAPS.one);

   // Track the mouse
   // Only call after setup globals
   canvas.addEventListener("mousemove", function (e) {
      NOISY.calculateMouseMove(NOISY.coordsToCell(canvas, e));
   });

   // Track clicks
   canvas.addEventListener("click", NOISY.click(canvas));

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
            NOISY.hexgrid.setShowIds(!NOISY.hexgrid.getShowIds());
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
      NOISY.render(canvas, dashboard, dt);

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
