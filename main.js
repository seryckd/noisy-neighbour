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

// Only used in ACTION mode
// Cells that are marked as reachable in this turn
NOISY.reachableMapCells = null;

// Only used in ACTION mode
// Cells that are targetable in this turn
NOISY.targetableMapCells = null;

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

// Called on canvas event listener
NOISY.mousemove = function (canvas) {
   "use strict";

   return function (e) {
      var cell = NOISY.coordsToCell(canvas, e);

      if (cell !== null) {

         // always set mouseOverCell
         NOISY.mouseOverCell = cell;

         if (NOISY.mode === MODE_ACTION) {

            if (!cell.hasActor() &&
                !cell.isWall() &&
                NOISY.reachableMapCells.has(cell.getHash())) {

               NOISY.selectedPathCells = new PATHFINDING(NOISY.hexgrid)
                  .findPath(NOISY.selectedPlayer.getCell(), cell);

            } else {
               NOISY.selectedPathCells = [];
            }
         }

      } else {
         NOISY.mouseOverCell = null;
      }
   };
};

// Called on canvas event listener
NOISY.click = function (canvas) {
   "use strict";

   return function (e) {
      var cell = NOISY.coordsToCell(canvas, e),
         l,
         p;

      if (cell !== null) {

         if (NOISY.mode === MODE_SELECT) {

            for (l = 0; l < NOISY.players.length; ++l) {
               p = NOISY.players[l];
               if (p.getCell() === cell) {
                  NOISY.mode = MODE_ACTION;
                  NOISY.selectedPlayer = p;
                  NOISY.reachableMapCells = new PATHFINDING(NOISY.hexgrid)
                     .findReachable(cell, p.getCurAP());

                  NOISY.targetableMapCells = new PATHFINDING(NOISY.hexgrid)
                     .findTargetable(cell, NOISY.npcs, NOISY.selectedPlayer.getWeaponRange());

                  break;
               }
            }

         } else {
            // action

            if (cell !== NOISY.selectedPlayer.getCell()) {
               NOISY.mode = MODE_SELECT;
               NOISY.selectedPlayer.setMovePath(NOISY.selectedPathCells);
            }
         }

      } else {

         NOISY.mode = MODE_SELECT;

         NOISY.selectedPlayer = null;
         NOISY.selectedPathCells = [];

         NOISY.targetCell = null;
      }
   };
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

   // -------------------------------------------------------------------------
   // move player

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
NOISY.render = function (canvas /*, interval*/) {
   "use strict";

   var ctx;

   // if ctx is null then canvas is not supported
   ctx = canvas.getContext("2d");

   // set viewport to current position
   ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      ctx.strokeStyle = '#00ff00';
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
      NOISY.targetableMapCells.forEach(function (c) {

         ctx.strokeStyle = '#f00000';
         ctx.beginPath();
         ctx.arc(c.centerxy.x, c.centerxy.y, 20, 0, 2 * Math.PI);
         ctx.moveTo(c.centerxy.x - 25, c.centerxy.y);
         ctx.lineTo(c.centerxy.x - 15, c.centerxy.y);
         ctx.moveTo(c.centerxy.x + 25, c.centerxy.y);
         ctx.lineTo(c.centerxy.x + 15, c.centerxy.y);
         ctx.moveTo(c.centerxy.x, c.centerxy.y - 25);
         ctx.lineTo(c.centerxy.x, c.centerxy.y - 15);
         ctx.moveTo(c.centerxy.x, c.centerxy.y + 25);
         ctx.lineTo(c.centerxy.x, c.centerxy.y + 15);
         ctx.stroke();

         //ctx.fillRect(c.centerxy.x, c.centerxy.y, 20, 20);
      });
   }

   // dashboard

   ctx.strokeStyle = '#000000';
   ctx.font = "24px sans serif";
   ctx.lineWidth = 1;
   ctx.strokeText(NOISY.mode, 10, 10);

   // reset current transformation matrix to the identity matrix
   // (clears the ctx.translate())
   ctx.setTransform(1, 0, 0, 1, 0, 0);
};

NOISY.loadMap = function (map) {
   "use strict";

   NOISY.hexgrid.init(MAPS.one);

   map.dwarf.forEach(function (d) {
      NOISY.players.push(new PLAYER(NOISY.hexgrid.getCell(d)));
   });

   map.goblin.forEach(function (g) {
      NOISY.npcs.push(new NPC(NOISY.hexgrid.getCell(g)));
   });
};

NOISY.run = function () {
   "use strict";

   var now,
      dt = 0,
      last = window.performance.now(),
      step = 1 / 60,
      canvas;

   NOISY.images = new IMAGES();
   NOISY.images.load("player", "images/dwarf.png");
   NOISY.images.load("goblin", "images/goblin1.png");

   canvas = document.getElementById("viewport");
   //canvas = document.createElement("canvas");

   canvas.width = 600;
   canvas.height = 400;

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
      NOISY.render(canvas, dt);

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
