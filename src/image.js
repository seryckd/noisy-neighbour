/* exported IMAGES */

function IMAGES() {
   "use strict";

   var allReady = false,
      images = {};

   function load(name, file) {

      var i = {
         name: name,
         image: new Image(),
         ready: false
      };

      images[name] = i;

      i.image.onload = function () {
         images[name].ready = true;
      };

      i.image.src = file;

      allReady = false;

      return i.image;
   }

   function isReady() {

      var name;

      if (!allReady) {
         for (name in images) {
            if (images.hasOwnProperty(name)) {
               if (!images[name].ready) {
                  return false;
               }
            }
         }
      }

      allReady = true;
      return allReady;
   }

   function image(name) {
      return images[name].image;
   }

   return {
      load: load,
      isReady: isReady,
      image: image
   };
}
