/*globals ACTOR */
/* exported NPC */

function NPC() {
   "use strict";

   this.imageName = "goblin";
}

NPC.prototype = new ACTOR();

//NPC.prototype.init = function(startCell) {
//   "use strict";
//   return Object.getPrototypeOf(this).init(startCell);
//};
