/* export modeEnum,RenderFlag */

var modeEnum = modeEnum || {
   ACTION: 'a',
   SELECT: 's'
};

function RenderFlag() {
   "use strict";
   this.needsRender = true;
}

RenderFlag.prototype.isRender = function() {
   "use strict";
   if (this.needsRender === true) {
      this.needsRender = false;
      return true;
   }
   return false;
};

RenderFlag.prototype.update = function(oldValue, newValue) {
   "use strict";

   if (this.needsRender === false) {

      // A simple way to compare JSON style objects
      // order is important
      this.needsRender = this.needsRender || JSON.stringify(oldValue) !== JSON.stringify(newValue);
   }

   return newValue;
};
