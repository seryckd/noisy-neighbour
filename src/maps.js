/* exported MAPS */

var MAPS = {

   "one" : {
      "walls" : [
         '(2,0)'
      ],
      "dwarf" : ['(1,0)', '(3,3)'],
      "goblin" : [
         { "start" : '(3,0)', "strategy" : "collab" }
      ],
      "grid" : [
         '(0,1)','(0,2)','(0,3)','(1,0)','(1,1)',
         '(2,-1)','(2,0)','(2,2)','(3,-1)','(3,0)',
         '(3,1)','(3,2)','(3,3)','(4,-1)','(4,0)',
         '(4,1)','(4,2)'
      ]
   },
   "two" : {
      "walls" : [
      ],
      "dwarf" : [
         '(2,-2)', '(6,-3)'
      ],
      "goblin" : [
         { "start" : '(0,4)', "strategy" : "collab" },
         { "start" : '(1,5)', "strategy" : "collab"},
         { "start" : '(6,1)', "strategy" : "collab"},
         { "start" : '(7,1)', "strategy" : "collab"},
         { "start" : '(5,5)', "strategy" : "collab"},
         { "start" : '(6,5)', "strategy" : "collab"},
         { "start" : '(4,5)', "strategy" : "collab"},
         { "start" : '(5,6)', "strategy" : "collab"}
      ],
      "grid": [
         '(0,1)','(0,2)','(0,4)','(0,5)','(0,6)',
         '(1,0)','(1,1)','(1,2)','(1,4)','(1,5)',
         '(1,6)','(2,-1)','(2,0)','(2,1)','(2,4)',
         '(2,5)','(2,6)','(3,-1)','(3,0)','(3,1)',
         '(3,3)','(3,4)','(3,5)','(3,6)','(4,-2)',
         '(4,-1)','(4,0)','(4,3)','(4,4)','(4,5)',
         '(4,6)','(5,-2)','(5,-1)','(5,0)','(5,2)',
         '(5,3)','(5,4)','(5,5)','(5,6)','(6,-3)',
         '(6,-2)','(6,-1)','(6,1)','(6,2)','(6,3)',
         '(6,4)','(6,5)','(6,6)','(7,-3)','(7,-2)',
         '(7,1)','(7,2)','(7,3)','(7,4)','(7,5)',
         '(8,-4)','(8,-3)','(8,-2)','(8,0)','(8,1)',
         '(8,2)','(8,3)','(9,-4)','(9,-3)','(9,0)',
         '(9,1)','(9,2)','(1,3)','(6,0)','(1,-1)',
         '(2,-2)','(3,-2)'
      ]
   },
   "three" : {
      "walls" : [
         '(2,1)', '(6,-1)', '(1,3)', '(1,0)'
      ],
      "dwarf" : [
         '(0,2)'
      ],
      "goblin" : [
         { "start" : '(7,-2)', "strategy" : "collab" },
         { "start" : '(7,0)', "strategy" : "collab" }
      ],
      "grid" : [
         '(0,0)','(0,1)','(0,2)','(0,3)','(0,4)',
         '(1,0)','(1,1)','(1,2)','(1,3)','(1,4)',
         '(2,-1)','(2,0)','(2,1)','(2,2)','(2,3)',
         '(3,0)','(3,1)','(4,0)','(5,-1)','(5,0)',
         '(6,-3)','(6,-2)','(6,-1)','(6,0)','(7,-3)',
         '(7,-2)','(7,-1)','(7,0)','(7,1)','(8,-4)',
         '(8,-3)','(8,-2)','(8,-1)','(8,0)','(9,-4)',
         '(9,-3)','(9,-2)','(9,-1)','(9,0)'
      ]
   },
   "four" : {
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
   }


};
