/* globals ACTION, UTILS */
/* exported GameOverAction  */

// ----------------------------------------------------------------------------
// Game Over Animation
// ----------------------------------------------------------------------------

function GameOverAction(width, height) {
   "use strict";

   var self = this,
       text = "GAME OVER".split(""),
       spacex = width / text.length,
       letterWidth = 35;

   self.letters = [];

   text.forEach(function(l, idx) {
      self.letters.push({
         letter: l,
         x: idx * spacex,
         y: Math.random() * height,
         xf: (width - letterWidth*text.length)/2 + idx*letterWidth,
         yf: height/2
      });
   });

   this.elapsedTime = 0;
}

GameOverAction.prototype = Object.create(ACTION.prototype);

GameOverAction.prototype.update = function(interval) {
   "use strict";

   var speed = 5,
       self = this;

   this.elapsedTime += interval;

   if (this.elapsedTime > speed) {
      this.elapsedTime = 0;

   } else {
      self.letters.forEach(function(l) {
         l.x = UTILS.lerp(l.x, l.xf, self.elapsedTime/speed);
         l.y = UTILS.lerp(l.y, l.yf, self.elapsedTime/speed);
      });
   }

   return true;
};

GameOverAction.prototype.render = function (ctx) {
  "use strict";

   ctx.save();
   ctx.setTransform(1, 0, 0, 1, 0, 0);

   ctx.fillStyle = '#ff0000';
   ctx.font = "44px Serif";

   this.letters.forEach(function(l) {
      ctx.fillText(l.letter, l.x, l.y);
   });

   ctx.fillStyle = '#000000';
   ctx.font = "42px Serif";

   this.letters.forEach(function(l) {
      ctx.fillText(l.letter, l.x, l.y);
   });

   ctx.restore();
};
