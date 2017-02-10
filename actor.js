/* globals UTILS */
/* exported ACTOR */

function ACTOR() {
   "use strict";

   // Expect init() to be called
   this.currentCell = null;
   this.centerxy = null;

   // Expect to be set by supertypes
   this.imageName = "N/A";

   this.isPlayer_ = false;

   this.path = [];
   this.health = 10;
   this.curAP = 3;
   this.turnAP = 3;
   this.elapsedTime = 0;

   this.copyCenter = function(cell) {
      return {
         x : cell.centerxy.x,
         y : cell.centerxy.y
      };
   };
}

// Params
// Return this
ACTOR.prototype.init = function(startCell) {
   "use strict";
   this.currentCell = startCell;
   this.centerxy = this.copyCenter(startCell);

   this.currentCell.setActor(this);

   return this;
};

ACTOR.prototype.isPlayer = function() {
   "use strict";
   return this.isPlayer_;
};

ACTOR.prototype.getWeaponRange = function() {
   "use strict";
   return 5;
};

ACTOR.prototype.getWeaponDamage = function() {
   "use strict";
   return 5;
};

ACTOR.prototype.applyDamage = function(damage) {
   "use strict";
   this.health -= damage;

   if (this.health <= 0) {
      // death

      this.currentCell.clearActor();

   }

   return this.health > 0;
};

//
// Params
// Cell[] array of cells to move through
ACTOR.prototype.setMovePath = function(apath) {
   "use strict";
   this.path = apath;

   //currentCell = path[path.length - 1];
   this.centerxy = this.copyCenter(this.currentCell);
};

ACTOR.prototype.getCell = function() {
   "use strict";
   return this.currentCell;
};

ACTOR.prototype.getHealth = function() {
   "use strict";
   return this.health;
};

ACTOR.prototype.newTurn = function() {
   "use strict";
   this.curAP = this.turnAP;
};

ACTOR.prototype.getCurAP = function() {
   "use strict";
   return this.curAP;
};

ACTOR.prototype.update = function(interval) {
   "use strict";

   var speed = 0.5;

   if (this.path.length > 0) {

      // time is from 0-0.5
      this.elapsedTime += interval;

      if (this.elapsedTime > speed) {
         // Arrived at next cell, now target the next cell in the path

         this.currentCell.clearActor();

         this.currentCell = this.path.shift();
         this.centerxy = this.copyCenter(this.currentCell);
         this.currentCell.setActor(this);

         this.elapsedTime = 0;
         this.curAP -= 1;

         if (this.curAP === 0) {
            this.path = [];
         }
      } else {
         // Move from current to next in path
         this.centerxy.x = UTILS.lerp(
            this.currentCell.centerxy.x,
            this.path[0].centerxy.x,
            this.elapsedTime / speed);

         this.centerxy.y = UTILS.lerp(
            this.currentCell.centerxy.y,
            this.path[0].centerxy.y,
            this.elapsedTime / speed);
      }
   }

};

ACTOR.prototype.render = function(ctx, image) {
   "use strict";

   ctx.drawImage(
      image.image(this.imageName),
      this.centerxy.x - 35,
      this.centerxy.y - 35
   );

   // rectangle
   // points in rectangle

   ctx.strokeText(this.curAP,
                 this.centerxy.x,
                 this.centerxy.y);

};


