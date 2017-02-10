/*globals ACTOR*/
/* exported PLAYER */

function PLAYER() {
   "use strict";

   this.imageName = "player";
   this.isPlayer_ = true;
}

PLAYER.prototype = new ACTOR();

