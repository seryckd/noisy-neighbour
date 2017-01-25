/*globals IMAGES,HEX,UTILS,PLAYER,MAPS,PATHFINDING*/

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
// Subset of reachableCells
// Cells that are marked as the selected path
// head is source, tail is target (which is always the same as mouseOverCell)
NOISY.selectedPathCells = [];

NOISY.viewport = {
   x : 0,
   y : 0
};

NOISY.players = [];

// Map keypresses to actions
NOISY.keymap = {
   65 : 'left',         // 'a'
   68 : 'right',        // 'd'
   87 : 'up',           // 'w'
   83 : 'down',         // 's'
   32 : 'space'         // ' '
};

// Holds the keys currently pressed
NOISY.keydown = {};

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

            if (NOISY.players[0].getCell() !== cell &&
                !cell.isWall() &&
                NOISY.reachableMapCells.has(cell.getHash())) {
               NOISY.selectedPathCells = new PATHFINDING(NOISY.hexgrid).findPath(NOISY.players[0].getCell(), cell);
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
      var cell = NOISY.coordsToCell(canvas, e);

      if (cell !== null) {

         if (NOISY.mode === MODE_SELECT) {
            if (NOISY.players[0].getCell() === cell) {
               NOISY.mode = MODE_ACTION;
               NOISY.reachableMapCells = new PATHFINDING(NOISY.hexgrid)
                  .findReachable(cell, NOISY.players[0].getCurAP());
            }
         } else {
            // action

            if (cell !== NOISY.selectedPathCells[0]) {
               NOISY.mode = MODE_SELECT;
               NOISY.players[0].setMovePath(NOISY.selectedPathCells);
            }
         }

      } else {

         console.log("no cell");
         NOISY.mode = MODE_SELECT;
         NOISY.selectedPathCells = [];

         NOISY.targetCell = null;
      }
   };
};

//NOISY.keypress = function () {
//   "use strict";
//
//   var acc = 2,
//      lastkey = 0;
//
//   return function (e) {
//
//      if (lastkey === e.keyCode) {
//         acc += 1.5;
//
//         if (acc > 15) {
//            acc = 15;
//         }
//      } else {
//         acc = 2;
//      }
//
//      lastkey = e.keyCode;
//
//      // a 97
//      if (e.keyCode === 97) {
//         NOISY.viewport.x -= NOISY.viewport.acc;
//
//      // d
//      } else if (e.keyCode === 100) {
//         NOISY.viewport.x += NOISY.viewport.acc;
//
//      // w
//      } else if (e.keyCode === 119) {
//         NOISY.viewport.y -= NOISY.viewport.acc;
//
//      // s
//      } else if (e.keyCode === 115) {
//         NOISY.viewport.y += NOISY.viewport.acc;
//
//      // space
//      } else if (e.keyCode === ' ') {
//         NOISY.endTurn();
//      }
//
//   };
//};

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

   NOISY.hexgrid.drawHexes(ctx);

   // draw player
   NOISY.players.forEach(function (p) {
      p.render(ctx, NOISY.images);
   });

   if (NOISY.mode === MODE_SELECT) {
      // mouse over cell
      if (NOISY.mouseOverCell !== null) {
         NOISY.hexgrid.drawHexPath(ctx, NOISY.mouseOverCell);
         ctx.strokeStyle = '#00ff00';
         ctx.stroke();
      }
   } else {

      // ACTION mode

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      NOISY.reachableMapCells.forEach(function (c) {
         ctx.strokeRect(
            c.centerxy.x - 10,
            c.centerxy.y - 10,
            20,
            20);
      });

      ctx.fillStyle = '#ffffff';
      NOISY.selectedPathCells.forEach(function (c) {
         ctx.fillRect(
            c.centerxy.x - 10,
            c.centerxy.y - 10,
            20,
            20);
      });

//      NOISY.selectedCells.forEach(function (c) {
//         NOISY.hexgrid.drawHexPath(ctx, c);
//         ctx.strokeStyle = '#ff0000';
//         ctx.stroke();
//      });
   }

   // ctx.clip(); drawImage()
   //ctx.drawImage(NOISY.images.image('rock'), 100, 100);

   // reset current transformation matrix to the identity matrix
   // (clears the ctx.translate())
   ctx.setTransform(1, 0, 0, 1, 0, 0);
};

NOISY.run = function () {
   "use strict";

   var now,
      dt = 0,
      last = window.performance.now(),
      step = 1 / 60,
      canvas;

   NOISY.images = new IMAGES();
   NOISY.images.load("player", "images/ball.png");
   NOISY.images.load("rock", "images/earth.png");

   canvas = document.getElementById("viewport");
   //canvas = document.createElement("canvas");

   canvas.width = 400;
   canvas.height = 400;
  // document.body.appendChild(canvas);

   //   NOISY.images = new IMAGES();
   //   NOISY.images.load('beach', 'beach4.png');

   NOISY.hexgrid = new HEX();

   NOISY.hexgrid.init(MAPS.one);

   NOISY.players[0] = new PLAYER();
   // TODO: how to discover hexagon cell?
   NOISY.players[0].setStartPos(NOISY.hexgrid.getCell("(0,0)"));

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
