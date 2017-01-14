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
 * Cube Coordinates (x, y, z)
 *
 * Where x + y + z = 0
 *
 * Cube coords are used for the algorithms.
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


   // Hex represented in axial coords
   function Axial(q, r) {
      this.q = q;
      this.r = r;

      this.hash = function () {
         //return q + "_" + r;
         return "(" + q + "," + r + ")";
      };
   }

   // Hex represented in cube coords
   function Cube(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;

      this.hash = function () {
         return "(" + x + "," + y + "," + z + ")";
      };
   }

   // Convert Cube coords to Axial coords
   // Params
   // Cube c
   // Return Axial
   function cube_to_axial(c) {
      return new Axial(c.x, c.z);
   }

   // Convert Axial coords to Cube coords
   // Params
   // Axial ax
   // Return Cube
   function axial_to_cube(ax) {
      var x = ax.q,
         z = ax.r,
         y = -x - z;
      return new Cube(x, y, z);
   }

   // Object: Individual Hex
   function Cell(q, r) {

      this.axial = new Axial(q, r);

      // x,y drawing coords (based on top lef)
      this.xy = {};
      this.centerxy = {};

      this.getHash = function () {
         return this.axial.hash();
      };
   }


   // Calculate the pixel coords from axial coords
   // Params
   // Axial ax
   // Return {x, y} pixel coords
   function toPixelXY(ax) {
      if (isFlatTop) {
         return {
            x: Math.floor(hexSize * 3 / 2 * ax.q),
            y: Math.floor(hexSize * Math.sqrt(3) * (ax.r + ax.q / 2))
         };
      } else {
         return {
            x: Math.floor(hexSize * Math.sqrt(3) * (ax.q + ax.r / 2)),
            y: Math.floor(hexSize * 3 / 2 * ax.r)
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
            cell.xy = toPixelXY(cell.axial);

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


   // selectHexFromPixel
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

      hex = cells[new Axial(q, r).hash()];

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

   function drawHexes(ctx) {
      var i,
         p;

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
      ctx.fillStyle = '#b0b0b0';

      each(function (cell) {
         drawHexPath(ctx, cell);

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

   // ---------------------------------------------


   // Calculate the number of hexes between two Cubes
   // Params
   // Cube a
   // Cube b
   function cube_distance(a, b) {
      return (
         Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
      ) / 2;
   }

   // Round floating point coords to integers
   // Cube h
   function cube_round(h) {
      var rx = Math.round(h.x),
         ry = Math.round(h.y),
         rz = Math.round(h.z),
         x_diff = Math.abs(rx - h.x),
         y_diff = Math.abs(ry - h.y),
         z_diff = Math.abs(rz - h.z);

      if (x_diff > y_diff && x_diff > z_diff) {
         rx = -ry - rz;
      } else if (y_diff > z_diff) {
         ry = -rx - rz;
      } else {
         rz = -rx - ry;
      }

      return new Cube(rx, ry, rz);
   }

   // linear interpolation of two numbers
   // number a
   // number b
   // number t where 0 <= t <= 1.0
   function lerp(a, b, t) {
      return a + (b - a) * t;
   }

   // Calculate floating point coords at position t on the line
   // between two Cubes
   // Params
   // Cube a
   // Cube b
   // number t where 0 <= t <= 1.0
   function cube_lerp(a, b, t) {
      return new Cube(
         lerp(a.x, b.x, t),
         lerp(a.y, b.y, t),
         lerp(a.z, b.z, t)
      );
   }

   // Calculate the cells that form a line between two cells.
   // Params
   // Cell a
   // Cell b
   // Return Cell[] where first entry is a and last entry is b
   function line(a, b) {
      var cubea = axial_to_cube(a.axial),
         cubeb = axial_to_cube(b.axial),
         N = cube_distance(cubea, cubeb),
         results = [],
         i,
         axiali;

      for (i = 0; i <= N; i += 1) {
         axiali = cube_to_axial(cube_round(cube_lerp(cubea, cubeb, 1.0 / N * i)));
         results.push(getCell(axiali.hash()));
      }

//      console.log("HEX line cells=" + results.length);
//      results.forEach(function (e) {
//         console.log("  " + e.getHash());
//      });

      return results;
   }

   // ---------------------------------------------

   return {
      // methods
      init: init,
      each: each,
      selectHex: selectHex,
      drawHexes: drawHexes,
      drawHexPath: drawHexPath,
      getCell: getCell,
      line: line,

      // expose in developer tools
      cells: cells,

      // objects
      Cell: Cell
   };
}
//})();

