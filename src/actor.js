/* globals UTILS, NOISY */
/* exported ACTOR, DAMAGE, CORPSE */

var gid = 0;

function ACTOR(imageName_, startCell) {
   "use strict";

   this.currentCell = startCell;
   this.currentCell.setActor(this);
   this.centerxy = UTILS.copyCellCenter(startCell);

   this.imageName = imageName_;

   this.isPlayer_ = false;

   this.health = 10;
   this.curAP = 3;
   this.turnAP = 3;

   this.id = ++gid;
}

ACTOR.prototype.name = function() {
   "use strict";
   return 'id:' + this.id + ' loc:' + this.currentCell.getHash();
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

ACTOR.prototype.makeCorpse = function() {
   "use strict";
   return new CORPSE(this.currentCell, 'dead-' + this.imageName);
};

ACTOR.prototype.update = function(/*interval*/) {
   "use strict";
};

ACTOR.prototype.render = function(ctx, image) {
   "use strict";

   //!!! slow to draw
   ctx.drawImage(
      image.image(this.imageName),
      this.centerxy.x - 35,
      this.centerxy.y - 35
   );

   if (NOISY.isShowOverlay) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = "18px Serif";
      ctx.fillText(this.id, this.centerxy.x-5, this.centerxy.y-5);
      ctx.restore();
   }
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



function CORPSE(cell_, imageName_) {
   "use strict";

   this.cell = cell_;
   this.centerxy = UTILS.copyCellCenter(cell_);

   this.imageName = imageName_;
}

// Return Cell
CORPSE.prototype.getCell = function() {
   "use strict";
   return this.cell;
};

CORPSE.prototype.render = function(ctx, image) {
   "use strict";

   //!!! slow to draw
   ctx.drawImage(
      image.image(this.imageName),
      this.centerxy.x - 35,
      this.centerxy.y - 35
   );

   if (NOISY.isShowOverlay) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = "18px Serif";
      ctx.fillText(this.id, this.centerxy.x-5, this.centerxy.y-5);
      ctx.restore();
   }
};
