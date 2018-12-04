/*globals HexMap, Hex */
/*export HEXGRID, HexAttr */

var HexAttr = HexAttr || {
   WALL: 'xWall',    // boolean
   PATH: 'xPath',    // boolean
   COLOUR: 'xColour',// colour string, '#000000'
   ACTOR: 'xActor',  // ACTOR or undefined
   CENTER: 'xCenter',// the (x,y) of the centre of the Hex
   SCENT: 'xScent'   // scent information used by Diffusion
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

   // TODO rename layer as worksheet?
   // layer = 'data1';
   //{
   //   scent1: [ data1: value, data2: value ],
   //   scent2: [ data1: value, data2: value ],
   //}

   var hexMap = new HexMap(),
       isShowIds = false,
       scentLayer = 'notset';

   /*
    * Params
    *  String[] scents
    */
   function initScents(layer, scents) {

      var o;

      hexMap.forEach(function(h) {

         o = {};

         scents.forEach(function(scent) {
            o[scent] = { "one": 0, "two": 0};
         });

         h.setAttr(HexAttr.SCENT, o);
      });

      setScentLayer(layer);
   }

   function getScent(h, scent, layer) {
      var l = layer === undefined ? scentLayer : layer;
      return h.getAttr(HexAttr.SCENT)[scent][l];
   }

   function setScent(h, scent, value, layer) {
      var l = layer === undefined ? scentLayer : layer;
      h.getAttr(HexAttr.SCENT)[scent][l] = value;
   }

   function setScentLayer(layer) {
      scentLayer = layer;
   }


   /**
    * Param
    *  offset - pixel offset for top left corner {x,y}
    *  map - map details
    */
   function init(offset, map) {

      var l, q, r;

      hexMap.clear();

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

         var fillColour = h.getAttr(HexAttr.COLOUR),
             scent,
             scentColour;

         if (isShowIds) {

            scent = getScent(h, 'player');

            if (scent !== undefined) {

               // Use log to take the large scent values and put them in a smaller range
               // (-Infinity, range -10 to 10)
               scentColour = Math.log2(scent);
               if (scentColour === -Infinity) {
                  scentColour = 0;
               } else {
                  // Slide result to the positive (range 0-20)
                  // and then change to scale 0-255
                  scentColour = Math.round((scentColour + 10) * (255 / 20));
               }
               fillColour = 'rgb(' + scentColour + ',' + 0 + ',' + 0 + ')';
            }
         }

         ctx.fillStyle = fillColour;

         ctx.beginPath();

         corners.forEach(function(pt) {
            ctx.lineTo(pt.x, pt.y);
         });

         ctx.closePath();
         ctx.fill();

         if (isShowIds) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '12px sans serif';
            ctx.strokeStyle = '#ffffff';
            ctx.strokeText(
               h.getId(),
               h.getAttr(HexAttr.CENTER).x,
               h.getAttr(HexAttr.CENTER).y);
            ctx.strokeText(
               scent,
               h.getAttr(HexAttr.CENTER).x,
               h.getAttr(HexAttr.CENTER).y + 12);
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

      ctx.closePath();

      if (width !== undefined) {
         ctx.lineWidth = width;
      }
      ctx.strokeStyle = colour;
      ctx.stroke();
   }

   /*
    * Params
    *  ctx - drawing context
    *  h - hex
    *  colour - line colour
    *  drawSize - [optional] radius of hex
    */
   function drawHex(ctx, h, colour, drawSize) {
      var size = drawSize !== undefined ? {x: drawSize, y: drawSize} : undefined,
         corners = hexMap.getLayout().getCorners(h, size);

      ctx.beginPath();

      corners.forEach(function(pt) {
         ctx.lineTo(pt.x, pt.y);
      });

      ctx.closePath();

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

      setShowIds: function(flag) {
         isShowIds = flag;
      },

      initScents: initScents,
      getScent: getScent,
      setScent: setScent,
      setScentLayer: setScentLayer,
      forEach: function(fn) {
         hexMap.forEach(function(h) {
            fn(h);
         });
      }
   };

}
