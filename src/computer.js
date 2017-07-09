/* globals NOISY, PATHFINDING, ACTION, MoveActorAction, MeleeAction, WaitAction */
/* exported COMPUTER */

// Created to handle a turn.
function COMPUTER(actors) {
   "use strict";

   this.actors = actors.slice(0);
}

// Selects the actor to do the next action
// Actor[]
// Return Action
COMPUTER.prototype.doTurn = function() {
   "use strict";
   var action = null;

   console.log('doTurn: actors:' + this.actors.length);

   while (action === null && this.actors.length !== 0) {
      if (this.actors[0].getCurAP() === 0) {
         this.actors.shift();
         continue;
      }

      action = this.actorTurn(this.actors[0]);
   }

   if (action === null) {
      NOISY.endTurn();
   }

   return action;
};

// generate an action
// callback
// Return Action
COMPUTER.prototype.actorTurn = function(actor) {
   "use strict";

   var self = this,
       pathfinding = new PATHFINDING(NOISY.hexgrid),
       targets = [],
       target,
       path = [];

   if (actor.getCurAP() === 0) {
      return null;
   }

   // sorted list by path length
   targets = pathfinding.findTargetablePaths(actor.currentCell, NOISY.players, 4);

   if (targets.length > 0) {

      target = targets[0];
      console.log('found:' + target.actor.getCell().getHash());

      if (NOISY.hexgrid.distance(actor.getCell(), target.actor.getCell()) === 1) {
         console.log('close combat');

         return new MeleeAction(
            actor,
            target.actor,
            function() { return new WaitAction(0.2, self.doTurn.bind(self)); }
         );
      } else {
         console.log('move');

         path = target.path;

         // the last element is the target, remove that so we stop at it
         path.pop();

         return new MoveActorAction(
            actor,
            path,
            function() { return new WaitAction(0.2, self.doTurn.bind(self)); }
         );
      }


   } else {
      console.log('no targets');
      actor.clearAP();
   }

   return null;
};

   // actor 1 - sniper
   // is player a neighbour
   //   close cobat
   // is player in range
   //   fire
   // can see a player out of range
   //   move towards it


// actor 2 - Leeroy
// is player a neighbour
//   pick weakest one
//   close combat
// pick closest player
//   move towards
