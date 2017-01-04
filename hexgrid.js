/*jslint devel: true*/
/* HEX Module
 * Refer to http://www.redblobgames.com/grids/hexagons/
 *
 * columns are denoted by 'q', number of columns is width
 * rows are denoted by 'r', number of rows is height
 *
 * Hexes can be drawn as pointy top or flat top. This handles both,
 * ensure that isFlatTop is set correctly.
 *
 *   - For flat top
 *     Width = 2 * HexSize
 *     Height = HexSize * sqrt(3)
 *
 * Terms
 *   - HexSize (radius and length of side)
 *     (remembering a regular hexagon is made up of 6 equilateral trianges)
 *   - HexPixelWidth (width of image to draw)
 *   - HexPixelHeight (height of image to draw)
 *
 * Axial Coordinates (q, r) (pointy top)
 *
 * Where column is the top left to bottom right diagonal and row is horizontal.
 * This system will lead to negative indexes.
 *
 * (0,0) (1,0) (2,0)         Width is 3
 *    (0, 1) (1,1)           Height is 4
 * (-1,2) (0,2) (1,2)
 *    (-1,3) (0,3)
 *
 * Axial Coordinates (q, r) (flat top)
 *
 * Where column is vertical and row is top left to bottom right
 *
 * (0,0) (2,-1) (4,-2)
 *    (1,0)  (3,-1)
 * (0,1) (2,0)  (3,-1)
 *    (1,1)  (3,0)
 *
 *
 * Cube Coordinates
 * (x, y, z)
 * Where x + y + z = 0
 *
 *
 */

function HEX() {
   "use strict";

   var isFlatTop = true,
      cells = {},
      numCols,          // Number of coloums in the grid
      numRows,          // Number of rows in the grid
      hexPixelWidth,    // width of hex in pixels
      hexPixelHeight,   // height of hex in pixels
      hexSize;          // length of hexagon size

   function getHash(q, r) {
      return q + "_" + r;
   }

   // Object: Individual Hex
   function Cell(q, r) {

      this.axial = {
         q: q,
         r: r
      };

      // x,y drawing coords (based on top lef)
      this.xy = {};
      this.centerxy = {};

      this.getHash = function () {
//         return this.axial.q + "_" + this.axial.r;
         return getHash(this.axial.q, this.axial.r);
      };
   }

   function toPixelXY(q, r) {
      if (isFlatTop) {
         return {
            x: Math.floor(hexSize * 3 / 2 * q),
            y: Math.floor(hexSize * Math.sqrt(3) * (r + q / 2))
         };
      } else {
         return {
            x: Math.floor(hexSize * Math.sqrt(3) * (q + r / 2)),
            y: Math.floor(hexSize * 3 / 2 * r)
         };
      }
   }

   // Call the function 'fn' for each cell
   function each(fn) {
      var key;

      for (key in cells) {
         if (cells.hasOwnProperty(key)) {
            fn(cells[key]);
         }
      }
   }

   function init(numberCols, numberRows) {

      var row,
         col,
         q,
         r,
         cell,
         rowCols,
         halfHexSize;

      numCols = numberCols;
      numRows = numberRows;
      hexSize = 36;
      halfHexSize = hexSize / 2;

      hexPixelWidth = 72;
      hexPixelHeight = 72;

      if (isFlatTop) {
         hexPixelWidth = 2 * hexSize;
         hexPixelHeight = Math.sqrt(3) * hexSize;
      } else {
         hexPixelHeight = 2 * hexSize;
         hexPixelWidth = Math.sqrt(3) * hexSize;
      }

      console.log('size=' + hexSize + ' width=' + hexPixelWidth + ' height=' + hexPixelHeight);

      for (row = 0; row < numRows; row += 1) {
         for (col = 0; col < numCols; col += 1) {

            if (isFlatTop) {
               r = -Math.floor(col / 2) + row;
               q = col;
            } else {
               q = -Math.floor(row / 2) + col;
               r = row;
            }
            cell = new Cell(q, r);
            cell.xy = toPixelXY(cell.axial.q, cell.axial.r);

            cell.centerxy = {
               x: cell.xy.x + hexPixelWidth / 2,
               y: cell.xy.y + hexPixelHeight / 2
               //x: cell.xy.x + hexSize,
               //y: cell.xy.y + hexSize
            };

            cells[cell.getHash()] = cell;
         }
      }
   }

   // Return (x,y) coords of one of the hex corners.
   // angle: corner number (0-5)
   function hexCorner(center, angle) {
      var angle_deg = 60 * angle,
         angle_rad;

      if (!isFlatTop) {
         angle_deg = angle_deg + 30;
      }

      angle_rad = Math.PI / 180 * angle_deg;

      return {
         x: center.x + hexSize * Math.cos(angle_rad),
         y: center.y + hexSize * Math.sin(angle_rad)
      };
   }

   /*
   function toAxial(cube) {
      return {
         q: cube.x,
         r: cube.z
      };
   }

   function toCube(axial) {
      return {
         x: axial.q,
         y: -axial.q - axial.r,
         z: axial.r
      };
   }

   // Takes floating point cube coords and converts to int cube coords
   // cube {x, y, z}
   function cubeRound(cube) {
      var rx = Math.round(cube.x),
         ry = Math.round(cube.y),
         rz = Math.round(cube.z),
         xdiff = Math.abs(rx - cube.x),
         ydiff = Math.abs(ry - cube.y),
         zdiff = Math.abs(rz - cube.z);

      if (xdiff > ydiff && xdiff > zdiff) {
         rx = -ry - rz;
      } else if (ydiff > zdiff) {
         ry = -rx - rz;
      } else {
         rz = -rx - ry;
      }

      return {
         x: rx,
         y: ry,
         z: rz
      };
   }
   */

   function selectHex(x, y) {
      //x = x - xyoffset.x;
      //y = y - xyoffset.y;

      var x1, y1, t1, t2, r, q, hex;

      // Branchless algorithm shamelessly copied
      // without any understanding from
      // http://www.redblobgames.com/grids/hexagons

      if (isFlatTop) {
         y1 = (y - (hexPixelHeight / 2)) / hexPixelHeight;
         t1 = x / hexSize;
         t2 = Math.floor(y1 + t1);
         q = Math.floor((Math.floor(t1 - y1) + t2) / 3);
         r = Math.floor((Math.floor(2 * y1 + 1) + t2) / 3) - q;
      } else {
         x1 = (x - (hexPixelWidth / 2)) / hexPixelWidth;
         t1 = y / hexSize;
         t2 = Math.floor(x1 + t1);
         r = Math.floor((Math.floor(t1 - x1) + t2) / 3);
         q = Math.floor((Math.floor(2 * x1 + 1) + t2) / 3) - r;
      }

      hex = cells[getHash(q, r)];

      if (hex === undefined) {
         hex = null;
      }

      return hex;
   }

   function drawHexPath(ctx, cell) {

      var p,
         i;

      ctx.beginPath();
      p = hexCorner(cell.centerxy, 5);
      ctx.moveTo(p.x, p.y);

      for (i = 0; i <= 5; i = i + 1) {
         p = hexCorner(cell.centerxy, i);
         ctx.lineTo(p.x, p.y);
      }

      ctx.closePath();
   }

   function drawHexes(ctx, selectedHex) {
      var i,
         p;

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';

      each(function (cell) {
         drawHexPath(ctx, cell);

         if (selectedHex === cell) {
            ctx.fillStyle = '#FF0000';
         } else {
            ctx.fillStyle = '#b0b0b0';
         }
         ctx.fill();
         ctx.stroke();

         // draw centre
         //ctx.fillStyle = '#000000';
         //ctx.fillRect(cell.centerxy.x, cell.centerxy.y, 1, 1);
      });
   }

   function getCell(hash) {
      return cells[hash];
   }

   return {
      // methods
      init: init,
      each: each,
      selectHex: selectHex,
      drawHexes: drawHexes,
      drawHexPath: drawHexPath,
      getCell: getCell,

      // expose in developer tools
      cells: cells,

      // objects
      Cell: Cell
   };
}
//})();

