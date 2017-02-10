/*globals IMAGES,HEX,UTILS,PLAYER,MAPS,PATHFINDING,NPC*/

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
NOISY.selectableActor = null;

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

// Calculate selectable cells based upon the current mouse over
NOISY.calculateMouseMove = function () {
   "use strict";

   var cell = NOISY.mouseOverCell;

   if (NOISY.mode === MODE_ACTION) {

      if (!cell.hasActor() &&
          !cell.isWall() &&
          NOISY.reachableMapCells.has(cell.getHash())) {

         NOISY.selectedPathCells = new PATHFINDING(NOISY.hexgrid)
            .findPath(NOISY.selectedPlayer.getCell(), cell);

      } else {
         NOISY.selectedPathCells = [];
      }

      NOISY.selectableActor = NOISY.targetableCells.includes(cell) ? cell : null;

   } else {

      NOISY.selectableActor = NOISY.players.some(function (p) {
         return p.getCell() === cell;
      }) ? cell : null;
   }
};

// Called on canvas event listener
NOISY.mousemove = function (canvas) {
   "use strict";

   return function (e) {
      var cell = NOISY.coordsToCell(canvas, e);

      if (cell !== null) {

         NOISY.mouseOverCell = cell;

         NOISY.calculateMouseMove();

      } else {
         NOISY.mouseOverCell = null;
         NOISY.selectableActor = null;
      }
   };
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
     var cell = NOISY.mouseOverCell,
         l,
         p;

      if (cell !== null) {

         if (NOISY.mode === MODE_SELECT) {

            for (l = 0; l < NOISY.players.length; ++l) {
               p = NOISY.players[l];
               if (p.getCell() === cell) {
                  NOISY.mode = MODE_ACTION;
                  NOISY.selectedPlayer = p;

                  NOISY.calculatePlayerAction();

                  break;
               }
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
               NOISY.selectedPlayer.setMovePath(NOISY.selectedPathCells);
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

NOISY.update = function (interval) {
   "use strict";

   var velocity = 5,
      bulletSpeed = 0.2;

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

   // -------------------------------------------------------------------------
   // event

   if (NOISY.event !== null) {

      switch (NOISY.event.state) {
         case "init" :
            if (NOISY.hexgrid.areNeighbours(NOISY.event.source.getCell(), NOISY.event.target.getCell())) {
               console.log("close combat");
               NOISY.event = null;
            } else {
               NOISY.event.state = "travel";
               NOISY.event.coordsxy = {
                  "x": NOISY.event.source.centerxy.x,
                  "y": NOISY.event.source.centerxy.y
               };
               NOISY.event.elapsedTime = 0;
            }
            break;

         case "travel":

            NOISY.event.elapsedTime += interval;

            if (NOISY.event.elapsedTime < bulletSpeed) {

               NOISY.event.coordsxy = {
                  "x": UTILS.lerp(
                     NOISY.event.source.centerxy.x,
                     NOISY.event.target.centerxy.x,
                     NOISY.event.elapsedTime / bulletSpeed),
                  "y": UTILS.lerp(
                     NOISY.event.source.centerxy.y,
                     NOISY.event.target.centerxy.y,
                     NOISY.event.elapsedTime / bulletSpeed)
               };

            } else {
               NOISY.event.state = "damage";
            }
            break;

         case "damage":
            if (NOISY.event.target.applyDamage(NOISY.event.source.getWeaponDamage()) === false) {
               NOISY.npcs = NOISY.npcs.filter(function (n) {
                  return n !== NOISY.event.target;
               });
               NOISY.calculatePlayerAction();
               NOISY.calculateMouseMove();
               NOISY.selectableActor = null;
            }
            NOISY.event = null;
            break;
      }

   }

   // -------------------------------------------------------------------------
   //  player

   NOISY.players.forEach(function (p) {
      p.update(interval);
   });


   // -------------------------------------------------------------------------
   // Misc

   // TODO need to control when endTurn is called
   if (NOISY.keydown.space === true) {
      NOISY.endTurn();
   }


};

// Ideas to improve performance
// - only update canvass for a bounding rect over the change
// - cache canvas until an update occurs
// - overlaying canvasses
//   <canvas id="bg" width="640" height="480" style="position: absolute; z-index: 0"></canvas>
//   <canvas id="fg" width="640" height="480" style="position: absolute; z-index: 1"></canvas>
NOISY.render = function (canvas, dashboard /*, interval*/) {
   "use strict";

   var ctx;

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

   // mouse over cell
   if (NOISY.mouseOverCell !== null) {
      NOISY.hexgrid.drawHexPath(ctx, NOISY.mouseOverCell, 36);

      ctx.strokeStyle = NOISY.selectableActor === NOISY.mouseOverCell ? '#ff0040' : '#00ff00';
      ctx.stroke();
   }

   if (NOISY.mode === MODE_ACTION ) {

      // ACTION mode

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

      ctx.fillStyle = '#000000';
      NOISY.targetableCells.forEach(function (c) {

         ctx.strokeStyle = '#f00000';
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

   }

   // Event

   if (NOISY.event !== null && NOISY.event.state === "travel") {
      ctx.fillStyle = '#a03a40';
      ctx.fillRect(
         NOISY.event.coordsxy.x - 10,
         NOISY.event.coordsxy.y - 10,
         10,
         10);
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
   canvas.addEventListener("mousemove", NOISY.mousemove(canvas));

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
