/* exported MAPS */

var MAPS = {

   "one" : {
      "width" : 16,
      "height" : 5,
      "walls" : [
         '(2,0)', '(5,2)',
         '(4,-1)', '(5,0)', '(6,0)',
         '(3,2)', '(4,-2)', '(5,-1)'
      ],
      "dwarf" : ['(1,2)', '(1,1)'],
      "goblin" : [
         { "start" : '(4,2)', "strategy" : "charge" },
         { "start" : '(6,-1)', "strategy" : "snipe"},
         { "start" : '(7,-3)', "strategy" : "snipe"},
         { "start" : '(8,-3)', "strategy" : "snipe"}
      ]
   }
};
