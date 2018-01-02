/*globals ACTOR, NOISY, CHARGESTRATEGY, SNIPESTRATEGY, COLLABSTRATEGY */
/* exported NPC */

function NPC(info) {
   "use strict";

   ACTOR.call(this, "goblin", NOISY.hexgrid.getCell(info.start));

   if (info.strategy === "charge") {
      this.strategy = new CHARGESTRATEGY(this);
   } else if (info.strategy === "snipe") {
      this.strategy = new SNIPESTRATEGY(this);
   } else if (info.strategy === "collab") {
      this.strategy = new COLLABSTRATEGY(this);
   }

   // Diffusion value of scent 'player'
   this.lambda.player = 0.1;
}

NPC.prototype = Object.create(ACTOR.prototype);



