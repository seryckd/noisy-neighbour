/* exported DIFFUSION2 */

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
         Obstacle contributes 0 to diffusion.
      Sheet
         A collection of Path Agents

      Item Agent (my definition)
         A Goal or Obstacle Agent that diffuses scent.

*/

// GameObject: render, diffusion value
//   Item
//     Corpse
//   Actor
//     Player
//     NPC

function DIFFUSION2(hexgrid_) {
   "use strict";

   // Sheet Definition
   // A Map of <Cell Hash, Scent Values> where
   // Scent Values is object of scents and values.

   var hexgrid = hexgrid_,
      // Keep two copies of the sheet.
      data1 = new Map(),
      data2 = new Map(),
      currentSheet = data1,
      workSheet = data2,

      // Higher values cause instability in the diffusion.
      // For instance, at 0.25 scent values go to negative and swing to high positives.
      // Since we are using hexagons, let's try 1/6 = 0.167
      D = 0.167;

   function init(scents) {

      hexgrid.each(function(cell) {
         if (cell.isPath()) {
            currentSheet.set(cell.getHash(), newValues(scents));
            workSheet.set(cell.getHash(), newValues(scents));
         }
      });
   }

   function newValues(scents) {
      var values = {};
      scents.forEach(function(scent) {
         values[scent] = 0;
      });
      return values;
   }

   // Promote 'nextSheet' to 'sheet'
   function swapGrids() {
      var temp = currentSheet;
      currentSheet = workSheet;
      workSheet = temp;
      //hexgrid.setScentMap(sheet);
   }

   function diffuseImpl(scent) {

      var cell,
         actor,
         n0,
         nsum,
         nv = [],
         dv = 0,
         lambda,
         neighbours;

      for (var [key, value] of currentSheet) {

         cell = hexgrid.getCell(key);

         if (!cell.isPath()) {
            continue;
         }

         actor = cell.getActor();

         if (actor !== null && actor.goal[scent] !== undefined) {
            // Goal scent is always populated
            workSheet.get(key)[scent] = actor.goal[scent];
            continue;
         }

         n0 = value[scent];
         nsum = 0;
         nv.length = 0;

         neighbours = hexgrid.adjacent(cell);

         // only sum the Path Agents (not Obstacles)
         for (var neighbour of neighbours) {
            if (neighbour.isPath()) {
               nv.push(getScent(neighbour, scent) - n0);
            } else {
               nv.push(0 - n0);
            }
         }

         nsum = sum(nv);

         dv = n0 + D * nsum;

         if (actor !== null) {
            lambda = actor.lambda[scent];
            if (lambda !== undefined) {
               dv = dv * lambda;
            }
         }

         workSheet.get(key)[scent] = dv;
      }

      swapGrids();
   }

   function sum(els) {
      var s = 0;

      els.forEach(function (e) {
         s = s + e;
      });

      return s;
   }

   function diffuse(scent, count) {

      console.log('diffuse ' + scent + ' (' + count + ')');

      if (count === undefined) {
         count = 1;
      }

      for (var c = 0; c < count; c++) {
         diffuseImpl(scent);
      }
   }

   function getScent(cell, scent) {
      var values = currentSheet.get(cell.getHash());

      if (values !== undefined) {
         return values[scent];
      }

      return values;
   }

   // Parameters
   // Cell cell
   // Return: cell or undefined
   function findHill(cell, scent) {
      var value,
         max = getScent(cell, scent),
         hash;

      hexgrid.adjacent(cell).forEach(function(neighbour) {

         value = getScent(neighbour, scent);

         if (value > max) {
            max = value;
            hash = neighbour.getHash();
         }
      });

      return hexgrid.getCell(hash);
   }

   // Parameters
   // Cell cell
   // maxLen
   // Return: array of Cells
   function hillClimb(cell, scent, maxLen) {
      var path = [];

      while (cell !== undefined && path.length < maxLen) {
         cell = findHill(cell, scent);

         if (cell !== undefined) {
            path.push(cell);
         }
      }

      return path;
   }

   function setGoalAgent(actor) {
      var key = actor.getCell().getHash();

      Object.getOwnPropertyNames(actor.goal).forEach(function(scent) {
         currentSheet.get(key)[scent] = actor.goal[scent];
      });
   }

   return {
      init: init,
      setGoalAgent: setGoalAgent,
      diffuse: diffuse,
      getScent: getScent,
      hillClimb: hillClimb
   };
}

// Default value for Goal scent
DIFFUSION2.GOAL_SCENT = 1000;

