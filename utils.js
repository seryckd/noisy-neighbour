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

