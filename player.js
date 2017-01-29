/* exported PLAYER */

function PLAYER(startCell) {
   "use strict";

   var self = this,
      currentCell = startCell,
      // arrays of cells to move through
      // [0] is same as currentCell
      path = [],
      elapsedTime = 0,
      // x,y position
      centerxy = copyCenter(currentCell),
      curAP = 3,         // current action points
      turnAP = 3;        // total action points available this turn

   currentCell.setActor(this);

   function copyCenter(cell) {
      return {
         x : cell.centerxy.x,
         y : cell.centerxy.y
      };
   }

   function getWeaponRange() {
      return 5;
   }

   //
   // Params
   // Cell[] array of cells to move through
   function setMovePath(apath) {
      path = apath;

      //currentCell = path[path.length - 1];
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

      var speed = 0.5;

      if (path.length > 0) {

         // time is from 0-0.5
         elapsedTime += interval;

         if (elapsedTime > speed) {
            // Arrived at next cell, now target the next cell in the path

            currentCell.clearActor();

            currentCell = path.shift();
            centerxy = copyCenter(currentCell);
            currentCell.setActor(self);

            elapsedTime = 0;
            curAP -= 1;

            if (curAP === 0) {
               path = [];
            }
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
         centerxy.x - 35,
         centerxy.y - 35
      );

      // rectangle
      // points in rectangle

      ctx.strokeText(curAP,
                    centerxy.x,
                    centerxy.y);

   }

   return {
      update: update,
      render: render,
      setMovePath: setMovePath,
      getCell: getCell,
      newTurn: newTurn,
      getCurAP: function () {
         return curAP;
      },
      getWeaponRange: getWeaponRange
   };
}

