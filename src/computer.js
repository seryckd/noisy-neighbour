/* globals NOISY, PATHFINDING, ACTION, MoveActorAction, MeleeAction, MissileAction, WaitAction, UTILS */
/* exported COMPUTER, CHARGESTRATEGY, SNIPESTRATEGY */


// ----------------------------------------------------------------------------
// Computer Action
// ----------------------------------------------------------------------------

// Computer Action handles the computer turn. It spawns movement and combat actions
// until the Computer turn is finished.

function ComputerAction(actors) {
   "use strict";

   // take a copy of the actor list as we are going to modify it
   this.actors = actors.slice(0);
}

ComputerAction.prototype = new ACTION();


// Selects the actor to do the next action
// Actor[]
// Return Action or null
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

   return actor.strategy.update(pathfinding, self);
};


// ----------------------------------------------------------------------------
// Computer Strategy
// ----------------------------------------------------------------------------

function STRATEGY(actor_) {
   "use strict";

   this.actor = actor_;
}

STRATEGY.prototype.update = function(/*pathfinding, nextAction*/) {};

// ----------------------------------------------------------------------------
// Strategy - Snipe
//
// actor 1 - sniper
// is player a neighbour
//   close combat
// is player in range
//   fire
// can see a player out of range
//   move towards it
// ----------------------------------------------------------------------------

function SNIPESTRATEGY(actor) {
   "use strict";
   STRATEGY.call(this, actor);
}

SNIPESTRATEGY.prototype = Object.create(STRATEGY.prototype);

SNIPESTRATEGY.prototype.update = function(pathfinding, nextAction) {

   "use strict";
   var targets = [],
      target,
      path = [];

   // list of cells sorted by length
   targets = pathfinding.findTargetableCells(this.actor.currentCell, NOISY.players, 8);

   if (targets.length > 0) {
      // fire on the closest one
      // TODO may need to check for close combat instead of firing
      console.log('SNIPE fire');
      return new MissileAction(this.actor, targets[0].actor)
         .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
   }

   // nothing to fire at. Can we find a target to move towards?

   // list of objects { actor: x, path: cell[]}
   // ordered by distance
   targets = pathfinding.findTargetablePaths(this.actor.currentCell, NOISY.players, 8);

   if (targets.length > 0) {

      target = targets[0];
      console.log('SNIPE found:' + target.actor.getCell().getHash() + ' distance: ' + target.path.length);

      path = target.path;

      // the last element is the target, remove that so we stop at it
      path.pop();
      console.log('SNIPE move ' + path);

      return new MoveActorAction(this.actor, path)
         .setNextAction(new WaitAction(0.2).setNextAction(nextAction));

   } else {
      console.log('SNIPE no targets');
      this.actor.clearAP();
   }

   return null;
};

// ----------------------------------------------------------------------------
// Strategy - Charge
//
// actor 2 - Leeroy
// is player a neighbour
//   pick weakest one
//   close combat
// pick closest player
//   move towards
// ----------------------------------------------------------------------------

function CHARGESTRATEGY(actor) {
   "use strict";
   STRATEGY.call(this, actor);
}

CHARGESTRATEGY.prototype = Object.create(STRATEGY.prototype);

CHARGESTRATEGY.prototype.update = function(pathfinding, nextAction) {

   "use strict";
   var targets = [],
      target,
      path = [],
      dist;

   // sorted list by path length
   targets = pathfinding.findTargetablePaths(this.actor.currentCell, NOISY.players, 4);

   if (targets.length > 0) {

      target = targets[0];
      console.log('CHARGE found:' + target.actor.getCell().getHash());

      dist = pathfinding.distanceBetweenCells(this.actor.getCell(), target.actor.getCell());

      if (dist === 1) {
         console.log('CHARGE close combat');

         return new MeleeAction(this.actor, target.actor)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      } else {

         path = target.path;

         // the last element is the target, remove that so we stop at it
         path.pop();

         console.log('CHARGE move dist:' + dist + ' path:' + UTILS.outputPath(path));

         return new MoveActorAction(this.actor, path)
            .setNextAction(new WaitAction(0.2).setNextAction(nextAction));
      }

   } else {
      console.log('CHARGE no targets');
      this.actor.clearAP();
   }

   return null;
};



