/*globals HexMap, Hex */
/*export HEXGRID, HexAttr */

var HexAttr = HexAttr || {
   WALL: 'xWall',    // boolean
   PATH: 'xPath',    // boolean
   COLOUR: 'xColour',// colour string, '#000000'
   ACTOR: 'xActor',  // ACTOR or undefined
   CENTER: 'xCenter'
};

Hex.prototype.setAttr = function(attr, value) {
   "use strict";
   this[attr] = value;
};

/*
 * Return
 *   value that is associated with attr or undefined
 */
Hex.prototype.getAttr = function(attr) {
   "use strict";
   return this[attr];
};

Hex.prototype.clearAttr = function(attr) {
   "use strict";
   delete this[attr];
};


function HEXGRID() {
   "use strict";

   var hexMap = new HexMap(),
       isShowIds = false;

   /**
    * Param
    *  offset - pixel offset for top left corner {x,y}
    *  map - map details
    */
   function init(offset, map) {

      var l, q, r;

      hexMap.setLayout(
         offset,
         {
            width: 36,
            height: 36
         });

      // add hexes to the HexMap

      map.grid.forEach(function(h) {
         l = h.slice(1, -1).split(',');

         q = parseInt(l[0], 10);
         r = parseInt(l[1], 10);

         h = hexMap.addHex({ id: { q: q, r: r }});

         h.setAttr(HexAttr.CENTER, hexMap.getCoords(h));

         if (map.walls.includes(h.getId())) {
            h.setAttr(HexAttr.WALL, true);
            h.setAttr(HexAttr.PATH, false);
            h.setAttr(HexAttr.COLOUR, '#d0ffd0');
         } else {
            h.setAttr(HexAttr.WALL, false);
            h.setAttr(HexAttr.PATH, true);
            h.setAttr(HexAttr.COLOUR, '#d0d0d0');
         }
      });
   }

   function render(ctx) {

      hexMap.draw(function(h, centerPt, corners) {

         ctx.fillStyle = h.getAttr(HexAttr.COLOUR);

         ctx.beginPath();

         corners.forEach(function(pt) {
            ctx.lineTo(pt.x, pt.y);
         });

         ctx.closePath();
         ctx.fill();

         if (isShowIds) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'extra-expanded 14px sans serif';
            ctx.strokeStyle = '#ffffff';
            ctx.strokeText(
               h.getId(),
               h.getAttr(HexAttr.CENTER).x,
               h.getAttr(HexAttr.CENTER).y);
         }
      });
   }

   /*
    * Params
    *  ctx - drawing context
    *  h - hex
    *  colour - line colour
    *  drawSize - [optional] radius of hex
    *  width - [optional] line width
    */
   function highlightHex(ctx, h, colour, drawSize, width) {
      var size = drawSize !== undefined ? {x: drawSize, y: drawSize} : undefined,
         corners = hexMap.getLayout().getCorners(h, size);

      ctx.beginPath();

      corners.forEach(function(pt) {
         ctx.lineTo(pt.x, pt.y);
      });

      if (width !== undefined) {
         ctx.lineWidth = width;
      }
      ctx.strokeStyle = colour;
      ctx.stroke();
   }

   function drawHex(ctx, h, colour, drawSize) {
      var size = drawSize !== undefined ? {x: drawSize, y: drawSize} : undefined,
         corners = hexMap.getLayout().getCorners(h, size);

      ctx.beginPath();

      corners.forEach(function(pt) {
         ctx.lineTo(pt.x, pt.y);
      });

      ctx.fillStyle = colour;
      ctx.fill();
   }


   function hasLineOfSight(a, b) {
      return hexMap.line(a, b).every(function (c) {
         return !c.isWall;
      });
   }

   function selectHex(point) {
      return hexMap.selectHex(point);
   }

   function getHex(id) {
      return hexMap.getHex(id);
   }

   function getAdjacent(h) {
      return hexMap.getAdjacent(h);
   }

   function distance(a, b) {
      return hexMap.distance(a, b);
   }

   return {
      init: init,
      render: render,
      highlightHex: highlightHex,
      drawHex: drawHex,

      selectHex: selectHex,
      getHex: getHex,

      hasLineOfSight: hasLineOfSight,
      line: hexMap.line,
      getAdjacent: getAdjacent,
      distance: distance,

      areNeighbours: function (c1, c2) {
         return hexMap.distance(c1, c2) === 1;
      },

      filter: function (attr, fn) {
         hexMap.forEach(function(h) {
            if (h[attr] === true) {
               fn(h);
            }
         });
      },

      // Empty Stubs
      setShowIds: function() {
         isShowIds = true;
      },

   };

}
