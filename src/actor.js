/* globals UTILS */
/* exported ACTOR, DAMAGE */

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

ACTOR.prototype.getMissileRange = function() {
   "use strict";
   return 5;
};

// Return: Damage
ACTOR.prototype.getMissileDamage = function() {
   "use strict";
   return new DAMAGE('missile', 5);
};

// return: Damage
ACTOR.prototype.getMeleeDamage = function() {
   "use strict";
   return new DAMAGE('melee', 5);
};

// Damage damage
// Return: Boolean - true is alive, false is dead
ACTOR.prototype.applyDamage = function(damage) {
   "use strict";
   this.health -= damage.getDamage();

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

// Return Cell
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

ACTOR.prototype.clearAP = function() {
   "use strict";
   this.curAP = 0;
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

function DAMAGE(type, damage) {
   "use strict";

   this.damage = damage;
   this.type = type;
}

DAMAGE.prototype.getDamage = function() {
   "use strict";
   return this.damage;
};
