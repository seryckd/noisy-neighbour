/* exported DIFFUSION */

/*
   Collaborative Diffusion
   http://www.cs.colorado.edu/~ralex/papers/PDF/OOPSLA06antiobjects.pdf

   u0.new = lambda [ u0 + D sum(ui - u0) ]

   u0  = diffusion value of center agent
   sum = sum over the number of neigboring agents used as input
   ui = diffusion value of neighboring agent
   D = diffusion coefficent [0..0.5]
   lambda = modulation coefficent
         >1 is collaboration between pursuers
         <1 is competition between pursuers

   Terminology
      Scent
         the diffusion value carried by Path Agents
      Goal Agent
         Agents that are pursued by other agents. They have a scent value.
      Path Agent
         Diffuses the scent of Goal Agents. (A hex tile)
      Pursuer Agent
         Pursues one or more Goals. Includes a goal selection mechanism.
      Obstacle Agent
         Does not diffuse the scent of Goal Agents.
      Sheet
         A collection of Path Agents
*/

function DIFFUSION(hexgrid_) {
   "use strict";

   // Map<hash, scent> sheet
   // where hash is the Cell hash from hexgrid

   var hexgrid = hexgrid_,
      data1 = new Map(),         // keep two Maps and switch between them
      data2 = new Map(),
      sheet = data1,
      tmpSheet = data2,
      // Higher values cause instability in the diffusion.
      // We see this is at seen at 0.25.
      // Since we are using hexagons, let's try 1/6 = 0.167
      D = 0.167,
      goalScent = 1000,
      goals = [],                // array of cell hashes
      modulators = new Map();    // key: cell hash, value: lambda value


   // Params
   // Object (key:cell.hash, value:scent)[] goals;   Player[]
   // Object (key:cell.hash, value:scent)[] pursuers
   function init(players, npcs) {

      goals = [];
      modulators.clear();

      hexgrid.setScentMap(null);

      hexgrid.each(function(cell) {
         // ignore Obstacle Agents
         if (!cell.isWall()) {
            // initial state is set to 0
            sheet.set(cell.getHash(), 0);
         }
      });

      // Make the players Goal Agents with a scent value
      players.forEach(function(player) {
         sheet.set(player.getCell().getHash(), goalScent);
         goals.push(player.getCell().getHash());
      });

      npcs.forEach(function(npc) {
         modulators.set(npc.getCell().getHash(), 0.1);
      });
   }

   function swapGrids() {
      var temp = sheet;
      sheet = tmpSheet;
      tmpSheet = temp;
      hexgrid.setScentMap(sheet);
   }

   function sum(els) {
      var s = 0;

      els.forEach(function (e) {
         s = s + e;
      });

      return s;
   }

   function diffuseImpl() {

      var n0,
         nsum,
         neighbours,
         dv,
         lambda,
         nv = [];

      for (var [key, value] of sheet) {

         // Goal Agents are always set to the scent
         if (-1 !== goals.indexOf(key)) {
            tmpSheet.set(key, value);
            continue;
         }

         n0 = value;
         nsum = 0;
         nv.length = 0;

         neighbours = hexgrid.adjacent(hexgrid.getCell(key));

         // only sum the Path Agents (not Obstacles)
         for (var cell of neighbours) {
            if (cell.isWall()) {
               nv.push(0);
            } else {
               nv.push(sheet.get(cell.getHash()) - n0);
            }
         }

         nsum = sum(nv);

         dv = n0 + D * nsum;

         lambda = modulators.get(key);
         if (lambda !== undefined) {
            dv = dv * lambda;
         }

         tmpSheet.set(key, dv);
      }

      swapGrids();
   }

   function diffuse(count) {

      if (count === undefined) {
         count = 1;
      }

      for (var c = 0; c < count; c++) {
         diffuseImpl();
      }
   }

   function getScent(cell) {
      return sheet.get(cell.getHash());
   }

   // Parameters
   // Cell cell
   // Return: cell or undefined
   function findHill(cell) {
      var scent,
         max = getScent(cell),
         hash;

      hexgrid.adjacent(cell).forEach(function(neighbour) {
         scent = sheet.get(neighbour.getHash());

         if (scent !== undefined && scent > max) {
            max = scent;
            hash = neighbour.getHash();
         }
      });

      return hexgrid.getCell(hash);
   }

   // Parameters
   // Cell cell
   // maxLen
   // Return: array of Cells
   function hillClimb(cell, maxLen) {
      var path = [];

      while (cell !== undefined && path.length < maxLen) {
         cell = findHill(cell);

         if (cell !== undefined) {
            path.push(cell);
         }
      }

      return path;
   }

   return {
      init: init,
      diffuse: diffuse,
      getScent: getScent,
      hillClimb: hillClimb
   };
}
