/*jslint browser: true, devel: true*/
/*globals IMAGES,HEX,UTILS,PLAYER*/

/*
 * Control Scheme
 *
 * selected player
 *   highlighted hexagon
 *   shows possible movement by white colour on all cells
 *   as mouse moves over possible squares, show path with small white hexes
 *   selecting a possible square makes the player move there and leaves player selected
 *
 * clicking outside the player and possible squares will remove the selection
 */

var NOISY = NOISY || {};

NOISY.selectedCell = null;
NOISY.mouseOverCell = null;
NOISY.selectedPlayer = null;
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
   83 : 'down'          // 's'
};

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
      var cell = NOISY.coordsToCell(canvas, e),
         line;

      if (cell !== null) {

         NOISY.mouseOverCell = cell;

         cell = NOISY.hexgrid.getCell(NOISY.selectedPlayer.getCell());

         if (NOISY.mouseOverCell !== cell) {

            line = NOISY.hexgrid.line(cell, NOISY.mouseOverCell);
            console.log("line:" + line.length);
            line.forEach(function (e) {
               console.log('  ' + e.getHash());
            });
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
         NOISY.selectedPlayer = NOISY.players[0];
         NOISY.players[0].setCell(cell.getHash());
      } else {
         NOISY.selectedPlayer = null;
      }
   };
};

NOISY.keypress = function () {
   "use strict";

   var acc = 2,
      lastkey = 0;

   return function (e) {

      console.log('keypress ' + e.keyCode);

      if (lastkey === e.keyCode) {
         acc += 1.5;

         if (acc > 15) {
            acc = 15;
         }
      } else {
         acc = 2;
      }

      lastkey = e.keyCode;

      // a 97
      if (e.keyCode === 97) {
         NOISY.viewport.x -= NOISY.viewport.acc;

      // d
      } else if (e.keyCode === 100) {
         NOISY.viewport.x += NOISY.viewport.acc;

      // w
      } else if (e.keyCode === 119) {
         NOISY.viewport.y -= NOISY.viewport.acc;

      // s
      } else if (e.keyCode === 115) {
         NOISY.viewport.y += NOISY.viewport.acc;
      }

   };
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

};

// Ideas to improve performance
// - only update canvass for a bounding rect over the change
// - cache canvas until an update occurs
// - overlaying canvasses
//   <canvas id="bg" width="640" height="480" style="position: absolute; z-index: 0"></canvas>
//   <canvas id="fg" width="640" height="480" style="position: absolute; z-index: 1"></canvas>
NOISY.render = function (canvas, interval) {
   "use strict";

   var ctx,
      digitWidth = 10,
      spos,
      count,
      text = 'say hello',
      cell;

   // if ctx is null then canvas is not supported
   ctx = canvas.getContext("2d");

   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.translate(NOISY.viewport.x, NOISY.viewport.y);

   /*
   if (!NOISY.images.isReady()) {
      console.log('waiting for image to load');
      return;
   }
   */

   /*
   NOISY.hexgrid.each(function (cell) {
      //console.log("x:" + cell.xy.x + " y:");
      //ctx.fillRect(
      //   cell.xy.x,
      //   cell.xy.y,
      //   36,
      //   36
      //);

      ctx.drawImage(NOISY.images.image('beach'), cell.xy.x, cell.xy.y);
   });
   */

   NOISY.hexgrid.drawHexes(ctx, NOISY.selectedCell);

   // draw player
   NOISY.players.forEach(function (element) {
      cell = NOISY.hexgrid.getCell(element.getCell());

      ctx.fillStyle = '#000000';
      ctx.fillRect(cell.centerxy.x, cell.centerxy.y, 4, 4);

      if (NOISY.selectedPlayer === element) {
         NOISY.hexgrid.drawHexPath(ctx, cell);
         ctx.strokeStyle = '#ff0000';
         ctx.stroke();
      }

   });

   // mouse over cell
   if (NOISY.mouseOverCell !== null) {
      NOISY.hexgrid.drawHexPath(ctx, NOISY.mouseOverCell);
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
   }

   // reset current transformation matrix to the identity matrix
   ctx.setTransform(1, 0, 0, 1, 0, 0);
};

NOISY.run = function () {
   "use strict";

   var now,
      dt = 0,
      last = window.performance.now(),
      step = 1 / 60,
      canvas;

   canvas = document.createElement("canvas");

   canvas.width = 400;
   canvas.height = 400;
   document.body.appendChild(canvas);

   //   NOISY.images = new IMAGES();
   //   NOISY.images.load('beach', 'beach4.png');

   NOISY.hexgrid = new HEX();

   NOISY.hexgrid.init(16, 16);

   NOISY.players[0] = new PLAYER();
   // TODO: how to discover hexagon cell?
   NOISY.players[0].setCell("(0,0)");
   NOISY.selectedPlayer = NOISY.players[0];

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

   window.requestAnimationFrame(frame);
};

NOISY.run();
