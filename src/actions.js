/* globals UTILS */
/* exported MoveActorAction */

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
// return this || null
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
         this.callback();
         return null;
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
// Cell target
// function callback
function MissileAction(source, target, callback) {
  "use strict";

  this.source = source;
  this.target = target;
  this.callback = callback;
  this.coordsxy = {};

  this.elapsedTime = 0;
}


MissileAction.prototype.update = function (interval) {
  "use strict";
  var animationTime = 0.2;

  this.elapsedTime += interval;

  if (this.elapsedTime < animationTime) {

     this.coordsxy = {
        "x": UTILS.lerp(
           this.source.centerxy.x,
           this.target.centerxy.x,
           this.elapsedTime / animationTime),
        "y": UTILS.lerp(
           this.source.centerxy.y,
           this.target.centerxy.y,
           this.elapsedTime / animationTime)
     };
  } else {

    // Done
    this.callback();
    return null;
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
// Cell target
// function callback
function MeleeAction(source, target, callback) {
  "use strict";

  this.source = source;
  this.target = target;
  this.callback = callback;
  this.coordsxy = {};

  this.elapsedTime = 0;
}


MeleeAction.prototype.update = function (interval) {
  "use strict";
  var animationTime = 0.2;

  this.elapsedTime += interval;

  if (this.elapsedTime < animationTime) {

     this.coordsxy = {
        "x": UTILS.lerp(
           this.source.centerxy.x,
           this.target.centerxy.x,
           this.elapsedTime / animationTime),
        "y": UTILS.lerp(
           this.source.centerxy.y,
           this.target.centerxy.y,
           this.elapsedTime / animationTime)
     };
  } else {

    // Done
    this.callback();
    return null;
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
