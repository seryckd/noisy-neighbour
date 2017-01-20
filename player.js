/*jslint devel: true*/
function PLAYER() {
   "use strict";

   var currentCell,
      // arrays of cells to move through
      // [0] is same as currentCell
      path = [],
      elapsedTime = 0,
      // x,y position
      centerxy,
      curAP,         // current action points
      turnAP = 3;        // total action points available this turn

   function copyCenter(cell) {
      return {
         x : cell.centerxy.x,
         y : cell.centerxy.y
      };
   }

   function movePath(apath) {
      path = apath;
      // first element is the same as the currentcell
      path.shift();

      //currentCell = path[path.length - 1];
      centerxy = copyCenter(currentCell);
   }

   function setStartPos(cell) {
      currentCell = cell;
      centerxy = copyCenter(currentCell);
   }


   function getCell() {
      return currentCell;
   }

   function newTurn() {
      curAP = turnAP;
   }

   // linear interpolation of two numbers
   // number a
   // number b
   // number t where 0 <= t <= 1.0
   function lerp(a, b, t) {
      return a + (b - a) * t;
   }

   //
   function update(interval) {

      var speed = 0.4;

      if (path.length > 0) {

         // time is from 0-0.5
         elapsedTime += interval;

         if (elapsedTime > speed) {
            // Arrived at next cell, now target the next cell in the path
            currentCell = path.shift();
            centerxy = copyCenter(currentCell);
            elapsedTime = 0;
         } else {
            // Move from current to next in path
            centerxy.x = lerp(currentCell.centerxy.x, path[0].centerxy.x, elapsedTime / speed);
            centerxy.y = lerp(currentCell.centerxy.y, path[0].centerxy.y, elapsedTime / speed);
         }
      }

   }

   function render(ctx, image) {

      ctx.drawImage(
         image.image("player"),
         centerxy.x - 25,
         centerxy.y - 25,
         50,
         50
      );

   }

   return {
      setStartPos: setStartPos,
      movePath: movePath,
      update: update,
      render: render,
      getCell: getCell,
      newTurn: newTurn,
      getCurAP: function () {
         return curAP;
      }
   };
}

