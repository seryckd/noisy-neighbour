/*globals modeEnum, RenderFlag*/

function Dashboard() {
   "use strict";
   this.mode = modeEnum.ACTION;
   this.actor = {
      isValid: false,
      ap: 0,
      health: 0
   };
   this.renderFlag = new RenderFlag();
}

Dashboard.prototype.setMode = function(mode) {
   "use strict";

   this.mode = this.renderFlag.update(this.mode, mode);
};

Dashboard.prototype.setActor = function(actor) {
   "use strict";

   if (actor === null) {
      this.clearActor();
   } else {

      var newActor = {
         isValid: true,
         ap: actor.getCurAP(),
         health: actor.getHealth()
      };

      this.actor = this.renderFlag.update(this.actor, newActor);
   }
};

Dashboard.prototype.clearActor = function() {
   "use strict";
   this.actor.isValid = this.renderFlag.update(this.actor.isValid, false);
};

Dashboard.prototype.render = function(canvas) {
   "use strict";

   if (this.renderFlag.isRender() === false) {
      return;
   }

   console.log('dashboard render');

   var ctx = canvas.getContext("2d");

   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = '#7fcabb';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.fillStyle = '#000000';
   ctx.font = "18px Serif";
   ctx.fillText("Mode:" + (this.mode === modeEnum.ACTION ? "ACTION" : "SELECT"), 10, 16);

   if (this.actor.isValid) {
      ctx.fillText("AP:" + this.actor.ap, 150, 16);
      ctx.fillText("Health:" + this.actor.health, 200, 16);
   }

};
