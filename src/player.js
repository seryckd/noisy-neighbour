/*globals NOISY,ACTOR, DIFFUSION3*/
/* exported PLAYER */

function PLAYER(startCell) {
   "use strict";

   ACTOR.call(this, 'player', startCell);

   this.isPlayer_ = true;

   this.goal.player = DIFFUSION3.GOAL_SCENT;
   NOISY.diffusionMap.setGoalAgent(this);
}

PLAYER.prototype = Object.create(ACTOR.prototype);

