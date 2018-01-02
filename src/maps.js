/* exported MAPS */

var MAPS = {

   "one" : {
      "width" : 16,
      "height" : 5,
      "walls" : [
         '(2,0)', '(5,2)',
         '(4,-1)', '(5,0)', '(6,0)',
         '(3,2)', '(5,-1)'
      ],
      "dwarf" : ['(1,2)', '(1,1)'],
      "goblin" : [
         { "start" : '(5,1)', "strategy" : "collab" },
         { "start" : '(6,-1)', "strategy" : "collab"},
         { "start" : '(7,-3)', "strategy" : "collab"},
         { "start" : '(7,-3)', "strategy" : "collab"},
         { "start" : '(10,-3)', "strategy" : "collab"}
      ]
   },
   "two" : {
      "width" : 12,
      "height" : 10,
      "walls" : [
      ],
      "dwarf" : ['(6,0)'],
      "goblin" : [
         { "start" : '(1,1)', "strategy" : "collab" },
         { "start" : '(1,2)', "strategy" : "collab"},
         { "start" : '(1,3)', "strategy" : "collab"},
         { "start" : '(2,-1)', "strategy" : "collab"},
         { "start" : '(2,2)', "strategy" : "collab"},
         { "start" : '(3,3)', "strategy" : "collab"},
         { "start" : '(2,0)', "strategy" : "collab"},
         { "start" : '(2,3)', "strategy" : "collab"}
      ]
   },
   "three" : {
      "width" : 16,
      "height" : 5,
      "walls" : [
         '(2,0)', '(3,0)', '(4,-1)', '(5,-1)',
         '(2,2)', '(3,2)', '(4,1)', '(5,1)', '(7,-1)'
      ],
      "dwarf" : ['(0,2)'],
      "goblin" : [
         { "start" : '(8,-2)', "strategy" : "collab" },
         { "start" : '(8,-1)', "strategy" : "collab" }
      ]
   }

};
