var UTILS = UTILS || {};


/**
 * This script finds the real position of an element,
 * so if you resize the page and run the script again,
 * it points to the correct new position of the element.
 */
UTILS.realPosition = function position(el) {
   "use strict";
   var pos;

   // Apply offsets of all parents
   for (pos = [0, 0]; el; el = el.offsetParent) {
      pos[0] += el.offsetLeft - el.scrollLeft;
      pos[1] += el.offsetTop - el.scrollTop;
   }
   return pos;
};

// For use in array callbacks to match a given object
// e.g. array.some(UTILS.matches(something))
UTILS.matches = function (match) {
   "use strict";
   return function(node) {
      if (node === match) {
         return true;
      }
   };
 };

// linear interpolation of two numbers
// number a
// number b
// number t where 0 <= t <= 1.0
UTILS.lerp = function (a, b, t) {
   "use strict";
   return a + (b - a) * t;
};

// Copy the {x,y} parameters from the given cell
UTILS.copyCellCenter = function(cell) {
   "use strict";
   return {
      x : cell.centerxy.x,
      y : cell.centerxy.y
   };
};
