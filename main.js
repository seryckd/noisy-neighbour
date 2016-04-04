/*jslint browser: true, devel: true*/
/*globals IMAGES,HEX,UTILS*/

var NOISY = NOISY || {};

// Polyfill for window.performance.now
// (not available on iPhone 4)
(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }
  
  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false){
    
    var nowOffset = Date.now();
    
    if (performance.timing && performance.timing.navigationStart){
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now(){
      return Date.now() - nowOffset;
    }
  }

})();

NOISY.selectedCell = null;

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

      if (cell !== null) {
         NOISY.selectedCell = cell;
       //  console.log("cell=" + NOISY.selectedCell.getHash());
      } else {
         NOISY.selectedCell = null;
      //   console.log("cell=null");
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
      text = 'say hello';

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

   ctx.font = "20px Times New Roman";
   ctx.fillStyle = "Black";

   spos = canvas.width - 1.5 * digitWidth;
   for (count = text.length - 1; count >= 0; count -= 1) {
      ctx.fillText(text.charAt(count), spos, 30);
      spos -= digitWidth;
   }

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
   //HEX.init();

   // Track the mouse
   // Only call after setup globals
   canvas.addEventListener("mousemove", NOISY.mousemove(canvas));

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
