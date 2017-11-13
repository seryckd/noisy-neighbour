/* globals UTILS, NOISY */
/* exported ACTION, MoveActorAction, MissileAction, MeleeAction */

// ACTION is meant to be called on the main input loop. They are primarily
// designed for animations and the computer turn.
//
// Action has two main functions, update() and render().
//
// update() performs the action. It should always call endUpdate() which
// will return

// update() returns an Action or null. Null means that control returns to the
// main input loop (e.g.the player). Anything else is the action that is
// currently happening.
// e.g. actions can be chained by returning another action.



function ACTION() {}

// function callback - the function to call when this action has finished
ACTION.prototype.setCallback = function(callback) {
   "use strict";
   this.callback = callback;
   this.nextAction = undefined;
   return this;
};

// ACTION action - the next action in the chain when this action has finished
ACTION.prototype.setNextAction = function(action) {
   "use strict";
   this.nextAction = action;
   this.callback = undefined;
   return this;
};

ACTION.prototype.endUpdate = function() {
   "use strict";
   if (this.callback !== undefined) {
      this.callback();
      return null;
   } else if (this.nextAction !== undefined) {
      return this.nextAction;
   }
   throw new Error("ACTION does not have callback or nextAction defined");
};

ACTION.prototype.update = function(/*interval*/) {
   "use strict";
   return this.endUpdate();
};

ACTION.prototype.render = function(/*ctx*/) {
      "use strict";
};


// ----------------------------------------------------------------------------
// Move Actor Action
// ----------------------------------------------------------------------------

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

MoveActorAction.prototype = Object.create(ACTION.prototype);

// update
// Update the Actor's position as it moves through the path
//
// long interval
// return this action, another action or null
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
         // Done
         this.path = [];
         return this.endUpdate();
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


// ----------------------------------------------------------------------------
// Missile Action
// ----------------------------------------------------------------------------

// Actor source
// Actor target
function MissileAction(source, target) {
   "use strict";

   this.source = source;
   this.target = target;
   this.coordsxy = {};
   this.elapsedTime = 0;

   // cost of missile action
   this.source.decAP(1);
}

MissileAction.prototype = Object.create(ACTION.prototype);

MissileAction.prototype.update = function (interval) {
  "use strict";
  var animationTime = 0.2,
      self = this;

  self.elapsedTime += interval;

  if (self.elapsedTime < animationTime) {

     self.coordsxy = {
        "x": UTILS.lerp(
           self.source.centerxy.x,
           self.target.centerxy.x,
           self.elapsedTime / animationTime),
        "y": UTILS.lerp(
           self.source.centerxy.y,
           self.target.centerxy.y,
           self.elapsedTime / animationTime)
     };
  } else {

     if (self.target.applyDamage(this.source.getMissileDamage()) === false) {
        // target death

        console.log('DEATH by MISSILE');

        NOISY.deadActor(self.target);

        // TODO DeathAction, pass callback to it
     }
     return self.endUpdate();
  }

  return this;
};

MissileAction.prototype.render = function (ctx) {
  "use strict";

  ctx.fillStyle = '#a03a40';
  ctx.fillRect(
     this.coordsxy.x - 10,
     this.coordsxy.y - 10,
     10,
     10);
};


// ----------------------------------------------------------------------------
// Melee Action
// ----------------------------------------------------------------------------

// Actor source
// Actor target
// function callback
function MeleeAction(source, target) {
   "use strict";

   this.source = source;
   this.target = target;
   this.coordsxy = {};

   this.elapsedTime = 0;

   // cost of melee action
   this.source.decAP(1);
}

MeleeAction.prototype = Object.create(ACTION.prototype);

MeleeAction.prototype.update = function (interval) {
  "use strict";
  var animationTime = 0.2,
      self = this;

  self.elapsedTime += interval;


  if (self.elapsedTime < animationTime) {

     this.coordsxy = {
        "x": UTILS.lerp(
           self.source.centerxy.x,
           self.target.centerxy.x,
           self.elapsedTime / animationTime),
        "y": UTILS.lerp(
           self.source.centerxy.y,
           self.target.centerxy.y,
           self.elapsedTime / animationTime)
     };
  } else {

     if (self.target.applyDamage(self.source.getMeleeDamage()) === false) {

        console.log('DEATH by MELEE');

        // target death

        NOISY.deadActor(self.target);

        // TODO DeathAction, pass callback to it
     }
     return self.endUpdate();
  }

  return this;
};

MeleeAction.prototype.render = function (ctx) {
  "use strict";

  ctx.save();

  ctx.translate(this.coordsxy.x, this.coordsxy.y);
  ctx.rotate(Math.PI / 4);

  ctx.fillStyle = '#a03a40';
  ctx.fillRect(-7, -5, 14, 10);
  ctx.fillRect(-2, 5, 5, 15);

  ctx.restore();
};


// ----------------------------------------------------------------------------
// Wait Action
// ----------------------------------------------------------------------------

function WaitAction(time) {
   "use strict";

   this.time = time;

   this.elapsedTime = 0;
}

WaitAction.prototype = Object.create(ACTION.prototype);

// long interval
// return this action, another action or null
WaitAction.prototype.update = function(interval) {
   "use strict";

   this.elapsedTime += interval;

   if (this.elapsedTime > this.time) {
      return this.endUpdate();
   }
   return this;
};
