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

   this.health = 10;
   this.curAP = 3;
   this.turnAP = 3;
}

// Params
// Return this
ACTOR.prototype.init = function(startCell) {
   "use strict";
   this.currentCell = startCell;
   this.centerxy = UTILS.copyCellCenter(startCell);

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

ACTOR.prototype.getCloseCombatDamage = function() {
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


// Cell cell
// {x,y} position (null)
ACTOR.prototype.setPosition = function(cell, position) {
   "use strict";
   this.currentCell.clearActor();
   this.currentCell = cell;
   this.currentCell.setActor(this);

   if (position) {
      this.centerxy = position;
   } else {
      this.centerxy = UTILS.copyCellCenter(this.currentCell);
   }
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

ACTOR.prototype.decAP = function(amount) {
   "use strict";
   this.curAP -= amount;
};

ACTOR.prototype.update = function(/*interval*/) {
   "use strict";
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

//   ctx.strokeText(this.curAP,
//                 this.centerxy.x,
//                 this.centerxy.y);

};


