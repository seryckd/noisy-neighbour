/* exported NPC */

function NPC(startCell) {
   "use strict";

   var currentCell = startCell;

   currentCell.setActor(this);

   function setCell(cell) {
      currentCell = cell;
   }

   function getCell() {
      return currentCell;
   }

   function render(ctx, image) {

      ctx.drawImage(
         image.image("goblin"),
         currentCell.centerxy.x - 35,
         currentCell.centerxy.y - 35
      );
   }

   return {
      render: render,
      setCell: setCell,
      getCell: getCell

   };
}
