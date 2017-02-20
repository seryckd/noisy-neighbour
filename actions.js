/* globals UTILS */
/* exported MoveActorAction */

// MoveActorAction
// Create an action to move an Actor
//
// ACTOR actor
// Cell[] path - cells to move the actor through
function MoveActorAction(actor, path) {
   "use strict";

   this.actor = actor;
   this.path = path;

   this.elapsedTime = 0;

   this.cell = actor.getCell();
   this.centerxy = UTILS.copyCellCenter(this.cell);
}

// update
// Update the Actor's position as it moves through the path
//
// long interval
// return this || null
MoveActorAction.prototype.update = function(interval) {
   "use strict";
   var speed = 0.5;

   // time is from 0-0.5
   this.elapsedTime += interval;

   if (this.elapsedTime > speed) {
      // Arrived at next cell, now target the next cell in the path

      this.cell = this.path.shift();
      this.centerxy = UTILS.copyCellCenter(this.cell);

      this.actor.setPosition(this.cell, this.centerxy);

      this.elapsedTime = 0;
      this.actor.decAP(1);

      if (this.path.length === 0 || this.actor.getCurAP() === 0) {
         this.path = [];
         return null;
      }

   } else {

      // Move actor from current cell to the next one
      this.centerxy.x = UTILS.lerp(
         this.cell.centerxy.x,
         this.path[0].centerxy.x,
         this.elapsedTime / speed);

      this.centerxy.y = UTILS.lerp(
         this.cell.centerxy.y,
         this.path[0].centerxy.y,
         this.elapsedTime / speed);

      this.actor.setPosition(this.cell, this.centerxy);
   }

   return this;
};
