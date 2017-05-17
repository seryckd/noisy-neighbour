/* globals UTILS, NOISY */
/* exported MoveActorAction, MissileAction, MeleeAction */


// Might rename Actions to Animations.
// Every Action has update() and render().
//
// update() returns an Action or null. Null means that control returns to the
// main input loop (e.g.the player). Anything else is the action that is
// currently happening.
// e.g. actions can be chained by returning another action.


// ----------------------------------------------------------------------------
// Move Actor Action
// ----------------------------------------------------------------------------

// MoveActorAction
// Create an action to move an Actor
//
// ACTOR actor
// Cell[] path - cells to move the actor through
function MoveActorAction(actor, path, callback) {
   "use strict";

   this.actor = actor;
   this.path = path;
   this.callback = callback;

   this.elapsedTime = 0;

   this.cell = actor.getCell();
   this.centerxy = UTILS.copyCellCenter(this.cell);
}

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
         return this.callback();
         //return null;
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

MoveActorAction.prototype.render = function () {
  "use strict";
};


// ----------------------------------------------------------------------------
// Missile Action
// ----------------------------------------------------------------------------

// Actor source
// Actor target
// function callback
function MissileAction(source, target, callback) {
   "use strict";

   this.source = source;
   this.target = target;
   this.callback = callback;
   this.coordsxy = {};
   this.elapsedTime = 0;

   // cost of missile action
   this.source.decAP(1);
}


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
     return self.callback();
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
function MeleeAction(source, target, callback) {
   "use strict";

   this.source = source;
   this.target = target;
   this.callback = callback;
   this.coordsxy = {};

   this.elapsedTime = 0;

   // cost of melee action
   this.source.decAP(1);
}


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
     return self.callback();
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

function WaitAction(time, callback) {
   "use strict";

   this.time = time;
   this.callback = callback;

   this.elapsedTime = 0;
}

// long interval
// return this action, another action or null
WaitAction.prototype.update = function(interval) {
   "use strict";

   this.elapsedTime += interval;

   if (this.elapsedTime > this.time) {
      return this.callback();
   }
   return this;
};

WaitAction.prototype.render = function () {
  "use strict";
};
