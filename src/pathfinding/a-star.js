/* globals HexAttr */
/* exported ASTAR */

// Implementation of A* using distance between cells as heuristic
// Every cell has same G value
// http://www.policyalmanac.org/games/aStarTutorial.htm
// TODO add movement cost to hexgrid.Cell.
//
// Should also look here
// http://theory.stanford.edu/~amitp/GameProgramming/

function ASTAR(hexgridf) {
  "use strict";

   var hexgrid = hexgridf,
      openMap = new Map(),
      closeMap = new Map(),
      mapCellToNodes = {};

   function outputCells(cells) {
      var o = '';

      cells.forEach(function (c) {
         o += c.getId();
         o += ',';
      });

      return o;
   }

//   function outputNodes(nodes) {
//      var o = '';
//
//      for (var value of nodes.values()) {
//         o += value.getId();
//         o += ',';
//      }
//
//      return o;
//   }

   function Node(cell) {
      this.cell = cell;
      this.parent = null;

      this.F = 0;    // estimate code from start to target (G + H)
      this.G = 0;    // movement cost from start node to this node
      this.H = 0;    // estimated movement cost from this node to target node

      this.calulateF = function () {
         this.F = this.G + this.H;
      };

      this.isWalkable = function () {
         return !this.cell.getAttr(HexAttr.WALL) && !this.cell.getAttr(HexAttr.ACTOR);
      };

      this.getId = function () {
         return this.cell.getId();
      };
   }

   // Node source
   // Node target
   function calculateH(source, target) {
      return hexgrid.distance(source.cell, target.cell);
   }

   function removeLowestF() {

      var lowF = -1,
         node = null;

      for (var value of openMap.values()) {
         if (lowF === -1 || value.F < lowF) {
            lowF = value.F;
            node = value;
         }
      }

      if (node !== null) {
         openMap.delete(node.getId());
      }

      return node;
   }

   function to_node(cell) {

      var node = mapCellToNodes[cell.getId()];

      if (node !== undefined) {
         return node;
      }

      node = new Node(cell);
      mapCellToNodes[cell.getId()] = node;
      return node;
   }

   // Params
   // Node currentNode
   // Cells neighbours
   // Return nothing
   function processNeighbours(currentNode, neighbours, targetNode) {

      var node,
         G;

      neighbours.forEach(function (neighbour) {

         node = to_node(neighbour);

         if (node !== targetNode) {
            if (!node.isWalkable() || closeMap.has(node.getId())) {
               // Node that should not be considered
               return;
            }
         }

         if (!openMap.has(node.getId())) {

            // found new node
            openMap.set(node.getId(), node);
            node.parent = currentNode;

            node.G = node.parent.G + 1;
            node.H = calculateH(node, targetNode);
            node.calulateF();

         } else {

            // Reached a node via a different path
            G = node.parent.G + 1;

            if (G < node.G) {
               // this is a better path
               node.parent = currentNode;
               node.G = G;
               // H remains the same
               node.calulateF();
            }
         }

      });

   }

   // Internal
   // Generate a path from a list of nodes
   //
   // Params
   // Node node
   function calculatePath(node) {

      var path = [];

      while (node !== null) {
         path.unshift(node.cell);
         node = node.parent;
      }

      // Remove the first cell as it is the start cell the
      path.shift();

      return path;
   }

   // Find a path between two cells that avoids any cell
   // wherer Node.isWalkable() returns false.
   // e.g. avoids Walls or Actors.
   //
   // hexgrid:
   // Cell start: starting cell
   // Cell end: ending cell
   // return: array of cells or null for not possible
   function findPath(startCell, endCell) {
      var currentNode,
         endNode = to_node(endCell),
         path = [];

      openMap.set(startCell.getId(), to_node(startCell));

      while (openMap.size > 0) {

         currentNode = removeLowestF();

         if (currentNode.cell === endCell) {
            // found path, need to calculate it

            path = calculatePath(currentNode);

            break;
         }

         closeMap.set(currentNode.getId(), currentNode);

         processNeighbours(currentNode, hexgrid.getAdjacent(currentNode.cell), endNode);
      }

      // console.log('path: ' + outputCells(path));

      return path;
   }

   // Breadth First Search
   // Return all cells that can be reached from the start cells within
   // a given range. Stop if we get to a Wall or another Actor.
   //
   // Params
   // Cell startCell
   // int movePoints
   // Return Map<Cell> cells that can be reached, excluding the start cell
   function findReachableCells(startCell, movePoints) {

      var frontier = [],
          reachable = new Map(),
          node = to_node(startCell),
          next,
          neighbours,
          index;

      frontier.push(node);
      //reachable.set(node.getId(), node.cell);

      while (frontier.length !== 0) {
         node = frontier.shift();

         neighbours = hexgrid.getAdjacent(node.cell);
         for (index=0; index<neighbours.length; ++index) {
            next = to_node(neighbours[index]);

            if (reachable.has(next.getId()) ||
                !next.isWalkable() ||
                next.getId() === startCell.getId()) {
               continue;
            }

            next.parent = node;

            // TODO needs to be actual movement cost of cell
            next.G = node.G + 1;

            if (next.G <= movePoints) {
               frontier.push(next);
               reachable.set(next.getId(), next.cell);
            }
         }
      }

      return reachable;
   }

   // Return an array of cells that contain actors with the given range
   // Param: Cell
   // Param: Actors[]
   // Param: integer
   // Return Cell[]
   function findTargetableCells(startCell, actors, range) {

      var cells = [],
         filtered = actors.filter(function (a) {
            return hexgrid.distance(startCell, a.getCell()) <= range;
         });

      filtered.forEach(function (a) {
         cells.push(a.getCell());
      });

      return cells.filter(function (c) {
         return hexgrid.hasLineOfSight(startCell, c);
      });
   }

   // Find the subset of actors whose path is within the given range
   // Sort by path length
   //
   // Return object
   // { actor: actor, path: cell[] }
   function findTargetablePaths(startCell, actors, range) {
      var result = [],
          path;

      actors.forEach(function (a) {
         path = findPath(startCell, a.getCell());
         if (path.length > 0 && path.length <= range) {
            result.push({
               "actor": a,
               "path": path
            });
         }
      });

      // Sort the result by ascending path length
      result.sort(function (a, b) {
         return a.path.length - b.path.length;
      });

      return result;
   }

   return {

      // Find a path between two cells avoiding any obstacles
      findPath: findPath,

      // Find all cells with no obstacles that are within a given range
      findReachableCells: findReachableCells,

      // Find all other actors that have a clear Line of Sight and are
      // in a given range
      findTargetableCells: findTargetableCells,

      // Return the paths to the subset of given actors that
      // are within a given range
      findTargetablePaths: findTargetablePaths,

      // Return the number of cells in a straight line between cellA
      // and cellB
      distanceBetweenCells: function(cellA, cellB) {
         return hexgrid.distance(cellA, cellB);
      }
   };

}
