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
NOISY.selectedPlayer = null;

NOISY.players = [];

// Called on canvas event listener
NOISY.mousemove = function (canvas) {
   "use strict";

   // e.clientX, e.clientY in local (DOM content) coords (Browser Window 0,0 is top left)
   // e.screenX, e.screenY in global (screen) coords
   return function (e) {
      // offset are window coords of the canvas
      //  var offset = UTILS.realPosition(canvas),
      //   mx = e.clientX - offset[0],
      // my = e.clientY - offset[1],
      var offset, mx, my, cell;

      offset = UTILS.realPosition(canvas);
      //console.log('offset=(' + offset[0] + ',' + offset[1] + ')');
      mx = e.clientX - offset[0];
      my = e.clientY - offset[1];
      //console.log('(' + mx + ',' + my + ')');

      cell = NOISY.hexgrid.selectHex(mx, my);

      /*
      if (cell !== null) {
         NOISY.selectedCell = cell;
         //  console.log("cell=" + NOISY.selectedCell.getHash());
      } else {
         NOISY.selectedCell = null;
         //   console.log("cell=null");
      }
      */
   };
};

// Called on canvas event listener
NOISY.click = function (canvas) {
   "use strict";

   // e.clientX, e.clientY in local (DOM content) coords (Browser Window 0,0 is top left)
   // e.screenX, e.screenY in global (screen) coords
   return function (e) {
      // offset are window coords of the canvas
      //  var offset = UTILS.realPosition(canvas),
      //   mx = e.clientX - offset[0],
      // my = e.clientY - offset[1],
      var offset, mx, my, cell;

      offset = UTILS.realPosition(canvas);
      //console.log('offset=(' + offset[0] + ',' + offset[1] + ')');
      mx = e.clientX - offset[0];
      my = e.clientY - offset[1];
      //console.log('(' + mx + ',' + my + ')');

      cell = NOISY.hexgrid.selectHex(mx, my);

      if (cell !== null) {
         NOISY.selectedPlayer = NOISY.players[0];
         NOISY.players[0].setCell(cell.getHash());
      } else {
         NOISY.selectedPlayer = null;
      }
   };
};

NOISY.update = function (interval) {
   "use strict";

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
};

NOISY.run = function () {
   "use strict";

   var now,
      dt,
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

   NOISY.hexgrid.init();

   NOISY.players[0] = new PLAYER();
   // TODO: how to discover hexagon cell?
   NOISY.players[0].setCell("0_0");

   // Track the mouse
   // Only call after setup globals
   canvas.addEventListener("mousemove", NOISY.mousemove(canvas));

   // Track clicks
   canvas.addEventListener("click", NOISY.click(canvas));

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

      requestAnimationFrame(frame);
   }

   requestAnimationFrame(frame);
};

NOISY.run();
