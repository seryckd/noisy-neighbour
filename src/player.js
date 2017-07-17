/*globals ACTOR*/
/* exported PLAYER */

function PLAYER(startCell) {
   "use strict";

   ACTOR.call(this, 'player', startCell);

   this.isPlayer_ = true;
}

PLAYER.prototype = Object.create(ACTOR.prototype);

