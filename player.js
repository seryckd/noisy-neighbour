function PLAYER() {
   "use strict";

   var currentCell,
      curAP,         // current action points
      turnAP = 3;        // total action points available this turn

   function setCell(cell) {
      currentCell = cell;
   }

   function getCell() {
      return currentCell;
   }

   function newTurn() {
      curAP = turnAP;
   }

   // FIXME make this array of cells to move
   function moveToCell(cell) {
      currentCell = cell;
      curAP -= 1;
   }

   return {
      setCell: setCell,
      getCell: getCell,
      newTurn: newTurn,
      getCurAP: function () {
         return curAP;
      },
      moveToCell: moveToCell
   };
}

