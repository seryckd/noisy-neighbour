/*globals ACTOR, NOISY */
/* exported NPC */

function NPC(info) {
   "use strict";

   ACTOR.call(this, 'goblin', NOISY.hexgrid.getCell(info.start));
   this.strategy = info.strategy;

}

NPC.prototype = Object.create(ACTOR.prototype);

NPC.prototype.CHARGE_STRATEGY = "charge";
NPC.prototype.SNIPE_STRATEGY = "snipe";

