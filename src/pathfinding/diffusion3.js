/* globals HexAttr */
/* exported DIFFUSION3 */

/*
   Collaborative Diffusion (3rd iteration)
   http://www.cs.colorado.edu/~ralex/papers/PDF/OOPSLA06antiobjects.pdf

   u0.new = lambda [ u0 + D sum(ui - u0) ]

   rewrite this to (where N is number of neighbours)
     u0.new = lambda [ u0(1 - ND) + N(n1 + n2 + ... + nN) ]

   u0  = diffusion value of center agent
   sum = sum over the number of neigboring agents used as input
   ui = diffusion value of neighboring agent
   D = diffusion coefficent [0..0.5]
       noticed that when D is greater than 1/N it causes instability
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

function DIFFUSION3(hexgrid_) {
   "use strict";

   var hexgrid = hexgrid_,
       layer = "one",
       D = 1/6;

   // params
   // scents - array of strings indicating the different scents to be tracked
   function init(scents) {

      hexgrid.initScents(layer, scents);
   }

   // Diffuse values from one work layer to the other.
   // Afterwards promote the new work layer to 'current'.
   //
   // params
   //   scent - name of scent to diffuse
   // Return - the number of cells that changed scent this diffusion
   function diffuseImpl(scent) {

      var
         actor,
         n0,
         nsum,
         nv = [],
         dv = 0,
         lambda,
         neighbours,
         workLayer = layer === "one" ? "two" : "one",
         diffs = 0;

      hexgrid.forEach(function(h) {

         if (!h.getAttr(HexAttr.PATH)) {
            return;
         }

         actor = h.getAttr(HexAttr.ACTOR);

         if (actor !== undefined && actor.goal[scent] !== undefined) {
            // Goal scent is always populated
            hexgrid.setScent(h, scent, actor.goal[scent], workLayer);
            return;
         }

         n0 = hexgrid.getScent(h, scent, layer);
         nsum = 0;
         nv.length = 0;

         neighbours = hexgrid.getAdjacent(h);

         // obstacle agents have a diffusion value of 0
         for (var neighbour of neighbours) {
            dv = neighbour.getAttr(HexAttr.PATH) ? hexgrid.getScent(neighbour, scent, layer) + 0 : 0;
            nsum += dv;
         }

         // hexes have 6 neighbours
         dv = n0 * (1 - 6 * D) + D * nsum;

         if (actor !== undefined) {
            lambda = actor.lambda[scent];
            if (lambda !== undefined) {
               dv = dv * lambda;
            }
         }

         dv = Math.round(dv * 100.0) / 100.0;

         hexgrid.setScent(h, scent, dv, workLayer);

         if (dv !== n0) {
            diffs += 1;
         }
      });

      hexgrid.setScentLayer(workLayer);
      layer = workLayer;

      return diffs;
   }

   // Diffuse the scent until it no longer changes
   function diffuse(scent) {

      var loop = 0;

      while(++loop < 20) {
         if (0 === diffuseImpl(scent)) {
            break;
         }
      }
   }

   // Parameters
   // Hex h
   // String scent
   // Return: cell or undefined
   function findHill(h, scent) {
      var value,
         max = hexgrid.getScent(h, scent),
         id;

      hexgrid.getAdjacent(h).forEach(function(neighbour) {

         value = hexgrid.getScent(neighbour, scent);

         if (value > max) {
            max = value;
            id = neighbour.getId();
         }
      });

      return hexgrid.getHex(id);
   }

   // Parameters
   // Hex h
   // int maxLen
   // Return: array of Cells
   function hillClimb(h, scent, maxLen) {
      var path = [];

      while (h !== undefined && path.length < maxLen) {
         h = findHill(h, scent);

         if (h !== undefined) {
            path.push(h);
         }
      }

      return path;
   }

   function setGoalAgent(actor) {
      var h = actor.getCell();

      Object.getOwnPropertyNames(actor.goal).forEach(function(scent) {
         hexgrid.setScent(h, scent, actor.goal[scent]);
      });
   }

   return {
      init: init,
      setGoalAgent: setGoalAgent,
      diffuse: diffuse,
      hillClimb: hillClimb
   };
}

// Default value for Goal scent
DIFFUSION3.GOAL_SCENT = 1000;

