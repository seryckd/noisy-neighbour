/* globals NOISY, PATHFINDING, ACTION, MoveActorAction, MeleeAction, MissileAction, WaitAction, UTILS */
/* exported COMPUTER */

// Created to handle a turn.
function ComputerAction(actors) {
   "use strict";

   this.actors = actors.slice(0);
}

ComputerAction.prototype = new ACTION();


// Selects the actor to do the next action
// Actor[]
// Return Action
ComputerAction.prototype.update = function() {
   "use strict";
   var action = null,
      actor;

   while (action === null && this.actors.length !== 0) {
      if (this.actors[0].getCurAP() === 0) {
         this.actors.shift();
         continue;
      }

      actor = this.actors[0];
      console.log('Comp actor:' + actor.name());
      action = this.actorTurn(actor);
   }

   if (action === null) {
      console.log('Comp endturn');
      NOISY.endTurn();
   }

   return action;
};

// generate an action
// callback
// Return Action
ComputerAction.prototype.actorTurn = function(actor) {
   "use strict";

   var self = this,
       pathfinding = new PATHFINDING(NOISY.hexgrid);

   if (actor.getCurAP() === 0) {
      return null;
   }

//   return new SnipeStrategy(actor, pathfinding, self);
   return chargeStrategy(actor, pathfinding, self);
};

// actor 1 - sniper
// is player a neighbour
//   close cobat
// is player in range
//   fire
// can see a player out of range
//   move towards it

function snipeStrategy(actor, pathfinding, nextAction) {

   "use strict";
   var targets = [],
      target,
      path = [];

   // sorted list by path length
   targets = pathfinding.findTargetablePaths(actor.currentCell, NOISY.players, 8);

   if (targets.length > 0) {

      target = targets[0];
      console.log('SNIPE found:' + target.actor.getCell().getHash());

      if (NOISY.hexgrid.distance(actor.getCell(), target.actor.getCell()) < actor.getMissileRange()) {
         console.log('SNIPE fire');
         return new MissileAction(actor, target.actor)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      } else {
         path = target.path;

         // the last element is the target, remove that so we stop at it
         path.pop();
         console.log('SNIPE move');

         return new MoveActorAction(actor, path)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      }

   } else {
      console.log('SNIPE no targets');
      actor.clearAP();
   }

   return null;
}

// actor 2 - Leeroy
// is player a neighbour
//   pick weakest one
//   close combat
// pick closest player
//   move towards

function chargeStrategy(actor, pathfinding, nextAction) {

   "use strict";
   var targets = [],
      target,
      path = [],
      dist;

   // sorted list by path length
   targets = pathfinding.findTargetablePaths(actor.currentCell, NOISY.players, 4);

   if (targets.length > 0) {

      target = targets[0];
      console.log('CHARGE found:' + target.actor.getCell().getHash());

      dist = NOISY.hexgrid.distance(actor.getCell(), target.actor.getCell());

 //     if (NOISY.hexgrid.distance(actor.getCell(), target.actor.getCell()) === 1) {
      if (dist === 1) {
         console.log('CHARGE close combat');

         return new MeleeAction(actor, target.actor)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      } else {

         path = target.path;

         // the last element is the target, remove that so we stop at it
         path.pop();

         console.log('CHARGE move dist:' + dist + ' path:' + UTILS.outputPath(path));

         return new MoveActorAction(actor, path)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      }

   } else {
      console.log('CHARGE no targets');
      actor.clearAP();
   }

   return null;
}



